// Sighting photos live in IndexedDB (localStorage is far too small for images).
const DB = 'bird-sightings'
const STORE = 'photos'

let dbPromise
function db() {
  dbPromise ||= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

async function tx(mode, fn) {
  const d = await db()
  return new Promise((resolve, reject) => {
    const t = d.transaction(STORE, mode)
    const req = fn(t.objectStore(STORE))
    t.oncomplete = () => resolve(req?.result)
    t.onerror = () => reject(t.error)
  })
}

export const putPhoto = (id, blob) => tx('readwrite', (s) => s.put(blob, id))
export const getPhoto = (id) => tx('readonly', (s) => s.get(id))
export const deletePhoto = (id) => tx('readwrite', (s) => s.delete(id))
export const clearPhotos = () => tx('readwrite', (s) => s.clear())

// Shrink camera photos (often 4–12 MB) to a sensible size before storing
export async function resizeImage(file, max = 1600) {
  const bitmap = await createImageBitmap(file).catch(() => null)
  if (!bitmap) return file
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close?.()
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b || file), 'image/jpeg', 0.85))
}

export const blobToDataURL = (blob) =>
  new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = () => reject(r.error)
    r.readAsDataURL(blob)
  })

export const dataURLToBlob = (url) => fetch(url).then((r) => r.blob())
