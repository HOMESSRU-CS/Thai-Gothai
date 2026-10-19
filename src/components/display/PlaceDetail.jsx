import { useLang } from '../../context/LangContext'
import useModalClose from '../../hooks/useModalClose'
import { Icon } from '@iconify/react'
import React, { useState, useEffect } from 'react'
import { updatePlaceRating, enrichPlace } from '../../services/placesService'
import { useAuth } from '../../context/AuthContext'
import { getCoords } from '../../data/provinceCoords'
import { getVisited, toggleVisited } from '../../services/visitedService'


// Modal รายละเอียดสถานที่ — สไตล์โฮโลแกรม
export default function PlaceDetail({ place: initialPlace, onClose: onCloseProp }) {
  const { t, tRegion, lang, tp } = useLang()
  const [closing, onClose] = useModalClose(onCloseProp, 420)
  const [place, setPlace] = useState(initialPlace)
  useEffect(() => { enrichPlace(initialPlace).then(setPlace).catch(() => {}) }, [initialPlace])
  const { user } = useAuth()
  const [userRating, setUserRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [rating, setRating] = useState(place.rating || 0)
  const [tab, setTab] = useState('food')
  const [imgError, setImgError] = useState(false)
  const [visited, setVisited] = useState(() => getVisited().has(initialPlace.id))

  const handleRate = async (stars) => {
    if (!user || submitted) return
    setUserRating(stars)
    setSubmitted(true)
    await updatePlaceRating(place.id, stars)
    setRating(prev => ((prev * (place.reviewCount || 0) + stars) / ((place.reviewCount || 0) + 1)))
  }

  const coords = place.gps?.lat ? [place.gps.lat, place.gps.lng] : getCoords(place)
  // นำทางจากตำแหน่งปัจจุบันไปยังสถานที่ — ค้นด้วยชื่อสถานที่ + จังหวัด ให้ Google หาจุดจริงเอง
  // (พิกัดในข้อมูลเป็นค่าประมาณ ถ้าใช้พิกัดตรงๆ อาจพาไปผิดจุด)
  const destination = [place.name_th || place.name, place.province, 'ประเทศไทย'].filter(Boolean).join(' ')
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`
  const province = place.province
    ? (lang === 'en' ? tp(place, 'province') : place.province.startsWith('กรุงเทพ') ? place.province : 'จังหวัด' + place.province)
    : ''
  const foods = place.foods || []
  const shops = (place.shops || []).filter(sh => sh.partner)
  const items = tab === 'food' ? foods : shops

  return (
    <div className={`modal-backdrop${closing ? ' closing' : ''}`} onClick={onClose}>
      <div className="holo-modal modal-pop" onClick={e => e.stopPropagation()}>
        <div className="holo-scan-wrap"><div className="holo-scan" /></div>
        <button className="holo-badge" onClick={onClose} title={t('d.close')} aria-label={t('d.close')}>
          <i><Icon icon="lucide:x" width="16" /></i>
        </button>

        <div className="hm-scroll">
          {/* Header */}
          <div className="hm-hero">
            {(place.imageUrl || place.img) && !imgError
              ? <img src={place.imageUrl || place.img} alt={place.name} onError={() => setImgError(true)} />
              : <div className="hm-hero-empty"><Icon icon="lucide:image-off" width="44" /><span>{t('d.noImage')}</span></div>}
            <div className="hm-hero-fade" />
            <span className="hm-region">{place.region}</span>
          </div>

          {/* Name block */}
          <div className="hm-panel hm-name-panel">
            <div style={{ minWidth: 0 }}>
              <div className="holo-label">{t('d.placeLabel')}</div>
              <h2 className="hm-title">{tp(place, 'name')}</h2>
              {province && <div className="holo-sub"><Icon icon="lucide:map-pin" style={{ verticalAlign: '-0.15em' }} /> {province}</div>}
            </div>
            <div className="hm-score">
              <Icon icon="material-symbols:star-rounded" width="18" style={{ color: '#facc15' }} />
              <b>{typeof rating === 'number' ? rating.toFixed(1) : '–'}</b>
              <small title={t('d.reviews')}>({(place.reviewCount || 0).toLocaleString()})</small>
            </div>
            <div className="holo-watermark"><Icon icon="lucide:star" width="110" /></div>
          </div>

          {(place.description || place.desc) && <p className="hm-desc">{tp(place, 'description') || place.desc}</p>}

          {/* Info cells */}
          <div className="hm-grid">
            <div className="holo-cell"><span><Icon icon="lucide:clock" /> {t('d.time')} :</span><b>{tp(place, 'opening_hours') || place.openingHours || '-'}</b></div>
            <div className="holo-cell"><span><Icon icon="lucide:ticket" /> {t('d.fee')} :</span><b title={tp(place, 'entrance_fee')}>{tp(place, 'entrance_fee') || place.entranceFee || '-'}</b></div>
            <div className="holo-cell"><span><Icon icon="lucide:locate-fixed" /> GPS :</span><b>{coords ? `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}` : '-'}</b></div>
            <div className="holo-cell"><span><Icon icon="lucide:globe" /> {t('d.region')} :</span><b>{tRegion(place.region) || '-'}</b></div>
          </div>

          {/* Food / Shops */}
          <div className="hm-tabs">
            <button className={tab === 'food' ? 'active' : ''} onClick={() => setTab('food')}>
              <Icon icon="lucide:utensils" /> {t('d.food')}
            </button>
            <button className={tab === 'shop' ? 'active' : ''} onClick={() => setTab('shop')}>
              <Icon icon="lucide:store" /> {t('d.shops')}
            </button>
          </div>
          <div className="hm-list">
            {items.length === 0 && (
              <div className="hm-empty">
                <Icon icon={tab === 'food' ? 'lucide:utensils-crossed' : 'lucide:store'} width="22" />
                <span>{tab === 'food' ? t('d.noFood') : t('d.noShops')}</span>
              </div>
            )}
            {items.map(it => (
              <div key={it.name} className="hm-item">
                <span className="hm-item-icon">
                  <Icon icon={tab === 'food' ? 'lucide:soup' : 'lucide:shopping-bag'} width="18" />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div className="hm-item-name">{it.name}</div>
                  <div className="hm-item-sub">{it.desc || it.type}</div>
                  {tab === 'shop' && it.line && (
                    <a className="hm-line" href={`https://line.me/R/ti/p/~${encodeURIComponent(it.line)}`} target="_blank" rel="noreferrer">
                      <Icon icon="simple-icons:line" /> LINE: {it.line}
                    </a>
                  )}
                </div>
                {tab === 'shop' && <span className="hm-partner"><Icon icon="lucide:badge-check" /> {t('d.partner')}</span>}
                <div style={{ display: 'none' }}>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          {place.id && <button className={`hm-visit ${visited ? 'on' : ''}`} onClick={() => setVisited(toggleVisited(place.id))}>
            <Icon icon={visited ? 'lucide:check-circle' : 'lucide:map-pin-plus'} width="18" />
            {visited ? t('d.visited') : t('d.visit')}
          </button>}

          <a href={mapsUrl} target="_blank" rel="noreferrer" className="holo-btn hm-map-btn">
            <Icon icon="lucide:navigation" /> {t('d.nav')}
          </a>

          <div className={`hm-rate ${!user ? 'locked' : ''} ${submitted ? 'done' : ''}`}>
            <div className="hm-rate-head">
              <span className="hm-rate-icon">
                <Icon icon={submitted ? 'lucide:check' : user ? 'lucide:sparkles' : 'lucide:lock'} width="16" />
              </span>
              <div>
                <div className="hm-rate-title">
                  {submitted ? t('d.rateThanks') : t('d.rate')}
                </div>
                <div className="hm-rate-hint">
                  {submitted ? t('d.youRated', { n: userRating })
                    : user ? (hover ? t(`rate.${hover}`) : t('d.rateHint'))
                    : t('d.rateLogin')}
                </div>
              </div>
            </div>
            <div className="hm-stars">
              {[1, 2, 3, 4, 5].map(star => {
                const on = star <= (hover || userRating)
                return (
                  <button key={star} className={`hm-star ${on ? 'on' : ''}`}
                    disabled={!user || submitted}
                    onMouseEnter={() => !submitted && user && setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => handleRate(star)}
                    aria-label={`${star}`}>
                    <Icon icon="material-symbols:star-rounded" width="34" height="34" />
                  </button>
                )
              })}
            </div>
          </div>

          {place.source && <div className="holo-foot">{t('d.source')}: {place.source}</div>}
        </div>
      </div>
    </div>
  )
}
