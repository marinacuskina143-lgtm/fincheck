import { toLocalIso } from './format'
import type { FiscalQr } from './types'

export function parseFiscalQr(raw: string): FiscalQr | null {
  const text = raw.trim()
  if (!text) return null
  const query = text.includes('?') ? text.slice(text.indexOf('?') + 1) : text
  const params = new URLSearchParams(query)
  const stamp = params.get('t') ?? params.get('T')
  const sumRaw = (params.get('s') ?? params.get('S') ?? '').replace(',', '.')
  if (!stamp || !sumRaw) return null

  const match = stamp.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?$/)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const hours = Number(match[4])
  const minutes = Number(match[5])
  const seconds = Number(match[6] ?? '0')
  const date = new Date(year, month - 1, day, hours, minutes, seconds)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null

  const sum = Math.round(Number(sumRaw) * 100) / 100
  if (!Number.isFinite(sum) || sum < 0) return null

  const fn = params.get('fn') ?? params.get('FN') ?? undefined
  const fd = params.get('i') ?? params.get('I') ?? undefined
  const fp = params.get('fp') ?? params.get('FP') ?? undefined

  return {
    sum,
    datetime: toLocalIso(date),
    fn,
    fd,
    fp,
    raw: text,
  }
}

export function sameFiscal(a: FiscalQr, b: FiscalQr): boolean {
  if (!a.fn || !a.fd || !a.fp) return false
  return a.fn === b.fn && a.fd === b.fd && a.fp === b.fp
}
