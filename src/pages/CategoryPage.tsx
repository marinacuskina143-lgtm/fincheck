import { useNavigate, useParams } from 'react-router-dom'
import { categoryById } from '../categories'
import { SubHeader } from '../components/Chrome'
import { dayLabel, money, monthNominative } from '../format'
import { groupByDay, linesInMonth } from '../stats'
import { useFin } from '../store'

export function CategoryPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { receipts, month } = useFin()
  const category = categoryById(id)
  const lines = linesInMonth(receipts, month).filter((line) => line.category === id)
  const total = lines.reduce((sum, line) => sum + line.price, 0)
  const groups = groupByDay(lines, (line) => line.datetime)

  if (!category) {
    return (
      <div className="page">
        <SubHeader title="Категория" back="/categories" />
        <div className="empty">
          <p>Такой категории нет.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <SubHeader title={category.name} back="/categories" />
      <section className="hero compact">
        <p className="hero-kicker">{monthNominative(month)}</p>
        <p className="hero-sum">{money(total)}</p>
      </section>
      {groups.length === 0 ? (
        <div className="empty">
          <p>В этом месяце в категории пусто.</p>
        </div>
      ) : (
        <div className="list-card">
          {groups.map((group) => (
            <section key={group.day}>
              <h3 className="day-label">{dayLabel(group.day)}</h3>
              {group.items.map((line) => (
                <button key={line.id} type="button" className="item" onClick={() => navigate(`/receipt/${line.receiptId}`)}>
                  <span className="item-main">
                    <span className="item-title">{line.name}</span>
                    <span className="item-sub">{line.store}</span>
                  </span>
                  <span className="item-sum">{money(line.price)}</span>
                </button>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
