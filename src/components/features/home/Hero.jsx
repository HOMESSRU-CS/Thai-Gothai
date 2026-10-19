import { useLang } from '../../../context/LangContext'
import React, { useEffect, useState } from 'react'
import { HeroSearch } from './HomeSections'
import { Icon } from '@iconify/react'
import { featuredPlaces } from '../../../data/featuredPlaces'

// Icons (Iconify)
const CompassIcon = ({ size = 18 }) => <Icon icon="lucide:compass" width={size} height={size} />
const ArrowRightIcon = ({ size = 15 }) => <Icon icon="lucide:arrow-right" width={size} height={size} />
const ClipboardListIcon = ({ size = 17 }) => <Icon icon="lucide:clipboard-list" width={size} height={size} />
const MapPinIcon = ({ size = 12 }) => <Icon icon="lucide:map-pin" width={size} height={size} />
const StarFillIcon = ({ size = 12 }) => <Icon icon="material-symbols:star-rounded" width={size} height={size} style={{ color:'#f59e0b' }} />

// ใช้ 9 สถานที่ยอดนิยมชุดเดียวกับหน้าแรก
const places = featuredPlaces

// Duplicate for seamless loop
const col1 = [...places.filter((_,i)=>i%3===0), ...places.filter((_,i)=>i%3===0)]
const col2 = [...places.filter((_,i)=>i%3===1), ...places.filter((_,i)=>i%3===1)]
const col3 = [...places.filter((_,i)=>i%3===2), ...places.filter((_,i)=>i%3===2)]

const baseStats = [
  { value:'100+', label:'stat.places' },
  { value:'5', label:'stat.regions' },
  { key:'shops', value:'–', label:'stat.shops' },
  { value:'4.8', label:'stat.rating' },
]

export default function Hero({ onSurveyClick, onPlacesClick, onSearch }) {
  const { t, tRegion, lang } = useLang()
  const [shopCount, setShopCount] = useState(null)
  useEffect(() => {
    fetch('/data/places_all.json').then(r => r.json()).then(d => {
      const n = Object.values(d.places || {}).reduce((sum, p) => sum + (p.shops || []).filter(sh => sh.partner).length, 0)
      setShopCount(n)
    }).catch(() => {})
  }, [])
  const stats = baseStats.map(st => st.key === 'shops' ? { ...st, value: shopCount ?? '–' } : st)
  return (
    <section style={heroSection}>
      {/* Dark overlay */}
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.6) 100%)', zIndex:0 }} />

      <div className="hero-inner" style={heroInner}>
        {/* LEFT */}
        <div className="hero-left" style={leftCol}>
          <div style={badgeStyle}>
            <span className="live-dot"><Icon icon="material-symbols:circle" width="10" height="10" /></span>
            {t('hero.welcome')} <b style={{ color:'#fff', letterSpacing:'0.5px' }}>GOTHAI</b>
          </div>

          <h1 style={h1}>
            {t('hero.title1')}<br />
            <span className="hero-accent">{t('hero.title2')}</span>
          </h1>

          <p style={descStyle}>
            <b style={{ color:'#fff' }}>GOTHAI</b> {t('hero.desc1')}<br />{t('hero.desc2')}
          </p>

          <HeroSearch onSearch={onSearch} />

          <div style={btnRow}>
            <button style={primaryBtn} onClick={onPlacesClick}>
              <CompassIcon size={18} />
              <span>{t('hero.explore')}</span>
              <ArrowRightIcon size={15} />
            </button>
            <button style={ghostBtn} onClick={onSurveyClick}>
              <ClipboardListIcon size={17} />
              <span>{t('hero.survey')}</span>
            </button>
          </div>

          <div className="hero-stats" style={statsRow}>
            {stats.map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <div style={divider} />}
                <div>
                  <div style={statVal}>{s.value}</div>
                  <div style={statLabel}>{t(s.label)}</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Wave ล่างสุดเพื่อ transition เข้าหน้า dark */}
      <div style={{ position:'absolute', bottom:-1, left:0, right:0, zIndex:3, lineHeight:0 }}>
        <svg viewBox="0 0 1440 72" preserveAspectRatio="none" style={{ display:'block', width:'100%', height:72 }}>
          <path d="M0,30 C240,72 480,0 720,36 C960,72 1200,10 1440,36 L1440,72 L0,72 Z"
            style={{ fill:'var(--bg)' }} />
        </svg>
      </div>

      <style>{`
        @keyframes scrollUp {
          from { transform: translateY(0); }
          to   { transform: translateY(-50%); }
        }
      `}</style>
    </section>
  )
}

function ScrollColumn({ cards, duration, offset, offset2 }) {
  const delay = offset ? `-${duration * 0.4}s` : offset2 ? `-${duration * 0.7}s` : '0s'
  return (
    <div style={{ position:'relative', height:520 }}>
      {/* fade บน-ล่าง ต่อ column เพื่อไม่ให้ทำ compositing layer บน rightCol */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:90, background:'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent)', pointerEvents:'none', zIndex:2 }} />
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:90, background:'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent)', pointerEvents:'none', zIndex:2 }} />
      <div style={{ overflow:'hidden', height:'100%' }}>
        <div style={{
          display:'flex', flexDirection:'column', gap:12,
          animation: `scrollUp ${duration}s linear infinite`,
          animationDelay: delay,
          willChange: 'transform',
        }}>
          {cards.map((p, i) => <MiniCard key={i} place={p} />)}
        </div>
      </div>
    </div>
  )
}

function MiniCard({ place }) {
  return (
    <div style={cardStyle}>
      <div style={{ position:'relative', height:110, overflow:'hidden', borderRadius:'10px 10px 0 0', background: place.gradient }}>
        {/* รูปจริงจาก picsum — gradient เป็น fallback */}
        <img
          src={place.img}
          alt={place.name}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', display:'block' }}
          loading="lazy"
        />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55))' }} />
        <span style={regionChip}>{place.region}</span>
      </div>
      <div style={{ padding:'8px 12px 10px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:12, fontWeight:700, color:'#fff' }}>{place.name}</span>
        <span style={{ display:'flex', alignItems:'center', gap:3 }}>
          <StarFillIcon /><span style={{ fontSize:11, fontWeight:600, color:'#fff' }}>{place.rating}</span>
        </span>
      </div>
      <div style={{ padding:'0 12px 10px', display:'flex', alignItems:'center', gap:4, color:'rgba(255,255,255,0.55)' }}>
        <MapPinIcon /><span style={{ fontSize:10 }}>{place.province}</span>
      </div>
    </div>
  )
}

// Styles
const heroSection = {
  overflow:'hidden', position:'relative',
  backgroundImage:'url(/details/North/doi_inthanon.png)',
  backgroundSize:'cover', backgroundPosition:'center',
}
const heroInner = {
  maxWidth:1280, margin:'0 auto', padding:'72px 24px 120px',
  display:'flex', alignItems:'center', gap:60,
  minHeight:'calc(100vh - 64px)',
  position:'relative', zIndex:1,
}
const leftCol = { flex:'0 0 auto', maxWidth:520 }
const badgeStyle = {
  display:'inline-flex', alignItems:'center', gap:8,
  background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)',
  borderRadius:99, padding:'5px 14px', fontSize:13, color:'rgba(255,255,255,0.85)', marginBottom:22,
  backdropFilter:'blur(8px)',
}
const dot = {
  width:7, height:7, borderRadius:'50%', background:'#22c55e',
  boxShadow:'0 0 7px #22c55e', flexShrink:0, display:'inline-block',
}
const h1 = {
  fontSize:'clamp(32px,3.6vw,50px)', fontWeight:800, lineHeight:1.1,
  marginBottom:20, color:'#fff', letterSpacing:'-1px',
  textShadow:'0 2px 20px rgba(0,0,0,0.4)',
}
const descStyle = { fontSize:17, color:'rgba(255,255,255,0.8)', lineHeight:1.75, marginBottom:36, maxWidth:480 }
const btnRow = { display:'flex', gap:10, flexWrap:'wrap', marginBottom:52, alignItems:'center' }
const primaryBtn = {
  display:'inline-flex', alignItems:'center', gap:8, padding:'11px 22px',
  borderRadius:99, background:'var(--accent)', color:'#fff',
  fontSize:15, fontWeight:600, border:'none', cursor:'pointer',
}
const ghostBtn = {
  display:'inline-flex', alignItems:'center', gap:8, padding:'10px 20px',
  borderRadius:99, background:'rgba(255,255,255,0.12)', color:'#fff',
  fontSize:15, fontWeight:500, border:'1px solid rgba(255,255,255,0.25)', cursor:'pointer',
  backdropFilter:'blur(8px)',
}
const statsRow = { display:'flex', alignItems:'stretch', borderTop:'1px solid rgba(255,255,255,0.2)', paddingTop:24 }
const divider = { width:1, background:'rgba(255,255,255,0.2)', margin:'0 22px', flexShrink:0 }
const statVal = { fontSize:26, fontWeight:800, color:'#fff', lineHeight:1 }
const statLabel = { fontSize:12, color:'rgba(255,255,255,0.6)', marginTop:4 }

const rightCol = {
  flex:1, position:'relative', display:'flex', alignItems:'center',
  justifyContent:'center', minHeight:520,
  /* ไม่มี overflow:hidden — ป้องกัน compositing layer ที่ทำให้เกิดกล่องดำ */
}
const glowBlob = {
  position:'absolute', width:380, height:380, borderRadius:'50%',
  background:'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
  top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none',
}
const cardGrid = {
  display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10,
  width:'100%', maxWidth:520, position:'relative', zIndex:1,
}
const cardStyle = {
  background:'rgba(10,10,18,0.82)', border:'1px solid rgba(255,255,255,0.12)',
  borderRadius:12, overflow:'hidden',
  boxShadow:'0 4px 16px rgba(0,0,0,0.35)',
  /* ไม่มี backdropFilter — ทำให้ browser สร้าง layer แยกที่เห็นเป็นกล่องดำ */
}
const regionChip = {
  position:'absolute', bottom:6, left:8,
  background:'rgba(0,0,0,0.6)', backdropFilter:'blur(6px)',
  color:'#fff', fontSize:9, fontWeight:700,
  padding:'2px 7px', borderRadius:99, border:'1px solid rgba(255,255,255,0.12)',
}
