import { cn } from '@/lib/utils'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export type ActivityItem = {
  id: string
  acronym: string
  name: string
  clientId: string
  clientName: string
  value: number | null
  completedAt: string
  completedBy: string | null
}

function relativeTime(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMs / 3600000)
  const diffD = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'agora'
  if (diffMin < 60) return `há ${diffMin} min`
  if (diffH < 24) return `há ${diffH}h`
  if (diffD === 1) return 'ontem'
  if (diffD < 7) return `há ${diffD} dias`

  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

interface ActivityFeedProps {
  items: ActivityItem[]
  className?: string
}

export function ActivityFeed({ items, className }: ActivityFeedProps) {
  const total   = items.length
  const visible = items.slice(0, 10)

  return (
    <div className={cn('bg-card rounded-2xl shadow-card overflow-hidden', className)}>
      <div className="px-4 pt-4 pb-0">
        <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
          Atividade Recente
        </p>

        {items.length === 0 ? (
          <p className="py-6 text-sm text-center text-muted-foreground">
            Nenhuma obrigação concluída ainda.
          </p>
        ) : (
          <div>
            {visible.map((item, i) => (
              <Link
                key={item.id}
                href={`/clientes/${item.clientId}/detalhes`}
                className={cn(
                  'flex items-start gap-3 py-2.5 group',
                  i > 0 && 'border-t border-border/40'
                )}
              >
                <CheckCircle2 className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-0.5" strokeWidth={1.5} />

                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground truncate leading-tight group-hover:underline">
                    {item.clientName}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {item.acronym ? `${item.acronym} · ` : ''}{item.name}
                  </p>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-0.5">
                  {item.value != null && (
                    <span className="text-[11px] font-mono font-semibold text-foreground">
                      {item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground/70 whitespace-nowrap">
                    {relativeTime(item.completedAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border/40">
        <Link
          href="/overview/atividade"
          className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Ver todos · {total} concluída{total !== 1 ? 's' : ''} →
        </Link>
      </div>
    </div>
  )
}
