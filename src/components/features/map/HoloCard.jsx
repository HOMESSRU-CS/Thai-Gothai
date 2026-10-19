import { useLang } from '../../../context/LangContext'
import { Icon } from '@iconify/react'
import React from 'react'

// การ์ดโฮโลแกรมแสดงรายละเอียดสถานที่บนแผนที่
export default function HoloCard({ place, x, y, pinned, onDetail, onClose }) {
  const { t, tRegion, lang, tp } = useLang()
  const below = y < 230 // ถ้าหมุดอยู่ขอบบน ให้การ์ดลงข้างล่าง
  return (
    <div className={`holo-card ${below ? 'below' : ''}`}
      style={{ left: x, top: y, pointerEvents: pinned ? 'auto' : 'none' }}
      onClick={e => e.stopPropagation()}>
      <div className="holo-scan-wrap"><div className="holo-scan" /></div>
      <button className="holo-badge" onClick={onClose} title={t('d.close')} aria-label={t('d.close')}><i><Icon icon="lucide:x" width="14" /></i></button>
      <div className="holo-inner">

      <div className="holo-main">
        <div className="holo-img">
          {place.imageUrl ? <img src={place.imageUrl} alt="" /> : <Icon icon="lucide:star" width="36" />}
        </div>
        <div className="holo-info">
          <div className="holo-label">{t('d.placeLabel')}</div>
          <div className="holo-name">{tp(place, 'name')}</div>
          <div className="holo-sub"><Icon icon="lucide:map-pin" style={{ verticalAlign:'-0.15em' }} /> {tp(place, 'province')}</div>
        </div>
        <div className="holo-watermark"><Icon icon="lucide:star" width="90" /></div>
      </div>

      <div className="holo-row">
        <div className="holo-cell"><span>{t('d.region')} :</span><b>{tRegion(place.region) || '-'}</b></div>
        <div className="holo-cell"><span>{t('d.time')} :</span><b>{tp(place, 'opening_hours') || t('d.allDay')}</b></div>
      </div>

      <div className="holo-foot">
        {place.entrance_fee ? `${t('d.fee')}: ${tp(place, 'entrance_fee')}` : t('d.recommended')}
      </div>

      {pinned && onDetail && <button className="holo-btn" onClick={onDetail}>{t('d.detail')}</button>}
      </div>
    </div>
  )
}
