import { useLang } from '../../context/LangContext'
import { Icon } from '@iconify/react'
import React from 'react'

const regionInfo = {
  north: { label: 'ภาคเหนือ', color: '#10b981' },
  central: { label: 'ภาคกลาง', color: '#f59e0b' },
  northeast: { label: 'ภาคตะวันออกเฉียงเหนือ', color: '#8b5cf6' },
  east: { label: 'ภาคตะวันออก', color: '#3b82f6' },
  south: { label: 'ภาคใต้', color: '#ec4899' },
}

const StarIcon = () => <Icon icon="material-symbols:star-rounded" width="14" height="14" style={{ color:'#f59e0b' }} />
const MapPin = () => <Icon icon="lucide:map-pin" width="14" height="14" />

export default function PlaceCard({ place, onClick }) {
  const { t, tp, lang, tRegion } = useLang()
  const region = regionInfo[place.regionId] || regionInfo[place.region] || regionInfo.central

  return (
    <div className="place-card" style={{ ...card, '--rc': region.color }} onClick={() => onClick(place)} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(place)}>
      {/* Image / gradient */}
      <div style={{ ...imgBox, background: place.gradient || 'var(--bg2)' }}>
        {place.imageUrl ? (
          <img className="place-card-img" src={place.imageUrl} alt={place.name} style={img} onError={e => { e.target.style.display='none' }} />
        ) : (
          <div style={placeholder}>
            <Icon icon="lucide:camera" width="40" height="40" style={{ color:'rgba(255,255,255,0.4)' }} />
          </div>
        )}
        <div style={{ ...regionBadge, background: region.color }}>{tRegion(place.region) || region.label}</div>
        {place.tags && (
          <div style={tagRow}>
            {place.tags.slice(0, 2).map(t => (
              <span key={t} style={tag}>{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={content}>
        <h3 style={name}>{tp(place, 'name')}</h3>
        {place.province && (
          <p style={{ ...nameEn, display: 'flex', alignItems: 'center', gap: 4 }}>
            <MapPin /> {lang === 'en' ? tp(place, 'province') : place.province.startsWith('กรุงเทพ') ? place.province : 'จ.' + place.province}
          </p>
        )}
        
        <p style={desc}>{tp(place, 'description')?.slice(0, 90)}...</p>
        <div style={footer}>
          <div style={ratingRow}>
            <StarIcon />
            <span style={ratingText}>{typeof place.rating === 'number' ? place.rating.toFixed(1) : '–'}</span>
            <span style={reviewCount}>({(place.reviewCount || 0).toLocaleString()})</span>
          </div>
          <div style={gpsChip}>
            <MapPin />
            <span>GPS</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const card = {
  background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16,
  overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s',
  ':hover': { transform: 'translateY(-4px)' },
}
const imgBox = { position: 'relative', height: 200, overflow: 'hidden' }
const img = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
const placeholder = { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'var(--bg3)' }
const regionBadge = {
  position: 'absolute', top: 12, left: 12, color: '#fff', fontWeight: 700,
  fontSize: 12, padding: '4px 10px', borderRadius: 20,
}
const tagRow = { position: 'absolute', bottom: 12, left: 12, display: 'flex', gap: 6 }
const tag = {
  background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 11,
  padding: '3px 8px', borderRadius: 20, backdropFilter: 'blur(4px)',
}
const content = { padding: '16px 18px 18px' }
const name = { fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }
const nameEn = { fontSize: 13, color: 'var(--text3)', marginBottom: 8 }
const desc = { fontSize: 14, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 14 }
const footer = { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
const ratingRow = { display: 'flex', alignItems: 'center', gap: 4 }
const ratingText = { fontSize: 15, fontWeight: 700, color: 'var(--text)' }
const reviewCount = { fontSize: 12, color: 'var(--text3)' }
const gpsChip = {
  display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
  color: 'var(--accent)', background: 'rgba(59,130,246,0.12)',
  padding: '3px 10px', borderRadius: 20,
}
