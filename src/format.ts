const MONTHS_IN = [
  'январе',
  'феврале',
  'марте',
  'апреле',
  'мае',
  'июне',
  'июле',
  'августе',
  'сентябре',
  'октябре',
  'ноябре',
  'декабре',
]

const MONTHS_SHORT = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']

const moneyFormat = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export function toLocalIso(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
}

export function currentMonthKey(date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
}

export function shiftMonth(key: string, delta: number): string {
  const [year, month] = key.split('-').map(Number)
  return currentMonthKey(new Date(year, month - 1 + delta, 1))
}

export function monthNominative(key: string): string {
  const [year, month] = key.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('ru-RU', { month: 'long' })
}

export function monthPrepositional(key: string): string {
  const month = Number(key.slice(5, 7))
  return MONTHS_IN[month - 1] ?? ''
}

export function monthShort(index: number): string {
  return MONTHS_SHORT[index] ?? ''
}

export function money(value: number, withMinus = false): string {
  const formatted = moneyFormat.format(Math.abs(value))
  return withMinus ? `−${formatted}` : formatted
}

export function shareLabel(share: number): string {
  return `${new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(share)}%`
}

export function itemsLabel(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return `${count} товар`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} товара`
  return `${count} товаров`
}

export function dayLabel(day: string): string {
  const [year, month, date] = day.split('-').map(Number)
  const target = new Date(year, month - 1, date)
  const today = new Date()
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const diff = Math.round((startToday.getTime() - target.getTime()) / 86400000)
  if (diff === 0) return 'Сегодня'
  if (diff === 1) return 'Вчера'
  return target.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

export function dateTimeLabel(iso: string): string {
  const [year, month, date] = iso.slice(0, 10).split('-').map(Number)
  const target = new Date(year, month - 1, date)
  const text = target.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
  return `${text}, ${iso.slice(11, 16)}`
}

export function changeText(current: number, previous: number, previousMonth: string): { tone: 'less' | 'more' | 'same'; text: string } {
  const when = monthPrepositional(previousMonth)
  if (previous === 0 && current === 0) return { tone: 'same', text: 'пока нет трат' }
  if (previous === 0) return { tone: 'more', text: `в ${when} трат не было` }
  const percent = ((current - previous) / previous) * 100
  if (Math.abs(percent) < 0.05) return { tone: 'same', text: `столько же, сколько в ${when}` }
  const abs = Math.abs(percent)
  const rounded = abs >= 10 ? Math.round(abs) : Math.round(abs * 10) / 10
  const more = percent > 0
  return {
    tone: more ? 'more' : 'less',
    text: `на ${rounded.toLocaleString('ru-RU')}% ${more ? 'больше' : 'меньше'}, чем в ${when}`,
  }
}
