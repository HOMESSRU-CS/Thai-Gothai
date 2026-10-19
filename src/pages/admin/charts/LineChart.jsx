import React from 'react'

export default function LineChart({ data = [], color = '#3b82f6', height = 160, title }) {
  if (data.length < 2) return <div style={{ textAlign:'center', color:'var(--text3)', padding:40 }}>ต้องการข้อมูลอย่างน้อย 2 จุด</div>

  const W = 480, H = height
  const pad = { top:20, right:20, bottom:40, left:40 }
  const iw = W - pad.left - pad.right
  const ih = H - pad.top - pad.bottom
  const vals = data.map(d => d.value)
  const maxV = Math.max(...vals, 1)
  const minV = 0

  const pts = data.map((d, i) => ({
    x: pad.left + (i / (data.length - 1)) * iw,
    y: pad.top + (1 - (d.value - minV) / (maxV - minV)) * ih,
    label: d.label, value: d.value,
  }))

  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ')
  const area = `M${pts[0].x},${pad.top + ih} ${pts.map(p => `L${p.x},${p.y}`).join(' ')} L${pts[pts.length-1].x},${pad.top+ih} Z`

  return (
    <div>
      {title && <p style={{ fontSize:14, fontWeight:600, color:'var(--text2)', marginBottom:8 }}>{title}</p>}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height }} preserveAspectRatio="none">
        {/* Grid lines */}
        {[0,.25,.5,.75,1].map((t,i) => (
          <line key={i} x1={pad.left} y1={pad.top + t*ih} x2={pad.left+iw} y2={pad.top+t*ih}
            stroke="var(--border)" strokeWidth={1} strokeDasharray="4,4" />
        ))}
        {/* Area */}
        <path d={area} fill={color} fillOpacity={0.12} />
        {/* Line */}
        <polyline points={polyline} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {/* Dots */}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill={color} stroke="var(--card)" strokeWidth={2}>
            <title>{p.label}: {p.value}</title>
          </circle>
        ))}
        {/* X labels (every nth) */}
        {pts.filter((_, i) => i % Math.ceil(pts.length / 6) === 0 || i === pts.length-1).map((p, i) => (
          <text key={i} x={p.x} y={H - 8} textAnchor="middle" fontSize={10} fill="var(--text3)">{p.label}</text>
        ))}
        {/* Y axis labels */}
        {[0, 0.5, 1].map((t, i) => (
          <text key={i} x={pad.left - 5} y={pad.top + (1-t)*ih + 4} textAnchor="end" fontSize={10} fill="var(--text3)">
            {Math.round(t * maxV)}
          </text>
        ))}
      </svg>
    </div>
  )
}
