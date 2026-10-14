import type { CategoryId, Receipt } from './types'

export type PurchaseLine = {
  id: string
  name: string
  price: number
  category: CategoryId
  datetime: string
  store: string
  receiptId: string
}

export function receiptTotal(receipt: Receipt): number {
  return receipt.products.reduce((sum, product) => sum + product.price, 0)
}

export function linesInMonth(receipts: Receipt[], month: string, store?: string): PurchaseLine[] {
  const lines: PurchaseLine[] = []
  for (const receipt of receipts) {
    if (!receipt.datetime.startsWith(month)) continue
    if (store && receipt.store !== store) continue
    for (const product of receipt.products) {
      lines.push({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        datetime: receipt.datetime,
        store: receipt.store,
        receiptId: receipt.id,
      })
    }
  }
  return lines
}

export function monthTotal(receipts: Receipt[], month: string): number {
  return receipts
    .filter((receipt) => receipt.datetime.startsWith(month))
    .reduce((sum, receipt) => sum + receiptTotal(receipt), 0)
}

export function storesInMonth(receipts: Receipt[], month: string): { name: string; sum: number }[] {
  const totals = new Map<string, number>()
  for (const receipt of receipts) {
    if (!receipt.datetime.startsWith(month)) continue
    totals.set(receipt.store, (totals.get(receipt.store) ?? 0) + receiptTotal(receipt))
  }
  return [...totals.entries()]
    .map(([name, sum]) => ({ name, sum }))
    .sort((a, b) => b.sum - a.sum || a.name.localeCompare(b.name, 'ru'))
}

export function groupByDay<T>(items: T[], iso: (item: T) => string): { day: string; items: T[] }[] {
  const sorted = [...items].sort((a, b) => iso(b).localeCompare(iso(a)))
  const groups: { day: string; items: T[] }[] = []
  for (const item of sorted) {
    const day = iso(item).slice(0, 10)
    const last = groups[groups.length - 1]
    if (!last || last.day !== day) groups.push({ day, items: [item] })
    else last.items.push(item)
  }
  return groups
}
