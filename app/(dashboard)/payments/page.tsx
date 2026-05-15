import { Topbar } from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Plus, Search, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/types/database'

type PaymentRow = Database['public']['Tables']['payments']['Row'] & {
  clients: { first_name: string | null; last_name: string | null; company_name: string | null } | null
  cases: { reference: string } | null
}

export default async function PaymentsPage() {
  const supabase = await createClient()
  const { data: paymentsRaw } = await supabase
    .from('payments')
    .select('*, clients(first_name, last_name, company_name), cases(reference)')
    .order('payment_date', { ascending: false })
  const payments = (paymentsRaw ?? []) as PaymentRow[]

  const totalPaid = payments.filter(p => p.status === 'paye').reduce((sum, p) => sum + p.amount, 0)
  const totalPending = payments.filter(p => p.status === 'en_attente').reduce((sum, p) => sum + p.amount, 0)

  return (
    <div>
      <Topbar title="Règlements">
        <div className="flex items-center gap-3 ml-4">
          <Link href="/payments/new">
            <Button size="sm">
              <Plus size={14} />
              Nouveau règlement
            </Button>
          </Link>
        </div>
      </Topbar>

      <div className="p-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Total encaissé</span>
              <TrendingUp size={14} className="text-emerald-400" />
            </div>
            <p className="text-zinc-100 text-xl font-semibold">{formatCurrency(totalPaid)}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">En attente</span>
              <TrendingUp size={14} className="text-amber-400" />
            </div>
            <p className="text-zinc-100 text-xl font-semibold">{formatCurrency(totalPending)}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Total règlements</span>
              <TrendingUp size={14} className="text-violet-400" />
            </div>
            <p className="text-zinc-100 text-xl font-semibold">{payments?.length ?? 0}</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-1.5">
              <Search size={14} className="text-zinc-500" />
              <input placeholder="Rechercher un règlement..." className="bg-transparent text-sm text-zinc-300 placeholder-zinc-600 outline-none flex-1 min-w-0" />
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                {['Date', 'Client', 'Dossier', 'Montant', 'Méthode', 'Statut'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-zinc-500 text-xs font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {!payments?.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-600 text-sm">
                    Aucun règlement pour le moment
                  </td>
                </tr>
              ) : (
                payments.map((p: PaymentRow) => (
                  <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 text-zinc-400 text-sm">{formatDate(p.payment_date)}</td>
                    <td className="px-4 py-3 text-zinc-300 text-sm">
                      {p.clients?.company_name || `${p.clients?.first_name} ${p.clients?.last_name}`}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/cases/${p.case_id}`} className="text-zinc-400 font-mono text-xs hover:text-violet-400 transition-colors">
                        {p.cases?.reference}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-100 text-sm font-medium">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3">
                      <Badge variant="default">{p.payment_method}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={
                        p.status === 'paye' ? 'success' :
                        p.status === 'en_retard' ? 'danger' :
                        p.status === 'annule' ? 'default' :
                        'warning'
                      }>{p.status}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
