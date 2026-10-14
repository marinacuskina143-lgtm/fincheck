import type { CategoryId } from './types'

export type Category = {
  id: CategoryId
  name: string
  color: string
}

export const CATEGORIES: Category[] = [
  { id: 'products', name: 'Продукты', color: '#1D4ED8' },
  { id: 'drinks', name: 'Напитки', color: '#7C3AED' },
  { id: 'cafe', name: 'Кафе', color: '#EA580C' },
  { id: 'health', name: 'Здоровье', color: '#059669' },
  { id: 'home', name: 'Для дома', color: '#0284C7' },
  { id: 'clothes', name: 'Одежда', color: '#DB2777' },
  { id: 'transport', name: 'Транспорт', color: '#D97706' },
  { id: 'other', name: 'Прочее', color: '#475569' },
]

const RULES: { test: RegExp; category: CategoryId }[] = [
  { test: /метро|такси|бензин|проезд|автобус|каршеринг/i, category: 'transport' },
  { test: /футболк|носк|джинс|куртк|плать|одежд|кроссов/i, category: 'clothes' },
  { test: /порошок|губк|пакет|посуд|туалет|бумаг|мыло|фольг|плёнк|пленк|перчат/i, category: 'home' },
  { test: /витамин|пластыр|лекар|шампунь|зубн|паста|аптек|бинт/i, category: 'health' },
  { test: /капучино|латте|круассан|чизкейк|ресторан|бургер|пицц|десерт/i, category: 'cafe' },
  { test: /кофе|чай|сок|вода|смузи|лимонад|пиво|вино|кола|морс|какао/i, category: 'drinks' },
]

export function guessCategory(name: string): CategoryId {
  const text = name.trim()
  if (!text) return 'products'
  for (const rule of RULES) {
    if (rule.test.test(text)) return rule.category
  }
  return 'products'
}

export function categoryById(id: string): Category | undefined {
  return CATEGORIES.find((category) => category.id === id)
}
