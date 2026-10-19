import { useLang } from '../../context/LangContext'
import { Icon } from '@iconify/react'
import React from 'react'

export default function Loader({ hide = false, text }) {
  const { t, tRegion, lang } = useLang()
  return (
    <div className={`loader-screen${hide ? ' hide' : ''}`} aria-busy={!hide} aria-label="loading">
      <Icon icon="svg-spinners:blocks-shuffle-2" width="64" height="64" style={{ color:'#7c5cff' }} />
      <div className="loader-text">{text || t('common.loading')}</div>
    </div>
  )
}
