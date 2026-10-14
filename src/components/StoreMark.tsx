const KNOWN: Record<string, { bg: string; fg: string; label: string }> = {
  чижик: { bg: '#F5C400', fg: '#1A1A1A', label: 'Ч' },
  пятёрочка: { bg: '#E10600', fg: '#FFFFFF', label: 'П' },
  пятерочка: { bg: '#E10600', fg: '#FFFFFF', label: 'П' },
  магнит: { bg: '#D0121A', fg: '#FFFFFF', label: 'М' },
  вкусвилл: { bg: '#6FBE44', fg: '#FFFFFF', label: 'В' },
  лента: { bg: '#0057A8', fg: '#FFFFFF', label: 'Л' },
  перекрёсток: { bg: '#F5A000', fg: '#1A1A1A', label: 'Пк' },
  перекресток: { bg: '#F5A000', fg: '#1A1A1A', label: 'Пк' },
  кофемания: { bg: '#3B2A1A', fg: '#FFFFFF', label: 'К' },
  'аптека 36,6': { bg: '#00A651', fg: '#FFFFFF', label: '36' },
  'gloria jeans': { bg: '#111827', fg: '#FFFFFF', label: 'GJ' },
}

export function StoreMark({ name, size = 44 }: { name: string; size?: number }) {
  const known = KNOWN[name.trim().toLocaleLowerCase('ru-RU')]
  const style = known ?? {
    bg: '#1A4DFF',
    fg: '#FFFFFF',
    label: (name.trim().slice(0, 1) || '?').toUpperCase(),
  }
  return (
    <span
      className="mark"
      style={{ background: style.bg, color: style.fg, width: size, height: size, fontSize: size < 40 ? 13 : 16 }}
      aria-hidden
    >
      {style.label}
    </span>
  )
}
