const MONTHS_FULL = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const MONTHS_SHORT = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']

const DAYS_SHORT = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']

/** Returns the full Portuguese month name. Accepts a 1-based month number or a Date. */
export function monthName(monthOrDate: number | Date): string {
  const idx = monthOrDate instanceof Date ? monthOrDate.getMonth() : monthOrDate - 1
  return MONTHS_FULL[idx] ?? ''
}

/** Returns the 3-letter Portuguese month abbreviation. Accepts a 1-based month number or a Date. */
export function monthNameShort(monthOrDate: number | Date): string {
  const idx = monthOrDate instanceof Date ? monthOrDate.getMonth() : monthOrDate - 1
  return MONTHS_SHORT[idx] ?? ''
}

/** Returns the 3-letter Portuguese weekday abbreviation from a Date. */
export function weekdayShort(date: Date): string {
  return DAYS_SHORT[date.getDay()]
}

export function formatCNPJ(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14)
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}
