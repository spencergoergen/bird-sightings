import { useEffect, useState } from 'react'

const KEY = 'bird-sightings:v1'
export const EMPTY = { sightings: [], customBirds: [], homeRegion: '' }

export function clean(data) {
  return {
    sightings: Array.isArray(data?.sightings) ? data.sightings.filter((s) => s && s.id && s.birdId && s.date) : [],
    customBirds: Array.isArray(data?.customBirds) ? data.customBirds.filter((b) => b && b.id && b.name) : [],
    homeRegion: typeof data?.homeRegion === 'string' ? data.homeRegion : '',
  }
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? clean(JSON.parse(raw)) : EMPTY
  } catch {
    return EMPTY
  }
}

export function useStore() {
  const [state, setState] = useState(load)
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      // storage blocked; keep working in memory
    }
  }, [state])
  return [state, setState]
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

export function today() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export const dayLabel = (date, opts = {}) =>
  new Date(date + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', ...opts })

export const byNewest = (a, b) => b.date.localeCompare(a.date) || (b.createdAt || 0) - (a.createdAt || 0)

export function download(filename, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
