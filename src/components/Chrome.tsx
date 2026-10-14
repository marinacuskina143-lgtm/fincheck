import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export function SubHeader({ title, back, right }: { title: string; back: string; right?: ReactNode }) {
  const navigate = useNavigate()
  return (
    <header className="subhead">
      <button type="button" className="icon-btn" onClick={() => navigate(back)} aria-label="Назад">
        <ChevronLeft size={22} />
      </button>
      <h1>{title}</h1>
      <div className="subhead-slot">{right ?? <span className="icon-spacer" />}</div>
    </header>
  )
}

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="sheet-back" onClick={onClose} role="presentation">
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet-grab" />
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  )
}
