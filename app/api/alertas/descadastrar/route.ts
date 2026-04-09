import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const escritorioId = searchParams.get('id')

  if (!escritorioId) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { error } = await supabase
    .from('escritorios')
    .update({ alertas_email_ativo: false })
    .eq('id', escritorioId)

  if (error) {
    return NextResponse.json({ error: 'Erro ao processar' }, { status: 500 })
  }

  // Redireciona para página de confirmação
  return NextResponse.redirect(
    new URL('/alertas/descadastrado', request.url)
  )
}
