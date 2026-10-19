import useModalClose from '../../hooks/useModalClose'
import { Icon } from '@iconify/react'
import React, { useState, useRef, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { uploadImage } from '../../services/uploadsService'

const REGIONS = [
  { id: 'north', label: 'ภาคเหนือ' },
  { id: 'central', label: 'ภาคกลาง' },
  { id: 'east', label: 'ภาคตะวันออก' },
  { id: 'south', label: 'ภาคใต้' },
]

export default function UploadModal({ onClose: onCloseProp }) {
  const [closing, onClose] = useModalClose(onCloseProp)
  const { user } = useAuth()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [processed, setProcessed] = useState(null)
  const [form, setForm] = useState({ placeName: '', region: 'north', description: '' })
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [drag, setDrag] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef()
  const canvasRef = useRef()

  const processCanvas = useCallback((src, bright, cont) => {
    if (!src) return
    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const maxW = 800
      let w = img.width, h = img.height
      if (w > maxW) { h = (h * maxW) / w; w = maxW }
      canvas.width = w; canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.filter = `brightness(${bright}%) contrast(${cont}%)`
      ctx.drawImage(img, 0, 0, w, h)
      setProcessed(canvas.toDataURL('image/jpeg', 0.88))
    }
    img.src = src
  }, [])

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) { setError('กรุณาเลือกไฟล์รูปภาพเท่านั้น'); return }
    if (f.size > 10 * 1024 * 1024) { setError('ไฟล์ต้องมีขนาดไม่เกิน 10 MB'); return }
    setError('')
    setFile(f)
    const reader = new FileReader()
    reader.onload = (e) => { setPreview(e.target.result); processCanvas(e.target.result, brightness, contrast) }
    reader.readAsDataURL(f)
  }

  const handleDrop = (e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]) }

  const handleAdjust = (b, c) => {
    setBrightness(b); setContrast(c)
    processCanvas(preview, b, c)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) { setError('กรุณาเข้าสู่ระบบก่อน'); return }
    if (!file) { setError('กรุณาเลือกรูปภาพ'); return }
    setLoading(true); setError('')
    try {
      await uploadImage({
        file, userId: user.uid, userName: user.displayName || user.email,
        placeId: form.region + '_' + Date.now(),
        placeName: form.placeName, region: form.region, description: form.description,
      })
      setSuccess(true)
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการอัปโหลด: ' + err.message)
    }
    setLoading(false)
  }

  if (success) return (
    <div className={`modal-backdrop${closing ? ' closing' : ''}`} onClick={onClose}>
      <div className="modal" style={{ textAlign:'center' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize:60, marginBottom:16, color:'var(--accent)' }}><Icon icon="lucide:party-popper" /></div>
        <h2 style={{ color:'var(--success)', marginBottom:8 }}>อัปโหลดสำเร็จ!</h2>
        <p style={{ color:'var(--text2)', marginBottom:24 }}>รูปภาพของคุณอยู่ระหว่างการตรวจสอบ จะปรากฏเมื่อผู้ดูแลอนุมัติ</p>
        <button className="btn btn-primary" onClick={onClose} style={{ margin:'0 auto' }}>ปิด</button>
      </div>
    </div>
  )

  return (
    <div className={`modal-backdrop${closing ? ' closing' : ''}`} onClick={onClose}>
      <div className="modal" style={{ maxWidth:620 }} onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h2 style={{ fontSize:20, fontWeight:800, color:'var(--text)' }}><Icon icon="lucide:camera" style={{ verticalAlign:'-0.15em' }} /> อัปโหลดรูปภาพ</h2>
          <button style={closeX} onClick={onClose}><Icon icon="lucide:x" /></button>
        </div>

        {!user && (
          <div style={warnBox}><Icon icon="lucide:alert-triangle" style={{ verticalAlign:'-0.15em' }} /> กรุณาเข้าสู่ระบบก่อนอัปโหลดรูปภาพ</div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Drop zone */}
          <div style={{ ...dropZone, ...(drag ? dropActive : {}), ...(file ? dropFilled : {}) }}
            onDragOver={e => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current.click()}>
            {file ? (
              <div style={{ fontSize:13, color:'var(--success)', textAlign:'center' }}>
                <Icon icon="lucide:check-circle" style={{ verticalAlign:'-0.15em' }} /> {file.name} ({(file.size/1024/1024).toFixed(2)} MB)
              </div>
            ) : (
              <>
                <div style={{ fontSize:40 }}><Icon icon="lucide:image-plus" /></div>
                <p style={{ color:'var(--text2)', marginTop:8 }}>วางรูปที่นี่ หรือ คลิกเพื่อเลือกไฟล์</p>
                <p style={{ color:'var(--text3)', fontSize:12, marginTop:4 }}>รองรับ JPG, PNG, WEBP (สูงสุด 10 MB)</p>
              </>
            )}
            <input ref={inputRef} type="file" accept="image/*" hidden onChange={e => handleFile(e.target.files[0])} />
          </div>

          {/* Preview + adjustments */}
          {preview && (
            <div style={{ marginBottom:20 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                <div>
                  <p style={{ fontSize:12, color:'var(--text3)', marginBottom:4 }}>ต้นฉบับ</p>
                  <img src={preview} alt="original" style={{ width:'100%', borderRadius:8, maxHeight:150, objectFit:'cover' }} />
                </div>
                <div>
                  <p style={{ fontSize:12, color:'var(--text3)', marginBottom:4 }}>หลังประมวลผล</p>
                  <canvas ref={canvasRef} style={{ width:'100%', borderRadius:8, maxHeight:150, objectFit:'cover', display:'block' }} />
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ fontSize:12, color:'var(--text2)' }}>ความสว่าง: {brightness}%</label>
                  <input type="range" min={50} max={150} value={brightness}
                    onChange={e => handleAdjust(+e.target.value, contrast)} style={{ width:'100%' }} />
                </div>
                <div>
                  <label style={{ fontSize:12, color:'var(--text2)' }}>คอนทราสต์: {contrast}%</label>
                  <input type="range" min={50} max={150} value={contrast}
                    onChange={e => handleAdjust(brightness, +e.target.value)} style={{ width:'100%' }} />
                </div>
              </div>
            </div>
          )}

          {/* Form fields */}
          <div className="form-group">
            <label>ชื่อสถานที่</label>
            <input type="text" placeholder="เช่น ดอยอินทนนท์" required
              value={form.placeName} onChange={e => setForm(f => ({ ...f, placeName: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>ภาค</label>
            <select value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))}>
              {REGIONS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>คำอธิบายรูปภาพ</label>
            <textarea rows={3} placeholder="บอกเล่าเกี่ยวกับรูปนี้..."
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{ resize:'vertical' }} />
          </div>

          {error && <div style={errBox}><Icon icon="lucide:alert-triangle" style={{ verticalAlign:'-0.15em' }} /> {error}</div>}

          <div style={{ display:'flex', gap:10 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} style={{ flex:1, justifyContent:'center' }}>ยกเลิก</button>
            <button type="submit" className="btn btn-primary" disabled={loading || !user || !file}
              style={{ flex:2, justifyContent:'center', opacity:(loading || !user || !file)?0.6:1 }}>
              {loading ? <><Icon icon="svg-spinners:180-ring" style={{ verticalAlign:'-0.15em' }} /> กำลังอัปโหลด...</> : <><Icon icon="lucide:upload" style={{ verticalAlign:'-0.15em' }} /> อัปโหลด</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const closeX = { background:'none', border:'none', fontSize:20, color:'var(--text2)', cursor:'pointer' }
const warnBox = { background:'rgba(245,158,11,0.12)', border:'1px solid var(--warning)', color:'var(--warning)',
  borderRadius:8, padding:'10px 14px', fontSize:13, marginBottom:16 }
const errBox = { background:'rgba(239,68,68,0.1)', border:'1px solid var(--error)', color:'var(--error)',
  borderRadius:8, padding:'10px 14px', fontSize:13, marginBottom:16 }
const dropZone = {
  border:'2px dashed var(--border)', borderRadius:12, padding:'32px 20px',
  textAlign:'center', cursor:'pointer', transition:'all 0.2s', marginBottom:16,
  background:'var(--bg2)',
}
const dropActive = { borderColor:'var(--accent)', background:'rgba(59,130,246,0.05)' }
const dropFilled = { borderColor:'var(--success)', borderStyle:'solid' }
