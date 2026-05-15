'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { UserRole } from '@/types/database'

const createUserSchema = z.object({
  full_name: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Mot de passe : 8 caractères minimum'),
  role: z.enum(['admin', 'collaborator', 'lawyer']),
})

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')
  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Accès refusé — rôle admin requis')
  return { supabase, user }
}

export async function createUserAction(formData: unknown) {
  await requireAdmin()
  const parsed = createUserSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const adminClient = createAdminClient()
  const { data, error } = await adminClient.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      full_name: parsed.data.full_name,
      role: parsed.data.role,
    },
  })

  if (error) return { error: { _form: [error.message] } }

  revalidatePath('/settings')
  return { success: true, userId: data.user.id }
}

export async function updateUserRoleAction(profileId: string, role: UserRole) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update({ role }).eq('id', profileId)
  if (error) return { error: error.message }
  revalidatePath('/settings')
  return { success: true }
}

export async function toggleUserActiveAction(profileId: string, isActive: boolean) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update({ is_active: isActive }).eq('id', profileId)
  if (error) return { error: error.message }
  revalidatePath('/settings')
  return { success: true }
}

const updateProfileSchema = z.object({
  full_name: z.string().min(2, 'Nom requis'),
})

export async function updateOwnProfileAction(formData: unknown) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  const parsed = updateProfileSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: parsed.data.full_name })
    .eq('user_id', user.id)

  if (error) return { error: { _form: [error.message] } }

  revalidatePath('/settings')
  return { success: true }
}

export async function updatePasswordAction(formData: unknown) {
  const schema = z.object({
    password: z.string().min(8, '8 caractères minimum'),
    confirm: z.string(),
  }).refine(d => d.password === d.confirm, { message: 'Les mots de passe ne correspondent pas', path: ['confirm'] })

  const parsed = schema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (error) return { error: { _form: [error.message] } }

  return { success: true }
}
