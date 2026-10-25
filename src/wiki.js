import { useEffect, useState } from 'react'

// Reference photo + short description from Wikipedia's keyless REST API, cached per bird.
const CACHE_KEY = 'bird-sightings:wiki'
let cache = {}
try {
  cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
} catch {
  cache = {}
}
const inflight = {}

async function fetchSummary(title) {
  const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`)
  if (!res.ok) return null
  const j = await res.json()
  if (j.type === 'disambiguation') return null
  return { img: j.thumbnail?.source || '', extract: j.extract || '', url: j.content_urls?.mobile?.page || '' }
}

function loadInfo(bird) {
  if (cache[bird.id]) return Promise.resolve(cache[bird.id])
  inflight[bird.id] ||= (async () => {
    let info = null
    let offline = false
    for (const title of [bird.sci, bird.name].filter(Boolean)) {
      try {
        info = await fetchSummary(title)
      } catch {
        offline = true
      }
      if (info) break
    }
    // Don't remember a miss caused by a network failure; try again next time
    if (!info && offline) {
      delete inflight[bird.id]
      return { img: '', extract: '', url: '' }
    }
    info ||= { img: '', extract: '', url: '' }
    cache[bird.id] = info
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
    } catch {
      // cache is optional
    }
    return info
  })()
  return inflight[bird.id]
}

export function useWiki(bird) {
  const [info, setInfo] = useState(() => (bird ? cache[bird.id] : null))
  useEffect(() => {
    if (!bird) return
    let live = true
    setInfo(cache[bird.id] || null)
    loadInfo(bird).then((i) => live && setInfo(i))
    return () => {
      live = false
    }
  }, [bird?.id])
  return info
}
