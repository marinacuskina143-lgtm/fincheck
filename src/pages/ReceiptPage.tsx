import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Sheet, SubHeader } from '../components/Chrome'
import { StoreMark } from '../components/StoreMark'
import { categoryById } from '../categories'
import { dateTimeLabel, money } from '../format'
import { receiptTotal } from '../stats'
import { useFin } from '../store'

export function ReceiptPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { receipts, removeReceipt } = useFin()
  const [confirm, setConfirm] = useState(false)
  const receipt = receipts.find((item) => item.id === id)

  if (!receipt) {
    return (
      <div className="page">
        <SubHeader title="Чек" back="/" />
        <div className="empty">
          <p>Такого чека нет.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <SubHeader title="Чек" back="/" />
      <section className="receipt-head">
        <StoreMark name={receipt.store} size={76} />
        <h2>{receipt.store}</h2>
        <p>{dateTimeLabel(receipt.datetime)}</p>
        <strong>{money(receiptTotal(receipt), true)}</strong>
      </section>
      <div className="list-card">
        {receipt.products.map((product) => (
          <div key={product.id} className="item static">
            <span className="item-main">
              <span className="item-title">{product.name}</span>
              <span className="item-sub">{categoryById(product.category)?.name}</span>
            </span>
            <span className="item-sum">{money(product.price)}</span>
          </div>
        ))}
      </div>
      <div className="quiet-actions">
        <button type="button" onClick={() => navigate(`/edit/${receipt.id}`)}>
          Изменить
        </button>
        <button type="button" className="danger-text" onClick={() => setConfirm(true)}>
          Удалить чек
        </button>
      </div>
      {confirm && (
        <Sheet title="Удалить чек?" onClose={() => setConfirm(false)}>
          <p className="sheet-text">Покупка пропадёт из трат и категорий.</p>
          <button
            type="button"
            className="btn danger"
            onClick={() => {
              removeReceipt(receipt.id)
              navigate('/')
            }}
          >
            Удалить
          </button>
          <button type="button" className="btn ghost" onClick={() => setConfirm(false)}>
            Отмена
          </button>
        </Sheet>
      )}
    </div>
  )
}
