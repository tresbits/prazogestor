import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const officeId = searchParams.get('id')

  if (!officeId) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { error } = await supabase
    .from('offices')
    .update({ email_alerts_enabled: false })
    .eq('id', officeId)

  if (error) {
    return NextResponse.json({ error: 'Erro ao processar' }, { status: 500 })
  }

  // Redireciona para página de confirmação
  return NextResponse.redirect(
    new URL('/alertas/descadastrado', request.url)
  )
}
