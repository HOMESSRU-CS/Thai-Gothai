import useModalClose from '../../hooks/useModalClose'
import React, { useState, useEffect, useRef } from 'react'
import { Icon } from '@iconify/react'
import * as XLSX from 'xlsx'
import { ref as sRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../../services/firebase'
import { useAuth } from '../../context/AuthContext'
import { getSurveys, getSurveyStats } from '../../services/surveysService'
import { getUploads, getUploadStats, updateUploadStatus } from '../../services/uploadsService'
import { getPlaces, addPlace, updatePlace, deletePlace } from '../../services/placesService'
import { getUsers, updateUserRole } from '../../services/usersService'
import BarChart from './charts/BarChart'
import PieChart from './charts/PieChart'
import LineChart from './charts/LineChart'

const TABS = [
  { id:'overview',  label:'ภาพรวม',         icon:'lucide:layout-dashboard' },
  { id:'content',   label:'จัดการสถานที่',   icon:'lucide:map-pin' },
  { id:'surveys',   label:'แบบสอบถาม',       icon:'lucide:clipboard-list' },
  { id:'analytics', label:'วิเคราะห์',       icon:'lucide:bar-chart-2' },
  { id:'uploads',   label:'อัปโหลด',         icon:'lucide:image' },
  { id:'users',     label:'ผู้ใช้',           icon:'lucide:users' },
]

const REGIONS = { north:'ภาคเหนือ', central:'ภาคกลาง', northeast:'ภาคตะวันออกเฉียงเหนือ', east:'ภาคตะวันออก', south:'ภาคใต้' }
const CATEGORIES = ['ธรรมชาติ','วัด/ศาสนสถาน','ชายหาด','วัฒนธรรม','ประวัติศาสตร์','ผจญภัย','ครอบครัว','อื่นๆ']

const EMPTY_FORM = {
  placeId:'', nameTh:'', nameEn:'', region:'north', province:'',
  category:'', description:'', address:'', latitude:'', longitude:'',
  openingHours:'', entranceFee:'', source:'', imageThumbnail:'', imageDetail:'',
}

// ---- Confirm Modal ----
function ConfirmModal({ message, onConfirm, onCancel: onCancelProp }) {
  const [closing, onCancel] = useModalClose(onCancelProp)
  return (
    <div className={`modal-backdrop${closing ? ' closing' : ''}`} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div className="modal-pop" style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, padding:28, maxWidth:380, width:'90%', boxShadow:'0 20px 60px rgba(0,0,0,0.4)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
          <span style={{ color:'#ef4444', fontSize:24 }}><Icon icon="lucide:alert-triangle" /></span>
          <h3 style={{ color:'var(--text)', fontWeight:700, fontSize:16, margin:0 }}>ยืนยันการลบ</h3>
        </div>
        <p style={{ color:'var(--text2)', fontSize:14, lineHeight:1.6, marginBottom:24 }}>{message}</p>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button onClick={onCancel} style={{ padding:'8px 18px', borderRadius:8, border:'1px solid var(--border)', background:'transparent', color:'var(--text2)', cursor:'pointer', fontSize:14 }}>ยกเลิก</button>
          <button onClick={onConfirm} style={{ padding:'8px 18px', borderRadius:8, border:'none', background:'#ef4444', color:'#fff', cursor:'pointer', fontSize:14, fontWeight:600 }}>ลบ</button>
        </div>
      </div>
    </div>
  )
}

// ---- Image Upload ----
async function uploadImage(file, path) {
  const fileRef = sRef(storage, path)
  await uploadBytes(fileRef, file)
  return await getDownloadURL(fileRef)
}

// ---- Main ----
export default function AdminDashboard({ onBack }) {
  const { user, isAdmin } = useAuth()
  const [tab, setTab] = useState('overview')
  const [surveys, setSurveys] = useState([])
  const [surveyStats, setSurveyStats] = useState(null)
  const [uploads, setUploads] = useState([])
  const [uploadStats, setUploadStats] = useState(null)
  const [places, setPlaces] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAdmin) return
    const load = async () => {
      setLoading(true)
      const [sv, ss, up, us, pl, usr] = await Promise.all([
        getSurveys(), getSurveyStats(), getUploads(), getUploadStats(),
        getPlaces(), getUsers(),
      ])
      setSurveys(sv); setSurveyStats(ss); setUploads(up); setUploadStats(us)
      setPlaces(pl); setUsers(usr)
      setLoading(false)
    }
    load()
  }, [isAdmin])

  if (!isAdmin) return (
    <div style={{ textAlign:'center', padding:'80px 24px' }}>
      <Icon icon="lucide:lock" width={56} style={{ color:'var(--text3)' }} />
      <h2 style={{ color:'var(--text)', marginTop:16 }}>ไม่มีสิทธิ์เข้าถึง</h2>
      <p style={{ color:'var(--text2)', marginTop:8 }}>เฉพาะผู้ดูแลระบบเท่านั้น</p>
    </div>
  )

  const current = TABS.find(x => x.id === tab)
  const hour = new Date().getHours()
  const greet = hour < 12 ? 'อรุณสวัสดิ์' : hour < 17 ? 'สวัสดีตอนบ่าย' : 'สวัสดีตอนเย็น'

  return (
    <div className="adm">
      {/* Sidebar */}
      <aside className="adm-side">
        <div className="adm-brand">
          <div className="adm-brand-icon"><Icon icon="lucide:shield-check" width={20} /></div>
          <div>
            <b>GO <span className="logo-accent">THAI</span></b>
            <small>Admin Console</small>
          </div>
        </div>
        <nav className="adm-nav">
          {TABS.map(x => (
            <button key={x.id} className={`adm-nav-btn ${tab === x.id ? 'active' : ''}`} onClick={() => setTab(x.id)}>
              <Icon icon={x.icon} width={18} />
              <span>{x.label}</span>
            </button>
          ))}
        </nav>
        <div className="adm-side-foot">
          <div className="adm-user">
            {user?.photoURL
              ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" />
              : <span>{(user?.displayName || user?.email || '?')[0].toUpperCase()}</span>}
            <div>
              <b>{user?.displayName || 'Admin'}</b>
              <small>{user?.email}</small>
            </div>
          </div>
          <button className="adm-back" onClick={onBack}><Icon icon="lucide:arrow-left" width={15} /> กลับหน้าเว็บ</button>
        </div>
      </aside>

      {/* Main */}
      <main className="adm-main">
        <header className="adm-head">
          <div>
            <p className="adm-greet">{greet}, {user?.displayName?.split(' ').slice(-1)[0] || 'Admin'}</p>
            <h1><Icon icon={current?.icon} width={26} /> {current?.label}</h1>
          </div>
          <div className="adm-date"><Icon icon="lucide:calendar" width={15} /> {new Date().toLocaleDateString('th-TH', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</div>
        </header>

        {loading ? (
          <div className="adm-loading">
            <Icon icon="svg-spinners:blocks-shuffle-2" width={44} style={{ color:'#8b5cf6' }} />
            <p>โหลดข้อมูล...</p>
          </div>
        ) : (
          <div className="adm-body" key={tab}>
            {tab==='overview'  && <OverviewTab surveyStats={surveyStats} uploadStats={uploadStats} places={places} users={users} />}
            {tab==='content'   && <ContentTab places={places} setPlaces={setPlaces} />}
            {tab==='surveys'   && <SurveysTab surveys={surveys} />}
            {tab==='analytics' && <AnalyticsTab surveyStats={surveyStats} uploadStats={uploadStats} />}
            {tab==='uploads'   && <UploadsTab uploads={uploads} setUploads={setUploads} />}
            {tab==='users'     && <UsersTab users={users} setUsers={setUsers} />}
          </div>
        )}
      </main>
    </div>
  )
}

// ---- Overview ----
function OverviewTab({ surveyStats, uploadStats, places, users }) {
  const partnerShops = places.reduce((n, p) => n + (p.shops || []).filter(sh => sh.partner).length, 0)
  const cards = [
    { label:'สถานที่ทั้งหมด', value:places.length, icon:'lucide:map-pin', color:'#3b82f6' },
    { label:'ร้านค้าร่วมโครงการ', value:partnerShops, icon:'lucide:store', color:'#10b981' },
    { label:'แบบสอบถาม', value:surveyStats?.total||0, icon:'lucide:clipboard-list', color:'#8b5cf6' },
    { label:'รูปอัปโหลด', value:uploadStats?.total||0, icon:'lucide:image', color:'#f59e0b' },
    { label:'ผู้ใช้', value:users.length, icon:'lucide:users', color:'#ec4899' },
  ]
  return (
    <div>
      <div className="adm-stats">
        {cards.map((c, i) => (
          <div key={c.label} className="adm-stat" style={{ '--c': c.color, '--d': `${i * 60}ms` }}>
            <div className="adm-stat-icon"><Icon icon={c.icon} width={22} /></div>
            <div className="adm-stat-val">{c.value.toLocaleString()}</div>
            <div className="adm-stat-label">{c.label}</div>
            <Icon className="adm-stat-bg" icon={c.icon} width={90} />
          </div>
        ))}
      </div>
      {surveyStats && (
        <div style={chartCard}>
          <h3 style={chartTitle}>คะแนนเฉลี่ยตามหัวข้อ</h3>
          <BarChart data={[
            { label:'ความสวยงาม', value:+surveyStats.avgDesign, color:'#3b82f6' },
            { label:'เนื้อหา', value:+surveyStats.avgContent, color:'#10b981' },
            { label:'ใช้งาน', value:+surveyStats.avgUsability, color:'#f59e0b' },
            { label:'ภาพรวม', value:+surveyStats.avgOverall, color:'#ec4899' },
          ]} height={180} />
        </div>
      )}
    </div>
  )
}

// ---- Content ----
function ContentTab({ places, setPlaces }) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [thumbFile, setThumbFile] = useState(null)
  const [thumbPreview, setThumbPreview] = useState('')
  const [detailFile, setDetailFile] = useState(null)
  const [detailPreview, setDetailPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [search, setSearch] = useState('')
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const thumbRef = useRef()
  const detailRef = useRef()
  const importRef = useRef()

  const handleImportJSON = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''
    setImporting(true)
    setImportResult(null)
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      const arr = Array.isArray(data) ? data : data.places || []
      if (!arr.length) throw new Error('ไม่พบข้อมูลในไฟล์ JSON')

      let success = 0, failed = 0
      for (const item of arr) {
        try {
          const placeData = {
            placeId:     item.placeId || item.place_id || `P${Date.now()}`,
            name:        item.nameTh  || item.name || item.name_th || '',
            nameTh:      item.nameTh  || item.name || item.name_th || '',
            nameEn:      item.nameEn  || item.name_en || '',
            region:      item.region  || 'south',
            province:    item.province || '',
            category:    item.category || '',
            description: item.description || '',
            address:     item.address || '',
            gps: {
              lat: parseFloat(item.latitude || item.gps?.lat || 0),
              lng: parseFloat(item.longitude || item.gps?.lng || 0),
              display: item.gps?.display || `${item.latitude||0}, ${item.longitude||0}`,
            },
            latitude:     parseFloat(item.latitude  || item.gps?.lat || 0),
            longitude:    parseFloat(item.longitude || item.gps?.lng || 0),
            openingHours: item.openingHours || item.opening_hours || '',
            entranceFee:  item.entranceFee  || item.entrance_fee  || '',
            source:       item.source || '',
            imageThumbnail: item.imageThumbnail || item.image_thumbnail || item.imageUrl || item.img || '',
            imageUrl:       item.imageThumbnail || item.image_thumbnail || item.imageUrl || item.img || '',
            imageDetail:    item.imageDetail    || item.image_detail    || '',
            tags:           item.tags || [],
            gradient:       item.gradient || 'linear-gradient(135deg,#1e3a8a,#1d4ed8)',
            rating:         item.rating || 0,
            reviewCount:    item.reviewCount || 0,
          }
          const ref = await addPlace(placeData)
          setPlaces(prev => [...prev, { id: ref.key, ...placeData }])
          success++
        } catch { failed++ }
      }
      setImportResult({ success, failed, total: arr.length })
    } catch (err) {
      setImportResult({ error: err.message })
    }
    setImporting(false)
  }

  const setField = (k, v) => setForm(f => ({ ...f, [k]:v }))

  const openAdd = () => {
    setEditId(null)
    setForm({ ...EMPTY_FORM, placeId: `P${String(places.length+1).padStart(3,'0')}` })
    setThumbFile(null); setThumbPreview('')
    setDetailFile(null); setDetailPreview('')
    setShowForm(true)
  }

  const openEdit = (place) => {
    setEditId(place.id)
    setForm({
      placeId: place.placeId || '',
      nameTh: place.name || place.nameTh || '',
      nameEn: place.nameEn || '',
      region: place.region || 'north',
      province: place.province || '',
      category: place.category || '',
      description: place.description || '',
      address: place.address || '',
      latitude: place.gps?.lat || place.latitude || '',
      longitude: place.gps?.lng || place.longitude || '',
      openingHours: place.openingHours || '',
      entranceFee: place.entranceFee || '',
      source: place.source || '',
      imageThumbnail: place.imageThumbnail || place.imageUrl || '',
      imageDetail: place.imageDetail || '',
    })
    setThumbPreview(place.imageThumbnail || place.imageUrl || '')
    setDetailPreview(place.imageDetail || '')
    setThumbFile(null); setDetailFile(null)
    setShowForm(true)
  }

  const handleFileChange = (e, type) => {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    if (type === 'thumb') { setThumbFile(file); setThumbPreview(url) }
    else { setDetailFile(file); setDetailPreview(url) }
  }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      let thumbUrl = form.imageThumbnail
      let detailUrl = form.imageDetail
      const pid = form.placeId || `P${Date.now()}`

      if (thumbFile) thumbUrl = await uploadImage(thumbFile, `places/${pid}/thumbnail_${thumbFile.name}`)
      if (detailFile) detailUrl = await uploadImage(detailFile, `places/${pid}/detail_${detailFile.name}`)

      const data = {
        placeId: pid,
        name: form.nameTh,
        nameTh: form.nameTh,
        nameEn: form.nameEn,
        region: form.region,
        province: form.province,
        category: form.category,
        description: form.description,
        address: form.address,
        gps: { lat: +form.latitude || 0, lng: +form.longitude || 0, display: `${form.latitude}, ${form.longitude}` },
        latitude: +form.latitude || 0,
        longitude: +form.longitude || 0,
        openingHours: form.openingHours,
        entranceFee: form.entranceFee,
        source: form.source,
        imageThumbnail: thumbUrl,
        imageUrl: thumbUrl,
        imageDetail: detailUrl,
        gradient: 'linear-gradient(135deg,#1e3a8a,#1d4ed8)',
      }

      if (editId) {
        await updatePlace(editId, data)
        setPlaces(prev => prev.map(p => p.id===editId ? { ...p, ...data } : p))
      } else {
        const ref = await addPlace(data)
        setPlaces(prev => [...prev, { id: ref.key, ...data }])
      }
      setShowForm(false)
    } catch(err) { alert('เกิดข้อผิดพลาด: ' + err.message) }
    setSaving(false)
  }

  const handleDelete = async () => {
    await deletePlace(confirm.id)
    setPlaces(prev => prev.filter(p => p.id !== confirm.id))
    setConfirm(null)
  }

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(places, null, 2)], { type:'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = 'places.json'; a.click()
  }

  const exportXLSX = () => {
    const rows = places.map(p => ({
      'รหัส': p.placeId || '', 'ชื่อไทย': p.nameTh || p.name || '',
      'ชื่ออังกฤษ': p.nameEn || '', 'ภาค': REGIONS[p.region] || p.region || '',
      'จังหวัด': p.province || '', 'ประเภท': p.category || '',
      'รายละเอียด': p.description || '', 'ที่อยู่': p.address || '',
      'Latitude': p.latitude || p.gps?.lat || '', 'Longitude': p.longitude || p.gps?.lng || '',
      'เวลาเปิด': p.openingHours || '', 'ค่าเข้าชม': p.entranceFee || '',
      'รูป Thumbnail': p.imageThumbnail || '', 'รูป Detail': p.imageDetail || '',
      'แหล่งข้อมูล': p.source || '', 'คะแนน': p.rating || 0, 'รีวิว': p.reviewCount || 0,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'สถานที่')
    XLSX.writeFile(wb, 'thai-places.xlsx')
  }

  const filtered = places.filter(p =>
    !search || (p.nameTh||p.name||'').includes(search) ||
    (p.nameEn||'').toLowerCase().includes(search.toLowerCase()) ||
    (p.province||'').includes(search)
  )

  return (
    <div>
      {confirm && <ConfirmModal message={`ต้องการลบ "${confirm.name}" ใช่หรือไม่?`} onConfirm={handleDelete} onCancel={() => setConfirm(null)} />}

      {/* Toolbar */}
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
        <h3 style={{ ...sectionTitle, flex:1 }}>สถานที่ท่องเที่ยว ({places.length})</h3>
        <input placeholder="ค้นหา..." value={search} onChange={e=>setSearch(e.target.value)}
          style={{ padding:'7px 14px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg2)', color:'var(--text)', fontSize:13, width:180 }} />
        <button onClick={exportJSON} style={{ ...outlineBtn, color:'#10b981', borderColor:'#10b981' }}>
          <Icon icon="lucide:file-json" width={14} /> Export JSON
        </button>
        <button onClick={exportXLSX} style={{ ...outlineBtn, color:'#3b82f6', borderColor:'#3b82f6' }}>
          <Icon icon="lucide:file-spreadsheet" width={14} /> XLSX
        </button>
        <button onClick={() => importRef.current.click()} disabled={importing}
          style={{ ...outlineBtn, color:'#f59e0b', borderColor:'#f59e0b', opacity:importing?0.6:1 }}>
          {importing
            ? <><Icon icon="lucide:loader-2" width={14} style={{ animation:'spin 0.8s linear infinite' }} /> กำลัง Import...</>
            : <><Icon icon="lucide:upload" width={14} /> Import JSON</>}
        </button>
        <input ref={importRef} type="file" accept=".json" style={{ display:'none' }} onChange={handleImportJSON} />
        <button onClick={openAdd} style={primaryBtn}>
          <Icon icon="lucide:plus" width={15} /> เพิ่มสถานที่
        </button>
      </div>

      {/* Import result */}
      {importResult && (
        <div style={{ marginBottom:14, padding:'10px 16px', borderRadius:8,
          background: importResult.error ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
          border: `1px solid ${importResult.error ? '#ef4444' : '#10b981'}`,
          display:'flex', alignItems:'center', gap:10 }}>
          <Icon icon={importResult.error ? 'lucide:alert-circle' : 'lucide:check-circle'} width={16}
            style={{ color: importResult.error ? '#ef4444' : '#10b981', flexShrink:0 }} />
          <span style={{ fontSize:13, color:'var(--text)', flex:1 }}>
            {importResult.error
              ? `นำเข้าล้มเหลว: ${importResult.error}`
              : `นำเข้าสำเร็จ ${importResult.success} รายการ${importResult.failed ? ` (ล้มเหลว ${importResult.failed})` : ''} จากทั้งหมด ${importResult.total} รายการ`}
          </span>
          <button onClick={() => setImportResult(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text3)', padding:2 }}>
            <Icon icon="lucide:x" width={14} />
          </button>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div style={{ ...chartCard, marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <h4 style={{ color:'var(--text)', fontWeight:700, fontSize:16, margin:0 }}>
              <Icon icon={editId ? 'lucide:pencil' : 'lucide:plus-circle'} width={16} style={{ marginRight:8 }} />
              {editId ? 'แก้ไขสถานที่' : 'เพิ่มสถานที่ใหม่'}
            </h4>
            <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text3)' }}>
              <Icon icon="lucide:x" width={20} />
            </button>
          </div>

          <form onSubmit={handleSave}>
            <div style={formGrid}>
              <Field label="รหัสสถานที่ (Place ID)" required>
                <input value={form.placeId} onChange={e=>setField('placeId',e.target.value)} required style={inputStyle} placeholder="P001" />
              </Field>
              <Field label="ชื่อภาษาไทย" required>
                <input value={form.nameTh} onChange={e=>setField('nameTh',e.target.value)} required style={inputStyle} placeholder="ดอยอินทนนท์" />
              </Field>
              <Field label="ชื่อภาษาอังกฤษ">
                <input value={form.nameEn} onChange={e=>setField('nameEn',e.target.value)} style={inputStyle} placeholder="Doi Inthanon" />
              </Field>
              <Field label="ภาค" required>
                <select value={form.region} onChange={e=>setField('region',e.target.value)} style={inputStyle}>
                  {Object.entries(REGIONS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </Field>
              <Field label="จังหวัด" required>
                <input value={form.province} onChange={e=>setField('province',e.target.value)} required style={inputStyle} placeholder="เชียงใหม่" />
              </Field>
              <Field label="ประเภทสถานที่" required>
                <select value={form.category} onChange={e=>setField('category',e.target.value)} style={inputStyle}>
                  <option value="">-- เลือกประเภท --</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Latitude" required>
                <input type="number" step="any" value={form.latitude} onChange={e=>setField('latitude',e.target.value)} style={inputStyle} placeholder="18.5888" />
              </Field>
              <Field label="Longitude" required>
                <input type="number" step="any" value={form.longitude} onChange={e=>setField('longitude',e.target.value)} style={inputStyle} placeholder="98.4862" />
              </Field>
              <Field label="เวลาเปิด-ปิด">
                <input value={form.openingHours} onChange={e=>setField('openingHours',e.target.value)} style={inputStyle} placeholder="06:00-18:00" />
              </Field>
              <Field label="ค่าเข้าชม">
                <input value={form.entranceFee} onChange={e=>setField('entranceFee',e.target.value)} style={inputStyle} placeholder="50 บาท" />
              </Field>
              <Field label="แหล่งข้อมูล">
                <input value={form.source} onChange={e=>setField('source',e.target.value)} style={inputStyle} placeholder="TAT / Wikipedia" />
              </Field>
            </div>

            <Field label="ที่อยู่">
              <input value={form.address} onChange={e=>setField('address',e.target.value)} style={{ ...inputStyle, width:'100%', boxSizing:'border-box' }} placeholder="ที่อยู่เต็ม" />
            </Field>
            <Field label="รายละเอียด" required>
              <textarea value={form.description} onChange={e=>setField('description',e.target.value)} required rows={3} style={{ ...inputStyle, width:'100%', boxSizing:'border-box', resize:'vertical' }} placeholder="คำอธิบายสถานที่..." />
            </Field>

            {/* Image upload */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
              <div>
                <label style={labelStyle}>รูปภาพ Thumbnail</label>
                <div style={imgUploadBox} onClick={() => thumbRef.current.click()}>
                  {thumbPreview
                    ? <img src={thumbPreview} alt="thumb" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:8 }} />
                    : <div style={{ textAlign:'center', color:'var(--text3)' }}>
                        <Icon icon="lucide:upload-cloud" width={32} style={{ marginBottom:8 }} />
                        <div style={{ fontSize:12 }}>คลิกเพื่ออัปโหลด</div>
                      </div>
                  }
                  <input ref={thumbRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e=>handleFileChange(e,'thumb')} />
                </div>
                {thumbPreview && (
                  <input value={form.imageThumbnail} onChange={e=>setField('imageThumbnail',e.target.value)}
                    style={{ ...inputStyle, width:'100%', boxSizing:'border-box', marginTop:6, fontSize:11 }} placeholder="หรือวาง URL รูป" />
                )}
              </div>
              <div>
                <label style={labelStyle}>รูปภาพ Detail</label>
                <div style={imgUploadBox} onClick={() => detailRef.current.click()}>
                  {detailPreview
                    ? <img src={detailPreview} alt="detail" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:8 }} />
                    : <div style={{ textAlign:'center', color:'var(--text3)' }}>
                        <Icon icon="lucide:upload-cloud" width={32} style={{ marginBottom:8 }} />
                        <div style={{ fontSize:12 }}>คลิกเพื่ออัปโหลด</div>
                      </div>
                  }
                  <input ref={detailRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e=>handleFileChange(e,'detail')} />
                </div>
                {detailPreview && (
                  <input value={form.imageDetail} onChange={e=>setField('imageDetail',e.target.value)}
                    style={{ ...inputStyle, width:'100%', boxSizing:'border-box', marginTop:6, fontSize:11 }} placeholder="หรือวาง URL รูป" />
                )}
              </div>
            </div>

            <div style={{ display:'flex', gap:10 }}>
              <button type="submit" disabled={saving} style={{ ...primaryBtn, opacity:saving?0.6:1 }}>
                {saving ? <><Icon icon="lucide:loader-2" width={14} style={{ animation:'spin 0.8s linear infinite' }} /> กำลังบันทึก...</> : <><Icon icon="lucide:save" width={14} /> บันทึก</>}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{ ...outlineBtn }}>ยกเลิก</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="adm-table" style={{ overflowX:'auto', borderRadius:16, border:'1px solid var(--border)', background:'var(--card)' }}>
        <table style={table}>
          <thead>
            <tr style={{ background:'var(--bg2)' }}>
              {['รหัส','ชื่อสถานที่','จังหวัด','ภาค','ประเภท','เวลาเปิด','ค่าเข้า','รูปภาพ','คะแนน','จัดการ'].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ borderBottom:'1px solid var(--border)' }}>
                <td style={{ ...td, fontSize:11, color:'var(--text3)', fontFamily:'monospace' }}>{p.placeId||'–'}</td>
                <td style={td}>
                  <div style={{ fontWeight:600, fontSize:13 }}>{p.nameTh||p.name}</div>
                  <div style={{ fontSize:11, color:'var(--text3)' }}>{p.nameEn}</div>
                </td>
                <td style={{ ...td, fontSize:13 }}>{p.province||'–'}</td>
                <td style={td}><span style={regionTag}>{REGIONS[p.region]||p.region}</span></td>
                <td style={{ ...td, fontSize:13 }}>{p.category||'–'}</td>
                <td style={{ ...td, fontSize:12, color:'var(--text3)' }}>{p.openingHours||'–'}</td>
                <td style={{ ...td, fontSize:12, color:'var(--text3)' }}>{p.entranceFee||'ฟรี'}</td>
                <td style={td}>
                  {(p.imageThumbnail||p.imageUrl)
                    ? <img src={p.imageThumbnail||p.imageUrl} alt="" style={{ width:48, height:36, objectFit:'cover', borderRadius:6 }} />
                    : <div style={{ width:48, height:36, borderRadius:6, background:'var(--bg2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <Icon icon="lucide:image-off" width={14} style={{ color:'var(--text3)' }} />
                      </div>
                  }
                </td>
                <td style={{ ...td, fontSize:13 }}>
                  <span style={{ color:'#f59e0b', fontWeight:700 }}>
                    {typeof p.rating==='number' ? p.rating.toFixed(1) : '–'}
                  </span>
                  <span style={{ fontSize:11, color:'var(--text3)', marginLeft:4 }}>({p.reviewCount||0})</span>
                </td>
                <td style={{ ...td }}>
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={() => openEdit(p)} style={{ ...iconActionBtn, color:'var(--accent)', borderColor:'var(--accent)' }}>
                      <Icon icon="lucide:pencil" width={13} />
                    </button>
                    <button onClick={() => setConfirm({ id:p.id, name:p.nameTh||p.name })} style={{ ...iconActionBtn, color:'#ef4444', borderColor:'#ef4444' }}>
                      <Icon icon="lucide:trash-2" width={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan={10} style={{ textAlign:'center', padding:40, color:'var(--text3)' }}>ยังไม่มีข้อมูล</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// helper
function Field({ label, required, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={labelStyle}>{label}{required && <span style={{ color:'#ef4444', marginLeft:3 }}>*</span>}</label>
      {children}
    </div>
  )
}

// ---- Surveys ----
function SurveysTab({ surveys }) {
  const exportXLSX = () => {
    const rows = surveys.map(s => ({
      'ผู้ตอบ': s.userName||'', 'อีเมล': s.email||'',
      'ภาค': { north:'ภาคเหนือ',central:'ภาคกลาง',east:'ตะวันออก',south:'ภาคใต้' }[s.region]||s.region||'',
      'ความสวยงาม': s.ratings?.design||0, 'เนื้อหา': s.ratings?.content||0,
      'ใช้งาน': s.ratings?.usability||0, 'ภาพรวม': s.ratings?.overall||0,
      'แนะนำ': s.recommend ? 'ใช่' : 'ไม่', 'ความเห็น': s.comment||'',
      'วันที่': s.createdAt ? new Date(s.createdAt).toLocaleDateString('th-TH') : '',
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'แบบสอบถาม')
    XLSX.writeFile(wb, 'surveys.xlsx')
  }

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <h3 style={sectionTitle}>ผลแบบสอบถาม ({surveys.length})</h3>
        <button onClick={exportXLSX} style={{ ...outlineBtn, color:'#3b82f6', borderColor:'#3b82f6' }}>
          <Icon icon="lucide:file-spreadsheet" width={14} /> XLSX
        </button>
      </div>
      <div className="adm-table" style={{ overflowX:'auto', borderRadius:16, border:'1px solid var(--border)', background:'var(--card)' }}>
        <table style={table}>
          <thead><tr style={{ background:'var(--bg2)' }}>
            {['ผู้ตอบ','ภาค','สวยงาม','เนื้อหา','ใช้งาน','ภาพรวม','แนะนำ','ความเห็น','วันที่'].map(h => <th key={h} style={th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {surveys.map(s => (
              <tr key={s.id} style={{ borderBottom:'1px solid var(--border)' }}>
                <td style={td}><div style={{fontWeight:600,fontSize:13}}>{s.userName}</div><div style={{fontSize:11,color:'var(--text3)'}}>{s.email}</div></td>
                <td style={{ ...td, fontSize:13 }}>{{ north:'เหนือ',central:'กลาง',east:'ออก',south:'ใต้' }[s.region]||s.region}</td>
                {['design','content','usability','overall'].map(k => (
                  <td key={k} style={{ ...td, textAlign:'center', color:'#f59e0b', fontWeight:700 }}>{Array.from({ length: Number(s.ratings?.[k]||0) || 0 }, (_, i) => <Icon key={i} icon="lucide:star" />)}</td>
                ))}
                <td style={{ ...td, textAlign:'center' }}>
                  <Icon icon={s.recommend ? 'lucide:thumbs-up' : 'lucide:thumbs-down'} width={16} style={{ color: s.recommend ? '#10b981' : '#ef4444' }} />
                </td>
                <td style={{ ...td, maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontSize:12, color:'var(--text2)' }}>{s.comment||'–'}</td>
                <td style={{ ...td, fontSize:12, color:'var(--text3)', whiteSpace:'nowrap' }}>{s.createdAt ? new Date(s.createdAt).toLocaleDateString('th-TH') : '–'}</td>
              </tr>
            ))}
            {!surveys.length && <tr><td colSpan={9} style={{ textAlign:'center', padding:40, color:'var(--text3)' }}>ยังไม่มีข้อมูล</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---- Analytics ----
function AnalyticsTab({ surveyStats, uploadStats }) {
  if (!surveyStats) return <div style={{ textAlign:'center', padding:60, color:'var(--text3)' }}>ยังไม่มีข้อมูลเพียงพอ</div>
  const rc = { north:'#10b981', central:'#f59e0b', east:'#3b82f6', south:'#ec4899' }
  const rl = { north:'เหนือ', central:'กลาง', east:'ตะวันออก', south:'ใต้' }
  const ratingData = Object.entries(surveyStats.ratingDist||{}).map(([s,c]) => ({ label:`${s} ดาว`, value:c, color:['#ef4444','#f59e0b','#eab308','#84cc16','#22c55e'][+s-1] }))
  const regionData = Object.entries(surveyStats.regionCounts||{}).map(([r,c]) => ({ label:rl[r], value:c, color:rc[r] }))
  const dailyData = Object.entries(surveyStats.dailyCounts||{}).sort(([a],[b])=>a.localeCompare(b)).slice(-14).map(([d,c])=>({ label:d.slice(0,5), value:c }))
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(400px,1fr))', gap:20 }}>
      <div style={chartCard}><h3 style={chartTitle}>แบบสอบถามรายวัน (14 วัน)</h3><LineChart data={dailyData} height={160} /></div>
      <div style={chartCard}><h3 style={chartTitle}>การกระจายคะแนน</h3><BarChart data={ratingData} height={180} /></div>
      <div style={chartCard}><h3 style={chartTitle}>ผู้ตอบตามภาค</h3><PieChart data={regionData} /></div>
      <div style={chartCard}>
        <h3 style={chartTitle}>คะแนนเฉลี่ยรายด้าน</h3>
        <BarChart data={[
          { label:'ความสวยงาม', value:+surveyStats.avgDesign, color:'#3b82f6' },
          { label:'เนื้อหา', value:+surveyStats.avgContent, color:'#10b981' },
          { label:'ใช้งาน', value:+surveyStats.avgUsability, color:'#f59e0b' },
          { label:'ภาพรวม', value:+surveyStats.avgOverall, color:'#ec4899' },
        ]} height={180} />
        <div style={{ marginTop:12, padding:'10px 12px', background:'var(--bg)', borderRadius:8, fontSize:13, color:'var(--text2)', display:'flex', alignItems:'center', gap:8 }}>
          <Icon icon="lucide:bar-chart-2" width={14} />
          แนะนำเว็บ: <strong style={{ color:'#10b981' }}>{surveyStats.recommendCount}</strong> / {surveyStats.total} คน
          ({surveyStats.total > 0 ? Math.round(surveyStats.recommendCount/surveyStats.total*100) : 0}%)
        </div>
      </div>
    </div>
  )
}

// ---- Uploads ----
function UploadsTab({ uploads, setUploads }) {
  const updateStatus = async (id, status) => {
    await updateUploadStatus(id, status)
    setUploads(prev => prev.map(u => u.id===id ? {...u,status} : u))
  }
  const sc = { pending:'#f59e0b', approved:'#10b981', rejected:'#ef4444' }
  const sl = { pending:'รอตรวจ', approved:'อนุมัติ', rejected:'ปฏิเสธ' }
  return (
    <div>
      <h3 style={{ ...sectionTitle, marginBottom:16 }}>รูปภาพที่อัปโหลด ({uploads.length})</h3>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>
        {uploads.map(u => (
          <div key={u.id} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
            {u.imageUrl ? <img src={u.imageUrl} alt="" style={{ width:'100%', height:160, objectFit:'cover', display:'block' }} />
              : <div style={{ height:160, background:'var(--bg2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon icon="lucide:image" width={40} style={{ color:'var(--text3)' }} />
                </div>}
            <div style={{ padding:12 }}>
              <div style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>{u.placeName}</div>
              <div style={{ fontSize:12, color:'var(--text3)', marginBottom:8 }}>โดย {u.userName}</div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontSize:12, fontWeight:700, color:sc[u.status], display:'flex', alignItems:'center', gap:4 }}>
                  <Icon icon={u.status==='approved'?'lucide:check-circle':u.status==='rejected'?'lucide:x-circle':'lucide:clock'} width={13} />
                  {sl[u.status]}
                </span>
                {u.status==='pending' && (
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={() => updateStatus(u.id,'approved')} style={{ ...iconActionBtn, color:'#10b981', borderColor:'#10b981' }}><Icon icon="lucide:check" width={13} /></button>
                    <button onClick={() => updateStatus(u.id,'rejected')} style={{ ...iconActionBtn, color:'#ef4444', borderColor:'#ef4444' }}><Icon icon="lucide:x" width={13} /></button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {!uploads.length && <div style={{ textAlign:'center', padding:60, color:'var(--text3)', gridColumn:'1/-1' }}>ยังไม่มีรูปภาพ</div>}
      </div>
    </div>
  )
}

// ---- Users ----
function UsersTab({ users, setUsers }) {
  const changeRole = async (uid, role) => {
    await updateUserRole(uid, role)
    setUsers(prev => prev.map(u => u.uid===uid ? {...u,role} : u))
  }
  return (
    <div>
      <h3 style={{ ...sectionTitle, marginBottom:16 }}>ผู้ใช้ทั้งหมด ({users.length})</h3>
      <div className="adm-table" style={{ overflowX:'auto', borderRadius:16, border:'1px solid var(--border)', background:'var(--card)' }}>
        <table style={table}>
          <thead><tr style={{ background:'var(--bg2)' }}>
            {['ผู้ใช้','อีเมล','สิทธิ์','วันสมัคร','เข้าระบบล่าสุด','จัดการ'].map(h => <th key={h} style={th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom:'1px solid var(--border)' }}>
                <td style={td}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    {u.photoURL ? <img src={u.photoURL} alt="" style={{ width:32,height:32,borderRadius:'50%' }} />
                      : <div style={{ width:32,height:32,borderRadius:'50%',background:'var(--accent)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14 }}>
                          {(u.displayName||u.email||'?')[0].toUpperCase()}</div>}
                    <span style={{ fontWeight:600, fontSize:13 }}>{u.displayName||'–'}</span>
                  </div>
                </td>
                <td style={{ ...td, fontSize:13, color:'var(--text2)' }}>{u.email}</td>
                <td style={td}>
                  <span style={{ fontSize:12,fontWeight:700,padding:'3px 10px',borderRadius:20, display:'inline-flex', alignItems:'center', gap:4,
                    background:u.role==='admin'?'rgba(236,72,153,0.15)':'rgba(59,130,246,0.1)',
                    color:u.role==='admin'?'#ec4899':'var(--accent)' }}>
                    <Icon icon={u.role==='admin'?'lucide:shield-check':'lucide:user'} width={11} />
                    {u.role==='admin'?'Admin':'ผู้ใช้'}
                  </span>
                </td>
                <td style={{ ...td, fontSize:12, color:'var(--text3)' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('th-TH') : '–'}</td>
                <td style={{ ...td, fontSize:12, color:'var(--text3)' }}>{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('th-TH') : '–'}</td>
                <td style={td}>
                  <select value={u.role} onChange={e=>changeRole(u.uid,e.target.value)}
                    style={{ background:'var(--bg2)',border:'1px solid var(--border)',color:'var(--text)',borderRadius:6,padding:'4px 8px',fontSize:12,cursor:'pointer' }}>
                    <option value="user">ผู้ใช้</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---- Styles ----
const tabBtn = { display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:'8px 8px 0 0', border:'none', background:'transparent', color:'var(--text2)', fontSize:13, fontWeight:500, cursor:'pointer', whiteSpace:'nowrap', borderBottom:'2px solid transparent' }
const tabActive = { background:'var(--bg2)', color:'var(--text)', borderBottom:'2px solid var(--accent)', fontWeight:600 }
const statCard = { background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, padding:20 }
const chartCard = { background:'var(--card)', border:'1px solid var(--border)', borderRadius:18, padding:22, boxShadow:'0 6px 24px rgba(0,0,0,0.12)' }
const chartTitle = { fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:16, margin:'0 0 16px' }
const sectionTitle = { fontSize:18, fontWeight:700, color:'var(--text)', margin:0 }
const table = { width:'100%', borderCollapse:'collapse', fontSize:14 }
const th = { padding:'12px 14px', textAlign:'left', color:'var(--text3)', fontSize:11, fontWeight:700, letterSpacing:'0.5px', textTransform:'uppercase', whiteSpace:'nowrap', borderBottom:'1px solid var(--border)', background:'var(--bg2)' }
const td = { padding:'12px 14px', color:'var(--text)', verticalAlign:'middle', borderBottom:'1px solid var(--border)' }
const regionTag = { fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:20, background:'rgba(139,92,246,0.12)', color:'#a78bfa', border:'1px solid rgba(139,92,246,0.3)', whiteSpace:'nowrap' }
const primaryBtn = { display:'inline-flex', alignItems:'center', gap:6, padding:'9px 18px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#8b5cf6,#6366f1)', boxShadow:'0 4px 14px rgba(139,92,246,0.35)', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600, whiteSpace:'nowrap' }
const outlineBtn = { display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:10, border:'1px solid var(--border)', background:'transparent', color:'var(--text2)', cursor:'pointer', fontSize:13, whiteSpace:'nowrap' }
const iconActionBtn = { display:'inline-flex', alignItems:'center', justifyContent:'center', width:28, height:28, borderRadius:6, border:'1px solid', background:'transparent', cursor:'pointer' }
const inputStyle = { width:'100%', padding:'10px 12px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg2)', color:'var(--text)', fontSize:13, outline:'none', boxSizing:'border-box' }
const labelStyle = { display:'block', fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:6 }
const formGrid = { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:12, marginBottom:14 }
const imgUploadBox = { height:140, border:'2px dashed var(--border)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden', background:'var(--bg2)', position:'relative' }
