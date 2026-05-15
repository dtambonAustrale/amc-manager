'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Plus, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { APPOINTMENT_TYPE_LABELS, APPOINTMENT_STATUS_LABELS, APPOINTMENT_LOCATION_LABELS } from '@/lib/labels'
import type { Database } from '@/types/database'

type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  clients: { first_name: string | null; last_name: string | null; company_name: string | null } | null
  cases: { reference: string } | null
}

const STATUS_VARIANTS: Record<string, 'success' | 'warning' | 'danger' | 'default' | 'violet'> = {
  prevu: 'violet',
  realise: 'success',
  annule: 'danger',
  reporte: 'warning',
  absent: 'danger',
  a_confirmer: 'warning',
}

interface AppointmentsTableProps {
  appointments: Appointment[]
}

export function AppointmentsTable({ appointments }: AppointmentsTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [view, setView] = useState<'upcoming' | 'all'>('upcoming')

  const now = new Date()

  const filtered = useMemo(() => {
    return appointments.filter(a => {
      const clientName = a.clients?.company_name || `${a.clients?.first_name ?? ''} ${a.clients?.last_name ?? ''}`
      const matchSearch = !search ||
        clientName.toLowerCase().includes(search.toLowerCase()) ||
        a.cases?.reference.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || a.status === statusFilter
      const matchType = typeFilter === 'all' || a.type === typeFilter
      const matchView = view === 'all' || new Date(a.scheduled_at) >= now
      return matchSearch && matchStatus && matchType && matchView
    })
  }, [appointments, search, statusFilter, typeFilter, view])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-48 flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 focus-within:border-zinc-700 transition-colors">
          <Search size={14} className="text-zinc-500 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Client ou dossier..." className="bg-transparent text-sm text-zinc-300 placeholder-zinc-600 outline-none flex-1 min-w-0" />
          {search && <button onClick={() => setSearch('')} className="text-zinc-600 hover:text-zinc-400 text-xs">✕</button>}
        </div>
        <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
          <button onClick={() => setView('upcoming')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === 'upcoming' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}>À venir</button>
          <button onClick={() => setView('all')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === 'all' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}>Tous</button>
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-400 focus:outline-none focus:border-zinc-700">
          <option value="all">Tous les statuts</option>
          {Object.entries(APPOINTMENT_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-400 focus:outline-none focus:border-zinc-700">
          <option value="all">Tous les types</option>
          {Object.entries(APPOINTMENT_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <Link href="/appointments/new"><Button size="sm"><Plus size={14} />Nouveau RDV</Button></Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              {['Date & Heure', 'Client', 'Type', 'Lieu', 'Dossier', 'Statut'].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-zinc-500 text-xs font-medium uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {!filtered.length ? (
              <tr><td colSpan={6}><EmptyState icon={Calendar} title="Aucun rendez-vous" description={view === 'upcoming' ? 'Aucun rendez-vous à venir.' : 'Aucun rendez-vous enregistré.'} action={<Link href="/appointments/new"><Button size="sm"><Plus size={14} />Nouveau RDV</Button></Link>} /></td></tr>
            ) : (
              filtered.map(a => {
                const clientName = a.clients?.company_name || `${a.clients?.first_name ?? ''} ${a.clients?.last_name ?? ''}`.trim()
                const date = new Date(a.scheduled_at)
                const isPast = date < now
                return (
                  <tr key={a.id} className={`hover:bg-zinc-800/30 transition-colors ${isPast && a.status === 'prevu' ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="text-zinc-200 text-sm font-medium">
                        {date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-zinc-500 text-xs">{date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-300 text-sm">{clientName || '—'}</td>
                    <td className="px-4 py-3"><Badge variant="default">{APPOINTMENT_TYPE_LABELS[a.type]}</Badge></td>
                    <td className="px-4 py-3 text-zinc-500 text-sm">{APPOINTMENT_LOCATION_LABELS[a.location]}</td>
                    <td className="px-4 py-3">
                      {a.cases ? (
                        <Link href={`/cases/${a.case_id}`} className="text-violet-400 hover:text-violet-300 text-sm font-mono transition-colors">{a.cases.reference}</Link>
                      ) : <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="px-4 py-3"><Badge variant={STATUS_VARIANTS[a.status] ?? 'default'}>{APPOINTMENT_STATUS_LABELS[a.status]}</Badge></td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
