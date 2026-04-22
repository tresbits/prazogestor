export function toISO(d: Date) {
  return d.toISOString().split('T')[0]
}

export function getUpcomingRange(periodo: string): { start: string; end: string } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  switch (periodo) {
    case 'hoje': {
      const iso = toISO(today)
      return { start: iso, end: iso }
    }
    case 'semana': {
      const end = new Date(today)
      end.setDate(today.getDate() + 6)
      return { start: toISO(today), end: toISO(end) }
    }
    case '15dias': {
      const end = new Date(today)
      end.setDate(today.getDate() + 14)
      return { start: toISO(today), end: toISO(end) }
    }
    case 'trimestre': {
      const qi = Math.floor(today.getMonth() / 3)
      const end = new Date(today.getFullYear(), qi * 3 + 3, 0)
      return { start: toISO(today), end: toISO(end) }
    }
    case 'mes':
    default: {
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      return { start: toISO(today), end: toISO(end) }
    }
  }
}

export function getAtividadeRange(periodo: string): { start: string; end: string } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const year = today.getFullYear()
  const month = today.getMonth()

  switch (periodo) {
    case 'mes_passado': {
      const start = new Date(year, month - 1, 1)
      const end   = new Date(year, month, 0)
      return { start: toISO(start), end: toISO(end) }
    }
    case '3meses': {
      const start = new Date(year, month - 2, 1)
      return { start: toISO(start), end: toISO(today) }
    }
    case 'trimestre': {
      const qi    = Math.floor(month / 3)
      const start = new Date(year, qi * 3, 1)
      return { start: toISO(start), end: toISO(today) }
    }
    case 'ano': {
      return { start: `${year}-01-01`, end: toISO(today) }
    }
    case 'mes':
    default: {
      const start = new Date(year, month, 1)
      return { start: toISO(start), end: toISO(today) }
    }
  }
}
