import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Moon, Sun } from 'lucide-react'
import { useTransactions } from '../../context/TransactionsContext'

export default function ProfileMenu({ theme, onToggleTheme }) {
  const { settings, updateSettings } = useTransactions()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const initial = (settings.name || 'R').trim().charAt(0).toUpperCase() || 'R'
  const isDark = theme === 'dark'

  return (
    <div className="profile-wrap" ref={ref}>
      <button
        className="avatar avatar-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="Profile menu"
        aria-expanded={open}
        title={settings.name}
      >
        {initial}
      </button>

      {open && (
        <div className="profile-panel card">
          <div className="profile-head">
            <div className="avatar">{initial}</div>
            <div>
              <b>{settings.name || 'Your name'}</b>
              <small className="muted">{settings.email || 'No email added'}</small>
            </div>
          </div>

          <label className="profile-field">Name
            <input
              className="text-input"
              value={settings.name}
              onChange={(e) => updateSettings({ name: e.target.value })}
              placeholder="Your name"
            />
          </label>
          <label className="profile-field">Email
            <input
              className="text-input"
              type="email"
              value={settings.email || ''}
              onChange={(e) => updateSettings({ email: e.target.value })}
              placeholder="you@example.com"
            />
          </label>

          <div className="profile-actions">
            <button className="btn" onClick={() => { setOpen(false); navigate('/settings') }}>
              <Settings size={14} /> Settings
            </button>
            <button className="btn" onClick={onToggleTheme}>
              {isDark ? <Sun size={14} /> : <Moon size={14} />} {isDark ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}