'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { paymentSchema } from '@/lib/validations/payment'
import type { PaymentStatus } from '@/types/database'

function nullify<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v === undefined ? null : v])
  ) as T
}

export async function createPaymentAction(formData: unknown) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single()
  if (!profile) throw new Error('Profil introuvable')

  const parsed = paymentSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const insertData = nullify({ ...parsed.data, created_by: profile.id })

  const { error } = await supabase.from('payments').insert(insertData as any)

  if (error) return { error: { _form: [error.message] } }

  revalidatePath('/payments')
  revalidatePath(`/cases/${parsed.data.case_id}`)
  redirect('/payments')
}

export async function updatePaymentStatusAction(id: string, status: PaymentStatus) {
  const supabase = await createClient()
  await supabase.from('payments').update({ status }).eq('id', id)
  revalidatePath('/payments')
}
