import { Topbar } from '@/components/layout/topbar'
import { ReportForm } from '@/components/forms/report-form'
import { PageHeader } from '@/components/ui/page-header'
import { createClient } from '@/lib/supabase/server'

export default async function NewReportPage() {
  const supabase = await createClient()

  const [{ data: cases }, { data: appointments }] = await Promise.all([
    supabase.from('cases').select('id, reference').not('status', 'in', '("archive")').order('created_at', { ascending: false }),
    supabase.from('appointments').select('id, type, scheduled_at').order('scheduled_at', { ascending: false }).limit(50),
  ])

  return (
    <div>
      <Topbar title="Nouveau compte rendu" />
      <div className="p-6 max-w-3xl">
        <PageHeader
          title="Nouveau compte rendu"
          description="Rédiger un compte rendu"
          backHref="/reports"
          backLabel="Comptes rendus"
        />
        <div className="mt-6">
          <ReportForm cases={cases ?? []} appointments={appointments ?? []} />
        </div>
      </div>
    </div>
  )
}
