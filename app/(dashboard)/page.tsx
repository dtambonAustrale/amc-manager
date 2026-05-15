import { Topbar } from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { Users, FolderOpen, CreditCard, Calendar, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Database } from '@/types/database'

type CaseStatus = Database['public']['Tables']['cases']['Row']['status']

export default async function DashboardPage() {
  const supabase = await createClient()

  // Stats parallèles
  const [clientsRes, casesRes, paymentsRes, appointmentsRes] = await Promise.all([
    supabase.from('clients').select('id, status', { count: 'exact' }),
    supabase.from('cases').select('id, status', { count: 'exact' }),
    supabase.from('payments').select('amount, status').eq('status', 'paye'),
    supabase.from('appointments')
      .select('id, scheduled_at, type, status, clients(first_name, last_name, company_name)')
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(5),
  ])

  const totalClients = clientsRes.count ?? 0
  const openCases = (casesRes.data as Array<{ id: string; status: CaseStatus }> ?? []).filter(c => c.status !== 'cloture' && c.status !== 'archive').length
  const totalPaid = (paymentsRes.data as Array<{ amount: number; status: string }> ?? []).reduce((sum, p) => sum + p.amount, 0)
  const upcomingAppointments = appointmentsRes.data ?? []

  const stats = [
    { label: 'Clients actifs', value: totalClients, icon: Users, colorClass: 'bg-violet-500/10', iconClass: 'text-violet-400' },
    { label: 'Dossiers ouverts', value: openCases, icon: FolderOpen, colorClass: 'bg-blue-500/10', iconClass: 'text-blue-400' },
    { label: 'Encaissé (total)', value: formatCurrency(totalPaid), icon: CreditCard, colorClass: 'bg-emerald-500/10', iconClass: 'text-emerald-400' },
    { label: 'RDV à venir', value: upcomingAppointments.length, icon: Calendar, colorClass: 'bg-amber-500/10', iconClass: 'text-amber-400' },
  ]

  return (
    <div>
      <Topbar title="Tableau de bord" />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">{stat.label}</span>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${stat.colorClass}`}>
                  <stat.icon size={14} className={stat.iconClass} />
                </div>
              </div>
              <p className="text-zinc-100 text-2xl font-semibold tracking-tight">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Upcoming appointments */}
          <div className="col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <h2 className="text-zinc-200 text-sm font-medium flex items-center gap-2">
                <Clock size={14} className="text-violet-400" />
                Prochains rendez-vous
              </h2>
            </div>
            <div className="divide-y divide-zinc-800/60">
              {upcomingAppointments.length === 0 ? (
                <div className="px-4 py-8 text-center text-zinc-600 text-sm">
                  Aucun rendez-vous à venir
                </div>
              ) : (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                upcomingAppointments.map((apt: any) => (
                  <div key={apt.id} className="px-4 py-3 flex items-center gap-3 hover:bg-zinc-800/30 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                      <Calendar size={14} className="text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-200 text-sm font-medium truncate">
                        {apt.clients?.company_name || `${apt.clients?.first_name} ${apt.clients?.last_name}` || 'Client'}
                      </p>
                      <p className="text-zinc-500 text-xs">{new Date(apt.scheduled_at).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <Badge variant={apt.status === 'prevu' ? 'violet' : 'default'}>
                      {apt.type?.replace('_', ' ')}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="px-4 py-3 border-b border-zinc-800">
              <h2 className="text-zinc-200 text-sm font-medium">Actions rapides</h2>
            </div>
            <div className="p-3 space-y-2">
              {[
                { label: 'Nouveau client', href: '/clients/new', icon: Users },
                { label: 'Nouveau dossier', href: '/cases/new', icon: FolderOpen },
                { label: 'Nouveau rendez-vous', href: '/appointments/new', icon: Calendar },
                { label: 'Nouveau règlement', href: '/payments/new', icon: CreditCard },
              ].map((action) => (
                <a
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all text-sm group"
                >
                  <action.icon size={15} className="text-violet-400 group-hover:scale-110 transition-transform" />
                  {action.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
