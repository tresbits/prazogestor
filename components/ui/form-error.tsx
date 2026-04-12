import { AlertCircle } from 'lucide-react'

export function FormError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-destructive/8 border border-destructive/15 px-3 py-2">
      <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
      <p className="text-xs text-destructive leading-snug">{message}</p>
    </div>
  )
}
