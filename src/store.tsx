import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { currentMonthKey } from './format'
import { seedReceipts } from './seed'
import type { Receipt } from './types'

const STORAGE_KEY = 'fincheck.receipts.v1'

type FinContextValue = {
  receipts: Receipt[]
  month: string
  setMonth: (month: string) => void
  addReceipt: (receipt: Receipt) => void
  updateReceipt: (receipt: Receipt) => void
  removeReceipt: (id: string) => void
  resetDemo: () => void
}

const FinContext = createContext<FinContextValue | null>(null)

function loadReceipts(): Receipt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return seedReceipts()
    const parsed = JSON.parse(raw) as Receipt[]
    if (!Array.isArray(parsed)) return seedReceipts()
    return parsed
  } catch {
    return seedReceipts()
  }
}

export function FinProvider({ children }: { children: ReactNode }) {
  const [receipts, setReceipts] = useState<Receipt[]>(loadReceipts)
  const [month, setMonth] = useState(currentMonthKey)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts))
  }, [receipts])

  const addReceipt = useCallback((receipt: Receipt) => {
    setReceipts((current) => [receipt, ...current])
  }, [])

  const updateReceipt = useCallback((receipt: Receipt) => {
    setReceipts((current) => current.map((item) => (item.id === receipt.id ? receipt : item)))
  }, [])

  const removeReceipt = useCallback((id: string) => {
    setReceipts((current) => current.filter((item) => item.id !== id))
  }, [])

  const resetDemo = useCallback(() => {
    setReceipts(seedReceipts())
    setMonth(currentMonthKey())
  }, [])

  const value = useMemo(
    () => ({ receipts, month, setMonth, addReceipt, updateReceipt, removeReceipt, resetDemo }),
    [receipts, month, addReceipt, updateReceipt, removeReceipt, resetDemo],
  )

  return <FinContext.Provider value={value}>{children}</FinContext.Provider>
}

export function useFin(): FinContextValue {
  const value = useContext(FinContext)
  if (!value) throw new Error('useFin должен быть внутри FinProvider')
  return value
}
