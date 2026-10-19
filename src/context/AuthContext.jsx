import React, { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../services/firebase'
import { getUserRole } from '../services/authService'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState('user')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // อีเมลแอดมินใน .env ได้สิทธิ์ admin ทันที (กันกรณีอ่าน role ก่อนบันทึกผู้ใช้ลง DB เสร็จตอนล็อกอินครั้งแรก)
        const isAdminEmail = firebaseUser.email === import.meta.env.VITE_ADMIN_EMAIL
        const userRole = isAdminEmail ? 'admin' : await getUserRole(firebaseUser.uid).catch(() => 'user')
        setUser(firebaseUser)
        setRole(userRole)
      } else {
        setUser(null)
        setRole('user')
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const isAdmin = role === 'admin'

  return (
    <AuthContext.Provider value={{ user, role, isAdmin, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
