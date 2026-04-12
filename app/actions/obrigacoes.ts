'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function completeObligation(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const obligationId = formData.get('obligation_id') as string

  await supabase
    .from('client_obligations')
    .update({
      status: 'completed',
      completed_by: user.email,
      completed_at: new Date().toISOString(),
    })
    .eq('id', obligationId)

  revalidatePath('/painel')
  revalidatePath('/calendario')
}
