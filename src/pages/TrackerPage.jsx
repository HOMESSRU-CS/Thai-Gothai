import { useLang } from '../context/LangContext'
import { Icon } from '@iconify/react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { getPlaces } from '../services/placesService'
import { getCoords } from '../data/provinceCoords'
import { getVisited, VISITED_EVENT } from '../services/visitedService'

// รูปขวานประเทศไทย 100 ช่อง: [คอลัมน์เริ่ม, จำนวนช่อง] ต่อแถว (แถวคี่เยื้องครึ่งช่อง)
const AXE_ROWS = [
  [2, 3], [1, 4], [1, 5], [1, 6],          // ภาคเหนือ
  [1, 9], [2, 9], [2, 9], [2, 9],          // เหนือตอนล่าง + อีสาน
  [3, 8], [3, 7], [4, 5], [4, 4], [4, 3],  // ภาคกลาง + ตะวันออก
  [4, 2], [3, 2], [3, 2], [3, 2], [3, 2],  // ด้ามขวาน (ภาคใต้)
  [3, 3], [4, 3], [5, 3],
]
const DEG = 0.72                          // ระยะช่องโดยประมาณ (องศา) ใช้จับคู่กับพิกัดจริง

// ช่องหกเหลี่ยมต่อกันสนิท
const HEX_W = 64
const HEX_H = HEX_W * 1.1547
const ROW_H = HEX_H * 0.75

// Hungarian algorithm: n แถว (สถานที่) ≤ m คอลัมน์ (ช่อง) → คืน index ช่องของแต่ละสถานที่
function hungarian(a) {
  const n = a.length, m = a[0]?.length || 0
  if (!n || n > m) return a.map((_, i) => (i < m ? i : -1))
  const INF = 1e18, u = new Array(n + 1).fill(0), v = new Array(m + 1).fill(0)
  const p = new Array(m + 1).fill(0), way = new Array(m + 1).fill(0)
  for (let i = 1; i <= n; i++) {
    p[0] = i; let j0 = 0
    const minv = new Array(m + 1).fill(INF), used = new Array(m + 1).fill(false)
    do {
      used[j0] = true; const i0 = p[j0]; let delta = INF, j1 = 0
      for (let j = 1; j <= m; j++) if (!used[j]) {
        const cur = a[i0 - 1][j - 1] - u[i0] - v[j]
        if (cur < minv[j]) { minv[j] = cur; way[j] = j0 }
        if (minv[j] < delta) { delta = minv[j]; j1 = j }
      }
      for (let j = 0; j <= m; j++) used[j] ? (u[p[j]] += delta, v[j] -= delta) : (minv[j] -= delta)
      j0 = j1
    } while (p[j0] !== 0)
    do { const j1 = way[j0]; p[j0] = p[j1]; j0 = j1 } while (j0)
  }
  const res = new Array(n).fill(-1)
  for (let j = 1; j <= m; j++) if (p[j]) res[p[j] - 1] = j - 1
  return res
}

function layoutTiles(places) {
  const cells = []
  AXE_ROWS.forEach(([start, len], r) => {
    for (let c = start; c < start + len; c++) {
      const off = r % 2 ? 0.5 : 0
      cells.push({ r, c, lat: 20.4 - r * DEG, lng: 97.6 + (c + off) * DEG })
    }
  })
  // จับคู่สถานที่ ↔ ช่อง ให้ระยะรวมน้อยที่สุด (Hungarian algorithm)
  const placeOf = new Array(cells.length).fill(null)
  const cost = places.map(p => cells.map(c => (p.coords[0] - c.lat) ** 2 + (p.coords[1] - c.lng) ** 2))
  hungarian(cost).forEach((ci, pi) => { if (ci >= 0) placeOf[ci] = places[pi] })

  const minC = Math.min(...cells.map(c => c.c)), minR = Math.min(...cells.map(c => c.r))
  const tiles = cells.map((c, i) => ({ c, place: placeOf[i] })).filter(t => t.place).map(({ c, place }) => ({
    key: `${c.r}-${c.c}`,
    place,
    x: (c.c - minC) * HEX_W + (c.r % 2 ? HEX_W / 2 : 0),
    y: (c.r - minR) * ROW_H,
  }))
  return {
    tiles,
    width: Math.max(...tiles.map(t => t.x)) + HEX_W,
    height: Math.max(...tiles.map(t => t.y)) + HEX_H,
  }
}

export default function CollectionPage({ onPlaceClick }) {
  const { t, tRegion, lang, tp } = useLang()
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [visited, setVisited] = useState(getVisited)
  const [scale, setScale] = useState(1)
  const boxRef = useRef(null)

  useEffect(() => {
    getPlaces().then(list => {
      const count = {}
      setPlaces(list.map(p => {
        const i = count[p.province] = (count[p.province] ?? -1) + 1
        return { ...p, coords: getCoords(p, i) }
      }).filter(p => p.coords))
    }).catch(console.error).finally(() => setLoading(false))
    const onChange = () => setVisited(getVisited())
    window.addEventListener(VISITED_EVENT, onChange)
    return () => window.removeEventListener(VISITED_EVENT, onChange)
  }, [])

  const layout = useMemo(() => places.length ? layoutTiles(places) : null, [places])

  // ย่อ/ขยายให้พอดีความกว้างจอ
  useEffect(() => {
    if (!layout || !boxRef.current) return
    const fit = () => setScale(Math.min(1, (boxRef.current.clientWidth - 8) / layout.width))
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [layout])


  return (
    <div className="col-page">
      <div className="col-head">
        <div>
          <h2 className="col-title"><Icon icon="lucide:hexagon" /> {t('col.title')}</h2>
          <p className="col-sub">{t('col.desc')}</p>
        </div>
      </div>

      <div className="col-board" ref={boxRef}>
        {loading && <div className="col-loading"><Icon icon="svg-spinners:blocks-shuffle-2" width="48" /></div>}
        {layout && (
          <div className="col-canvas" style={{ width: layout.width * scale, height: layout.height * scale }}>
            <div style={{ width: layout.width, height: layout.height, transform: `scale(${scale})`, transformOrigin: '0 0', position: 'relative' }}>
              {layout.tiles.map(({ key, place, x, y }, i) => {
                const open = visited.has(place.id)
                return (
                  <button key={place.id} className={`col-tile ${open ? 'open' : 'locked'}`}
                    style={{ left: x, top: y, '--d': `${i * 5}ms`, '--rc': REGION_COLOR[place.regionId] || '#60a5fa' }}
                    onClick={() => onPlaceClick?.(place)}
                    title={open ? tp(place, 'name') : `??? (${tp(place, 'province')})`}>
                    <span className="col-shape">
                      {open ? (
                        <>
                          {place.imageUrl && <img src={place.imageUrl} alt="" onError={e => { e.currentTarget.style.display = 'none' }} />}
                          <span className="col-name">{tp(place, 'name')}</span>
                        </>
                      ) : <span className="col-q">?</span>}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="col-legend">
        {Object.keys(REGION_COLOR).map(id => (
          <span key={id}><i style={{ background: REGION_COLOR[id] }} /> {t(`region.${id}`)}</span>
        ))}
        <span><i className="locked-dot" /> {t('col.locked')}</span>
      </div>
    </div>
  )
}

const REGION_COLOR = { north: '#10b981', central: '#f59e0b', northeast: '#8b5cf6', east: '#3b82f6', south: '#ec4899' }
const REGION_LABEL = { north: 'เหนือ', central: 'กลาง', northeast: 'ตะวันออกเฉียงเหนือ', east: 'ตะวันออก', south: 'ใต้' }
