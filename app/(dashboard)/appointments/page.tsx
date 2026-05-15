import { Topbar } from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/server'
import { AppointmentsTable } from '@/components/tables/appointments-table'

export default async function AppointmentsPage() {
  const supabase = await createClient()
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, clients(first_name, last_name, company_name), cases(reference)')
    .order('scheduled_at', { ascending: false })

  return (
    <div>
      <Topbar title="Rendez-vous" />
      <div className="p-6">
        <AppointmentsTable appointments={(appointments ?? []) as any} />
      </div>
    </div>
  )
}
