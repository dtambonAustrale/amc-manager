'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { caseSchema } from '@/lib/validations/case'

function nullify<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v === undefined ? null : v])
  ) as T
}

export async function createCaseAction(formData: unknown) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single()
  if (!profile) throw new Error('Profil introuvable')

  const parsed = caseSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const insertData = nullify({ ...parsed.data, created_by: profile.id })

  const { data: newCase, error } = await supabase.from('cases').insert(insertData as any).select('id').single()

  if (error) return { error: { _form: [error.message] } }

  revalidatePath('/cases')
  redirect(`/cases/${(newCase as { id: string }).id}`)
}

export async function updateCaseAction(id: string, formData: unknown) {
  const supabase = await createClient()
  const parsed = caseSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const updateData = nullify({ ...parsed.data })

  const { error } = await supabase.from('cases').update(updateData as any).eq('id', id)
  if (error) return { error: { _form: [error.message] } }

  revalidatePath(`/cases/${id}`)
  revalidatePath('/cases')
  redirect(`/cases/${id}`)
}
