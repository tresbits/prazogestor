export type Celula = { date: string; dia: number; currentMonth: boolean }

export const DIAS_SEMANA     = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
export const DIAS_SEMANA_MOB = ['D',   'S',   'T',   'Q',   'Q',   'S',   'S'  ]
export const MESES_CURTOS    = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
export const MESES_PT        = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

export function getDias(dueDate: string): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  return Math.round((new Date(dueDate + 'T00:00:00').getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
}

export function buildCells(ano: number, mes: number): Celula[] {
  const cells: Celula[] = []
  const startDow = new Date(ano, mes - 1, 1).getDay()
  const diasNoMes = new Date(ano, mes, 0).getDate()

  const prevMes = mes === 1 ? 12 : mes - 1
  const prevAno = mes === 1 ? ano - 1 : ano
  const diasPrevMes = new Date(prevAno, prevMes, 0).getDate()
  for (let i = startDow - 1; i >= 0; i--) {
    const dia = diasPrevMes - i
    cells.push({ date: `${prevAno}-${String(prevMes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`, dia, currentMonth: false })
  }

  for (let dia = 1; dia <= diasNoMes; dia++) {
    cells.push({ date: `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`, dia, currentMonth: true })
  }

  const nextMes = mes === 12 ? 1 : mes + 1
  const nextAno = mes === 12 ? ano + 1 : ano
  const total = Math.ceil(cells.length / 7) * 7
  let nextDia = 1
  while (cells.length < total) {
    cells.push({ date: `${nextAno}-${String(nextMes).padStart(2, '0')}-${String(nextDia).padStart(2, '0')}`, dia: nextDia, currentMonth: false })
    nextDia++
  }
  return cells
}

export function cellUrgency(
  items: { due_date: string; status: string }[]
): 'critical' | 'urgent' | 'close' | 'normal' {
  for (const item of items) {
    const d = getDias(item.due_date)
    if (item.status === 'overdue' || d <= 0) return 'critical'
  }
  for (const item of items) {
    if (getDias(item.due_date) <= 3) return 'urgent'
  }
  for (const item of items) {
    if (getDias(item.due_date) <= 7) return 'close'
  }
  return 'normal'
}

export function badgeClass(urgency: ReturnType<typeof cellUrgency>): string {
  if (urgency === 'critical') return 'bg-destructive text-white'
  if (urgency === 'urgent')   return 'bg-amber-500 text-white'
  if (urgency === 'close')    return 'bg-yellow-400 text-foreground'
  return 'bg-foreground/80 text-background'
}
