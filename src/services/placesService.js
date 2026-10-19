import { ref, get, push, set, update, remove } from 'firebase/database'
import { db } from './firebase'
import { initialPlaces } from '../data/initialPlaces'

const PATH = 'places'

// แปลง path จาก Firebase ("image/details/North/x.png") ให้ตรงกับไฟล์จริงใน public/ ("/details/North/x.png")
const toPublicUrl = (p) => {
  if (!p) return ''
  if (/^(https?:|data:|\/)/.test(p)) return p
  return '/' + p.replace(/^image\//, '')
}

// ทำให้ข้อมูลจาก Firebase มีฟิลด์ที่ component ใช้ (name, imageUrl)
const REGION_IDS = {
  'ภาคเหนือ': 'north', 'ภาคกลาง': 'central', 'ภาคตะวันออก': 'east',
  'ภาคตะวันออกเฉียงเหนือ': 'northeast', 'ภาคใต้': 'south',
}

const normalizePlace = (place) => ({
  ...place,
  name: place.name || place.name_th || '',
  regionId: REGION_IDS[place.region] || place.region,
  imageUrl: toPublicUrl(place.imageUrl || place.imageDetail || place.image),
})

export const seedPlaces = async () => {
  const snap = await get(ref(db, PATH))
  if (snap.exists()) return   // มีข้อมูลแล้ว ไม่ต้อง seed

  for (const place of initialPlaces) {
    await push(ref(db, PATH), { ...place, createdAt: Date.now() })
  }
}

// ข้อมูลเสริมจาก public/data/places_all.json (อาหาร ร้านค้า พิกัด) — ใช้เมื่อ Firebase ยังไม่มีฟิลด์นั้น
let localExtraPromise
const getLocalExtra = () => {
  if (!localExtraPromise) {
    localExtraPromise = fetch('/data/places_all.json')
      .then(r => r.ok ? r.json() : { places: {} })
      .then(d => {
        const map = {}
        Object.values(d.places || {}).forEach(p => { map[p.name_th] = p })
        return map
      })
      .catch(() => ({}))
  }
  return localExtraPromise
}
const mergeExtra = (place, extra) => {
  const x = extra[place.name_th] || extra[place.name]
  if (x) place = { ...place, province: place.province || x.province, opening_hours: place.opening_hours || x.opening_hours, entrance_fee: place.entrance_fee || x.entrance_fee, description: place.description || x.description, source: place.source || x.source }
  if (!x) return place
  return {
    ...place,
    foods: place.foods?.length ? place.foods : (x.foods || []),
    // ร้านค้า: แสดงเฉพาะร้านที่ร่วมโครงการ (partner: true)
    shops: (place.shops || []).some(sh => sh.partner) ? place.shops.filter(sh => sh.partner) : (x.shops || []),
    name_en: place.name_en || x.name_en,
    province_en: place.province_en || x.province_en,
    description_en: place.description_en || x.description_en,
    opening_hours_en: place.opening_hours_en || x.opening_hours_en,
    entrance_fee_en: place.entrance_fee_en || x.entrance_fee_en,
    lat: place.lat ?? x.lat,
    lng: place.lng ?? x.lng,
  }
}

export const getPlaces = async (region = null) => {
  const extra = await getLocalExtra()
  const snap = await get(ref(db, PATH))
  if (!snap.exists()) return []

  const places = []
  snap.forEach(child => {
    const place = mergeExtra(normalizePlace({ id: child.key, ...child.val() }), extra)
    if (!region || place.region === region || place.regionId === region) places.push(place)
  })

  return places.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'th'))
}

export const getPlace = async (id) => {
  const snap = await get(ref(db, `${PATH}/${id}`))
  return snap.exists() ? normalizePlace({ id: snap.key, ...snap.val() }) : null
}

export const addPlace = async (data) => {
  return await push(ref(db, PATH), { ...data, createdAt: Date.now(), rating: 0, reviewCount: 0 })
}

export const updatePlace = async (id, data) => {
  await update(ref(db, `${PATH}/${id}`), { ...data, updatedAt: Date.now() })
}

export const deletePlace = async (id) => {
  await remove(ref(db, `${PATH}/${id}`))
}

export const updatePlaceRating = async (id, newRating) => {
  const place = await getPlace(id)
  if (!place) return
  const oldTotal = (place.rating || 0) * (place.reviewCount || 0)
  const newCount = (place.reviewCount || 0) + 1
  await update(ref(db, `${PATH}/${id}`), {
    rating: (oldTotal + newRating) / newCount,
    reviewCount: newCount,
  })
}

// เติมข้อมูลให้สถานที่ที่ไม่ได้มาจาก Firebase (เช่น สถานที่ยอดนิยมหน้าแรก)
export const enrichPlace = async (place) => mergeExtra(place, await getLocalExtra())
