import { useLang } from './context/LangContext'
import { featuredPlaces } from './data/featuredPlaces'
import React, { useState, useEffect } from 'react'
import { enrichPlace } from './services/placesService'
import Loader from './components/ui/Loader'
import Navbar from './components/layout/Navbar'
import Hero from './components/features/home/Hero'
import RegionSection from './components/features/explore/RegionSection'
import MapPage from './pages/MapPage'
import CollectionPage from './pages/TrackerPage'
import { CategoryBar, TopRated, RegionExplore } from './components/features/home/HomeSections'
import PlaceDetail from './components/display/PlaceDetail'
import LoginModal from './components/ui/LoginModal'
import UploadModal from './components/ui/UploadModal'
import SurveyPage from './pages/SurveyPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import './index.css'

// ====== Icons ======
const StarFillIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)
const MapPinIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const ChevronDownIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

// ====== Featured Places ======
const featured = featuredPlaces

// ====== FAQ ======
const faqs = [
  { q: 'GOTHAI คืออะไร?', a: 'GOTHAI คือเว็บแนะนำสถานที่ท่องเที่ยวทั่วประเทศไทย ที่เชื่อมนักท่องเที่ยวกับร้านค้าชุมชนที่ร่วมโครงการในแต่ละสถานที่ เพื่อให้การเที่ยวช่วยกระจายรายได้สู่คนในพื้นที่' },
  { q: 'ร้านค้าร่วมโครงการคืออะไร?', a: 'คือร้านค้าในชุมชนรอบสถานที่ท่องเที่ยวที่เข้าร่วมโครงการกับ GOTHAI ดูได้ในหน้ารายละเอียดของแต่ละสถานที่ หัวข้อ "ร้านค้าร่วมโครงการ" ถ้าสถานที่ไหนยังไม่มีร้านเข้าร่วมจะแสดงว่า "ไม่มีร้านค้าที่ร่วมโครงการ"' },
  { q: 'ร้านค้าของฉันอยากเข้าร่วมโครงการ ต้องทำอย่างไร?', a: 'ติดต่อทีมงาน GOTHAI เพื่อแจ้งชื่อร้าน สถานที่ท่องเที่ยวที่อยู่ใกล้ และรายละเอียดร้าน เมื่อผ่านการตรวจสอบ ร้านของคุณจะแสดงในหน้าสถานที่นั้น' },
  { q: 'มีสถานที่ท่องเที่ยวครบทุกภาคไหม?', a: 'มีครบ 5 ภาค ได้แก่ ภาคเหนือ ภาคกลาง ภาคตะวันออกเฉียงเหนือ ภาคตะวันออก และภาคใต้ รวมกว่า 100 สถานที่ ค้นหาตามชื่อ จังหวัด หรือกรองตามภาคได้ในหน้า "สถานที่"' },
  { q: 'ใช้แผนที่อย่างไร?', a: 'ไปที่เมนู "แผนที่" แล้วชี้หรือกดหมุดเพื่อดูรายละเอียดสถานที่ หรือเลือกจากรายการด้านข้างเพื่อให้แผนที่พาไปยังจุดนั้น และกด "นำทางด้วย Google Maps" เพื่อเดินทางได้ทันที' },
  { q: 'อาหารแนะนำมาจากไหน?', a: 'เป็นอาหารขึ้นชื่อของแต่ละสถานที่และพื้นที่ใกล้เคียง ช่วยให้นักท่องเที่ยวรู้ว่าไปแล้วควรลองชิมอะไร' },
  { q: 'ต้องสมัครสมาชิกก่อนใช้งานไหม?', a: 'ไม่จำเป็น ดูข้อมูลสถานที่ แผนที่ และร้านค้าได้เลย แต่ต้องเข้าสู่ระบบก่อนจึงจะให้คะแนนสถานที่ได้' },
  { q: 'แบบสอบถามใช้ทำอะไร?', a: 'ใช้รวบรวมความคิดเห็นของนักท่องเที่ยว เพื่อนำไปปรับปรุงเว็บไซต์และโครงการร้านค้าชุมชนให้ดียิ่งขึ้น' },
]

const faqsEn = [
  { q: 'What is GOTHAI?', a: 'GOTHAI is a guide to destinations across Thailand that connects travellers with partner community shops at each place, so every trip helps spread income to local people.' },
  { q: 'What are partner shops?', a: 'Community shops near tourist spots that have joined the GOTHAI project. You can find them in each place\'s details under "Partner shops". If a place has none yet, it shows "No partner shops here".' },
  { q: 'How can my shop join the project?', a: 'Contact the GOTHAI team with your shop name, the nearby tourist spot and your shop details. Once verified, your shop will appear on that place\'s page.' },
  { q: 'Do you cover every region?', a: 'Yes — all 5 regions: North, Central, Northeast, East and South, with 100+ places. Search by name or province, or filter by region on the "Places" page.' },
  { q: 'How do I use the map?', a: 'Open "Map", then hover or tap a pin to see details, or pick a place from the list to fly there. Tap "Navigate with Google Maps" to get directions.' },
  { q: 'Where does the local food list come from?', a: 'It lists well-known dishes of each place and its surrounding area, so you know what to try when you get there.' },
  { q: 'Do I need an account?', a: 'No. You can browse places, the map and shops freely, but you need to sign in to rate places.' },
  { q: 'What is the survey for?', a: 'It collects travellers\' feedback to improve the website and the community shop project.' },
]

// ====== FeaturedSection ======
function FeaturedSection({ onPlaceClick }) {
  const { t, tRegion, lang } = useLang()
  // เติมข้อมูลภาษาอังกฤษ/รายละเอียดจาก places_all.json (จับคู่ตามชื่อ)
  const [items, setItems] = useState(featured)
  useEffect(() => {
    Promise.all(featured.map(p => enrichPlace({ ...p, name_th: p.name }))).then(setItems).catch(() => {})
  }, [])
  return (
    <section style={{ background:'var(--bg)', padding:'80px 24px 72px', position:'relative' }}>
      <div style={sectionInner}>
        <div style={sectionHead}>
          <div style={sectionBadge}>{t('feat.badge')}</div>
          <h2 style={sectionTitle}>{t('feat.title')}</h2>
          <p style={sectionDesc}>{t('feat.desc')}</p>
        </div>
        <div className="featured-grid" style={featuredGrid}>
          {items.slice(0, 6).map((place) => (
            <FeaturedCard key={place.name} place={place} onClick={() => onPlaceClick && onPlaceClick(place)} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturedCard({ place, onClick }) {
  const [hovered, setHovered] = React.useState(false)
  const { lang, tp, tRegion } = useLang()
  return (
    <div
      style={{ ...featCardStyle, transform: hovered ? 'translateY(-5px)' : 'translateY(0)', boxShadow: hovered ? '0 16px 48px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.3)', transition:'all 0.25s' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <div style={{ position:'relative', height:160, background: place.gradient, overflow:'hidden', borderRadius:'12px 12px 0 0' }}>
        <img src={place.img} alt={place.name} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', display:'block' }} loading="lazy" />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(0,0,0,0.15) 0%, transparent 50%, rgba(0,0,0,0.3) 100%)' }} />
        <span style={featRegionChip}>{tRegion(place.region)}</span>
        <span style={featRatingChip}><StarFillIcon size={11} />{place.rating}</span>
      </div>
      <div style={{ padding:'14px 16px 16px' }}>
        <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text)', margin:'0 0 6px' }}>{tp(place, 'name')}</h3>
        <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.6, margin:'0 0 10px' }}>{lang === 'en' ? (place.description_en || place.desc) : place.desc}</p>
        <div style={{ display:'flex', alignItems:'center', gap:4, color:'var(--text3)', fontSize:12 }}>
          <MapPinIcon size={13} /> {tp(place, 'province') || (lang === 'en' ? 'Thailand' : 'ประเทศไทย')}
        </div>
      </div>
    </div>
  )
}

// ====== FAQ Section ======
function FaqSection() {
  const { t, tRegion, lang } = useLang()
  const [open, setOpen] = React.useState(null)
  return (
    <section style={{ background:'var(--bg)', padding:'0 24px 80px' }}>
      <div style={sectionInner}>
        {/* Wave top */}
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <div style={sectionBadge}>FAQ</div>
          <h2 style={{ ...sectionTitle, color:'var(--text)' }}>{t('faq.title')}</h2>
          <p style={{ ...sectionDesc, color:'var(--text2)' }}>{t('faq.desc')}</p>
        </div>
        <div style={{ maxWidth:760, margin:'0 auto' }}>
          {(lang === 'en' ? faqsEn : faqs).map((faq, i) => (
            <div key={i} style={{ ...faqItem, borderColor: open===i ? 'var(--accent)' : 'var(--border)' }}>
              <button
                style={faqQ}
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span style={{ color:'var(--text)' }}>{faq.q}</span>
                <span style={{ transform: open===i ? 'rotate(180deg)' : 'rotate(0deg)', transition:'transform 0.2s', flexShrink:0, color:'var(--text3)' }}>
                  <ChevronDownIcon size={18} />
                </span>
              </button>
              {open === i && (
                <div style={faqA}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ====== PlacesPage — แค่ RegionSection เลย ไม่มี header ซ้ำ ======
function PlacesPage({ onPlaceClick, query }) {
  return (
    <div style={{ minHeight:'calc(100vh - 64px)', background:'var(--bg)' }}>
      <RegionSection key={query.key} onPlaceClick={onPlaceClick} initialSearch={query.search} initialRegion={query.region} />
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState('home') // 'home' | 'places' | 'survey' | 'admin'
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [showLogin, setShowLogin] = useState(false)
  const [showUpload, setShowUpload] = useState(false)

  // หน้า loading: แสดงตอนเปิดเว็บ และตอนเปลี่ยนหน้า
  const [loading, setLoading] = useState(true)
  const [loaderMounted, setLoaderMounted] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1400)
    return () => clearTimeout(t)
  }, [])
  useEffect(() => {
    if (loading) { setLoaderMounted(true); return }
    const t = setTimeout(() => setLoaderMounted(false), 400) // รอ fade out
    return () => clearTimeout(t)
  }, [loading])

  const switchPage = (p) => {
    if (p === page) { window.scrollTo({ top:0, behavior:'smooth' }); return }
    setLoading(true)
    setTimeout(() => {
      setPage(p)
      window.scrollTo({ top:0 })
      setTimeout(() => setLoading(false), 500)
    }, 250)
  }
  const goHome = () => switchPage('home')
  const goPage = (p) => switchPage(p)
  // ไปหน้าสถานที่พร้อมคำค้น/ภาค (จากช่องค้นหา หมวดหมู่ และปุ่มภาคในหน้าแรก)
  const [placesQuery, setPlacesQuery] = useState({ key: 0, search: '', region: 'all' })
  const goPlaces = (search = '', region = 'all') => {
    setPlacesQuery(q => ({ key: q.key + 1, search, region }))
    switchPage('places')
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      {loaderMounted && <Loader hide={!loading} />}
      <Navbar
        onLoginClick={() => setShowLogin(true)}
        onAdminClick={() => goPage('admin')}
        onHomeClick={goHome}
        onSurveyClick={() => goPage('survey')}
        onPlacesClick={() => goPage('places')}
        onMapClick={() => goPage('map')}
        onCollectionClick={() => goPage('collection')}
      />

      {page === 'home' && (
        <>
          {/* Hero มีพื้นหลังรูปเอง */}
          <Hero onSurveyClick={() => goPage('survey')} onPlacesClick={() => goPlaces()} onSearch={q => goPlaces(q)} />
          <CategoryBar onSearch={q => goPlaces(q)} />

          {/* ส่วนที่เหลือ dark bg ตามปกติ */}
          <FeaturedSection onPlaceClick={setSelectedPlace} />
          <TopRated onPlaceClick={setSelectedPlace} onSeeAll={() => goPlaces()} />
          <RegionExplore onRegion={r => goPlaces('', r)} onMap={() => goPage('map')} />
          <FaqSection />

          <footer style={footer}>
            <p style={{ color:'var(--text3)', fontSize:13, textAlign:'center', margin:0 }}>
              © 2026 GoThai — รวมสถานที่จัดอีเว้นในประเทศไทยที่ดีที่สุด
            </p>
          </footer>
        </>
      )}

      {page === 'places' && (
        <PlacesPage onPlaceClick={setSelectedPlace} query={placesQuery} />
      )}

      {page === 'collection' && <CollectionPage onPlaceClick={setSelectedPlace} />}

      {page === 'map' && <MapPage onPlaceClick={setSelectedPlace} />}

      {page === 'survey' && <SurveyPage onBack={goHome} />}

      {page === 'admin' && <AdminDashboard onBack={goHome} />}

      {/* Modals */}
      {selectedPlace && <PlaceDetail place={selectedPlace} onClose={() => setSelectedPlace(null)} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ====== Styles ======
const footer = { borderTop:'1px solid var(--border)', padding:'28px 0', background:'var(--bg)' }

const sectionInner = { maxWidth:1280, margin:'0 auto' }
const sectionHead = { textAlign:'center', marginBottom:48 }
const sectionBadge = {
  display:'inline-block', padding:'4px 14px', borderRadius:99,
  background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.35)',
  color:'var(--accent)', fontSize:12, fontWeight:700, letterSpacing:'0.05em',
  textTransform:'uppercase', marginBottom:12,
}
const sectionTitle = { fontSize:'clamp(22px,3vw,32px)', fontWeight:800, color:'var(--text)', margin:'0 0 10px', letterSpacing:'-0.5px' }
const sectionDesc = { fontSize:15, color:'var(--text2)', margin:0, maxWidth:500, marginLeft:'auto', marginRight:'auto', lineHeight:1.7 }

const featuredGrid = {
  display:'grid',
  gridTemplateColumns:'repeat(3, 1fr)',
  gap:18,
}
const featCardStyle = {
  background:'var(--card)', border:'1px solid var(--border)',
  borderRadius:12, overflow:'hidden', cursor:'pointer',
}
const featRegionChip = {
  position:'absolute', bottom:8, left:10,
  background:'rgba(0,0,0,0.65)', backdropFilter:'blur(6px)',
  color:'#fff', fontSize:10, fontWeight:700,
  padding:'3px 8px', borderRadius:99, border:'1px solid rgba(255,255,255,0.15)',
}
const featRatingChip = {
  position:'absolute', top:8, right:10,
  background:'rgba(0,0,0,0.65)', backdropFilter:'blur(6px)',
  color:'#fff', fontSize:10, fontWeight:700,
  padding:'3px 8px', borderRadius:99, border:'1px solid rgba(255,255,255,0.15)',
  display:'flex', alignItems:'center', gap:3,
}

const faqItem = {
  border:'1px solid var(--border)', borderRadius:12,
  marginBottom:8, overflow:'hidden', background:'var(--card)',
  transition:'border-color 0.2s',
}
const faqQ = {
  width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
  gap:16, padding:'16px 20px', cursor:'pointer', fontSize:15, fontWeight:600,
  background:'transparent', border:'none', textAlign:'left',
}
const faqA = {
  padding:'0 20px 16px', fontSize:14, color:'var(--text2)', lineHeight:1.75,
}
