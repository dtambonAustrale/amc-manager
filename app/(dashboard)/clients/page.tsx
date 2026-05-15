import { Topbar } from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/server'
import { ClientsTable } from '@/components/tables/clients-table'
import type { Database } from '@/types/database'

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <Topbar title="Clients" />
      <div className="p-6">
        <ClientsTable clients={(clients ?? []) as Database['public']['Tables']['clients']['Row'][]} />
      </div>
    </div>
  )
}
