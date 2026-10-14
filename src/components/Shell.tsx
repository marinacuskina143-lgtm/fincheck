import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Home, PieChart } from 'lucide-react'

const NAV = new Set(['/', '/categories'])

type BeforeInstall = Event & {
  prompt: () => Promise<void>
}

function isStandalone(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true
}

function InstallHint() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstall | null>(null)
  const [ios, setIos] = useState(false)
  const [hidden, setHidden] = useState(() => localStorage.getItem('fincheck.hideInstall') === '1')

  useEffect(() => {
    if (hidden || isStandalone()) return
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent))
    const onPrompt = (event: Event) => {
      event.preventDefault()
      setPromptEvent(event as BeforeInstall)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [hidden])

  if (hidden || isStandalone() || (!promptEvent && !ios)) return null

  return (
    <div className="install">
      <div>
        <strong>Поставить на экран телефона</strong>
        <p>
          {ios
            ? 'Откройте «Поделиться» и выберите «На экран Домой».'
            : 'FinCheck откроется как приложение, без адресной строки.'}
        </p>
      </div>
      <div className="install-actions">
        {promptEvent && (
          <button
            type="button"
            onClick={() => {
              void promptEvent.prompt()
              setHidden(true)
            }}
          >
            Установить
          </button>
        )}
        <button
          type="button"
          className="install-hide"
          onClick={() => {
            localStorage.setItem('fincheck.hideInstall', '1')
            setHidden(true)
          }}
          aria-label="Скрыть"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export function Shell() {
  const location = useLocation()
  const showNav = NAV.has(location.pathname)

  return (
    <div className={showNav ? 'app-shell has-nav' : 'app-shell'}>
      <Outlet />
      {showNav && (
        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
            <Home size={22} />
            Главная
          </NavLink>
          <NavLink to="/categories" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            <PieChart size={22} />
            Категории
          </NavLink>
        </nav>
      )}
      {showNav && <InstallHint />}
    </div>
  )
}
