import { Topbar } from '@/components/layout/topbar'
import { PaymentForm } from '@/components/forms/payment-form'
import { PageHeader } from '@/components/ui/page-header'
import { createClient } from '@/lib/supabase/server'

export default async function NewPaymentPage() {
  const supabase = await createClient()
  const { data: cases } = await supabase
    .from('cases')
    .select('id, reference, client_id, clients(first_name, last_name, company_name)')
    .not('status', 'in', '("cloture","archive")')
    .order('created_at', { ascending: false })

  return (
    <div>
      <Topbar title="Nouveau règlement" />
      <div className="p-6 max-w-3xl">
        <PageHeader
          title="Nouveau règlement"
          description="Enregistrer un paiement pour un dossier"
          backHref="/payments"
          backLabel="Règlements"
        />
        <div className="mt-6">
          <PaymentForm cases={(cases as any) ?? []} />
        </div>
      </div>
    </div>
  )
}
