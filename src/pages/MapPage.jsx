import { useLang } from '../context/LangContext'
import { Icon } from '@iconify/react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { getPlaces } from '../services/placesService'
import { getCoords } from '../data/provinceCoords'
import HoloCard from '../components/features/map/HoloCard'
import { getIcon } from '@iconify/react'

// SVG ของหมุดพิกัด (Iconify) สำหรับใช้ใน marker ของ Leaflet
const PIN_ICON = 'material-symbols:location-on'
const pinSvg = () => {
  const ic = getIcon(PIN_ICON)
  if (!ic) return ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${ic.left || 0} ${ic.top || 0} ${ic.width} ${ic.height}" width="36" height="36">${ic.body}</svg>`
}

const REGIONS = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'north', label: 'ภาคเหนือ' },
  { id: 'central', label: 'ภาคกลาง' },
  { id: 'northeast', label: 'ภาคตะวันออกเฉียงเหนือ' },
  { id: 'east', label: 'ภาคตะวันออก' },
  { id: 'south', label: 'ภาคใต้' },
]
const REGION_COLOR = { north: '#10b981', central: '#f59e0b', northeast: '#8b5cf6', east: '#3b82f6', south: '#ec4899' }

// โหลด Leaflet จาก CDN (ไม่ต้อง npm install)
let leafletPromise
const loadLeaflet = () => {
  if (window.L) return Promise.resolve(window.L)
  if (leafletPromise) return leafletPromise
  leafletPromise = new Promise((resolve, reject) => {
    const css = document.createElement('link')
    css.rel = 'stylesheet'; css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(css)
    const js = document.createElement('script')
    js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    js.onload = () => resolve(window.L); js.onerror = reject
    document.head.appendChild(js)
  })
  return leafletPromise
}

export default function MapPage({ onPlaceClick }) {
  const { t, tRegion, lang, tp } = useLang()
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [region, setRegion] = useState('all')
  const [search, setSearch] = useState('')
  const [pinned, setPinned] = useState(null)    // สถานที่ที่กดเลือก
  const [hovered, setHovered] = useState(null)  // สถานที่ที่เมาส์ชี้
  const [cardPos, setCardPos] = useState(null)

  const mapEl = useRef(null)
  const mapRef = useRef(null)
  const layerRef = useRef(null)
  const markersRef = useRef({})

  useEffect(() => {
    getPlaces().then(setPlaces).catch(console.error).finally(() => setLoading(false))
  }, [])

  // ใส่พิกัดให้ทุกสถานที่
  const withCoords = useMemo(() => {
    const count = {}
    return places.map(p => {
      const i = count[p.province] = (count[p.province] ?? -1) + 1
      return { ...p, coords: getCoords(p, i) }
    }).filter(p => p.coords)
  }, [places])

  const list = useMemo(() => withCoords.filter(p =>
    (region === 'all' || p.regionId === region) &&
    (search === '' || [p.name, p.province, p.name_en, p.province_en].some(v => v?.toLowerCase().includes(search.toLowerCase())))
  ), [withCoords, region, search])

  const active = hovered || pinned

  const updateCardPos = (place) => {
    if (!place || !mapRef.current) return setCardPos(null)
    const pt = mapRef.current.latLngToContainerPoint(place.coords)
    setCardPos({ x: pt.x, y: pt.y })
  }

  // สร้างแผนที่
  useEffect(() => {
    let cancelled = false
    loadLeaflet().then(L => {
      if (cancelled || mapRef.current) return
      const map = L.map(mapEl.current, { zoomControl: true, attributionControl: true }).setView([13.2, 101], 6)
      // ภาพแผนที่ไม่ต้องใช้ API key — ถ้าแหล่งแรกโหลดไม่ได้จะสลับไปแหล่งถัดไปอัตโนมัติ
      const TILE_SOURCES = [
        { url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 },
        { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
          attribution: 'Tiles &copy; Esri', maxZoom: 19 },
      ]
      let srcIndex = 0, errors = 0, tiles
      const useSource = (i) => {
        if (tiles) map.removeLayer(tiles)
        errors = 0
        const src = TILE_SOURCES[i]
        tiles = L.tileLayer(src.url, { attribution: src.attribution, maxZoom: src.maxZoom }).addTo(map)
        tiles.on('tileerror', () => {
          errors += 1
          if (errors >= 4 && srcIndex < TILE_SOURCES.length - 1) useSource(++srcIndex)
        })
      }
      useSource(0)
      setTimeout(() => map.invalidateSize(), 200) // แก้แผนที่แสดงไม่เต็มกรอบ
      const onResize = () => map.invalidateSize()
      window.addEventListener('resize', onResize)
      map.on('unload', () => window.removeEventListener('resize', onResize))
      layerRef.current = L.layerGroup().addTo(map)
      mapRef.current = map
      map.on('click', () => setPinned(null))
      setPlaces(p => [...p]) // trigger วาดหมุด
    })
    return () => { cancelled = true; mapRef.current?.remove(); mapRef.current = null }
  }, [])

  // วาดหมุด
  useEffect(() => {
    const L = window.L
    if (!L || !layerRef.current) return
    layerRef.current.clearLayers(); markersRef.current = {}
    list.forEach(p => {
      const color = REGION_COLOR[p.regionId] || '#22d3ee'
      const icon = L.divIcon({
        className: '',
        html: `<div class="map-pin" style="--pin:${color}">${pinSvg()}</div>`,
        iconSize: [36, 36], iconAnchor: [18, 34],
      })
      const m = L.marker(p.coords, { icon }).addTo(layerRef.current)
      m.on('mouseover', () => setHovered(p))
      m.on('mouseout', () => setHovered(null))
      m.on('click', (e) => { L.DomEvent.stopPropagation(e); setPinned(p) })
      markersRef.current[p.id] = m
    })
  }, [list])

  // ขยับการ์ดตามหมุดเมื่อเลื่อน/ซูมแผนที่
  useEffect(() => {
    updateCardPos(active)
    const map = mapRef.current
    if (!map) return
    const h = () => updateCardPos(active)
    map.on('move zoom', h)
    return () => map.off('move zoom', h)
  }, [active])

  const selectFromList = (p) => {
    setPinned(p)
    mapRef.current?.flyTo(p.coords, 10, { duration: 0.8 })
  }

  return (
    <div className="map-page" style={page}>
      <aside className="map-sidebar" style={sidebar}>
        <h2 style={{ margin: '0 0 4px', fontSize: 20, color: 'var(--text)' }}>{t('map.title')}</h2>
        <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--text3)' }}>{t('map.desc')}</p>
        <input style={searchBox} placeholder={t('map.search')}
          value={search} onChange={e => setSearch(e.target.value)} />
        <div style={chipRow}>
          {REGIONS.map(r => (
            <button key={r.id} onClick={() => setRegion(r.id)}
              style={{ ...chip, ...(region === r.id ? chipActive : {}) }}>{t(`region.${r.id}`)}</button>
          ))}
        </div>
        <div className="map-list" style={listBox}>
          {loading && <p style={muted}>{t('common.loading')}</p>}
          {!loading && list.length === 0 && <p style={muted}>{t('places.empty')}</p>}
          {list.map(p => (
            <button key={p.id} onClick={() => selectFromList(p)}
              onMouseEnter={() => setHovered(p)} onMouseLeave={() => setHovered(null)}
              style={{ ...item, ...(pinned?.id === p.id ? itemActive : {}) }}>
              {p.imageUrl ? <img src={p.imageUrl} alt="" style={thumb} onError={e => { e.currentTarget.style.visibility = 'hidden' }} /> : <div style={{ ...thumb, background: 'var(--bg2)' }} />}
              <div style={{ minWidth: 0, textAlign: 'left' }}>
                <div style={itemName}>{tp(p, 'name')}</div>
                <div style={itemSub}><Icon icon="lucide:map-pin" style={{ verticalAlign:'-0.15em' }} /> {tp(p, 'province') || p.region}</div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <section className="map-wrap" style={mapWrap}>
        <div ref={mapEl} style={{ width: '100%', height: '100%' }} />
        {active && cardPos && (
          <HoloCard key={active.id} place={active} x={cardPos.x} y={cardPos.y}
            pinned={pinned?.id === active.id}
            onDetail={onPlaceClick ? () => onPlaceClick(active) : null}
            onClose={() => setPinned(null)} />
        )}
      </section>
    </div>
  )
}

const page = { display: 'flex', gap: 16, padding: 16, height: 'calc(100vh - 64px)', boxSizing: 'border-box', background: 'var(--bg)', flexWrap: 'wrap' }
const sidebar = { flex: '0 0 320px', maxWidth: '100%', display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%' }
const searchBox = { padding: '10px 14px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: 14, marginBottom: 10, outline: 'none' }
const chipRow = { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }
const chip = { padding: '5px 12px', borderRadius: 99, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', fontSize: 12, cursor: 'pointer' }
const chipActive = { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' }
const listBox = { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, paddingRight: 4 }
const item = { display: 'flex', alignItems: 'center', gap: 10, padding: 8, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--card)', cursor: 'pointer' }
const itemActive = { borderColor: '#22d3ee', boxShadow: '0 0 0 1px #22d3ee' }
const thumb = { width: 52, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }
const itemName = { fontSize: 14, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
const itemSub = { fontSize: 12, color: 'var(--text3)' }
const muted = { color: 'var(--text3)', fontSize: 13 }
const mapWrap = { flex: 1, minWidth: 300, minHeight: 400, position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', background: '#aad3df' }
