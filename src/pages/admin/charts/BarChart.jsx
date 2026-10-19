import React from 'react'

export default function BarChart({ data = [], color = '#3b82f6', height = 200, title }) {
  if (!data.length) return <div style={{ textAlign:'center', color:'var(--text3)', padding:40 }}>ไม่มีข้อมูล</div>
  const max = Math.max(...data.map(d => d.value), 1)
  const barW = Math.min(60, (480 / data.length) - 8)

  return (
    <div>
      {title && <p style={{ fontSize:14, fontWeight:600, color:'var(--text2)', marginBottom:12 }}>{title}</p>}
      <div style={{ display:'flex', alignItems:'flex-end', gap:6, height, padding:'8px 0', overflowX:'auto' }}>
        {data.map((d, i) => (
          <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, flex:1, minWidth:barW }}>
            <span style={{ fontSize:11, color:'var(--text3)', fontWeight:600 }}>{d.value}</span>
            <div style={{
              width:'100%', borderRadius:'6px 6px 0 0',
              background: d.color || color,
              height: `${(d.value / max) * (height - 40)}px`,
              minHeight: d.value > 0 ? 4 : 0,
              transition: 'height 0.4s ease',
            }} title={`${d.label}: ${d.value}`} />
            <span style={{ fontSize:11, color:'var(--text3)', textAlign:'center', wordBreak:'break-word', maxWidth:70 }}>
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
