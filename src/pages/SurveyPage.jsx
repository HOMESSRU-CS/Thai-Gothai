import { useLang } from '../context/LangContext'
import { Icon } from '@iconify/react'
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { submitSurvey } from '../services/surveysService'

// Icons
const ChevronLeftIcon = ({ size = 18 }) => <Icon icon="lucide:chevron-left" width={size} height={size} />
const ChevronRightIcon = ({ size = 18 }) => <Icon icon="lucide:chevron-right" width={size} height={size} />
const SendIcon = ({ size = 17 }) => <Icon icon="lucide:send" width={size} height={size} />
const CheckCircleIcon = ({ size = 56 }) => <Icon icon="lucide:check-circle" width={size} height={size} />
const ThumbUpIcon = ({ size = 18 }) => <Icon icon="lucide:thumbs-up" width={size} height={size} />
const ThumbDownIcon = ({ size = 18 }) => <Icon icon="lucide:thumbs-down" width={size} height={size} />
const AlertIcon = ({ size = 15 }) => <Icon icon="lucide:alert-triangle" width={size} height={size} />
const LoaderIcon = ({ size = 17 }) => <Icon icon="svg-spinners:180-ring" width={size} height={size} />

const questions = [
  { key:'design',    label:'ความสวยงามของเว็บไซต์', en:'Website design' },
  { key:'content',   label:'ความครบถ้วนของเนื้อหา', en:'Content completeness' },
  { key:'usability', label:'ความสะดวกในการใช้งาน', en:'Ease of use' },
  { key:'overall',   label:'ความพึงพอใจโดยรวม', en:'Overall satisfaction' },
]
const REGIONS = [
  { id:'',        label:'-- เลือกภาคที่คุณสนใจ --', en:'-- Choose a region --' },
  { id:'north',   label:'ภาคเหนือ', en:'North' },
  { id:'central', label:'ภาคกลาง', en:'Central' },
  { id:'northeast', label:'ภาคตะวันออกเฉียงเหนือ', en:'Northeast' },
  { id:'east',    label:'ภาคตะวันออก', en:'East' },
  { id:'south',   label:'ภาคใต้', en:'South' },
]
const ratingOptions = [
  { v:1, label:'แย่มาก', en:'Very poor' },
  { v:2, label:'แย่', en:'Poor' },
  { v:3, label:'ปานกลาง', en:'Fair' },
  { v:4, label:'ดี', en:'Good' },
  { v:5, label:'ดีมาก', en:'Very good' },
]

function PillRating({ value, onChange }) {
  const { lang } = useLang()
  const L = (th, en) => (lang === 'en' ? en : th)
  return (
    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
      {ratingOptions.map(opt => {
        const active = value === opt.v
        const colors = {
          1: '#ef4444', 2: '#f97316', 3: '#eab308', 4: '#22c55e', 5: '#6366f1',
        }
        return (
          <button key={opt.v} type="button"
            style={{
              padding:'7px 16px', borderRadius:99, fontSize:13, fontWeight:600, cursor:'pointer',
              border: active ? `2px solid ${colors[opt.v]}` : '1px solid var(--border)',
              background: active ? `${colors[opt.v]}18` : 'var(--bg2)',
              color: active ? colors[opt.v] : 'var(--text2)',
              transition:'all 0.15s',
            }}
            onClick={() => onChange(opt.v)}>
            {lang === 'en' ? opt.en : opt.label}
          </button>
        )
      })}
    </div>
  )
}

export default function SurveyPage({ onBack }) {
  const { lang } = useLang()
  const L = (th, en) => (lang === 'en' ? en : th)
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
  const progress = ((step) / totalSteps) * 100

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
      setError(L('เกิดข้อผิดพลาด กรุณาลองใหม่: ', 'Something went wrong, please try again: ') + err.message)
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div style={pageWrap}>
        <div style={doneCard}>
          <div style={{ color:'var(--success)', marginBottom:20 }}><CheckCircleIcon size={64} /></div>
          <h2 style={{ fontSize:26, fontWeight:800, color:'var(--text)', marginBottom:10 }}>{L('ขอบคุณสำหรับความคิดเห็น!', 'Thank you for your feedback!')}</h2>
          <p style={{ color:'var(--text2)', fontSize:16, lineHeight:1.7, marginBottom:32 }}>
            {L('คำตอบของคุณช่วยให้เราพัฒนาเว็บไซต์ให้ดียิ่งขึ้น', 'Your answers help us improve the website.')}
          </p>
          <button style={backBtn} onClick={onBack}>
            <ChevronLeftIcon /> {L('กลับหน้าหลัก', 'Back to home')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={pageWrap}>
      <div style={pageInner}>

        {/* Back button */}
        <button style={backBtn} onClick={onBack}>
          <ChevronLeftIcon /> {L('กลับ', 'Back')}
        </button>

        {/* Page title */}
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <h1 style={{ fontSize:32, fontWeight:800, color:'var(--text)', marginBottom:8 }}>{L('แบบสอบถาม', 'Survey')}</h1>
          <p style={{ color:'var(--text2)', fontSize:16 }}>{L('ช่วยเราพัฒนาเว็บไซต์ GOTHAI ให้ดียิ่งขึ้น', 'Help us make GOTHAI better')}</p>
        </div>

        {/* Step indicator */}
        <div style={stepIndicator}>
          {(lang === 'en' ? ['Satisfaction','More info','Suggestions'] : ['ประเมินความพึงพอใจ','ข้อมูลเพิ่มเติม','ข้อเสนอแนะ']).map((label, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div style={{ flex:1, height:2, background: i<=step ? 'var(--accent)':'var(--border)', transition:'background 0.3s' }} />}
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                <div style={{
                  width:36, height:36, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                  fontWeight:700, fontSize:14, transition:'all 0.3s',
                  background: i<=step ? 'var(--accent)':'var(--bg2)',
                  color: i<=step ? '#fff':'var(--text3)',
                  border: i===step ? '2px solid var(--accent)':'2px solid transparent',
                }}>
                  {i + 1}
                </div>
                <span style={{ fontSize:11, color: i<=step ? 'var(--accent)':'var(--text3)', fontWeight: i===step?700:400, whiteSpace:'nowrap' }}>
                  {label}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ background:'var(--bg2)', borderRadius:4, height:4, marginBottom:40, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${progress}%`, background:'var(--accent)', transition:'width 0.4s ease', borderRadius:4 }} />
        </div>

        {/* Card */}
        <div style={formCard}>

          {/* Step 0 */}
          {step === 0 && (
            <div>
              <h3 style={stepTitle}>{L('ประเมินความพึงพอใจ', 'Rate your satisfaction')}</h3>
              <p style={stepDesc}>{L('กรุณาให้คะแนนในแต่ละด้าน', 'Please rate each aspect')}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:24, marginTop:28 }}>
                {questions.map(q => (
                  <div key={q.key} style={{ display:'flex', flexDirection:'column', gap:10, padding:'16px 0', borderBottom:'1px solid var(--border)' }}>
                    <label style={{ fontSize:14, fontWeight:600, color:'var(--text)' }}>{lang === 'en' ? q.en : q.label}</label>
                    <PillRating value={ratings[q.key]} onChange={v => setRatings(r => ({ ...r, [q.key]:v }))} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div>
              <h3 style={stepTitle}>{L('ข้อมูลเพิ่มเติม', 'More about you')}</h3>
              <p style={stepDesc}>{L('บอกเราเพิ่มเติมเกี่ยวกับความสนใจของคุณ', 'Tell us more about your interests')}</p>
              <div style={{ marginTop:28 }}>
                <div className="form-group">
                  <label>{L('ภาคที่คุณสนใจท่องเที่ยว', 'Which region interests you?')}</label>
                  <select value={region} onChange={e => setRegion(e.target.value)}>
                    {REGIONS.map(r => <option key={r.id} value={r.id}>{lang === 'en' ? r.en : r.label}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginTop:20 }}>
                  <label style={{ marginBottom:12, display:'block' }}>{L('คุณจะแนะนำเว็บนี้ให้คนอื่นหรือไม่?', 'Would you recommend this website?')}</label>
                  <div style={{ display:'flex', gap:12 }}>
                    {[
                      { v:true,  label:L('แนะนำ', 'Yes'),    Icon:ThumbUpIcon,   color:'var(--success)' },
                      { v:false, label:L('ไม่แนะนำ', 'No'), Icon:ThumbDownIcon, color:'var(--error)' },
                    ].map(({ v, label, Icon, color }) => (
                      <button key={String(v)} type="button"
                        style={{
                          flex:1, padding:'14px', borderRadius:12,
                          border: recommend===v ? `2px solid ${color}`:'1px solid var(--border)',
                          background: recommend===v ? `${color}18`:'var(--bg2)',
                          color: recommend===v ? color:'var(--text)',
                          cursor:'pointer', fontWeight:600, fontSize:14,
                          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                          transition:'all 0.2s',
                        }}
                        onClick={() => setRecommend(v)}>
                        <Icon size={16} /> {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div>
              <h3 style={stepTitle}>{L('ข้อเสนอแนะ', 'Suggestions')}</h3>
              <p style={stepDesc}>{L('ไม่บังคับ — แต่เราอยากฟังความคิดเห็นของคุณ', "Optional — but we'd love to hear from you")}</p>
              <div style={{ marginTop:28 }}>
                <div className="form-group">
                  <label>{L('ความคิดเห็นและข้อเสนอแนะ', 'Comments and suggestions')}</label>
                  <textarea rows={5} placeholder={L('บอกเราว่าเราควรปรับปรุงอะไร หรือชอบอะไรเป็นพิเศษ...', 'What should we improve, or what did you like?')}
                    value={comment} onChange={e => setComment(e.target.value)} style={{ resize:'vertical' }} />
                </div>

                {/* Summary */}
                <div style={{ background:'var(--bg2)', borderRadius:12, padding:18, border:'1px solid var(--border)', marginTop:8 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:'var(--text2)', marginBottom:14 }}>{L('สรุปคำตอบของคุณ', 'Your answers')}</p>
                  {questions.map(q => (
                    <div key={q.key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:13, padding:'6px 0', borderBottom:'1px solid var(--border)' }}>
                      <span style={{ color:'var(--text3)' }}>{lang === 'en' ? q.en : q.label}</span>
                      <span style={{ fontWeight:600, color:'var(--accent)' }}>
                        {(o => o ? (lang === 'en' ? o.en : o.label) : '–')(ratingOptions.find(o => o.v === ratings[q.key]))}
                      </span>
                    </div>
                  ))}
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, paddingTop:8 }}>
                    <span style={{ color:'var(--text3)' }}>{L('จะแนะนำ', 'Recommend')}</span>
                    <span style={{ fontWeight:600, color: recommend ? 'var(--success)':'var(--error)' }}>
                      {recommend ? L('แนะนำ', 'Yes') : L('ไม่แนะนำ', 'No')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(239,68,68,0.1)', border:'1px solid var(--error)', color:'var(--error)', borderRadius:10, padding:'11px 14px', fontSize:13, marginTop:20 }}>
              <AlertIcon /> {error}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display:'flex', gap:10, marginTop:32 }}>
            {step > 0 && (
              <button style={prevBtn} onClick={() => setStep(s => s-1)}>
                <ChevronLeftIcon /> {L('ย้อนกลับ', 'Previous')}
              </button>
            )}
            {step < 2 ? (
              <button style={{ ...nextBtn, opacity: canNext()?1:0.45, cursor: canNext()?'pointer':'not-allowed' }}
                onClick={() => canNext() && setStep(s => s+1)} disabled={!canNext()}>
                {L('ถัดไป', 'Next')} <ChevronRightIcon />
              </button>
            ) : (
              <button style={{ ...nextBtn, background:'var(--success)', opacity:loading?0.6:1 }}
                onClick={handleSubmit} disabled={loading}>
                {loading ? <><LoaderIcon /> {L('กำลังส่ง...', 'Sending...')}</> : <><SendIcon /> {L('ส่งแบบสอบถาม', 'Submit')}</>}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

const pageWrap = { minHeight:'calc(100vh - 64px)', background:'var(--bg)', padding:'48px 24px 80px' }
const pageInner = { maxWidth:680, margin:'0 auto' }
const doneCard = {
  maxWidth:480, margin:'80px auto 0', textAlign:'center',
  background:'var(--card)', border:'1px solid var(--border)',
  borderRadius:20, padding:'48px 40px',
}
const backBtn = {
  display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px',
  borderRadius:99, background:'var(--bg2)', border:'1px solid var(--border)',
  color:'var(--text2)', fontSize:14, fontWeight:500, cursor:'pointer',
  marginBottom:32,
}
const stepIndicator = {
  display:'flex', alignItems:'flex-start', gap:0, marginBottom:24,
}
const formCard = {
  background:'var(--card)', border:'1px solid var(--border)',
  borderRadius:16, padding:'32px 36px',
}
const stepTitle = { fontSize:20, fontWeight:800, color:'var(--text)', marginBottom:4 }
const stepDesc = { fontSize:14, color:'var(--text3)' }
const prevBtn = {
  display:'flex', alignItems:'center', gap:6, padding:'11px 20px',
  borderRadius:99, background:'var(--bg2)', border:'1px solid var(--border)',
  color:'var(--text)', fontSize:15, fontWeight:500, cursor:'pointer',
}
const nextBtn = {
  flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7,
  padding:'12px 24px', borderRadius:99, background:'var(--accent)',
  border:'none', color:'#fff', fontSize:15, fontWeight:600, cursor:'pointer',
  transition:'opacity 0.2s',
}
