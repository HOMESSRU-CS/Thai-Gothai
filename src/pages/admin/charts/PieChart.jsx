import React from 'react'

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ec4899','#8b5cf6','#ef4444','#14b8a6']

export default function PieChart({ data = [], size = 180, title }) {
  if (!data.length || data.every(d => d.value === 0))
    return <div style={{ textAlign:'center', color:'var(--text3)', padding:40 }}>ไม่มีข้อมูล</div>

  const total = data.reduce((s, d) => s + d.value, 0)
  const r = size / 2 - 10
  const cx = size / 2
  const cy = size / 2

  let angle = -Math.PI / 2
  const slices = data.map((d, i) => {
    const ratio = d.value / total
    const start = angle
    angle += ratio * 2 * Math.PI
    const end = angle
    const x1 = cx + r * Math.cos(start)
    const y1 = cy + r * Math.sin(start)
    const x2 = cx + r * Math.cos(end)
    const y2 = cy + r * Math.sin(end)
    const large = ratio > 0.5 ? 1 : 0
    return { d: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`,
      color: d.color || COLORS[i % COLORS.length], label: d.label, value: d.value, pct: (ratio * 100).toFixed(1) }
  })

  return (
    <div>
      {title && <p style={{ fontSize:14, fontWeight:600, color:'var(--text2)', marginBottom:12 }}>{title}</p>}
      <div style={{ display:'flex', alignItems:'center', gap:24, flexWrap:'wrap' }}>
        <svg width={size} height={size} style={{ flexShrink:0 }}>
          {slices.map((s, i) => (
            <path key={i} d={s.d} fill={s.color} stroke="var(--card)" strokeWidth={2}>
              <title>{s.label}: {s.value} ({s.pct}%)</title>
            </path>
          ))}
        </svg>
        <div style={{ flex:1 }}>
          {slices.map((s, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <div style={{ width:12, height:12, borderRadius:3, background:s.color, flexShrink:0 }} />
              <span style={{ fontSize:13, color:'var(--text2)', flex:1 }}>{s.label}</span>
              <span style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{s.value}</span>
              <span style={{ fontSize:11, color:'var(--text3)' }}>({s.pct}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
