'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import { toggleEmailAlerts } from '@/app/actions/configuracoes'

export function SecaoNotificacoes({ alertsEnabled }: { alertsEnabled: boolean }) {
  const [enabled, setEnabled] = useState(alertsEnabled)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleToggle() {
    const newValue = !enabled
    setEnabled(newValue)
    setError(null)
    setSaving(true)
    const result = await toggleEmailAlerts(newValue)
    setSaving(false)
    if (result?.error) {
      setEnabled(!newValue)
      setError('Não foi possível salvar a preferência. Tente novamente.')
    }
  }

  return (
    <div className="space-y-3">
      <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Notificações</h2>
        </div>

        <div className="flex items-center justify-between gap-4 bg-muted/40 rounded-xl px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">Alertas por e-mail</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Receba avisos 7, 3 e 1 dia antes do vencimento de cada obrigação.
            </p>
          </div>
          <button
            role="switch"
            aria-checked={enabled}
            onClick={handleToggle}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none disabled:opacity-50 ${
              enabled ? 'bg-foreground' : 'bg-muted-foreground/30'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-background shadow transition-transform ${
                enabled ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-destructive px-1">{error}</p>
      )}

      <p className="text-[11px] text-muted-foreground/70 px-1 leading-relaxed">
        Em conformidade com a LGPD, você pode desativar estes alertas a qualquer momento. Para
        controle total de descadastramento (opt-out), utilize o link presente no rodapé de qualquer
        comunicado enviado pelo PrazoGestor.
      </p>
    </div>
  )
}
