import { Topbar } from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Users, FolderOpen, CreditCard, Calendar, Clock, AlertCircle, TrendingUp, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import type { Database } from '@/types/database'
import type { UserRole } from '@/types/database'

type CaseStatus = Database['public']['Tables']['cases']['Row']['status']

const CASE_STATUS_VARIANTS: Record<CaseStatus, 'success' | 'info' | 'warning' | 'default' | 'violet'> = {
  ouvert: 'success', en_cours: 'info', en_attente: 'warning', a_completer: 'warning',
  rdv_prevu: 'violet', attente_reglement: 'warning', cloture: 'default', archive: 'default',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profileRaw } = await supabase.from('profiles').select('*').eq('user_id', user!.id).single()
  const profile = profileRaw as Database['public']['Tables']['profiles']['Row'] | null
  const role = profile?.role as UserRole ?? 'collaborator'

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

  const [clientsRes, casesRes, paymentsMonthRes, appointmentsRes, overdueRes, recentCasesRes] = await Promise.all([
    supabase.from('clients').select('id', { count: 'exact' }).eq('status', 'actif'),
    supabase.from('cases').select('id', { count: 'exact' }).not('status', 'in', '("cloture","archive")'),
    supabase.from('payments').select('amount').eq('status', 'paye').gte('payment_date', startOfMonth).lte('payment_date', endOfMonth),
    supabase.from('appointments')
      .select('id, scheduled_at, type, status, clients(first_name, last_name, company_name)')
      .gte('scheduled_at', now.toISOString())
      .in('status', ['prevu', 'a_confirmer'])
      .order('scheduled_at', { ascending: true })
      .limit(6),
    supabase.from('payments').select('amount').eq('status', 'en_retard'),
    supabase.from('cases')
      .select('id, reference, status, clients(first_name, last_name, company_name)')
      .not('status', 'in', '("cloture","archive")')
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const totalActiveClients = clientsRes.count ?? 0
  const totalOpenCases = casesRes.count ?? 0
  const monthlyRevenue = (paymentsMonthRes.data ?? []).reduce((s, p) => s + p.amount, 0)
  const upcomingAppointments = appointmentsRes.data ?? []
  const overdueAmount = (overdueRes.data ?? []).reduce((s, p) => s + p.amount, 0)
  const recentCases = recentCasesRes.data ?? []

  const monthName = now.toLocaleDateString('fr-FR', { month: 'long' })

  const stats = [
    { label: 'Clients actifs', value: totalActiveClients, icon: Users, colorClass: 'bg-violet-500/10', iconClass: 'text-violet-400', href: '/clients' },
    { label: 'Dossiers en cours', value: totalOpenCases, icon: FolderOpen, colorClass: 'bg-blue-500/10', iconClass: 'text-blue-400', href: '/cases' },
    { label: `Encaissé (${monthName})`, value: formatCurrency(monthlyRevenue), icon: TrendingUp, colorClass: 'bg-emerald-500/10', iconClass: 'text-emerald-400', href: '/payments' },
    { label: 'RDV à venir', value: upcomingAppointments.length, icon: Calendar, colorClass: 'bg-amber-500/10', iconClass: 'text-amber-400', href: '/appointments' },
  ]

  return (
    <div>
      <Topbar title="Tableau de bord" />
      <div className="p-6 space-y-6">
        {/* Greeting */}
        <div>
          <h2 className="text-zinc-100 text-xl font-semibold tracking-tight">
            Bonjour, {profile?.full_name?.split(' ')[0] ?? 'utilisateur'} 👋
          </h2>
          <p className="text-zinc-500 text-sm mt-0.5">
            {now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map(stat => (
            <Link key={stat.label} href={stat.href} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">{stat.label}</span>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${stat.colorClass}`}>
                  <stat.icon size={14} className={stat.iconClass} />
                </div>
              </div>
              <p className="text-zinc-100 text-2xl font-semibold tracking-tight">{stat.value}</p>
            </Link>
          ))}
        </div>

        {/* Overdue alert */}
        {overdueAmount > 0 && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
            <AlertCircle size={15} className="text-red-400 shrink-0" />
            <p className="text-red-300 text-sm">
              <span className="font-semibold">{formatCurrency(overdueAmount)}</span> de règlements en retard.{' '}
              <Link href="/payments" className="underline hover:text-red-200 transition-colors">Voir les règlements</Link>
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          {/* Upcoming appointments */}
          <div className="col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <h2 className="text-zinc-200 text-sm font-medium flex items-center gap-2">
                <Clock size={14} className="text-violet-400" />
                Prochains rendez-vous
              </h2>
              <Link href="/appointments" className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors">
                Voir tout →
              </Link>
            </div>
            <div className="divide-y divide-zinc-800/60">
              {upcomingAppointments.length === 0 ? (
                <div className="px-4 py-8 text-center text-zinc-600 text-sm">
                  Aucun rendez-vous à venir
                </div>
              ) : (
                upcomingAppointments.map((apt: any) => {
                  const date = new Date(apt.scheduled_at)
                  const isToday = date.toDateString() === now.toDateString()
                  const clientName = apt.clients?.company_name || `${apt.clients?.first_name ?? ''} ${apt.clients?.last_name ?? ''}`.trim()
                  return (
                    <div key={apt.id} className="px-4 py-3 flex items-center gap-3 hover:bg-zinc-800/30 transition-colors">
                      <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0 ${isToday ? 'bg-violet-500/20 border border-violet-500/30' : 'bg-zinc-800'}`}>
                        <p className={`text-xs font-bold leading-none ${isToday ? 'text-violet-300' : 'text-zinc-300'}`}>{date.getDate()}</p>
                        <p className={`text-xs leading-none mt-0.5 ${isToday ? 'text-violet-400' : 'text-zinc-600'}`}>{date.toLocaleDateString('fr-FR', { month: 'short' })}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-zinc-200 text-sm font-medium truncate">{clientName || 'Client'}</p>
                        <p className="text-zinc-500 text-xs">
                          {isToday ? "Aujourd'hui" : date.toLocaleDateString('fr-FR', { weekday: 'long' })} à {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <Badge variant={apt.status === 'prevu' ? 'violet' : 'warning'}>
                        {apt.type?.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Quick actions */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800">
                <h2 className="text-zinc-200 text-sm font-medium">Actions rapides</h2>
              </div>
              <div className="p-2 space-y-0.5">
                {[
                  { label: 'Nouveau client', href: '/clients/new', icon: Users },
                  { label: 'Nouveau dossier', href: '/cases/new', icon: FolderOpen },
                  { label: 'Nouveau rendez-vous', href: '/appointments/new', icon: Calendar },
                  { label: 'Nouveau règlement', href: '/payments/new', icon: CreditCard },
                  { label: 'Nouveau compte rendu', href: '/reports/new', icon: FileText },
                ].map(action => (
                  <Link key={action.href} href={action.href} className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all text-sm">
                    <action.icon size={14} className="text-violet-400 shrink-0" />
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent cases */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                <h2 className="text-zinc-200 text-sm font-medium">Dossiers récents</h2>
                <Link href="/cases" className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors">Voir tout →</Link>
              </div>
              <div className="divide-y divide-zinc-800/60">
                {recentCases.length === 0 ? (
                  <div className="px-4 py-6 text-center text-zinc-600 text-xs">Aucun dossier</div>
                ) : recentCases.map((c: any) => {
                  const clientName = c.clients?.company_name || `${c.clients?.first_name ?? ''} ${c.clients?.last_name ?? ''}`.trim()
                  return (
                    <Link key={c.id} href={`/cases/${c.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-zinc-300 text-xs font-mono">{c.reference}</p>
                        <p className="text-zinc-600 text-xs truncate">{clientName || '—'}</p>
                      </div>
                      <Badge variant={CASE_STATUS_VARIANTS[c.status as CaseStatus] ?? 'default'} className="shrink-0">
                        {c.status?.replace(/_/g, ' ')}
                      </Badge>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
