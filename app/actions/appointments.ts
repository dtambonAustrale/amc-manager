'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { appointmentSchema } from '@/lib/validations/appointment'
import type { AppointmentStatus } from '@/types/database'

function nullify<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v === undefined ? null : v])
  ) as T
}

export async function createAppointmentAction(formData: unknown) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single()
  if (!profile) throw new Error('Profil introuvable')

  const parsed = appointmentSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { send_confirmation, ...appointmentData } = parsed.data

  const insertData = nullify({ ...appointmentData, created_by: profile.id })

  const { error } = await supabase.from('appointments').insert(insertData as any)

  if (error) return { error: { _form: [error.message] } }

  revalidatePath('/appointments')
  redirect('/appointments')
}

export async function updateAppointmentStatusAction(id: string, status: AppointmentStatus) {
  const supabase = await createClient()
  await supabase.from('appointments').update({ status }).eq('id', id)
  revalidatePath('/appointments')
}
