'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { clientSchema } from '@/lib/validations/client'

function nullify<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v === undefined ? null : v])
  ) as T
}

export async function createClientAction(formData: unknown) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single()
  if (!profile) throw new Error('Profil introuvable')

  const parsed = clientSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const insertData = nullify({
    ...parsed.data,
    email: parsed.data.email || null,
    created_by: profile.id,
  })

  const { error } = await supabase.from('clients').insert(insertData as any)

  if (error) return { error: { _form: [error.message] } }

  revalidatePath('/clients')
  redirect('/clients')
}

export async function updateClientAction(id: string, formData: unknown) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  const parsed = clientSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const updateData = nullify({ ...parsed.data, email: parsed.data.email || null })

  const { error } = await supabase
    .from('clients')
    .update(updateData as any)
    .eq('id', id)

  if (error) return { error: { _form: [error.message] } }

  revalidatePath(`/clients/${id}`)
  revalidatePath('/clients')
  redirect(`/clients/${id}`)
}

export async function archiveClientAction(id: string) {
  const supabase = await createClient()
  await supabase.from('clients').update({ status: 'archivé' as const }).eq('id', id)
  revalidatePath('/clients')
  redirect('/clients')
}
