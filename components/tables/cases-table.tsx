'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Plus, FolderOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { formatDate } from '@/lib/utils'
import { CASE_TYPE_LABELS, CASE_STATUS_LABELS, CASE_PRIORITY_LABELS } from '@/lib/labels'
import type { Database } from '@/types/database'

type Case = Database['public']['Tables']['cases']['Row'] & {
  clients: { first_name: string | null; last_name: string | null; company_name: string | null } | null
}

const STATUS_VARIANTS: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'default' | 'violet'> = {
  ouvert: 'success',
  en_cours: 'info',
  en_attente: 'warning',
  a_completer: 'warning',
  rdv_prevu: 'violet',
  attente_reglement: 'warning',
  cloture: 'default',
  archive: 'default',
}

const PRIORITY_VARIANTS: Record<string, 'danger' | 'warning' | 'default'> = {
  urgente: 'danger',
  haute: 'warning',
  normale: 'default',
  basse: 'default',
}

interface CasesTableProps {
  cases: Case[]
}

export function CasesTable({ cases }: CasesTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const filtered = useMemo(() => {
    return cases.filter(c => {
      const clientName = c.clients?.company_name || `${c.clients?.first_name ?? ''} ${c.clients?.last_name ?? ''}`
      const matchSearch = !search ||
        c.reference.toLowerCase().includes(search.toLowerCase()) ||
        clientName.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || c.status === statusFilter
      const matchType = typeFilter === 'all' || c.type === typeFilter
      const matchPriority = priorityFilter === 'all' || c.priority === priorityFilter
      return matchSearch && matchStatus && matchType && matchPriority
    })
  }, [cases, search, statusFilter, typeFilter, priorityFilter])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-48 flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 focus-within:border-zinc-700 transition-colors">
          <Search size={14} className="text-zinc-500 shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Référence, client, description..."
            className="bg-transparent text-sm text-zinc-300 placeholder-zinc-600 outline-none flex-1 min-w-0"
          />
          {search && <button onClick={() => setSearch('')} className="text-zinc-600 hover:text-zinc-400 text-xs">✕</button>}
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-400 focus:outline-none focus:border-zinc-700">
          <option value="all">Tous les statuts</option>
          {Object.entries(CASE_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-400 focus:outline-none focus:border-zinc-700">
          <option value="all">Tous les types</option>
          {Object.entries(CASE_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-400 focus:outline-none focus:border-zinc-700">
          <option value="all">Toutes priorités</option>
          {Object.entries(CASE_PRIORITY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <Link href="/cases/new"><Button size="sm"><Plus size={14} />Nouveau dossier</Button></Link>
      </div>

      <p className="text-zinc-600 text-xs">{filtered.length} dossier{filtered.length !== 1 ? 's' : ''}{cases.length !== filtered.length && ` sur ${cases.length}`}</p>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              {['Référence', 'Client', 'Type', 'Priorité', 'Statut', 'Ouvert le', ''].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-zinc-500 text-xs font-medium uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {!filtered.length ? (
              <tr><td colSpan={7}><EmptyState icon={FolderOpen} title="Aucun dossier" description="Créez un nouveau dossier pour commencer." action={<Link href="/cases/new"><Button size="sm"><Plus size={14} />Nouveau dossier</Button></Link>} /></td></tr>
            ) : (
              filtered.map(c => {
                const clientName = c.clients?.company_name || `${c.clients?.first_name ?? ''} ${c.clients?.last_name ?? ''}`.trim()
                return (
                  <tr key={c.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-4 py-3">
                      <Link href={`/cases/${c.id}`} className="text-violet-400 hover:text-violet-300 text-sm font-mono font-medium transition-colors">
                        {c.reference}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-300 text-sm">{clientName || '—'}</td>
                    <td className="px-4 py-3"><Badge variant="default">{CASE_TYPE_LABELS[c.type]}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={PRIORITY_VARIANTS[c.priority] ?? 'default'}>{CASE_PRIORITY_LABELS[c.priority]}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={STATUS_VARIANTS[c.status] ?? 'default'}>{CASE_STATUS_LABELS[c.status]}</Badge></td>
                    <td className="px-4 py-3 text-zinc-500 text-sm">{formatDate(c.opened_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/cases/${c.id}/edit`} className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors">Modifier</Link>
                      </div>
                    </td>
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
