import useModalClose from '../../hooks/useModalClose'
import { Icon } from '@iconify/react'
import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { submitSurvey } from '../../services/surveysService'

const questions = [
  { key: 'design', label: 'ความสวยงามของเว็บไซต์' },
  { key: 'content', label: 'ความครบถ้วนของเนื้อหา' },
  { key: 'usability', label: 'ความสะดวกในการใช้งาน' },
  { key: 'overall', label: 'ความพึงพอใจโดยรวม' },
]

const REGIONS = [
  { id: '', label: '-- เลือกภาคที่คุณสนใจ --' },
  { id: 'north', label: 'ภาคเหนือ' },
  { id: 'central', label: 'ภาคกลาง' },
  { id: 'east', label: 'ภาคตะวันออก' },
  { id: 'south', label: 'ภาคใต้' },
]

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display:'flex', gap:4 }}>
      {[1,2,3,4,5].map(s => (
        <button key={s} type="button"
          style={{ background:'none', border:'none', fontSize:24, cursor:'pointer',
            color: s <= (hover || value) ? '#f59e0b' : 'var(--border)', transition:'color 0.15s' }}
          onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}>
          <Icon icon="lucide:star" />
        </button>
      ))}
      {value > 0 && <span style={{ fontSize:12, color:'var(--text3)', alignSelf:'center', marginLeft:4 }}>
        {['','แย่มาก','แย่','ปานกลาง','ดี','ดีมาก'][value]}
      </span>}
    </div>
  )
}

export default function SurveyModal({ onClose: onCloseProp }) {
  const [closing, onClose] = useModalClose(onCloseProp)
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [ratings, setRatings] = useState({ design:0, content:0, usability:0, overall:0 })
  const [region, setRegion] = useState('')
  const [comment, setComment] = useState('')
  const [recommend, setRecommend] = useState(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const totalSteps = 3
  const progress = ((step + 1) / (totalSteps + 1)) * 100

  const canNext = () => {
    if (step === 0) return Object.values(ratings).every(v => v > 0)
    if (step === 1) return region !== '' && recommend !== null
    return true
  }

  const handleSubmit = async () => {
    setLoading(true); setError('')
    try {
      await submitSurvey({
        userId: user?.uid || 'anonymous',
        userName: user?.displayName || user?.email || 'ผู้ใช้ทั่วไป',
        email: user?.email || '',
        ratings, region, comment, recommend,
      })
      setDone(true)
    } catch (err) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่: ' + err.message)
    }
    setLoading(false)
  }

  if (done) return (
    <div className={`modal-backdrop${closing ? ' closing' : ''}`} onClick={onClose}>
      <div className="modal" style={{ textAlign:'center' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize:60, marginBottom:16, color:'var(--accent)' }}><Icon icon="lucide:heart-handshake" /></div>
        <h2 style={{ color:'var(--success)', marginBottom:8 }}>ขอบคุณสำหรับความคิดเห็น!</h2>
        <p style={{ color:'var(--text2)', marginBottom:24 }}>คำตอบของคุณช่วยให้เราพัฒนาเว็บไซต์ได้ดียิ่งขึ้น</p>
        <button className="btn btn-primary" onClick={onClose} style={{ margin:'0 auto' }}>ปิด</button>
      </div>
    </div>
  )

  return (
    <div className={`modal-backdrop${closing ? ' closing' : ''}`} onClick={onClose}>
      <div className="modal" style={{ maxWidth:520 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <h2 style={{ fontSize:20, fontWeight:800, color:'var(--text)' }}><Icon icon="lucide:clipboard-list" style={{ verticalAlign:'-0.15em' }} /> แบบสอบถาม</h2>
          <button style={{ background:'none',border:'none',fontSize:20,color:'var(--text2)',cursor:'pointer' }} onClick={onClose}><Icon icon="lucide:x" /></button>
        </div>

        {/* Progress */}
        <div style={{ background:'var(--bg2)', borderRadius:4, height:6, marginBottom:24, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${progress}%`, background:'var(--accent)', transition:'width 0.3s', borderRadius:4 }} />
        </div>

        {/* Step 0: Ratings */}
        {step === 0 && (
          <div>
            <h3 style={{ marginBottom:20, color:'var(--text)' }}>ประเมินความพึงพอใจ</h3>
            {questions.map(q => (
              <div key={q.key} style={{ marginBottom:20 }}>
                <label style={{ display:'block', marginBottom:8, fontWeight:500, color:'var(--text2)', fontSize:14 }}>
                  {q.label}
                </label>
                <StarRating value={ratings[q.key]} onChange={v => setRatings(r => ({ ...r, [q.key]: v }))} />
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Region & Recommend */}
        {step === 1 && (
          <div>
            <h3 style={{ marginBottom:20, color:'var(--text)' }}>ข้อมูลเพิ่มเติม</h3>
            <div className="form-group">
              <label>ภาคที่คุณสนใจท่องเที่ยว</label>
              <select value={region} onChange={e => setRegion(e.target.value)}>
                {REGIONS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>คุณจะแนะนำเว็บนี้ให้คนอื่นหรือไม่?</label>
              <div style={{ display:'flex', gap:12, marginTop:8 }}>
                {[{v:true,l:<><Icon icon="lucide:thumbs-up" style={{ verticalAlign:'-0.15em' }} /> แนะนำ</>},{v:false,l:<><Icon icon="lucide:thumbs-down" style={{ verticalAlign:'-0.15em' }} /> ไม่แนะนำ</>}].map(({v,l}) => (
                  <button key={String(v)} type="button"
                    style={{ flex:1, padding:'10px', borderRadius:8, border:'1px solid var(--border)',
                      background: recommend===v ? (v?'var(--success)':'var(--error)') : 'var(--bg2)',
                      color: recommend===v ? '#fff' : 'var(--text)', cursor:'pointer', fontWeight:600, fontSize:14 }}
                    onClick={() => setRecommend(v)}>{l}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Comment */}
        {step === 2 && (
          <div>
            <h3 style={{ marginBottom:16, color:'var(--text)' }}>ข้อเสนอแนะ (ไม่บังคับ)</h3>
            <div className="form-group">
              <label>ความคิดเห็นและข้อเสนอแนะ</label>
              <textarea rows={5} placeholder="บอกเราว่าเราควรปรับปรุงอะไร หรือชอบอะไรเป็นพิเศษ..."
                value={comment} onChange={e => setComment(e.target.value)} style={{ resize:'vertical' }} />
            </div>
            <div style={{ background:'var(--bg2)', borderRadius:10, padding:14, border:'1px solid var(--border)' }}>
              <p style={{ fontSize:13, color:'var(--text2)', marginBottom:8 }}>สรุปคำตอบของคุณ:</p>
              {questions.map(q => (
                <div key={q.key} style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
                  <span style={{ color:'var(--text3)' }}>{q.label}</span>
                  <span style={{ color:'var(--warning)', fontWeight:700 }}>{Array.from({ length: ratings[q.key] || 0 }, (_, i) => <Icon key={i} icon="lucide:star" />)}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginTop:4 }}>
                <span style={{ color:'var(--text3)' }}>แนะนำ</span>
                <span>{recommend ? <><Icon icon="lucide:thumbs-up" style={{ verticalAlign:'-0.15em' }} /> ใช่</> : <><Icon icon="lucide:thumbs-down" style={{ verticalAlign:'-0.15em' }} /> ไม่ใช่</>}</span>
              </div>
            </div>
          </div>
        )}

        {error && <div style={{ background:'rgba(239,68,68,0.1)',border:'1px solid var(--error)',color:'var(--error)',borderRadius:8,padding:'10px 14px',fontSize:13,margin:'12px 0' }}><Icon icon="lucide:alert-triangle" style={{ verticalAlign:'-0.15em' }} /> {error}</div>}

        {/* Navigation */}
        <div style={{ display:'flex', gap:10, marginTop:24 }}>
          {step > 0 && (
            <button className="btn btn-ghost" onClick={() => setStep(s => s-1)} style={{ flex:1, justifyContent:'center' }}>← ย้อนกลับ</button>
          )}
          {step < 2 ? (
            <button className="btn btn-primary" onClick={() => setStep(s => s+1)} disabled={!canNext()}
              style={{ flex:2, justifyContent:'center', opacity:canNext()?1:0.5 }}>
              ถัดไป →
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}
              style={{ flex:2, justifyContent:'center', background:'var(--success)', opacity:loading?0.6:1 }}>
              {loading ? <><Icon icon="svg-spinners:180-ring" style={{ verticalAlign:'-0.15em' }} /> กำลังส่ง...</> : <><Icon icon="lucide:send" style={{ verticalAlign:'-0.15em' }} /> ส่งแบบสอบถาม</>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
