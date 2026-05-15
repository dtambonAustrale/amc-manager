import { Topbar } from '@/components/layout/topbar'
import { AppointmentForm } from '@/components/forms/appointment-form'
import { PageHeader } from '@/components/ui/page-header'
import { createClient } from '@/lib/supabase/server'

export default async function NewAppointmentPage() {
  const supabase = await createClient()

  const [{ data: clients }, { data: cases }] = await Promise.all([
    supabase.from('clients').select('id, first_name, last_name, company_name').eq('status', 'actif').order('created_at', { ascending: false }),
    supabase.from('cases').select('id, reference, client_id').not('status', 'in', '("cloture","archive")').order('created_at', { ascending: false }),
  ])

  return (
    <div>
      <Topbar title="Nouveau rendez-vous" />
      <div className="p-6 max-w-3xl">
        <PageHeader
          title="Nouveau rendez-vous"
          description="Planifier un rendez-vous client"
          backHref="/appointments"
          backLabel="Rendez-vous"
        />
        <div className="mt-6">
          <AppointmentForm clients={clients ?? []} cases={cases ?? []} />
        </div>
      </div>
    </div>
  )
}
