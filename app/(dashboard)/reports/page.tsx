import { Topbar } from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/server'
import { ReportsTable } from '@/components/tables/reports-table'

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: reports } = await supabase
    .from('reports')
    .select('*, cases(reference), profiles!reports_author_id_fkey(full_name)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <Topbar title="Comptes rendus" />
      <div className="p-6">
        <ReportsTable reports={(reports ?? []) as any} />
      </div>
    </div>
  )
}
