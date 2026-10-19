import { ref, get, update } from 'firebase/database'
import { db } from './firebase'

const PATH = 'users'

export const getUsers = async () => {
  const snap = await get(ref(db, PATH))
  if (!snap.exists()) return []

  const users = []
  snap.forEach(child => users.push({ id: child.key, ...child.val() }))
  return users.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

export const updateUserRole = async (uid, role) => {
  await update(ref(db, `${PATH}/${uid}`), { role })
}
