import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, QrCode } from 'lucide-react'
import { StoreMark } from '../components/StoreMark'
import { changeText, currentMonthKey, dayLabel, itemsLabel, money, monthNominative, shiftMonth } from '../format'
import { groupByDay, linesInMonth, monthTotal, receiptTotal, storesInMonth } from '../stats'
import { useFin } from '../store'
import type { Receipt } from '../types'

export function HomePage() {
  const { receipts, resetDemo } = useFin()
  const navigate = useNavigate()
  const month = currentMonthKey()
  const previous = shiftMonth(month, -1)
  const currentSum = monthTotal(receipts, month)
  const previousSum = monthTotal(receipts, previous)
  const delta = changeText(currentSum, previousSum, previous)
  const stores = storesInMonth(receipts, month)
  const [selected, setSelected] = useState('all')
  const active = selected === 'all' || stores.some((store) => store.name === selected) ? selected : 'all'
  const monthReceipts = receipts.filter((receipt) => receipt.datetime.startsWith(month))

  return (
    <div className="page">
      <header className="topbar">
        <button type="button" className="icon-btn" onClick={() => navigate('/scan')} aria-label="Сканировать QR чека">
          <QrCode size={22} />
        </button>
        <div className="brand">FinCheck</div>
        <button type="button" className="icon-btn" onClick={() => navigate('/edit/new')} aria-label="Добавить чек">
          <Plus size={22} />
        </button>
      </header>

      <section className="hero">
        <p className="hero-kicker">Траты за {monthNominative(month)}</p>
        <p className="hero-sum">{money(currentSum)}</p>
        <span className={`delta ${delta.tone}`}>{delta.text}</span>
      </section>

      <div className="stores" role="tablist" aria-label="Магазины">
        <button
          type="button"
          className={active === 'all' ? 'store-chip on' : 'store-chip'}
          onClick={() => setSelected('all')}
          role="tab"
          aria-selected={active === 'all'}
        >
          <span className="mark all-mark" aria-hidden>Все</span>
          <span className="store-chip-name">Все</span>
        </button>
        {stores.map((store) => (
          <button
            key={store.name}
            type="button"
            className={active === store.name ? 'store-chip on' : 'store-chip'}
            onClick={() => setSelected(store.name)}
            role="tab"
            aria-selected={active === store.name}
          >
            <StoreMark name={store.name} />
            <span className="store-chip-name">{store.name}</span>
          </button>
        ))}
      </div>

      <h2 className="section-title">{active === 'all' ? 'Чеки покупок' : 'Продукты по дням'}</h2>

      {active === 'all' ? (
        monthReceipts.length === 0 ? (
          <EmptyMonth onReset={receipts.length === 0 ? resetDemo : undefined} />
        ) : (
          <ReceiptList receipts={monthReceipts} onOpen={(id) => navigate(`/receipt/${id}`)} />
        )
      ) : (
        <ProductList lines={linesInMonth(receipts, month, active)} onOpen={(id) => navigate(`/receipt/${id}`)} />
      )}
    </div>
  )
}

function EmptyMonth({ onReset }: { onReset?: () => void }) {
  return (
    <div className="empty">
      <p>В этом месяце чеков пока нет.</p>
      <p>Сканируйте QR или добавьте покупку кнопкой «+».</p>
      {onReset && (
        <button type="button" className="btn ghost" onClick={onReset}>
          Показать примеры
        </button>
      )}
    </div>
  )
}

function ReceiptList({ receipts, onOpen }: { receipts: Receipt[]; onOpen: (id: string) => void }) {
  const groups = groupByDay(receipts, (receipt) => receipt.datetime)
  return (
    <div className="list-card">
      {groups.map((group) => (
        <section key={group.day}>
          <h3 className="day-label">{dayLabel(group.day)}</h3>
          {group.items.map((receipt) => (
            <button key={receipt.id} type="button" className="item" onClick={() => onOpen(receipt.id)}>
              <StoreMark name={receipt.store} />
              <span className="item-main">
                <span className="item-title">{receipt.store}</span>
                <span className="item-sub">{itemsLabel(receipt.products.length)}</span>
              </span>
              <span className="item-sum">{money(receiptTotal(receipt), true)}</span>
            </button>
          ))}
        </section>
      ))}
    </div>
  )
}

function ProductList({
  lines,
  onOpen,
}: {
  lines: { id: string; name: string; price: number; datetime: string; receiptId: string }[]
  onOpen: (id: string) => void
}) {
  const groups = groupByDay(lines, (line) => line.datetime)
  return (
    <div className="list-card">
      {groups.map((group) => (
        <section key={group.day}>
          <h3 className="day-label">{dayLabel(group.day)}</h3>
          {group.items.map((line) => (
            <button key={line.id} type="button" className="item" onClick={() => onOpen(line.receiptId)}>
              <span className="item-main">
                <span className="item-title">{line.name}</span>
                <span className="item-sub">{line.datetime.slice(11, 16)}</span>
              </span>
              <span className="item-sum">{money(line.price)}</span>
            </button>
          ))}
        </section>
      ))}
    </div>
  )
}
