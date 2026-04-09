'use client'

import * as React from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export { Dialog }

export function Modal({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog.Root>
  )
}

export function ModalTrigger({ children }: { children: React.ReactNode }) {
  return <Dialog.Trigger render={children as React.ReactElement} />
}

export function ModalContent({
  children,
  className,
  title,
  description,
}: {
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
}) {
  return (
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
        className={cn(
          'fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
          'w-full max-w-md',
          'bg-background/85 backdrop-blur-3xl',
          'border-[0.5px] border-white/20 dark:border-white/10',
          'rounded-[20px]',
          'shadow-[0_32px_80px_rgba(0,0,0,0.18)]',
          'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
          'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
          'transition-all duration-200',
          className
        )}
      >
        {/* Close button */}
        <Dialog.Close
          className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors z-10"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </Dialog.Close>

        {/* Header */}
        {(title || description) && (
          <div className="px-6 pt-6 pb-0">
            {title && (
              <Dialog.Title className="font-heading text-[17px] font-semibold text-foreground leading-tight">
                {title}
              </Dialog.Title>
            )}
            {description && (
              <Dialog.Description className="text-sm text-muted-foreground mt-1">
                {description}
              </Dialog.Description>
            )}
          </div>
        )}

        {children}
      </Dialog.Popup>
    </Dialog.Portal>
  )
}

export function ModalFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/40">
      {children}
    </div>
  )
}
