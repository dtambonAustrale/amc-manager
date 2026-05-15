import { Topbar } from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Plus, Search, Calendar, Clock } from 'lucide-react'
import type { Database } from '@/types/database'

type AppointmentRow = Database['public']['Tables']['appointments']['Row'] & {
  clients: { first_name: string | null; last_name: string | null; company_name: string | null } | null
  cases: { reference: string } | null
}

export default async function AppointmentsPage() {
  const supabase = await createClient()
  const { data: appointmentsRaw } = await supabase
    .from('appointments')
    .select('*, clients(first_name, last_name, company_name), cases(reference)')
    .order('scheduled_at', { ascending: false })
  const appointments = (appointmentsRaw ?? []) as AppointmentRow[]

  const upcoming = appointments.filter(a => new Date(a.scheduled_at) >= new Date() && a.status !== 'annule')
  const past = appointments.filter(a => new Date(a.scheduled_at) < new Date() || a.status === 'realise')

  return (
    <div>
      <Topbar title="Rendez-vous">
        <div className="flex items-center gap-3 ml-4">
          <Link href="/appointments/new">
            <Button size="sm">
              <Plus size={14} />
              Nouveau rendez-vous
            </Button>
          </Link>
        </div>
      </Topbar>

      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">À venir</span>
              <Calendar size={14} className="text-violet-400" />
            </div>
            <p className="text-zinc-100 text-xl font-semibold">{upcoming.length}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Passés</span>
              <Clock size={14} className="text-zinc-400" />
            </div>
            <p className="text-zinc-100 text-xl font-semibold">{past.length}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Total</span>
              <Calendar size={14} className="text-blue-400" />
            </div>
            <p className="text-zinc-100 text-xl font-semibold">{appointments?.length ?? 0}</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-1.5">
              <Search size={14} className="text-zinc-500" />
              <input placeholder="Rechercher un rendez-vous..." className="bg-transparent text-sm text-zinc-300 placeholder-zinc-600 outline-none flex-1 min-w-0" />
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                {['Date & Heure', 'Client', 'Dossier', 'Type', 'Lieu', 'Durée', 'Statut'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-zinc-500 text-xs font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {!appointments?.length ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-600 text-sm">
                    Aucun rendez-vous pour le moment
                  </td>
                </tr>
              ) : (
                appointments.map((a: AppointmentRow) => (
                  <tr key={a.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-zinc-200 text-sm">{new Date(a.scheduled_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                      <p className="text-zinc-500 text-xs">{new Date(a.scheduled_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-300 text-sm">
                      {a.clients?.company_name || `${a.clients?.first_name} ${a.clients?.last_name}`}
                    </td>
                    <td className="px-4 py-3">
                      {a.cases?.reference ? (
                        <Link href={`/cases/${a.case_id}`} className="text-zinc-400 font-mono text-xs hover:text-violet-400 transition-colors">
                          {a.cases.reference}
                        </Link>
                      ) : (
                        <span className="text-zinc-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="violet">{a.type?.replace(/_/g, ' ')}</Badge>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-sm">{a.location}</td>
                    <td className="px-4 py-3 text-zinc-500 text-sm">{a.duration_minutes} min</td>
                    <td className="px-4 py-3">
                      <Badge variant={
                        a.status === 'realise' ? 'success' :
                        a.status === 'annule' ? 'danger' :
                        a.status === 'absent' ? 'warning' :
                        'default'
                      }>{a.status}</Badge>
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
