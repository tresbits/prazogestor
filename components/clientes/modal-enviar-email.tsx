'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { Mail, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sendClientEmail } from '@/app/actions/email-cliente'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormError } from '@/components/ui/form-error'

type ObligationItem = {
  id: string
  acronym: string
  name: string
  due_date: string
  status: string
}

function getDaysRemaining(dueDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate + 'T00:00:00')
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

function isUrgent(o: ObligationItem): boolean {
  if (o.status === 'overdue') return true
  return getDaysRemaining(o.due_date) <= 7
}

export function ModalEnviarEmail({
  clientId,
  clientName,
  clientEmail,
  officeTemplate,
  obligations,
  trigger,
}: {
  clientId: string
  clientName: string
  clientEmail?: string | null
  officeTemplate?: string | null
  obligations: ObligationItem[]
  trigger?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(sendClientEmail, null)
  const popupRef = useRef<HTMLDivElement>(null)

  const defaultMessage = officeTemplate ?? `Prezado(a) cliente,\n\nSegue a relação de obrigações fiscais pendentes para providências.\n\nQualquer dúvida, estamos à disposição.\n\nAtenciosamente,`

  const [recipientEmail, setRecipientEmail] = useState(clientEmail ?? '')
  const [saveEmail, setSaveEmail] = useState(false)
  const [message, setMessage] = useState(defaultMessage)
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(obligations.filter(isUrgent).map(o => o.id))
  )

  // Fecha ao enviar com sucesso
  useEffect(() => {
    if (state?.success) setOpen(false)
  }, [state])

  // Reseta ao abrir
  useEffect(() => {
    if (open) {
      setRecipientEmail(clientEmail ?? '')
      setMessage(defaultMessage)
      setSelected(new Set(obligations.filter(isUrgent).map(o => o.id)))
      setSaveEmail(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function toggleObligation(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const sortedObligations = [...obligations].sort((a, b) => {
    if (a.status === 'overdue' && b.status !== 'overdue') return -1
    if (a.status !== 'overdue' && b.status === 'overdue') return 1
    return a.due_date.localeCompare(b.due_date)
  })

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {trigger ? (
        <div onClick={() => setOpen(true)} className="contents cursor-pointer">{trigger}</div>
      ) : (
        <Dialog.Trigger
          className="p-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="Enviar e-mail ao cliente"
        >
          <Mail className="h-3.5 w-3.5" />
        </Dialog.Trigger>
      )}

      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            'fixed inset-0 z-40 bg-black/40 backdrop-blur-[12px]',
            'data-open:animate-in data-open:fade-in-0',
            'data-closed:animate-out data-closed:fade-out-0',
            'transition-all duration-200'
          )}
        />
        <Dialog.Popup
          ref={popupRef}
          initialFocus={popupRef}
          className={cn(
            'fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
            'w-[calc(100%-2rem)] max-w-4xl max-h-[90vh] flex flex-col',
            'bg-background/90 backdrop-blur-3xl',
            'border-[0.5px] border-white/20 dark:border-white/10',
            'rounded-[20px]',
            'shadow-[0_32px_80px_rgba(0,0,0,0.18)]',
            'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-[0.97]',
            'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-[0.97]',
            'transition-all duration-200'
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-6 pb-4 shrink-0 border-b border-border/60">
            <div>
              <Dialog.Title className="font-heading text-[17px] font-semibold text-foreground leading-tight">
                Enviar E-mail ao Cliente
              </Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground mt-0.5">
                {clientName}
              </Dialog.Description>
            </div>
            <Dialog.Close className="p-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors mt-0.5">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {/* Body — scrollable */}
          <form
            action={action}
            className="flex-1 overflow-y-auto min-h-0 no-scrollbar"
          >
            <input type="hidden" name="client_id" value={clientId} />
            <input type="hidden" name="save_email" value={saveEmail ? 'true' : 'false'} />
            {Array.from(selected).map(id => (
              <input key={id} type="hidden" name="obligation_ids" value={id} />
            ))}

            <div className="px-6 py-5 space-y-5">
              {/* Seção 1: Destinatário */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Destinatário
                </p>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    E-mail
                  </Label>
                  <Input
                    name="recipient_email"
                    type="email"
                    value={recipientEmail}
                    onChange={e => setRecipientEmail(e.target.value)}
                    placeholder="email@cliente.com.br"
                    required
                    className="bg-muted/60"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={saveEmail}
                    onChange={e => setSaveEmail(e.target.checked)}
                    className="rounded border-border w-3.5 h-3.5 accent-foreground"
                  />
                  <span className="text-xs text-muted-foreground">
                    Salvar este e-mail no cadastro do cliente
                  </span>
                </label>
              </div>

              {/* Seção 2: Obrigações */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Obrigações
                  </p>
                  <span className="text-[10px] text-muted-foreground/70">
                    {selected.size} selecionada{selected.size !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="rounded-xl overflow-hidden border border-border bg-muted/40">
                  {sortedObligations.map((o, i) => {
                    const days  = getDaysRemaining(o.due_date)
                    const isOv  = o.status === 'overdue' || days < 0
                    const isUg  = !isOv && days <= 3
                    const isCl  = !isOv && !isUg && days <= 7
                    const checked = selected.has(o.id)

                    return (
                      <label
                        key={o.id}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/60 transition-colors',
                          i > 0 && 'border-t border-border/60',
                          checked && 'bg-muted/40'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleObligation(o.id)}
                          className="rounded border-border w-3.5 h-3.5 accent-foreground shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0',
                              isOv ? 'bg-destructive/10 text-destructive'
                                : isUg ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : isCl ? 'bg-yellow-400/10 text-yellow-600 dark:text-yellow-400'
                                :        'bg-muted-foreground/15 text-muted-foreground'
                            )}>
                              {o.acronym}
                            </span>
                            <span className="text-sm text-foreground truncate">{o.name}</span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className={cn(
                            'text-[10px] font-bold',
                            isOv ? 'text-destructive' : isUg ? 'text-amber-500' : isCl ? 'text-yellow-500' : 'text-muted-foreground'
                          )}>
                            {isOv ? 'VENCIDO' : days === 0 ? 'HOJE' : `${days}d`}
                          </p>
                          <p className="text-[10px] font-mono text-muted-foreground/70">{formatDate(o.due_date)}</p>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Seção 3: Mensagem */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Mensagem
                </Label>
                <textarea
                  name="message"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={5}
                  required
                  className={cn(
                    'w-full rounded-xl bg-muted/60 border border-input px-3 py-2.5',
                    'text-sm text-foreground placeholder:text-muted-foreground',
                    'resize-none focus:outline-none focus:ring-1 focus:ring-ring',
                    'transition-colors'
                  )}
                />
              </div>

              {state?.error && <FormError message={state.error} />}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/40 shrink-0">
              <Dialog.Close
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium',
                  'text-muted-foreground hover:text-foreground hover:bg-muted',
                  'transition-colors'
                )}
              >
                Cancelar
              </Dialog.Close>
              <button
                type="submit"
                disabled={pending || selected.size === 0}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium',
                  'bg-foreground text-background',
                  'hover:opacity-90 active:scale-95',
                  'transition-all disabled:opacity-40',
                  'flex items-center gap-2'
                )}
              >
                <Mail className="h-3.5 w-3.5" />
                {pending ? 'Enviando…' : 'Enviar'}
              </button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
