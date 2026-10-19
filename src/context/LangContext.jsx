import React, { createContext, useContext, useEffect, useState } from 'react'

// คำแปลข้อความหน้าเว็บ (ข้อมูลสถานที่จาก Firebase ยังเป็นภาษาไทย)
const DICT = {
  th: {
    'nav.places': 'สถานที่', 'nav.map': 'แผนที่', 'nav.collection': 'ติดตามสถานที่', 'nav.survey': 'แบบสอบถาม',
    'nav.admin': 'หลังบ้าน', 'nav.login': 'เข้าสู่ระบบ', 'nav.logout': 'ออกจากระบบ', 'nav.theme': 'เปลี่ยนธีม', 'nav.lang': 'เปลี่ยนภาษา',
    'hero.welcome': 'ยินดีต้อนรับสู่', 'hero.title1': 'เที่ยวไทย', 'hero.title2': 'ได้ทั้งเราและชุมชน',
    'hero.desc1': 'พาคุณไปทุกที่ และพาคุณไปเจอ', 'hero.desc2': 'ร้านค้าชุมชนที่ร่วมโครงการกับเรา',
    'hero.explore': 'เริ่มสำรวจ', 'hero.survey': 'แบบสอบถาม',
    'stat.places': 'สถานที่', 'stat.regions': 'ภูมิภาค', 'stat.shops': 'ร้านค้าที่ร่วมโครงการ', 'stat.rating': 'คะแนนเฉลี่ย',
    'feat.badge': 'สถานที่แนะนำ', 'feat.title': '6 สถานที่แนะนำ', 'feat.desc': 'คัดสรรสถานที่ที่นักท่องเที่ยวชื่นชอบมากที่สุดจากทั่วประเทศ',
    'faq.title': 'คำถามที่พบบ่อย', 'faq.desc': 'รวบรวมคำถามและคำตอบที่นักท่องเที่ยวถามบ่อย',
    'region.all': 'ทั้งหมด', 'region.north': 'ภาคเหนือ', 'region.central': 'ภาคกลาง', 'region.northeast': 'ภาคตะวันออกเฉียงเหนือ',
    'region.east': 'ภาคตะวันออก', 'region.south': 'ภาคใต้',
    'places.title': 'สถานที่ท่องเที่ยว', 'places.desc': 'ค้นพบสถานที่สวยงามทั่วประเทศไทย ครบทุกภาค',
    'places.search': 'ค้นหาสถานที่...', 'common.loading': 'กำลังโหลด...', 'places.empty': 'ไม่พบสถานที่ที่ค้นหา',
    'map.title': 'แผนที่สถานที่ท่องเที่ยว', 'map.desc': 'ชี้หรือกดหมุดบนแผนที่เพื่อดูรายละเอียด', 'map.search': 'ค้นหาชื่อสถานที่หรือจังหวัด...',
    'col.title': 'ติดตามสถานที่', 'col.desc': 'ไปเที่ยวที่ไหนแล้ว กดเปิดสถานที่แล้วกด "ฉันไปมาแล้ว" เพื่อปลดล็อกช่องบนแผนที่', 'col.locked': 'ยังไม่ได้ไป',
    'd.time': 'เวลา', 'd.fee': 'ค่าเข้า', 'd.gps': 'GPS', 'd.region': 'ภาค', 'd.reviews': 'รีวิว',
    'd.food': 'อาหารแนะนำ', 'd.shops': 'ร้านค้าร่วมโครงการ', 'd.noFood': 'ยังไม่มีข้อมูลอาหาร', 'd.noShops': 'ไม่มีร้านค้าที่ร่วมโครงการ',
    'd.partner': 'ร่วมโครงการ', 'd.visit': 'ฉันไปมาแล้ว', 'd.visited': 'ไปมาแล้ว (ปลดล็อกในหน้าติดตามสถานที่)', 'd.nav': 'นำทางด้วย Google Maps',
    'd.rate': 'ให้คะแนนสถานที่นี้', 'd.rateThanks': 'ขอบคุณสำหรับการให้คะแนน!', 'd.rateHint': 'แตะดาวเพื่อให้คะแนน',
    'd.rateLogin': 'เข้าสู่ระบบก่อน จึงจะให้คะแนนได้', 'd.youRated': 'คุณให้ {n} ดาว', 'd.source': 'ที่มา', 'd.noImage': 'ยังไม่มีรูปภาพ',
    'd.detail': 'ดูรายละเอียด', 'd.placeLabel': 'สถานที่:', 'd.allDay': 'ตลอดวัน', 'd.recommended': 'แหล่งท่องเที่ยวแนะนำ', 'd.close': 'ปิด',
    'rate.1': 'แย่', 'rate.2': 'พอใช้', 'rate.3': 'ดี', 'rate.4': 'ดีมาก', 'rate.5': 'ยอดเยี่ยม!',
  },
  en: {
    'nav.places': 'Places', 'nav.map': 'Map', 'nav.collection': 'Place Tracker', 'nav.survey': 'Survey',
    'nav.admin': 'Admin', 'nav.login': 'Sign in', 'nav.logout': 'Sign out', 'nav.theme': 'Toggle theme', 'nav.lang': 'Change language',
    'hero.welcome': 'Welcome to', 'hero.title1': 'Travel Thailand,', 'hero.title2': 'Support Local',
    'hero.desc1': 'takes you everywhere — and to the', 'hero.desc2': 'community shops partnered with us',
    'hero.explore': 'Start exploring', 'hero.survey': 'Survey',
    'stat.places': 'Places', 'stat.regions': 'Regions', 'stat.shops': 'Partner shops', 'stat.rating': 'Avg. rating',
    'feat.badge': 'Featured', 'feat.title': '6 Recommended Places', 'feat.desc': "Travellers' favourite destinations from across the country",
    'faq.title': 'FAQ', 'faq.desc': 'Common questions from travellers',
    'region.all': 'All', 'region.north': 'North', 'region.central': 'Central', 'region.northeast': 'Northeast',
    'region.east': 'East', 'region.south': 'South',
    'places.title': 'Destinations', 'places.desc': 'Discover beautiful places in every region of Thailand',
    'places.search': 'Search places...', 'common.loading': 'Loading...', 'places.empty': 'No places found',
    'map.title': 'Destination Map', 'map.desc': 'Hover or tap a pin to see details', 'map.search': 'Search by place or province...',
    'col.title': 'Place Tracker', 'col.desc': 'Been somewhere? Open the place and tap "I\'ve been here" to unlock its tile', 'col.locked': 'Not visited',
    'd.time': 'Hours', 'd.fee': 'Entry', 'd.gps': 'GPS', 'd.region': 'Region', 'd.reviews': 'reviews',
    'd.food': 'Local food', 'd.shops': 'Partner shops', 'd.noFood': 'No food info yet', 'd.noShops': 'No partner shops here',
    'd.partner': 'Partner', 'd.visit': "I've been here", 'd.visited': 'Visited (unlocked in Place Tracker)', 'd.nav': 'Navigate with Google Maps',
    'd.rate': 'Rate this place', 'd.rateThanks': 'Thanks for rating!', 'd.rateHint': 'Tap a star to rate',
    'd.rateLogin': 'Sign in to rate', 'd.youRated': 'You gave {n} stars', 'd.source': 'Source', 'd.noImage': 'No image yet',
    'd.detail': 'View details', 'd.placeLabel': 'PLACE:', 'd.allDay': 'All day', 'd.recommended': 'Recommended spot', 'd.close': 'Close',
    'rate.1': 'Poor', 'rate.2': 'Fair', 'rate.3': 'Good', 'rate.4': 'Very good', 'rate.5': 'Excellent!',
  },
}

// ชื่อภาคภาษาไทยจากข้อมูล → key
export const REGION_KEY = {
  'ภาคเหนือ': 'north', 'ภาคกลาง': 'central', 'ภาคตะวันออกเฉียงเหนือ': 'northeast', 'ภาคตะวันออก': 'east', 'ภาคใต้': 'south',
}

const LangContext = createContext({ lang: 'th', setLang: () => {}, t: k => k })

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('gothai_lang') || 'th' } catch { return 'th' }
  })
  useEffect(() => {
    try { localStorage.setItem('gothai_lang', lang) } catch { /* ignore */ }
    document.documentElement.lang = lang
  }, [lang])
  const t = (key, vars) => {
    let s = DICT[lang][key] ?? DICT.th[key] ?? key
    if (vars) Object.entries(vars).forEach(([k, v]) => { s = s.replace(`{${k}}`, v) })
    return s
  }
  // แปลชื่อภาคจากข้อมูล (เช่น "ภาคเหนือ") ตามภาษา
  const tRegion = (region) => {
    const key = REGION_KEY[region] || region
    return DICT[lang][`region.${key}`] || region
  }
  // ข้อมูลสถานที่ตามภาษา: ใช้ฟิลด์ *_en เมื่อเป็นภาษาอังกฤษ (ถ้ามี)
  const tp = (place, field) => {
    if (!place) return ''
    if (lang === 'en' && place[`${field}_en`]) return place[`${field}_en`]
    return place[field] ?? (field === 'name' ? place.name_th : '')
  }
  return <LangContext.Provider value={{ lang, setLang, t, tRegion, tp }}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)
