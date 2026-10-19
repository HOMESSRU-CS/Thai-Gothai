import { ref, push, get } from 'firebase/database'
import { db } from './firebase'

const PATH = 'surveys'

export const submitSurvey = async (data) => {
  return await push(ref(db, PATH), { ...data, createdAt: Date.now() })
}

export const getSurveys = async () => {
  const snap = await get(ref(db, PATH))
  if (!snap.exists()) return []

  const surveys = []
  snap.forEach(child => surveys.push({ id: child.key, ...child.val() }))
  return surveys.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

export const getSurveyStats = async () => {
  const surveys = await getSurveys()
  if (!surveys.length) return null

  const regionCounts = { north: 0, central: 0, east: 0, south: 0 }
  const ratingDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  const dailyCounts = {}
  let totalOverall = 0, totalDesign = 0, totalContent = 0, totalUsability = 0

  surveys.forEach(s => {
    if (s.region && regionCounts[s.region] !== undefined) regionCounts[s.region]++

    const overall = Math.round(s.ratings?.overall || 0)
    if (overall >= 1 && overall <= 5) ratingDist[overall]++

    totalOverall   += s.ratings?.overall   || 0
    totalDesign    += s.ratings?.design    || 0
    totalContent   += s.ratings?.content   || 0
    totalUsability += s.ratings?.usability || 0

    // วันที่จาก timestamp (ms)
    const date = s.createdAt
      ? new Date(s.createdAt).toLocaleDateString('th-TH')
      : 'Unknown'
    dailyCounts[date] = (dailyCounts[date] || 0) + 1
  })

  const n = surveys.length
  return {
    total: n,
    avgOverall:    (totalOverall    / n).toFixed(1),
    avgDesign:     (totalDesign     / n).toFixed(1),
    avgContent:    (totalContent    / n).toFixed(1),
    avgUsability:  (totalUsability  / n).toFixed(1),
    regionCounts,
    ratingDist,
    dailyCounts,
    recommendCount: surveys.filter(s => s.recommend).length,
    recent: surveys.slice(0, 5),
  }
}
