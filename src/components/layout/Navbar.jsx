import { useLang } from '../../context/LangContext'
import { Icon } from '@iconify/react'
import React, { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { logoutUser } from '../../services/authService'

// Inline SVG icons (lucide-style)
const SunIcon = ({ size = 18 }) => <Icon icon="lucide:sun" width={size} height={size} />
const MoonIcon = ({ size = 18 }) => <Icon icon="lucide:moon" width={size} height={size} />
const UserIcon = ({ size = 16 }) => <Icon icon="lucide:user" width={size} height={size} />
const MapIcon = ({ size = 22 }) => <Icon icon="lucide:map" width={size} height={size} />
const LogOutIcon = ({ size = 15 }) => <Icon icon="lucide:log-out" width={size} height={size} />
const SettingsIcon = ({ size = 15 }) => <Icon icon="lucide:settings" width={size} height={size} />
const ChevronDownIcon = ({ size = 14 }) => <Icon icon="lucide:chevron-down" width={size} height={size} />

const CompassNavIcon = ({ size = 16 }) => <Icon icon="lucide:compass" width={size} height={size} />
const BookOpenIcon = ({ size = 16 }) => <Icon icon="lucide:book-open" width={size} height={size} />
const ShieldIcon = ({ size = 16 }) => <Icon icon="lucide:shield" width={size} height={size} />

export default function Navbar({ onLoginClick, onAdminClick, onHomeClick, onSurveyClick, onPlacesClick, onMapClick, onCollectionClick }) {
  const { t, lang, setLang } = useLang()
  const { theme, toggleTheme } = useTheme()
  const { user, isAdmin } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logoutUser()
    setMenuOpen(false)
  }

  return (
    <nav style={navStyle}>
      <div className="nav-inner" style={innerStyle}>

        {/* Logo */}
        <div style={logoStyle} onClick={onHomeClick} role="button" tabIndex={0}>
          <div style={logoIconWrap}>
            <MapIcon size={20} />
          </div>
          <span className="nav-logo-text" style={logoTextStyle}>GO <span className="logo-accent">THAI</span></span>
        </div>

        {/* Pill nav — ชิดซ้ายต่อจาก Logo */}
        <div className="nav-pill" style={pillNav}>
          <button style={navLinkBtn} onClick={onPlacesClick}
            onMouseEnter={e => { e.currentTarget.style.color='var(--text)'; e.currentTarget.style.background='var(--bg2)' }}
            onMouseLeave={e => { e.currentTarget.style.color='var(--text2)'; e.currentTarget.style.background='transparent' }}
          >
            <CompassNavIcon /> <span className="nav-label">{t('nav.places')}</span>
          </button>
          <button style={navLinkBtn} onClick={onMapClick}
            onMouseEnter={e => { e.currentTarget.style.color='var(--text)'; e.currentTarget.style.background='var(--bg2)' }}
            onMouseLeave={e => { e.currentTarget.style.color='var(--text2)'; e.currentTarget.style.background='transparent' }}
          >
            <MapIcon size={16} /> <span className="nav-label">{t('nav.map')}</span>
          </button>
          <button style={navLinkBtn} onClick={onCollectionClick}
            onMouseEnter={e => { e.currentTarget.style.color='var(--text)'; e.currentTarget.style.background='var(--bg2)' }}
            onMouseLeave={e => { e.currentTarget.style.color='var(--text2)'; e.currentTarget.style.background='transparent' }}
          >
            <Icon icon="lucide:hexagon" width={16} height={16} /> <span className="nav-label">{t('nav.collection')}</span>
          </button>
          <button style={navLinkBtn} onClick={onSurveyClick}
            onMouseEnter={e => { e.currentTarget.style.color='var(--text)'; e.currentTarget.style.background='var(--bg2)' }}
            onMouseLeave={e => { e.currentTarget.style.color='var(--text2)'; e.currentTarget.style.background='transparent' }}
          >
            <BookOpenIcon /> <span className="nav-label">{t('nav.survey')}</span>
          </button>
        </div>

        {/* Right actions — marginLeft:auto ดัน Login ชิดขวา */}
        <div style={actionsStyle}>
          {/* Language toggle TH / EN */}
          <button className="lang-toggle" onClick={() => setLang(lang === 'th' ? 'en' : 'th')} title={t('nav.lang')} aria-label={t('nav.lang')}>
            <Icon icon="lucide:languages" width={15} height={15} />
            <span className={lang === 'th' ? 'on' : ''}>TH</span>
            <span className={lang === 'en' ? 'on' : ''}>EN</span>
          </button>

          {/* Theme toggle */}
          <button style={iconBtnStyle} onClick={toggleTheme} title={t('nav.theme')}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg2)'; e.currentTarget.style.borderColor = 'var(--border2)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* Auth */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button style={avatarBtnStyle} onClick={() => setMenuOpen(m => !m)}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                {user.photoURL
                  ? <img src={user.photoURL} alt="avatar" referrerPolicy="no-referrer" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                  : <div style={avatarCircleStyle}>{(user.displayName || user.email || '?')[0].toUpperCase()}</div>
                }
                <span className="nav-label" style={{ fontSize: 13, maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <ChevronDownIcon />
              </button>

              {menuOpen && (
                <>
                  {/* Backdrop */}
                  <div style={{ position: 'fixed', inset: 0, zIndex: 190 }} onClick={() => setMenuOpen(false)} />
                  <div style={dropdownStyle}>
                    <div style={dropHeaderStyle}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{user.displayName || 'ผู้ใช้'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{user.email}</div>
                    </div>
                    <div style={dropDivider} />
                    {isAdmin && (
                      <button style={dropItemStyle} onClick={() => { setMenuOpen(false); onAdminClick() }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg2)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                      >
                        <SettingsIcon /> {t('nav.admin')}
                      </button>
                    )}
                    <button style={{ ...dropItemStyle, color: 'var(--error, #ef4444)' }} onClick={handleLogout}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <LogOutIcon /> {t('nav.logout')}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button style={loginBtnStyle} onClick={onLoginClick}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
            >
              <UserIcon size={15} />
              <span className="nav-label">{t('nav.login')}</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

const navStyle = {
  position: 'sticky', top: 0, zIndex: 100,
  background: 'var(--nav-bg, rgba(5,5,10,0.45))',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
}
const innerStyle = {
  maxWidth: 1280, margin: '0 auto', padding: '0 24px',
  height: 64, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 16,
}
const logoStyle = {
  display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0, userSelect: 'none',
}
const logoIconWrap = {
  width: 36, height: 36, borderRadius: 10,
  background: 'linear-gradient(135deg, var(--accent), var(--accent2, #7c3aed))',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#fff', flexShrink: 0,
}
const logoTextStyle = {
  fontSize: 17, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px',
}

// Pill-shaped nav container — ชิดซ้าย ต่อจาก Logo
const pillNav = {
  display: 'flex', alignItems: 'center', gap: 4,
  background: 'var(--pill-bg, rgba(255,255,255,0.04))',
  border: '1px solid var(--border2, rgba(255,255,255,0.12))',
  borderRadius: 99, padding: '5px',
  flexShrink: 0,
}
const navLink = {
  padding: '7px 16px', borderRadius: 99,
  color: 'var(--text2)', fontSize: 14, fontWeight: 500,
  transition: 'all 0.15s', textDecoration: 'none', cursor: 'pointer',
  whiteSpace: 'nowrap', background: 'transparent',
}
const navLinkBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  padding: '8px 18px', borderRadius: 99,
  color: 'var(--text2)', fontSize: 14, fontWeight: 500,
  transition: 'all 0.15s', cursor: 'pointer',
  whiteSpace: 'nowrap', background: 'transparent',
  border: 'none',
}
const actionsStyle = { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 'auto' }
const iconBtnStyle = {
  width: 38, height: 38, borderRadius: '50%',
  border: '1px solid var(--border)',
  background: 'transparent', color: 'var(--text2)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
}
const loginBtnStyle = {
  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
  background: 'var(--accent)', color: '#fff',
  border: 'none', borderRadius: 99, fontSize: 14, fontWeight: 600,
  cursor: 'pointer', transition: 'opacity 0.15s', whiteSpace: 'nowrap',
}
const avatarBtnStyle = {
  display: 'flex', alignItems: 'center', gap: 7, padding: '5px 12px 5px 5px',
  background: 'var(--bg2)', border: '1px solid var(--border)',
  borderRadius: 99, color: 'var(--text)', cursor: 'pointer', transition: 'border-color 0.15s',
}
const avatarCircleStyle = {
  width: 28, height: 28, borderRadius: '50%',
  background: 'linear-gradient(135deg, var(--accent), var(--accent2, #7c3aed))',
  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontWeight: 700, fontSize: 12,
}
const dropdownStyle = {
  position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: 200,
  background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14,
  boxShadow: '0 12px 40px rgba(0,0,0,0.25)', overflow: 'hidden', zIndex: 200,
}
const dropHeaderStyle = { padding: '14px 16px 12px' }
const dropDivider = { height: 1, background: 'var(--border)', margin: '0 8px' }
const dropItemStyle = {
  width: '100%', display: 'flex', alignItems: 'center', gap: 9,
  padding: '11px 16px', cursor: 'pointer', fontSize: 13, color: 'var(--text)',
  transition: 'background 0.12s', background: 'transparent', border: 'none',
  textAlign: 'left',
}
