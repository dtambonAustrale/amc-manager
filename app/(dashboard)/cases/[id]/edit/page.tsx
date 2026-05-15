import { Topbar } from '@/components/layout/topbar'
import { CaseForm } from '@/components/forms/case-form'
import { PageHeader } from '@/components/ui/page-header'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Database } from '@/types/database'

type Case = Database['public']['Tables']['cases']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type Client = Database['public']['Tables']['clients']['Row']

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditCasePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: caseRaw } = await supabase.from('cases').select('*').eq('id', id).single()
  if (!caseRaw) notFound()
  const caseData = caseRaw as Case

  const [{ data: clientsRaw }, { data: lawyersRaw }] = await Promise.all([
    supabase.from('clients').select('id, first_name, last_name, company_name').order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, full_name, role').eq('role', 'lawyer').eq('is_active', true),
  ])

  const clients = (clientsRaw ?? []) as Pick<Client, 'id' | 'first_name' | 'last_name' | 'company_name'>[]
  const lawyers = (lawyersRaw ?? []) as Pick<Profile, 'id' | 'full_name' | 'role'>[]

  return (
    <div>
      <Topbar title={`Modifier — ${caseData.reference}`} />
      <div className="p-6 max-w-3xl">
        <PageHeader
          title={`Modifier ${caseData.reference}`}
          backHref={`/cases/${id}`}
          backLabel="Fiche dossier"
        />
        <div className="mt-6">
          <CaseForm
            caseId={id}
            clients={clients}
            lawyers={lawyers}
            defaultValues={{
              reference: caseData.reference,
              client_id: caseData.client_id,
              type: caseData.type,
              status: caseData.status,
              description: caseData.description,
              lawyer_id: caseData.lawyer_id,
              priority: caseData.priority,
              opened_at: caseData.opened_at?.split('T')[0] ?? '',
              closed_at: caseData.closed_at?.split('T')[0] ?? null,
              estimated_amount: caseData.estimated_amount ?? undefined,
              notes: caseData.notes,
            }}
          />
        </div>
      </div>
    </div>
  )
}
