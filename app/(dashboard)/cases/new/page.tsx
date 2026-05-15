import { Topbar } from '@/components/layout/topbar'
import { CaseForm } from '@/components/forms/case-form'
import { PageHeader } from '@/components/ui/page-header'
import { createClient } from '@/lib/supabase/server'

export default async function NewCasePage() {
  const supabase = await createClient()

  const [{ data: clients }, { data: lawyers }] = await Promise.all([
    supabase.from('clients').select('id, first_name, last_name, company_name').eq('status', 'actif').order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, full_name, role').eq('role', 'lawyer').eq('is_active', true),
  ])

  return (
    <div>
      <Topbar title="Nouveau dossier" />
      <div className="p-6 max-w-3xl">
        <PageHeader
          title="Nouveau dossier"
          description="Ouvrir un nouveau dossier client"
          backHref="/cases"
          backLabel="Dossiers"
        />
        <div className="mt-6">
          <CaseForm clients={clients ?? []} lawyers={lawyers ?? []} />
        </div>
      </div>
    </div>
  )
}
