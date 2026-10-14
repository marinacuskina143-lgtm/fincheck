import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import { CATEGORIES } from '../categories'
import { Sheet } from '../components/Chrome'
import { dateTimeLabel, money, monthNominative, monthShort, shareLabel } from '../format'
import { linesInMonth, monthTotal } from '../stats'
import { useFin } from '../store'
import type { CategoryId } from '../types'

export function CategoriesPage() {
  const { receipts, month, setMonth } = useFin()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [picker, setPicker] = useState(false)
  const applied = query.trim()
  const total = monthTotal(receipts, month)
  const slices = useMemo(() => categorySlices(receipts, month), [receipts, month])
  const found = useMemo(() => {
    const needle = applied.toLocaleLowerCase('ru-RU')
    if (!needle) return []
    return linesInMonth(receipts, month)
      .filter((line) => line.name.toLocaleLowerCase('ru-RU').includes(needle))
      .sort((a, b) => b.datetime.localeCompare(a.datetime))
  }, [receipts, month, applied])
  const foundSum = found.reduce((sum, line) => sum + line.price, 0)
  const title = uniqueTitle(found.map((line) => line.name), applied)

  return (
    <div className="page">
      <header className={searchOpen ? 'topbar search-on' : 'topbar'}>
        {searchOpen ? (
          <>
            <label className="search-field">
              <Search size={18} />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Название товара"
                aria-label="Поиск товара"
              />
            </label>
            <button
              type="button"
              className="icon-btn"
              aria-label="Закрыть поиск"
              onClick={() => {
                setQuery('')
                setSearchOpen(false)
              }}
            >
              <X size={20} />
            </button>
          </>
        ) : (
          <>
            <button type="button" className="icon-btn" aria-label="Поиск товара" onClick={() => setSearchOpen(true)}>
              <Search size={20} />
            </button>
            <div className="brand">Категории</div>
            <button type="button" className="icon-btn" aria-label="Выбрать месяц" onClick={() => setPicker(true)}>
              <Calendar size={20} />
            </button>
          </>
        )}
      </header>

      <button type="button" className="month-btn" onClick={() => setPicker(true)}>
        {monthNominative(month)} {month.slice(0, 4)}
      </button>

      {applied ? (
        <>
          <section className="search-hero">
            <p>Товар</p>
            <h2>{title}</h2>
            <strong>{money(foundSum)}</strong>
            <span>за {monthNominative(month)}</span>
          </section>
          {found.length === 0 ? (
            <div className="empty">
              <p>В этом месяце такого товара нет.</p>
            </div>
          ) : (
            <div className="list-card">
              {found.map((line) => (
                <button key={line.id} type="button" className="item" onClick={() => navigate(`/receipt/${line.receiptId}`)}>
                  <span className="item-main">
                    <span className="item-title">{dateTimeLabel(line.datetime)}</span>
                    <span className="item-sub">{line.store}</span>
                  </span>
                  <span className="item-sum">{money(line.price)}</span>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <section className="cat-panel">
            {slices.length === 0 ? (
              <p className="cat-empty">За этот месяц покупок нет</p>
            ) : (
              <div className="bubbles">
                {slices.map((slice) => (
                  <button
                    key={slice.id}
                    type="button"
                    className="bubble"
                    style={{ width: slice.size, height: slice.size, background: bubbleBackground(slice.color) }}
                    onClick={() => navigate(`/category/${slice.id}`)}
                  >
                    <span>{slice.name}</span>
                    <strong>{shareLabel(slice.share)}</strong>
                  </button>
                ))}
              </div>
            )}
          </section>
          <section className="expenses">
            <div className="expenses-top">
              <span>Траты</span>
              <strong>{money(total)}</strong>
            </div>
            {slices.map((slice) => (
              <button key={slice.id} type="button" className="cat-row" onClick={() => navigate(`/category/${slice.id}`)}>
                <i style={{ background: slice.color }} />
                <span>{slice.name}</span>
                <b>{money(slice.sum)}</b>
              </button>
            ))}
          </section>
        </>
      )}

      {picker && <MonthPicker month={month} onClose={() => setPicker(false)} onPick={setMonth} />}
    </div>
  )
}

function categorySlices(receipts: Parameters<typeof linesInMonth>[0], month: string) {
  const totals = new Map<CategoryId, number>()
  for (const line of linesInMonth(receipts, month)) {
    totals.set(line.category, (totals.get(line.category) ?? 0) + line.price)
  }
  const total = [...totals.values()].reduce((sum, value) => sum + value, 0)
  return CATEGORIES.map((category) => {
    const sum = totals.get(category.id) ?? 0
    const share = total === 0 ? 0 : (sum / total) * 100
    return { ...category, sum, share, size: 96 + Math.min(share, 55) * 1.15 }
  })
    .filter((category) => category.sum > 0)
    .sort((a, b) => b.sum - a.sum)
}

function bubbleBackground(color: string): string {
  return `radial-gradient(circle at 32% 28%, rgba(255,255,255,.55), transparent 46%), ${color}`
}

function uniqueTitle(names: string[], query: string): string {
  const unique = [...new Set(names)]
  if (unique.length === 1) return unique[0]
  const trimmed = query.trim()
  return trimmed.charAt(0).toLocaleUpperCase('ru-RU') + trimmed.slice(1)
}

function MonthPicker({
  month,
  onClose,
  onPick,
}: {
  month: string
  onClose: () => void
  onPick: (month: string) => void
}) {
  const now = new Date()
  const [year, setYear] = useState(Number(month.slice(0, 4)))
  const selectedMonth = Number(month.slice(5, 7)) - 1
  const selectedYear = Number(month.slice(0, 4))

  return (
    <Sheet title="Месяц" onClose={onClose}>
      <div className="year-row">
        <button type="button" className="icon-btn" aria-label="Предыдущий год" onClick={() => setYear((value) => value - 1)}>
          <ChevronLeft size={18} />
        </button>
        <strong>{year}</strong>
        <button
          type="button"
          className="icon-btn"
          aria-label="Следующий год"
          disabled={year >= now.getFullYear()}
          onClick={() => setYear((value) => value + 1)}
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="month-grid">
        {MONTH_INDEXES.map((index) => {
          const future = year > now.getFullYear() || (year === now.getFullYear() && index > now.getMonth())
          const active = year === selectedYear && index === selectedMonth
          const key = `${year}-${String(index + 1).padStart(2, '0')}`
          return (
            <button
              key={key}
              type="button"
              className={active ? 'on' : undefined}
              disabled={future}
              onClick={() => {
                onPick(key)
                onClose()
              }}
            >
              {monthShort(index)}
            </button>
          )
        })}
      </div>
    </Sheet>
  )
}

const MONTH_INDEXES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
