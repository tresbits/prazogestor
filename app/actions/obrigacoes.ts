'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function concluirObrigacao(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const obrigacaoId = formData.get('obrigacao_id') as string

  await supabase
    .from('obrigacoes_cliente')
    .update({
      status: 'concluido',
      concluido_por: user.email,
      concluido_em: new Date().toISOString(),
    })
    .eq('id', obrigacaoId)

  revalidatePath('/painel')
  revalidatePath('/calendario')
}
