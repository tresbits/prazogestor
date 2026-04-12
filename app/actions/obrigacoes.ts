'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function completeObligation(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const obligationId = formData.get('obligation_id') as string

  const { error } = await supabase
    .from('client_obligations')
    .update({
      status: 'completed',
      completed_by: user.email,
      completed_at: new Date().toISOString(),
    })
    .eq('id', obligationId)

  if (error) return { error: 'Não foi possível registrar a conclusão. Tente novamente.' }

  revalidatePath('/painel')
  revalidatePath('/calendario')
  return { success: true }
}
