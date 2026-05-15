import { Topbar } from '@/components/layout/topbar'
import { ReportForm } from '@/components/forms/report-form'
import { PageHeader } from '@/components/ui/page-header'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Database } from '@/types/database'

type Report = Database['public']['Tables']['reports']['Row']
type CaseRow = Database['public']['Tables']['cases']['Row']
type Appointment = Database['public']['Tables']['appointments']['Row']

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditReportPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: reportRaw }, { data: casesRaw }, { data: appointmentsRaw }] = await Promise.all([
    supabase.from('reports').select('*').eq('id', id).single(),
    supabase.from('cases').select('id, reference').not('status', 'in', '("archive")').order('created_at', { ascending: false }),
    supabase.from('appointments').select('id, type, scheduled_at').order('scheduled_at', { ascending: false }).limit(50),
  ])

  if (!reportRaw) notFound()

  const report = reportRaw as Report
  const cases = (casesRaw ?? []) as Pick<CaseRow, 'id' | 'reference'>[]
  const appointments = (appointmentsRaw ?? []) as Pick<Appointment, 'id' | 'type' | 'scheduled_at'>[]

  return (
    <div>
      <Topbar title="Modifier le compte rendu" />
      <div className="p-6 max-w-3xl">
        <PageHeader
          title="Modifier le compte rendu"
          backHref={`/reports/${id}`}
          backLabel="Compte rendu"
        />
        <div className="mt-6">
          <ReportForm
            reportId={id}
            cases={cases}
            appointments={appointments}
            defaultValues={{
              type: report.type,
              status: report.status,
              visibility: report.visibility,
              content: report.content,
              raw_notes: report.raw_notes,
              case_id: report.case_id,
              appointment_id: report.appointment_id,
            }}
          />
        </div>
      </div>
    </div>
  )
}
