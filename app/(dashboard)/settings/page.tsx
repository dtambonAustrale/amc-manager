import { Topbar } from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/server'
import { SettingsContent } from '@/components/dashboard/settings-content'
import type { Database } from '@/types/database'
import type { UserRole } from '@/types/database'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profileRaw } = await supabase.from('profiles').select('*').eq('user_id', user!.id).single()
  const profile = profileRaw as Database['public']['Tables']['profiles']['Row']
  const role = profile?.role as UserRole

  let allProfiles: Database['public']['Tables']['profiles']['Row'][] = []
  if (role === 'admin') {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: true })
    allProfiles = (data ?? []) as Database['public']['Tables']['profiles']['Row'][]
  }

  return (
    <div>
      <Topbar title="Paramètres" />
      <div className="p-6">
        <SettingsContent profile={profile} allProfiles={allProfiles} isAdmin={role === 'admin'} />
      </div>
    </div>
  )
}
