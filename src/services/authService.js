import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { ref, set, get, update } from 'firebase/database'
import { auth, db, googleProvider } from './firebase'

export const registerUser = async (email, password, displayName) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(cred.user, { displayName })
  await saveUserToDB(cred.user)
  return cred.user
}

export const loginUser = async (email, password) => {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  await saveUserToDB(cred.user)
  return cred.user
}

export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider)
  await saveUserToDB(result.user)
  return result.user
}

export const logoutUser = () => signOut(auth)

export const getUserRole = async (uid) => {
  const snap = await get(ref(db, `users/${uid}/role`))
  return snap.exists() ? snap.val() : 'user'
}

const saveUserToDB = async (user) => {
  const userRef = ref(db, `users/${user.uid}`)
  const snap = await get(userRef)
  const isAdmin = user.email === import.meta.env.VITE_ADMIN_EMAIL

  if (!snap.exists()) {
    await set(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      role: isAdmin ? 'admin' : 'user',
      createdAt: Date.now(),
      lastLogin: Date.now(),
    })
  } else {
    await update(userRef, { lastLogin: Date.now() })
    if (isAdmin && snap.val().role !== 'admin') {
      await update(userRef, { role: 'admin' })
    }
  }
}
