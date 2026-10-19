import { ref as dbRef, push, get, update } from 'firebase/database'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from './firebase'

const PATH = 'uploads'

// ประมวลผลรูป (resize + compress) ด้วย Canvas
export const processImage = (file, maxWidth = 1200, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        if (width > maxWidth) { height = (height * maxWidth) / width; width = maxWidth }
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality)
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const uploadImage = async ({ file, userId, userName, placeId, placeName, region, description }) => {
  // 1. ประมวลผลรูป
  const processedBlob = await processImage(file)

  // 2. อัปโหลดไป Firebase Storage
  const filename = `uploads/${userId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
  const sRef = storageRef(storage, filename)
  await uploadBytes(sRef, processedBlob)
  const imageUrl = await getDownloadURL(sRef)

  // 3. บันทึก metadata ลง Realtime Database
  return await push(dbRef(db, PATH), {
    userId, userName, placeId, placeName, region,
    description, imageUrl, storagePath: filename,
    status: 'pending',
    createdAt: Date.now(),
  })
}

export const getUploads = async () => {
  const snap = await get(dbRef(db, PATH))
  if (!snap.exists()) return []

  const uploads = []
  snap.forEach(child => uploads.push({ id: child.key, ...child.val() }))
  return uploads.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

export const updateUploadStatus = async (id, status) => {
  await update(dbRef(db, `${PATH}/${id}`), { status, updatedAt: Date.now() })
}

export const getUploadStats = async () => {
  const uploads = await getUploads()
  const byRegion = { north: 0, central: 0, east: 0, south: 0 }
  const byStatus = { pending: 0, approved: 0, rejected: 0 }
  const byUser = {}

  uploads.forEach(u => {
    if (byRegion[u.region]  !== undefined) byRegion[u.region]++
    if (byStatus[u.status]  !== undefined) byStatus[u.status]++
    byUser[u.userName] = (byUser[u.userName] || 0) + 1
  })

  const topContributors = Object.entries(byUser)
    .sort(([, a], [, b]) => b - a).slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  return { total: uploads.length, byRegion, byStatus, topContributors }
}
