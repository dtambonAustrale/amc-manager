import { Topbar } from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/server'
import { CasesTable } from '@/components/tables/cases-table'

export default async function CasesPage() {
  const supabase = await createClient()
  const { data: cases } = await supabase
    .from('cases')
    .select('*, clients(first_name, last_name, company_name)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <Topbar title="Dossiers" />
      <div className="p-6">
        <CasesTable cases={(cases ?? []) as any} />
      </div>
    </div>
  )
}
