import { useLang } from '../../../context/LangContext'
import { Icon } from '@iconify/react'
import React, { useState, useEffect } from 'react'
import PlaceCard from '../../ui/PlaceCard'
import { getPlaces } from '../../../services/placesService'

const REGIONS = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'north', label: 'ภาคเหนือ' },
  { id: 'central', label: 'ภาคกลาง' },
  { id: 'northeast', label: 'ภาคตะวันออกเฉียงเหนือ' },
  { id: 'east', label: 'ภาคตะวันออก' },
  { id: 'south', label: 'ภาคใต้' },
]

const regionIds = ['north', 'central', 'northeast', 'east', 'south']

export default function RegionSection({ onPlaceClick, initialSearch = '', initialRegion = 'all' }) {
  const { t, tRegion, lang } = useLang()
  const [activeRegion, setActiveRegion] = useState(initialRegion)
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(initialSearch)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await getPlaces(activeRegion === 'all' ? null : activeRegion)
        setPlaces(data)
      } catch (err) {
        console.error('Error loading places:', err)
      }
      setLoading(false)
    }
    load()
  }, [activeRegion])

  const filtered = places.filter(p =>
    search === '' ||
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.name_en?.toLowerCase().includes(search.toLowerCase()) ||
    p.province?.includes(search) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <section id="regions" style={section}>
      <div style={inner}>
        {/* Header */}
        <div style={header}>
          <h2 style={title}>{t('places.title')}</h2>
          <p style={sub}>{t('places.desc')}</p>
        </div>

        {/* Controls */}
        <div style={controls}>
          {/* Region tabs */}
          <div style={tabs}>
            {REGIONS.map(r => (
              <button
                key={r.id}
                style={{ ...tab, ...(activeRegion === r.id ? tabActive : {}) }}
                onClick={() => setActiveRegion(r.id)}
              >
                {t(`region.${r.id}`)}
              </button>
            ))}
          </div>
          {/* Search */}
          <input
            style={searchInput}
            placeholder={t('places.search')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div style={loadingBox}>
            <div style={spinner} />
            <p style={{ color: 'var(--text2)', marginTop: 16 }}>{t('common.loading')}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={emptyBox}>
            <Icon icon="lucide:search-x" width="48" height="48" style={{ color:'var(--text3)' }} />
            <p style={{ color: 'var(--text2)' }}>{t('places.empty')}</p>
          </div>
        ) : (
          <div className="place-grid" style={grid}>
            {filtered.map(place => (
              <PlaceCard key={place.id} place={place} onClick={onPlaceClick} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

const section = { padding: '60px 0 80px' }
const inner = { maxWidth: 1280, margin: '0 auto', padding: '0 24px' }
const header = { textAlign: 'center', marginBottom: 40 }
const title = { fontSize: 36, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }
const sub = { fontSize: 16, color: 'var(--text2)' }
const controls = { display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }
const tabs = { display: 'flex', gap: 8, flexWrap: 'wrap' }
const tab = {
  padding: '10px 18px', borderRadius: 50, border: '1px solid var(--border)',
  background: 'transparent', color: 'var(--text2)', fontSize: 14, fontWeight: 500,
  cursor: 'pointer', transition: 'all 0.2s',
}
const tabActive = {
  background: 'var(--accent)', color: '#fff', border: '1px solid var(--accent)',
}
const searchInput = {
  padding: '10px 16px', borderRadius: 50, border: '1px solid var(--border)',
  background: 'var(--bg2)', color: 'var(--text)', fontSize: 14, minWidth: 220,
  outline: 'none',
}
const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: 24,
}
const loadingBox = { textAlign: 'center', padding: '80px 0' }
const emptyBox = { textAlign: 'center', padding: '60px 0' }
const spinner = {
  width: 40, height: 40, border: '3px solid var(--border)',
  borderTopColor: 'var(--accent)', borderRadius: '50%',
  animation: 'spin 0.8s linear infinite', margin: '0 auto',
}
