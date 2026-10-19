import useModalClose from '../../hooks/useModalClose'
import { Icon } from '@iconify/react'
import React, { useState } from 'react'
import { loginUser, registerUser, loginWithGoogle } from '../../services/authService'

export default function LoginModal({ onClose: onCloseProp }) {
  const [closing, onClose] = useModalClose(onCloseProp)
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await loginUser(email, password)
      } else {
        if (!name.trim()) { setError('กรุณากรอกชื่อ'); setLoading(false); return }
        await registerUser(email, password, name)
      }
      onClose()
    } catch (err) {
      const messages = {
        'auth/user-not-found': 'ไม่พบบัญชีนี้',
        'auth/wrong-password': 'รหัสผ่านไม่ถูกต้อง',
        'auth/email-already-in-use': 'อีเมลนี้ถูกใช้งานแล้ว',
        'auth/invalid-email': 'รูปแบบอีเมลไม่ถูกต้อง',
        'auth/weak-password': 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
        'auth/too-many-requests': 'ลองใหม่อีกครั้งในภายหลัง',
        'auth/invalid-credential': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
      }
      setError(messages[err.code] || `เกิดข้อผิดพลาด: ${err.message}`)
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      await loginWithGoogle()
      onClose()
    } catch (err) {
      setError('ไม่สามารถเข้าสู่ระบบด้วย Google ได้ กรุณาลองใหม่')
    }
    setLoading(false)
  }

  return (
    <div className={`modal-backdrop${closing ? ' closing' : ''}`} onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width:52,height:52, borderRadius:14, background:'linear-gradient(135deg,var(--accent),var(--accent2,#4f46e5))', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
            <Icon icon="lucide:user" width="26" height="26" style={{ color:'#fff' }} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>
            {mode === 'login' ? 'เข้าสู่ระบบ' : 'สร้างบัญชีใหม่'}
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>
            {mode === 'login' ? 'ยินดีต้อนรับกลับมา!' : 'เข้าร่วมชุมชนนักท่องเที่ยว'}
          </p>
        </div>

        {/* Google */}
        <button onClick={handleGoogle} disabled={loading}
          style={{ ...googleBtn, opacity: loading ? 0.6 : 1 }}>
          <Icon icon="logos:google-icon" width="20" height="20" />
          เข้าสู่ระบบด้วย Google
        </button>

        <div className="divider">หรือ</div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label>ชื่อ-นามสกุล</label>
              <input type="text" placeholder="ชื่อของคุณ" value={name} onChange={e => setName(e.target.value)} required />
            </div>
          )}
          <div className="form-group">
            <label>อีเมล</label>
            <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>รหัสผ่าน</label>
            <input type="password" placeholder="รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>

          {error && (
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(239,68,68,0.1)', border:'1px solid var(--error)', color:'var(--error)',
              borderRadius:8, padding:'10px 14px', fontSize:13, marginBottom:16 }}>
              <Icon icon="lucide:alert-circle" width="14" height="14" />
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}
            style={{ width:'100%', justifyContent:'center', fontSize:16, padding:'12px', marginBottom:16, opacity:loading?0.7:1 }}>
            {loading ? 'กำลังดำเนินการ...' : (mode === 'login' ? 'เข้าสู่ระบบ' : 'สร้างบัญชี')}
          </button>
        </form>

        {/* Switch mode */}
        <p style={{ textAlign:'center', color:'var(--text2)', fontSize:14 }}>
          {mode === 'login' ? 'ยังไม่มีบัญชี? ' : 'มีบัญชีแล้ว? '}
          <button style={{ background:'none', border:'none', color:'var(--accent)', fontWeight:600, cursor:'pointer', fontSize:14 }}
            onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError('') }}>
            {mode === 'login' ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
          </button>
        </p>
      </div>
    </div>
  )
}

const googleBtn = {
  width:'100%', padding:'12px 16px', border:'1px solid var(--border)', borderRadius:50,
  background:'var(--bg2)', color:'var(--text)', display:'flex', alignItems:'center',
  justifyContent:'center', gap:10, fontSize:15, fontWeight:500, cursor:'pointer',
  transition:'all 0.2s', marginBottom:16,
}
