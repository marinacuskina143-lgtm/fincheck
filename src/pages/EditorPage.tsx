import { useRef, useState, type FormEvent } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { CATEGORIES, guessCategory } from '../categories'
import { SubHeader } from '../components/Chrome'
import { money, toLocalIso } from '../format'
import { useFin } from '../store'
import type { CategoryId, FiscalQr, Product, Receipt } from '../types'

type Draft = {
  id: string
  name: string
  price: string
  category: CategoryId
  touched: boolean
}

function blankLine(): Draft {
  return { id: crypto.randomUUID(), name: '', price: '', category: 'products', touched: false }
}

function priceToInput(value: number): string {
  return value.toFixed(2).replace('.', ',')
}

function parsePrice(value: string): number | null {
  const normalized = value.trim().replace(/\s/g, '').replace(',', '.')
  if (!normalized) return null
  const number = Number(normalized)
  if (!Number.isFinite(number) || number <= 0) return null
  return Math.round(number * 100) / 100
}

function splitIso(iso: string): { date: string; time: string } {
  return { date: iso.slice(0, 10), time: iso.slice(11, 16) }
}

export function EditorPage() {
  const { id = 'new' } = useParams()
  const location = useLocation()
  const fiscalFromNav = (location.state as { fiscal?: FiscalQr } | null)?.fiscal
  return <EditorForm key={`${id}:${fiscalFromNav?.raw ?? ''}`} id={id} fiscalFromNav={fiscalFromNav} />
}

function EditorForm({ id, fiscalFromNav }: { id: string; fiscalFromNav?: FiscalQr }) {
  const navigate = useNavigate()
  const { receipts, addReceipt, updateReceipt } = useFin()
  const existing = id === 'new' ? undefined : receipts.find((receipt) => receipt.id === id)
  const fiscal = fiscalFromNav ?? existing?.fiscal
  const initialWhen = splitIso(existing?.datetime ?? fiscal?.datetime ?? toLocalIso(new Date()))
  const [store, setStore] = useState(existing?.store ?? '')
  const [date, setDate] = useState(initialWhen.date)
  const [time, setTime] = useState(initialWhen.time)
  const [lines, setLines] = useState<Draft[]>(() =>
    existing
      ? existing.products.map((product) => ({
          id: product.id,
          name: product.name,
          price: priceToInput(product.price),
          category: product.category,
          touched: true,
        }))
      : [blankLine()],
  )
  const [error, setError] = useState('')
  const lock = useRef(false)
  const storeNames = [...new Set(receipts.map((receipt) => receipt.store))].sort((a, b) => a.localeCompare(b, 'ru'))
  const parsed = lines.map((line) => parsePrice(line.price))
  const entered = parsed.reduce<number>((sum, price) => sum + (price ?? 0), 0)
  const mismatch = fiscal !== undefined && entered > 0 && Math.abs(entered - fiscal.sum) > 0.009

  if (id !== 'new' && !existing) {
    return (
      <div className="page">
        <SubHeader title="Чек" back="/" />
        <div className="empty">
          <p>Такого чека нет.</p>
        </div>
      </div>
    )
  }

  function updateLine(lineId: string, patch: Partial<Draft>) {
    setLines((current) => current.map((line) => (line.id === lineId ? { ...line, ...patch } : line)))
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (lock.current) return
    const storeName = store.trim()
    if (!storeName) {
      setError('Укажите магазин.')
      return
    }
    if (!date || !time) {
      setError('Укажите дату и время.')
      return
    }
    const products: Product[] = []
    for (const line of lines) {
      const name = line.name.trim()
      const price = parsePrice(line.price)
      if (!name && !line.price.trim()) continue
      if (!name || price === null) {
        setError('У каждого товара нужны название и цена больше нуля.')
        return
      }
      products.push({ id: line.id, name, price, category: line.category })
    }
    if (products.length === 0) {
      setError('Добавьте хотя бы один товар.')
      return
    }

    const receipt: Receipt = {
      id: existing?.id ?? crypto.randomUUID(),
      store: storeName,
      datetime: `${date}T${time}:00`,
      products,
      fiscal,
    }
    lock.current = true
    if (existing) updateReceipt(receipt)
    else addReceipt(receipt)
    navigate(`/receipt/${receipt.id}`, { replace: true })
  }

  return (
    <div className="page">
      <SubHeader title={existing ? 'Изменить чек' : 'Новый чек'} back="/" />
      {fiscal && (
        <p className="banner">
          Сумма по QR: {money(fiscal.sum)}. Товаров в коде чека нет — впишите их, категории подставятся сами.
        </p>
      )}
      <form onSubmit={onSubmit}>
        <div className="form-block">
          <label className="field">
            <span>Магазин</span>
            <input list="store-names" value={store} onChange={(event) => setStore(event.target.value)} placeholder="Например, Пятёрочка" />
            <datalist id="store-names">
              {storeNames.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </label>
          <div className="row-2">
            <label className="field">
              <span>Дата</span>
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
            </label>
            <label className="field">
              <span>Время</span>
              <input type="time" value={time} onChange={(event) => setTime(event.target.value)} required />
            </label>
          </div>
        </div>

        <h2 className="section-title">Товары</h2>
        {lines.map((line, index) => (
          <div key={line.id} className="prod">
            <label className="field">
              <span>Товар {index + 1}</span>
              <input
                value={line.name}
                placeholder="Молоко"
                autoComplete="off"
                onChange={(event) => {
                  const name = event.target.value
                  updateLine(line.id, {
                    name,
                    category: line.touched ? line.category : guessCategory(name),
                  })
                }}
              />
            </label>
            <div className="row-2">
              <label className="field">
                <span>Цена, ₽</span>
                <input
                  inputMode="decimal"
                  value={line.price}
                  placeholder="0,00"
                  onChange={(event) => updateLine(line.id, { price: event.target.value })}
                />
              </label>
              <label className="field">
                <span>Категория</span>
                <select
                  value={line.category}
                  onChange={(event) =>
                    updateLine(line.id, { category: event.target.value as CategoryId, touched: true })
                  }
                >
                  {CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {lines.length > 1 && (
              <button type="button" className="link-btn" onClick={() => setLines((current) => current.filter((item) => item.id !== line.id))}>
                Убрать товар
              </button>
            )}
          </div>
        ))}

        <div className="form-block">
          <button type="button" className="btn ghost" onClick={() => setLines((current) => [...current, blankLine()])}>
            Ещё товар
          </button>
        </div>

        <p className={mismatch ? 'banner warn' : 'sum-line'}>
          По товарам: {money(entered)}
          {mismatch && fiscal ? `. В QR ${money(fiscal.sum)}` : ''}
        </p>
        {error && <p className="form-error">{error}</p>}
        <div className="savebar">
          <button type="submit" className="btn">
            Сохранить чек
          </button>
        </div>
      </form>
    </div>
  )
}
