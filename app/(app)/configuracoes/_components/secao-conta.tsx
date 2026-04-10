'use client'

import { useState } from 'react'
import { UserCircle } from 'lucide-react'
import { enviarResetSenha } from '@/app/actions/configuracoes'
import { Input } from '@/components/ui/input'

export function SecaoConta({ email }: { email: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')

  async function handleReset() {
    setStatus('loading')
    const result = await enviarResetSenha()
    setStatus(result?.error ? 'error' : 'sent')
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-5">
      <div className="flex items-center gap-2">
        <UserCircle className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">Conta</h2>
      </div>

      <div className="space-y-1.5">
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          E-mail de acesso
        </p>
        <div className="flex items-center gap-3">
          <Input value={email} readOnly className="opacity-60 cursor-default" />
          <button
            type="button"
            onClick={handleReset}
            disabled={status === 'loading' || status === 'sent'}
            className="shrink-0 px-4 py-2 rounded-full text-sm font-medium border border-border bg-background hover:bg-muted transition-colors disabled:opacity-40"
          >
            {status === 'loading' ? 'Enviando…' : status === 'sent' ? 'Enviado!' : 'Alterar senha'}
          </button>
        </div>
        {status === 'sent' && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            E-mail de redefinição enviado.
          </p>
        )}
        {status === 'error' && (
          <p className="text-xs text-destructive mt-1">Erro ao enviar. Tente novamente.</p>
        )}
      </div>
    </div>
  )
}
