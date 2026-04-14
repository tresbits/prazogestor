'use client'

import { useActionState } from 'react'
import { Mail } from 'lucide-react'
import { saveClientEmailTemplate } from '@/app/actions/email-cliente'
import { FormError } from '@/components/ui/form-error'

const DEFAULT_TEMPLATE = `Prezado(a) cliente,

Segue a relação de obrigações fiscais pendentes para providências.

Qualquer dúvida, estamos à disposição.

Atenciosamente,`

export function SecaoTemplateEmail({ template }: { template: string | null }) {
  const [state, action, pending] = useActionState(saveClientEmailTemplate, null)

  return (
    <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">Template de E-mail ao Cliente</h2>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Mensagem padrão pré-preenchida ao enviar obrigações por e-mail para um cliente. Editável a cada envio.
      </p>

      <form action={action} className="space-y-4">
        <textarea
          name="client_email_template"
          defaultValue={template ?? DEFAULT_TEMPLATE}
          rows={6}
          className="w-full rounded-xl bg-muted/60 border border-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
        />

        {state?.error && <FormError message={state.error} />}
        {state?.success && (
          <p className="text-xs text-green-600 dark:text-green-400">Template salvo.</p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="px-5 py-2 rounded-full text-sm font-medium bg-foreground text-background hover:opacity-80 transition-opacity disabled:opacity-40"
          >
            {pending ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}
