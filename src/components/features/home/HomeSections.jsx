import { Icon } from '@iconify/react'
import React, { useEffect, useState } from 'react'
import { useLang } from '../../../context/LangContext'
import { enrichPlace } from '../../../services/placesService'
import { featuredPlaces } from '../../../data/featuredPlaces'

// หมวดหมู่ใต้ Hero — กดแล้วค้นหาคำนั้นในหน้าสถานที่
export const CATEGORIES = [
  { q: '', th: 'ทั้งหมด', en: 'All', icon: 'lucide:layout-grid' },
  { q: 'ดอย', th: 'ภูเขา/ดอย', en: 'Mountains', icon: 'lucide:mountain' },
  { q: 'หาด', th: 'ชายหาด', en: 'Beaches', icon: 'lucide:waves' },
  { q: 'เกาะ', th: 'เกาะ', en: 'Islands', icon: 'lucide:sailboat' },
  { q: 'วัด', th: 'วัด', en: 'Temples', icon: 'lucide:landmark' },
  { q: 'น้ำตก', th: 'น้ำตก', en: 'Waterfalls', icon: 'lucide:droplets' },
  { q: 'ตลาด', th: 'ตลาด', en: 'Markets', icon: 'lucide:store' },
  { q: 'อุทยาน', th: 'อุทยาน', en: 'National parks', icon: 'lucide:trees' },
]

const REGION_TILES = [
  { id: 'north', icon: 'lucide:mountain-snow', color: '#10b981' },
  { id: 'central', icon: 'lucide:landmark', color: '#f59e0b' },
  { id: 'northeast', icon: 'lucide:sun', color: '#8b5cf6' },
  { id: 'east', icon: 'lucide:sailboat', color: '#3b82f6' },
  { id: 'south', icon: 'lucide:palmtree', color: '#ec4899' },
]

// ช่องค้นหาใน Hero
export function HeroSearch({ onSearch }) {
  const { lang } = useLang()
  const [q, setQ] = useState('')
  return (
    <form className="hs-search" onSubmit={e => { e.preventDefault(); onSearch?.(q.trim()) }}>
      <Icon icon="lucide:search" width={20} />
      <input value={q} onChange={e => setQ(e.target.value)}
        placeholder={lang === 'en' ? 'Search places or provinces...' : 'ค้นหาสถานที่ หรือจังหวัด...'} />
      <button type="submit">{lang === 'en' ? 'Search' : 'ค้นหา'}</button>
    </form>
  )
}

// แถบหมวดหมู่
export function CategoryBar({ onSearch }) {
  const { lang } = useLang()
  return (
    <div className="home-wrap">
      <div className="cat-bar">
        {CATEGORIES.map(c => (
          <button key={c.th} className="cat-chip" onClick={() => onSearch?.(c.q)}>
            <Icon icon={c.icon} width={16} /> {lang === 'en' ? c.en : c.th}
          </button>
        ))}
      </div>
    </div>
  )
}

// สถานที่ยอดนิยม Top Rated (เลื่อนแนวนอน)
export function TopRated({ onPlaceClick, onSeeAll }) {
  const { lang, tp, tRegion } = useLang()
  const [items, setItems] = useState([])
  useEffect(() => {
    const top = [...featuredPlaces].sort((a, b) => b.rating - a.rating)
    Promise.all(top.map(p => enrichPlace({ ...p, name_th: p.name }))).then(setItems).catch(() => setItems(top))
  }, [])
  return (
    <section className="home-sec">
      <div className="home-wrap">
        <div className="home-sec-head">
          <h2><Icon icon="material-symbols:star-rounded" style={{ color: '#f59e0b' }} /> {lang === 'en' ? 'Top Rated (4.5+)' : 'สถานที่ยอดนิยม (Top Rated 4.5+)'}</h2>
          <button className="home-more" onClick={onSeeAll}>{lang === 'en' ? 'See all' : 'ดูทั้งหมด'} <Icon icon="lucide:arrow-right" width={15} /></button>
        </div>
        <div className="top-row">
          {items.filter(p => p.rating >= 4.5).map((p, i) => (
            <button key={p.name} className="top-card" style={{ '--d': `${i * 50}ms` }} onClick={() => onPlaceClick?.(p)}>
              <div className="top-img">
                <img src={p.img} alt="" loading="lazy" />
                <span className="top-rank">#{i + 1}</span>
              </div>
              <div className="top-info">
                <b>{tp(p, 'name')}</b>
                <small><Icon icon="material-symbols:star-rounded" style={{ color: '#f59e0b' }} /> {p.rating} · {tRegion(p.region)}</small>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

// สำรวจตามภาค + ปุ่มไปหน้าแผนที่
export function RegionExplore({ onRegion, onMap }) {
  const { lang, t } = useLang()
  return (
    <section className="home-sec">
      <div className="home-wrap">
        <div className="home-sec-head">
          <h2><Icon icon="lucide:compass" style={{ color: '#8b5cf6' }} /> {lang === 'en' ? 'Explore by region' : 'สำรวจตามภาค'}</h2>
        </div>
        <div className="region-tiles">
          {REGION_TILES.map(r => (
            <button key={r.id} className="region-tile" style={{ '--c': r.color }} onClick={() => onRegion?.(r.id)}>
              <Icon icon={r.icon} width={26} />
              <span>{t(`region.${r.id}`)}</span>
            </button>
          ))}
        </div>
        <button className="map-cta" onClick={onMap}>
          <Icon icon="lucide:map" width={22} />
          <span>{lang === 'en' ? 'Explore all places on the map' : 'ดูสถานที่ทั้งหมดบนแผนที่'}</span>
          <small>Map View</small>
          <Icon icon="lucide:arrow-right" width={18} />
        </button>
      </div>
    </section>
  )
}
