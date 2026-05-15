import { Topbar } from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/server'
import { PaymentsTable } from '@/components/tables/payments-table'

export default async function PaymentsPage() {
  const supabase = await createClient()
  const { data: payments } = await supabase
    .from('payments')
    .select('*, clients(first_name, last_name, company_name), cases(reference)')
    .order('payment_date', { ascending: false })

  return (
    <div>
      <Topbar title="Règlements" />
      <div className="p-6">
        <PaymentsTable payments={(payments ?? []) as any} />
      </div>
    </div>
  )
}
