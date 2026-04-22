/**
 * Deterministic color palette for obligation chips/pills.
 * Color is derived from the acronym string — same acronym always gets the same color.
 */

const CHIP_PALETTE = [
  'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
] as const

export function chipColor(acronym: string): string {
  if (!acronym) return 'bg-muted text-muted-foreground'
  let hash = 0
  for (const ch of acronym) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff
  return CHIP_PALETTE[hash % CHIP_PALETTE.length]
}
