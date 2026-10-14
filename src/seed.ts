import type { CategoryId, Product, Receipt } from './types'

function daysAgo(days: number, hours: number, minutes: number): string {
  const now = new Date()
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days, hours, minutes, 0, 0)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(hours)}:${pad(minutes)}:00`
}

function prevMonth(day: number, hours: number, minutes: number): string {
  const now = new Date()
  const date = new Date(now.getFullYear(), now.getMonth() - 1, day, hours, minutes, 0, 0)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
}

export function seedReceipts(): Receipt[] {
  let productNo = 0
  let receiptNo = 0
  const item = (name: string, price: number, category: CategoryId): Product => ({
    id: `p${++productNo}`,
    name,
    price,
    category,
  })
  const receipt = (store: string, datetime: string, products: Product[]): Receipt => ({
    id: `r${++receiptNo}`,
    store,
    datetime,
    products,
  })

  return [
    receipt('Чижик', daysAgo(1, 18, 20), [
      item('Молоко 2,5%', 89.9, 'products'),
      item('Хлеб бородинский', 54, 'products'),
      item('Яйца С1, 10 шт', 119, 'products'),
    ]),
    receipt('Пятёрочка', daysAgo(2, 13, 5), [
      item('Куриное филе', 349, 'products'),
      item('Рис', 89.9, 'products'),
      item('Масло сливочное', 159, 'products'),
      item('Сок яблочный', 99.9, 'drinks'),
      item('Вода питьевая', 45, 'drinks'),
    ]),
    receipt('Магнит', daysAgo(3, 19, 40), [
      item('Стиральный порошок', 429, 'home'),
      item('Губки для посуды', 79, 'home'),
      item('Мыло', 65, 'home'),
    ]),
    receipt('Чижик', daysAgo(5, 12, 40), [
      item('Батон нарезной', 32.9, 'products'),
      item('Кефир 1%', 27.74, 'products'),
    ]),
    receipt('Пятёрочка', daysAgo(6, 17, 15), [
      item('Кофе в зёрнах', 540, 'drinks'),
      item('Сахар', 79.9, 'products'),
      item('Печенье', 115, 'products'),
    ]),
    receipt('Магнит', daysAgo(6, 11, 2), [
      item('Бананы', 126.4, 'products'),
      item('Йогурт', 64.9, 'products'),
      item('Шампунь', 289, 'health'),
    ]),
    receipt('ВкусВилл', daysAgo(8, 20, 10), [
      item('Творог 5%', 149, 'products'),
      item('Огурцы', 98, 'products'),
      item('Зелень', 79, 'products'),
      item('Смузи', 189, 'drinks'),
    ]),
    receipt('Лента', daysAgo(10, 14, 30), [
      item('Макароны', 72, 'products'),
      item('Фарш говяжий', 420, 'products'),
      item('Томаты', 156, 'products'),
      item('Сыр', 310, 'products'),
      item('Молоко 3,2%', 86.5, 'products'),
      item('Пакеты для мусора', 89, 'home'),
    ]),
    receipt('Кофемания', daysAgo(11, 9, 15), [
      item('Капучино', 290, 'cafe'),
      item('Круассан', 220, 'cafe'),
    ]),
    receipt('Перекрёсток', daysAgo(12, 16, 45), [
      item('Апельсины', 210, 'products'),
      item('Минеральная вода', 85, 'drinks'),
      item('Шоколад', 129, 'products'),
    ]),
    receipt('Пятёрочка', prevMonth(28, 19, 10), [
      item('Молоко 2,5%', 89.9, 'products'),
      item('Сметана', 79, 'products'),
      item('Картофель', 120, 'products'),
      item('Курица', 410, 'products'),
      item('Хлеб', 49, 'products'),
      item('Чай чёрный', 189, 'drinks'),
    ]),
    receipt('Магнит', prevMonth(24, 18, 0), [
      item('Средство для посуды', 149, 'home'),
      item('Туалетная бумага', 219, 'home'),
      item('Бананы', 98, 'products'),
      item('Яблоки', 145, 'products'),
    ]),
    receipt('Чижик', prevMonth(20, 12, 15), [
      item('Молоко 2,5%', 79.9, 'products'),
      item('Яйца С1, 10 шт', 109, 'products'),
      item('Сахар', 69.9, 'products'),
    ]),
    receipt('ВкусВилл', prevMonth(18, 16, 40), [
      item('Творог 5%', 159, 'products'),
      item('Кефир 1%', 89, 'products'),
      item('Овощной набор', 240, 'products'),
    ]),
    receipt('Лента', prevMonth(14, 13, 20), [
      item('Фарш говяжий', 380, 'products'),
      item('Макароны', 68, 'products'),
      item('Сыр', 290, 'products'),
      item('Сок яблочный', 119, 'drinks'),
      item('Вода питьевая', 55, 'drinks'),
    ]),
    receipt('Кофемания', prevMonth(11, 10, 5), [
      item('Латте', 320, 'cafe'),
      item('Чизкейк', 390, 'cafe'),
    ]),
    receipt('Перекрёсток', prevMonth(8, 17, 50), [
      item('Рыба', 540, 'products'),
      item('Лимоны', 89, 'products'),
      item('Рис', 99, 'products'),
    ]),
    receipt('Аптека 36,6', prevMonth(4, 15, 30), [
      item('Витамин C', 349, 'health'),
      item('Пластыри', 89, 'health'),
    ]),
    receipt('Gloria Jeans', prevMonth(2, 19, 0), [
      item('Футболка', 1290, 'clothes'),
      item('Носки', 390, 'clothes'),
    ]),
    receipt('Магнит', prevMonth(1, 11, 25), [
      item('Молоко 2,5%', 89.9, 'products'),
      item('Хлеб', 46, 'products'),
      item('Печенье', 95, 'products'),
      item('Шоколад', 119, 'products'),
    ]),
  ]
}
