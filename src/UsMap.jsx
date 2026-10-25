import { useEffect, useState } from 'react'
import { geoPath } from 'd3-geo'
import { feature, mesh } from 'topojson-client'
import { REGIONS, STATE_REGION, STATUS, SEASONS } from './birds.js'

// The pre-projected Albers atlas (with Alaska & Hawaii insets) loads once, on first map view.
let shapesPromise
function loadShapes() {
  shapesPromise ||= import('us-atlas/states-albers-10m.json').then((m) => {
    const us = m.default
    const path = geoPath()
    return {
      states: feature(us, us.objects.states).features.map((f) => ({
        name: f.properties.name,
        region: STATE_REGION[f.properties.name],
        d: path(f),
      })),
      borders: path(mesh(us, us.objects.states, (a, b) => a !== b)),
    }
  })
  return shapesPromise
}

export default function UsMap({ range, season }) {
  const [shapes, setShapes] = useState(null)
  const [picked, setPicked] = useState(null) // state name
  useEffect(() => {
    loadShapes().then(setShapes)
  }, [])

  const shows = SEASONS.find((s) => s.id === season).shows
  const statusFor = (region) => {
    const st = range?.[region]
    return st && shows.includes(st) ? st : null
  }

  const pickedRegion = picked && STATE_REGION[picked]
  const pickedStatus = pickedRegion && statusFor(pickedRegion)

  return (
    <div className="map-wrap">
      <svg viewBox="0 0 975 610" className="map" role="img" aria-label="US range map">
        {shapes ? (
          <>
            {shapes.states.map((s) => {
              const st = statusFor(s.region)
              return (
                <path
                  key={s.name}
                  d={s.d}
                  className={`state ${st ? STATUS[st].cls : 'st-none'}${picked === s.name ? ' picked' : ''}`}
                  onClick={() => setPicked(picked === s.name ? null : s.name)}
                >
                  <title>{s.name}</title>
                </path>
              )
            })}
            <path d={shapes.borders} className="borders" />
          </>
        ) : (
          <text x="487" y="305" textAnchor="middle" className="map-loading">Loading map…</text>
        )}
      </svg>
      <p className="map-caption" aria-live="polite">
        {picked
          ? <><strong>{picked}</strong> ({REGIONS[pickedRegion].name}): {pickedStatus ? STATUS[pickedStatus].label : 'not usually present this season'}</>
          : 'Tap a state for details'}
      </p>
    </div>
  )
}
