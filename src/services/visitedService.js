// เก็บรายการสถานที่ที่ "ไปมาแล้ว" ไว้ในเครื่องผู้ใช้ (localStorage)
const KEY = 'gothai_visited'
export const VISITED_EVENT = 'gothai-visited-change'

export const getVisited = () => {
  try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')) } catch { return new Set() }
}

export const toggleVisited = (id) => {
  const set = getVisited()
  set.has(id) ? set.delete(id) : set.add(id)
  try { localStorage.setItem(KEY, JSON.stringify([...set])) } catch { /* ignore */ }
  window.dispatchEvent(new Event(VISITED_EVENT))
  return set.has(id)
}
