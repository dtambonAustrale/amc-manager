import { Topbar } from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { notFound } from 'next/navigation'
import { ArrowLeft, User, Calendar, CreditCard } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/types/database'

type CaseRow = Database['public']['Tables']['cases']['Row']
type PaymentRow = Database['public']['Tables']['payments']['Row']
type AppointmentRow = Database['public']['Tables']['appointments']['Row']

interface Props {
  params: Promise<{ id: string }>
}

export default async function CaseDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: caseRaw } = await supabase
    .from('cases')
    .select('*, clients(first_name, last_name, company_name, email, phone)')
    .eq('id', id)
    .single()

  if (!caseRaw) notFound()
  const caseData = caseRaw as CaseRow & { clients: { first_name: string | null; last_name: string | null; company_name: string | null; email: string | null; phone: string | null } | null }

  const { data: paymentsRaw } = await supabase
    .from('payments')
    .select('*')
    .eq('case_id', id)
    .order('payment_date', { ascending: false })
  const payments = (paymentsRaw ?? []) as PaymentRow[]

  const { data: appointmentsRaw } = await supabase
    .from('appointments')
    .select('*')
    .eq('case_id', id)
    .order('scheduled_at', { ascending: false })
  const appointments = (appointmentsRaw ?? []) as AppointmentRow[]

  const client = caseData.clients
  const clientName = client?.company_name || `${client?.first_name ?? ''} ${client?.last_name ?? ''}`.trim()

  return (
    <div>
      <Topbar title={`Dossier ${caseData.reference}`} />
      <div className="p-6 space-y-6">
        <Link href="/cases" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
          <ArrowLeft size={14} />
          Retour aux dossiers
        </Link>

        <div className="grid grid-cols-3 gap-6">
          {/* Case info */}
          <div className="col-span-1 space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-zinc-100 font-mono font-semibold">{caseData.reference}</span>
                  <Badge variant={
                    caseData.priority === 'urgente' ? 'danger' :
                    caseData.priority === 'haute' ? 'warning' :
                    'default'
                  }>{caseData.priority}</Badge>
                </div>
                <Badge variant={
                  caseData.status === 'cloture' ? 'default' :
                  caseData.status === 'en_cours' ? 'info' :
                  caseData.status === 'ouvert' ? 'success' :
                  'warning'
                }>{caseData.status?.replace(/_/g, ' ')}</Badge>
              </div>

              <div className="space-y-3 pt-2 border-t border-zinc-800 text-sm">
                <div className="flex items-center gap-3">
                  <User size={14} className="text-zinc-500 shrink-0" />
                  <Link href={`/clients/${caseData.client_id}`} className="text-zinc-300 hover:text-violet-400 transition-colors">
                    {clientName}
                  </Link>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={14} className="text-zinc-500 shrink-0" />
                  <span className="text-zinc-400">Ouvert le {formatDate(caseData.opened_at)}</span>
                </div>
                {caseData.estimated_amount && (
                  <div className="flex items-center gap-3">
                    <CreditCard size={14} className="text-zinc-500 shrink-0" />
                    <span className="text-zinc-400">{formatCurrency(caseData.estimated_amount)}</span>
                  </div>
                )}
              </div>

              {caseData.description && (
                <div className="pt-2 border-t border-zinc-800">
                  <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">Description</p>
                  <p className="text-zinc-400 text-sm leading-relaxed">{caseData.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right column: payments + appointments */}
          <div className="col-span-2 space-y-4">
            {/* Payments */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800">
                <h2 className="text-zinc-200 text-sm font-medium">Règlements ({payments?.length ?? 0})</h2>
              </div>
              <div className="divide-y divide-zinc-800/60">
                {!payments?.length ? (
                  <div className="px-4 py-6 text-center text-zinc-600 text-sm">Aucun règlement</div>
                ) : (
                  payments.map((p) => (
                    <div key={p.id} className="px-4 py-3 flex items-center gap-4">
                      <div className="flex-1">
                        <p className="text-zinc-200 text-sm font-medium">{formatCurrency(p.amount)}</p>
                        <p className="text-zinc-500 text-xs">{formatDate(p.payment_date)} · {p.payment_method}</p>
                      </div>
                      <Badge variant={p.status === 'paye' ? 'success' : p.status === 'en_retard' ? 'danger' : 'warning'}>
                        {p.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Appointments */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800">
                <h2 className="text-zinc-200 text-sm font-medium">Rendez-vous ({appointments?.length ?? 0})</h2>
              </div>
              <div className="divide-y divide-zinc-800/60">
                {!appointments?.length ? (
                  <div className="px-4 py-6 text-center text-zinc-600 text-sm">Aucun rendez-vous</div>
                ) : (
                  appointments.map((a) => (
                    <div key={a.id} className="px-4 py-3 flex items-center gap-4">
                      <div className="flex-1">
                        <p className="text-zinc-200 text-sm font-medium">{a.type?.replace(/_/g, ' ')}</p>
                        <p className="text-zinc-500 text-xs">{new Date(a.scheduled_at).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })} · {a.location}</p>
                      </div>
                      <Badge variant={a.status === 'realise' ? 'success' : a.status === 'annule' ? 'danger' : 'violet'}>
                        {a.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
