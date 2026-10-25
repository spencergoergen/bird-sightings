import { useEffect, useMemo, useRef, useState } from 'react'
import {
  SPECIES, GROUPS, REGIONS, REGION_IDS, STATE_REGION, STATUS, SEASONS,
  currentSeason, presentIn, allAboutBirdsUrl,
} from './birds.js'
import { useStore, uid, today, dayLabel, byNewest, download, clean, EMPTY } from './store.js'
import { putPhoto, getPhoto, deletePhoto, clearPhotos, resizeImage, blobToDataURL, dataURLToBlob } from './photos.js'
import { useWiki } from './wiki.js'
import UsMap from './UsMap.jsx'

const TABS = [
  { id: 'list', label: 'My birds', emoji: '📋' },
  { id: 'explore', label: 'Explore', emoji: '🔭' },
  { id: 'settings', label: 'Settings', emoji: '⚙️' },
]

function useRoute() {
  const parse = () => {
    const [page, arg] = location.hash.slice(1).split('/')
    return { page: page || 'list', arg: arg ? decodeURIComponent(arg) : '' }
  }
  const [route, setRoute] = useState(parse)
  useEffect(() => {
    const on = () => {
      setRoute(parse())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

const go = (hash) => (location.hash = hash)

export default function App() {
  const [state, setState] = useStore()
  const route = useRoute()
  const [logging, setLogging] = useState(null) // sighting draft: {} | {birdId} | existing sighting
  const [viewer, setViewer] = useState(null) // photo id
  const [toast, setToast] = useState('')
  const [photoVersion, setPhotoVersion] = useState(0)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 2400)
    return () => clearTimeout(t)
  }, [toast])

  const birds = useMemo(() => [...SPECIES, ...state.customBirds], [state.customBirds])
  const birdById = useMemo(() => Object.fromEntries(birds.map((b) => [b.id, b])), [birds])
  const sightingsByBird = useMemo(() => {
    const m = {}
    for (const s of [...state.sightings].sort(byNewest)) (m[s.birdId] ||= []).push(s)
    return m
  }, [state.sightings])

  const saveSighting = async (s, photo) => {
    // photo: Blob to store, null to remove, undefined to leave as is
    if (photo) await putPhoto(s.id, photo)
    if (photo === null) await deletePhoto(s.id).catch(() => {})
    const next = { ...s, hasPhoto: photo === undefined ? !!s.hasPhoto : !!photo }
    const isEdit = state.sightings.some((x) => x.id === s.id)
    const isNewSpecies = !isEdit && !sightingsByBird[s.birdId]
    setState((st) => {
      const exists = st.sightings.some((x) => x.id === s.id)
      return { ...st, sightings: exists ? st.sightings.map((x) => (x.id === s.id ? next : x)) : [...st.sightings, next] }
    })
    setPhotoVersion((v) => v + 1)
    setLogging(null)
    setToast(isNewSpecies ? `🎉 New bird: ${birdById[s.birdId]?.name}` : 'Sighting saved')
    if (route.page !== 'bird' || route.arg !== s.birdId) go(`bird/${s.birdId}`)
  }

  const deleteSighting = async (s) => {
    if (s.hasPhoto) await deletePhoto(s.id).catch(() => {})
    setState((st) => ({ ...st, sightings: st.sightings.filter((x) => x.id !== s.id) }))
    setToast('Sighting deleted')
  }

  const addCustomBird = (name) => {
    const bird = { id: 'c-' + uid(), name, sci: '', group: 'other', range: null, custom: true }
    setState((st) => ({ ...st, customBirds: [...st.customBirds, bird] }))
    return bird
  }

  const ctx = { birds, birdById, sightingsByBird, photoVersion }
  const bird = route.page === 'bird' && birdById[route.arg]
  const tab = bird ? null : TABS.some((t) => t.id === route.page) ? route.page : 'list'

  return (
    <div className="app">
      <main>
        {bird ? (
          <BirdPage
            key={bird.id}
            bird={bird}
            sightings={sightingsByBird[bird.id] || []}
            homeRegion={state.homeRegion}
            photoVersion={photoVersion}
            onLog={() => setLogging({ birdId: bird.id })}
            onEdit={setLogging}
            onDelete={deleteSighting}
            onPhoto={setViewer}
          />
        ) : tab === 'explore' ? (
          <Explore {...ctx} homeRegion={state.homeRegion} onRegion={(homeRegion) => setState((s) => ({ ...s, homeRegion }))} />
        ) : tab === 'settings' ? (
          <Settings
            state={state}
            onRegion={(homeRegion) => setState((s) => ({ ...s, homeRegion }))}
            onReplace={(next, msg) => {
              setState(next)
              setPhotoVersion((v) => v + 1)
              setToast(msg)
            }}
            notify={setToast}
          />
        ) : (
          <LifeList {...ctx} total={state.sightings.length} onLog={() => setLogging({})} />
        )}
      </main>

      {!bird && (
        <nav className="tabbar">
          {TABS.map((t) => (
            <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => go(t.id)} aria-current={tab === t.id}>
              <span className="tab-emoji" aria-hidden="true">{t.emoji}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
      )}

      {logging && (
        <LogSheet
          initial={logging}
          birds={birds}
          birdById={birdById}
          sightingsByBird={sightingsByBird}
          onAddBird={addCustomBird}
          onSave={saveSighting}
          onClose={() => setLogging(null)}
          onRegionDetected={(r) => !state.homeRegion && setState((s) => ({ ...s, homeRegion: r }))}
        />
      )}
      {viewer && <PhotoViewer id={viewer} version={photoVersion} onClose={() => setViewer(null)} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  )
}

/* ---------- Shared bits ---------- */

function PhotoImg({ id, version, alt, className, onClick }) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    let u = ''
    let live = true
    getPhoto(id)
      .then((blob) => {
        if (blob && live) {
          u = URL.createObjectURL(blob)
          setUrl(u)
        }
      })
      .catch(() => {})
    return () => {
      live = false
      if (u) URL.revokeObjectURL(u)
    }
  }, [id, version])
  if (!url) return <div className={`${className} img-placeholder`} />
  return <img src={url} alt={alt} className={className} onClick={onClick} />
}

// The best picture for a bird: your latest photo, else a Wikipedia reference photo
function BirdThumb({ bird, sightings, version, className = 'thumb' }) {
  const mine = sightings?.find((s) => s.hasPhoto)
  const wiki = useWiki(mine ? null : bird)
  if (mine) return <PhotoImg id={mine.id} version={version} alt={bird.name} className={className} />
  if (wiki?.img) return <img src={wiki.img} alt={bird.name} className={className} loading="lazy" />
  return <div className={`${className} img-placeholder`}><span>{GROUPS[bird.group]?.emoji || '🪶'}</span></div>
}

function Sheet({ onClose, label, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label={label} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grip" />
        {children}
      </div>
    </div>
  )
}

function PhotoViewer({ id, version, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="viewer" onClick={onClose} role="dialog" aria-label="Photo">
      <PhotoImg id={id} version={version} alt="Sighting photo" className="viewer-img" />
      <button className="viewer-close" aria-label="Close">✕</button>
    </div>
  )
}

/* ---------- Life list ---------- */

function LifeList({ birdById, sightingsByBird, photoVersion, total, onLog }) {
  const [sort, setSort] = useState('recent')
  const seen = Object.entries(sightingsByBird)
    .filter(([id]) => birdById[id])
    .map(([id, list]) => ({ bird: birdById[id], list, last: list[0].date }))
  seen.sort(sort === 'az' ? (a, b) => a.bird.name.localeCompare(b.bird.name) : (a, b) => b.last.localeCompare(a.last))
  const thisYear = String(new Date().getFullYear())
  const yearCount = seen.filter((s) => s.list.some((x) => x.date.startsWith(thisYear))).length

  return (
    <>
      <header className="topbar">
        <h1>My birds</h1>
      </header>
      <section className="stats">
        <div className="stat"><span className="stat-value">{seen.length}</span><span className="stat-label">species</span></div>
        <div className="stat"><span className="stat-value">{yearCount}</span><span className="stat-label">in {thisYear}</span></div>
        <div className="stat"><span className="stat-value">{total}</span><span className="stat-label">sightings</span></div>
      </section>
      <button className="btn primary big" onClick={onLog}>+ Log a sighting</button>

      {seen.length === 0 ? (
        <section className="card empty-card">
          <p className="empty-emoji">🐦</p>
          <p><strong>No birds yet.</strong></p>
          <p className="muted small">Log your first sighting, or browse <a href="#explore">Explore</a> to see which birds are around this season.</p>
        </section>
      ) : (
        <>
          <div className="row-between">
            <span className="muted small">{seen.length} species</span>
            <div className="seg-mini">
              <button className={sort === 'recent' ? 'on' : ''} onClick={() => setSort('recent')}>Recent</button>
              <button className={sort === 'az' ? 'on' : ''} onClick={() => setSort('az')}>A–Z</button>
            </div>
          </div>
          <ul className="grid">
            {seen.map(({ bird, list, last }) => (
              <li key={bird.id}>
                <a className="bird-card" href={`#bird/${bird.id}`}>
                  <BirdThumb bird={bird} sightings={list} version={photoVersion} />
                  <span className="bird-card-body">
                    <span className="bird-card-name">{bird.name}</span>
                    <span className="muted small">{list.length > 1 ? `${list.length}× · ` : ''}{dayLabel(last, { year: undefined })}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}

/* ---------- Explore ---------- */

function Explore({ birds, sightingsByBird, homeRegion, onRegion }) {
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('all')
  const [seenFilter, setSeenFilter] = useState('all')
  const [nearby, setNearby] = useState(false)
  const season = currentSeason()
  const seasonLabel = SEASONS.find((s) => s.id === season).label.toLowerCase()

  const q = query.trim().toLowerCase()
  const list = birds
    .filter((b) => {
      if (q && !b.name.toLowerCase().includes(q) && !b.sci?.toLowerCase().includes(q)) return false
      if (group !== 'all' && b.group !== group) return false
      if (seenFilter === 'seen' && !sightingsByBird[b.id]) return false
      if (seenFilter === 'unseen' && sightingsByBird[b.id]) return false
      if (nearby && homeRegion && !presentIn(b, homeRegion, season)) return false
      return true
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <>
      <header className="topbar">
        <h1>Explore</h1>
      </header>
      <section className="card nearby">
        <div className="row-between">
          <label className="switch">
            <input type="checkbox" checked={nearby} onChange={(e) => setNearby(e.target.checked)} disabled={!homeRegion} />
            <span>Likely around me this {seasonLabel}</span>
          </label>
        </div>
        <select value={homeRegion} onChange={(e) => { onRegion(e.target.value); setNearby(!!e.target.value) }} aria-label="Home region">
          <option value="">Choose your region…</option>
          {REGION_IDS.map((r) => <option key={r} value={r}>{REGIONS[r].name}</option>)}
        </select>
      </section>

      <input className="search" type="search" placeholder="Search birds" value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className="chips">
        {[['all', 'All'], ['unseen', 'Not seen yet'], ['seen', 'Seen']].map(([id, label]) => (
          <button key={id} className={seenFilter === id ? 'chip on' : 'chip'} onClick={() => setSeenFilter(id)}>{label}</button>
        ))}
      </div>
      <div className="chips">
        <button className={group === 'all' ? 'chip on' : 'chip'} onClick={() => setGroup('all')}>All groups</button>
        {Object.entries(GROUPS).filter(([id]) => birds.some((b) => b.group === id)).map(([id, g]) => (
          <button key={id} className={group === id ? 'chip on' : 'chip'} onClick={() => setGroup(id)}>{g.emoji} {g.label}</button>
        ))}
      </div>

      <section className="card">
        <p className="muted small">{list.length} {list.length === 1 ? 'bird' : 'birds'}</p>
        {list.length === 0 ? (
          <p className="empty">No birds match.</p>
        ) : (
          <ul className="rows">
            {list.map((b) => {
              const n = sightingsByBird[b.id]?.length
              const st = homeRegion && b.range?.[homeRegion]
              return (
                <li key={b.id}>
                  <a href={`#bird/${b.id}`} className="row">
                    <span className="row-emoji" aria-hidden="true">{GROUPS[b.group]?.emoji}</span>
                    <span className="row-main">
                      <span className="row-name">{b.name}</span>
                      <span className="muted small">
                        {b.sci && <em>{b.sci}</em>}
                        {st && <> · <span className={`dot-label ${STATUS[st].cls}`}>{STATUS[st].label}</span></>}
                      </span>
                    </span>
                    {n ? <span className="seen-badge">✓ {n > 1 ? n : ''}</span> : <span className="chev">›</span>}
                  </a>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </>
  )
}

/* ---------- Bird page ---------- */

function BirdPage({ bird, sightings, homeRegion, photoVersion, onLog, onEdit, onDelete, onPhoto }) {
  const [season, setSeason] = useState(currentSeason)
  const wiki = useWiki(bird)
  const mine = sightings.find((s) => s.hasPhoto)
  const seasonInfo = SEASONS.find((s) => s.id === season)

  const byStatus = {}
  if (bird.range) {
    for (const r of REGION_IDS) {
      const st = bird.range[r]
      if (st && seasonInfo.shows.includes(st)) (byStatus[st] ||= []).push(REGIONS[r].name)
    }
  }
  const homeStatus = homeRegion && bird.range?.[homeRegion]
  const back = () => (history.length > 1 ? history.back() : go('list'))

  return (
    <>
      <div className="bird-hero">
        {mine ? (
          <PhotoImg id={mine.id} version={photoVersion} alt={bird.name} className="hero-img" onClick={() => onPhoto(mine.id)} />
        ) : wiki?.img ? (
          <img src={wiki.img} alt={bird.name} className="hero-img" />
        ) : (
          <div className="hero-img img-placeholder"><span>{GROUPS[bird.group]?.emoji || '🪶'}</span></div>
        )}
        <button className="back" onClick={back} aria-label="Back">‹</button>
        {!mine && wiki?.img && <span className="credit">Photo: Wikipedia</span>}
        {mine && <span className="credit">Your photo</span>}
      </div>

      <section className="bird-head">
        <h1>{bird.name}</h1>
        {bird.sci && <p className="muted"><em>{bird.sci}</em></p>}
        <p className="seen-line">
          {sightings.length
            ? <>✓ Seen {sightings.length} {sightings.length === 1 ? 'time' : 'times'} · first on {dayLabel(sightings[sightings.length - 1].date)}</>
            : <span className="muted">Not seen yet</span>}
        </p>
        <button className="btn primary big" onClick={onLog}>+ Log a sighting</button>
      </section>

      <section className="card">
        <h2>Where to find it</h2>
        {bird.range ? (
          <>
            <div className="chips tight">
              {SEASONS.map((s) => (
                <button key={s.id} className={season === s.id ? 'chip on' : 'chip'} onClick={() => setSeason(s.id)}>
                  {s.label}{s.id === currentSeason() ? ' •' : ''}
                </button>
              ))}
            </div>
            <UsMap range={bird.range} season={season} />
            <ul className="legend">
              {Object.entries(STATUS).filter(([k]) => seasonInfo.shows.includes(k)).map(([k, s]) => (
                <li key={k}><span className={`swatch ${s.cls}`} />{s.label}</li>
              ))}
            </ul>
            {seasonInfo.note && <p className="muted small">{seasonInfo.note}</p>}
            {Object.keys(byStatus).length ? (
              <dl className="where">
                {Object.entries(STATUS).filter(([k]) => byStatus[k]).map(([k, s]) => (
                  <div key={k}>
                    <dt><span className={`swatch ${s.cls}`} />{s.label}</dt>
                    <dd>{byStatus[k].join(', ')}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="empty">Not usually found in the US this season.</p>
            )}
            {homeStatus && (
              <p className="home-note">
                In your region ({REGIONS[homeRegion].name}): <strong>{STATUS[homeStatus].label.toLowerCase()}</strong>
              </p>
            )}
            <p className="muted small">
              Ranges are simplified by region. For detailed maps see{' '}
              <a href={allAboutBirdsUrl(bird)} target="_blank" rel="noreferrer">All About Birds</a>.
            </p>
          </>
        ) : (
          <p className="muted small">
            No built-in range data for birds you add yourself.{' '}
            <a href={`https://ebird.org/explore?q=${encodeURIComponent(bird.name)}`} target="_blank" rel="noreferrer">Search eBird</a> for a range map.
          </p>
        )}
      </section>

      {wiki?.extract && (
        <section className="card">
          <h2>About</h2>
          <p className="extract">{wiki.extract}</p>
          {wiki.url && <a className="small" href={wiki.url} target="_blank" rel="noreferrer">Read more on Wikipedia</a>}
        </section>
      )}

      <section className="card">
        <h2>My sightings</h2>
        {sightings.length === 0 ? (
          <p className="empty">Your sightings of this bird will show up here.</p>
        ) : (
          <ul className="sightings">
            {sightings.map((s) => (
              <li key={s.id}>
                {s.hasPhoto && (
                  <PhotoImg id={s.id} version={photoVersion} alt={`${bird.name} on ${s.date}`} className="sighting-img" onClick={() => onPhoto(s.id)} />
                )}
                <div className="row-between">
                  <strong>{dayLabel(s.date)}</strong>
                  <span className="actions">
                    <button className="link" onClick={() => onEdit(s)}>Edit</button>
                    <button className="link danger" onClick={() => confirm('Delete this sighting?') && onDelete(s)}>Delete</button>
                  </span>
                </div>
                {s.location && <span className="muted small">📍 {s.location}</span>}
                {s.count > 1 && <span className="muted small">{s.count} birds</span>}
                {s.notes && <p className="notes">{s.notes}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

/* ---------- Log sheet ---------- */

function LogSheet({ initial, birds, birdById, sightingsByBird, onAddBird, onSave, onClose, onRegionDetected }) {
  const editing = !!initial.id
  const [birdId, setBirdId] = useState(initial.birdId || '')
  const [query, setQuery] = useState('')
  const [date, setDate] = useState(initial.date || today())
  const [location, setLocation] = useState(initial.location || '')
  const [count, setCount] = useState(initial.count || 1)
  const [notes, setNotes] = useState(initial.notes || '')
  const [photo, setPhoto] = useState(undefined) // Blob | null | undefined (unchanged)
  const [preview, setPreview] = useState('')
  const [locating, setLocating] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    let u = ''
    if (photo) {
      u = URL.createObjectURL(photo)
      setPreview(u)
    } else if (photo === undefined && initial.hasPhoto) {
      getPhoto(initial.id).then((b) => b && setPreview((u = URL.createObjectURL(b))))
    } else {
      setPreview('')
    }
    return () => u && URL.revokeObjectURL(u)
  }, [photo])

  const bird = birdById[birdId]
  const q = query.trim().toLowerCase()
  const matches = q
    ? birds.filter((b) => b.name.toLowerCase().includes(q)).sort((a, b) => a.name.toLowerCase().indexOf(q) - b.name.toLowerCase().indexOf(q)).slice(0, 8)
    : []
  const exact = birds.some((b) => b.name.toLowerCase() === q)

  const pickFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) setPhoto(await resizeImage(file))
  }

  const locate = () => {
    if (!navigator.geolocation) return alert('Location is not available on this device.')
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const fallback = `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`
        try {
          const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=en`)
          const j = await r.json()
          const place = [j.locality || j.city, j.principalSubdivisionCode?.split('-')[1] || j.principalSubdivision].filter(Boolean).join(', ')
          setLocation(place || fallback)
          if (STATE_REGION[j.principalSubdivision]) onRegionDetected(STATE_REGION[j.principalSubdivision])
        } catch {
          setLocation(fallback)
        }
        setLocating(false)
      },
      () => {
        setLocating(false)
        alert('Couldn’t get your location. Check location permission for your browser.')
      },
      { enableHighAccuracy: false, timeout: 10000 }
    )
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!birdId || saving) return
    setSaving(true)
    try {
      await onSave(
        {
          ...initial,
          id: initial.id || uid(),
          birdId,
          date,
          location: location.trim(),
          count: Math.max(1, Number(count) || 1),
          notes: notes.trim(),
          createdAt: initial.createdAt || Date.now(),
        },
        photo
      )
    } catch {
      setSaving(false)
      alert('Couldn’t save the photo. Your browser may be out of storage space.')
    }
  }

  return (
    <Sheet onClose={onClose} label="Log a sighting">
      <form className="stack" onSubmit={submit}>
        <div className="row-between">
          <h2>{editing ? 'Edit sighting' : 'Log a sighting'}</h2>
          <button type="button" className="link" onClick={onClose}>Cancel</button>
        </div>

        {bird ? (
          <div className="picked-bird">
            <span>
              <strong>{bird.name}</strong>
              {!sightingsByBird[bird.id] && <span className="new-badge">New for you!</span>}
            </span>
            {!editing && <button type="button" className="link" onClick={() => { setBirdId(''); setQuery('') }}>Change</button>}
          </div>
        ) : (
          <div className="field">
            <span>Bird</span>
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Start typing… e.g. robin" autoFocus />
            {q && (
              <ul className="matches">
                {matches.map((b) => (
                  <li key={b.id}>
                    <button type="button" onClick={() => setBirdId(b.id)}>
                      {GROUPS[b.group]?.emoji} {b.name}
                      {sightingsByBird[b.id] && <span className="muted small"> · seen</span>}
                    </button>
                  </li>
                ))}
                {!exact && (
                  <li>
                    <button type="button" className="add-new" onClick={() => setBirdId(onAddBird(query.trim()).id)}>
                      + Add “{query.trim()}” as a new bird
                    </button>
                  </li>
                )}
              </ul>
            )}
          </div>
        )}

        <div className="photo-field">
          {preview ? (
            <div className="photo-preview">
              <img src={preview} alt="Selected" />
              <button type="button" className="photo-remove" onClick={() => setPhoto(null)} aria-label="Remove photo">✕</button>
            </div>
          ) : (
            <button type="button" className="photo-add" onClick={() => fileRef.current?.click()}>
              <span className="photo-add-icon">📷</span>
              <span>Add a photo <em>(optional)</em></span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickFile} />
        </div>

        <div className="two">
          <label className="field">
            <span>Date</span>
            <input type="date" required value={date} max={today()} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="field">
            <span>How many</span>
            <input type="number" inputMode="numeric" min="1" value={count} onChange={(e) => setCount(e.target.value)} />
          </label>
        </div>
        <div className="field">
          <span>Location</span>
          <div className="loc">
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Backyard, Lake Harriet…" />
            <button type="button" className="btn" onClick={locate} disabled={locating} aria-label="Use my location">
              {locating ? '…' : '📍'}
            </button>
          </div>
        </div>
        <label className="field">
          <span>Notes</span>
          <textarea rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Behavior, song, what it was eating…" />
        </label>
        <button className="btn primary big" type="submit" disabled={!birdId || saving}>
          {saving ? 'Saving…' : editing ? 'Save changes' : 'Save sighting'}
        </button>
      </form>
    </Sheet>
  )
}

/* ---------- Settings ---------- */

function Settings({ state, onRegion, onReplace, notify }) {
  const fileRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const photoCount = state.sightings.filter((s) => s.hasPhoto).length

  const backup = async () => {
    setBusy(true)
    try {
      const photos = {}
      for (const s of state.sightings) {
        if (!s.hasPhoto) continue
        const blob = await getPhoto(s.id).catch(() => null)
        if (blob) photos[s.id] = await blobToDataURL(blob)
      }
      download(`bird-sightings-backup-${today()}.json`, JSON.stringify({ app: 'bird-sightings', version: 1, ...state, photos }), 'application/json')
      notify('Backup downloaded')
    } finally {
      setBusy(false)
    }
  }

  const restore = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const data = JSON.parse(await file.text())
      if (!Array.isArray(data.sightings)) throw new Error('Not a Bird Sightings backup file')
      const next = clean(data)
      if (!confirm(`Replace current data with ${next.sightings.length} sightings from this backup?`)) return
      setBusy(true)
      await clearPhotos()
      for (const [id, url] of Object.entries(data.photos || {})) await putPhoto(id, await dataURLToBlob(url))
      onReplace(next, 'Backup restored')
    } catch (err) {
      alert(err.message || 'Could not read that file')
    } finally {
      setBusy(false)
    }
  }

  const erase = async () => {
    if (!confirm('Delete all sightings and photos? Download a backup first if you need one.')) return
    await clearPhotos().catch(() => {})
    onReplace(EMPTY, 'All data erased')
  }

  return (
    <>
      <header className="topbar">
        <h1>Settings</h1>
      </header>
      <section className="card">
        <h2>Home region</h2>
        <p className="muted small">Used for “likely around me” in Explore and the note on each bird’s map.</p>
        <select value={state.homeRegion} onChange={(e) => onRegion(e.target.value)}>
          <option value="">Not set</option>
          {REGION_IDS.map((r) => <option key={r} value={r}>{REGIONS[r].name}</option>)}
        </select>
      </section>
      <section className="card">
        <h2>Your data</h2>
        <p className="muted small">
          Sightings and photos ({photoCount}) are saved only on this device, in this browser. Download a backup now and then, or to move to another phone.
        </p>
        <button className="btn" onClick={backup} disabled={busy}>{busy ? 'Working…' : 'Download backup (with photos)'}</button>
        <button className="btn" onClick={() => fileRef.current?.click()} disabled={busy}>Restore from backup</button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={restore} />
        <button className="btn danger" onClick={erase}>Erase all data</button>
      </section>
      <p className="muted small center">
        Range data is simplified from general field-guide knowledge. Reference photos and descriptions come from Wikipedia.
        <br />Tip: Share → Add to Home Screen to open it like an app.
      </p>
    </>
  )
}
