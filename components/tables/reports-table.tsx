'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Plus, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { formatDate } from '@/lib/utils'
import { REPORT_TYPE_LABELS, REPORT_STATUS_LABELS, REPORT_VISIBILITY_LABELS } from '@/lib/labels'
import type { Database } from '@/types/database'

type Report = Database['public']['Tables']['reports']['Row'] & {
  cases: { reference: string } | null
  profiles: { full_name: string } | null
}

const STATUS_VARIANTS: Record<string, 'default' | 'warning' | 'info' | 'success'> = {
  brouillon: 'default',
  a_relire: 'warning',
  finalise: 'info',
  valide: 'success',
  archive: 'default',
}

interface ReportsTableProps {
  reports: Report[]
}

export function ReportsTable({ reports }: ReportsTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const filtered = useMemo(() => {
    return reports.filter(r => {
      const matchSearch = !search ||
        r.cases?.reference.toLowerCase().includes(search.toLowerCase()) ||
        r.profiles?.full_name.toLowerCase().includes(search.toLowerCase()) ||
        r.content?.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || r.status === statusFilter
      const matchType = typeFilter === 'all' || r.type === typeFilter
      return matchSearch && matchStatus && matchType
    })
  }, [reports, search, statusFilter, typeFilter])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-48 flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 focus-within:border-zinc-700 transition-colors">
          <Search size={14} className="text-zinc-500 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Dossier, auteur, contenu..." className="bg-transparent text-sm text-zinc-300 placeholder-zinc-600 outline-none flex-1 min-w-0" />
          {search && <button onClick={() => setSearch('')} className="text-zinc-600 hover:text-zinc-400 text-xs">✕</button>}
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-400 focus:outline-none focus:border-zinc-700">
          <option value="all">Tous les statuts</option>
          {Object.entries(REPORT_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-400 focus:outline-none focus:border-zinc-700">
          <option value="all">Tous les types</option>
          {Object.entries(REPORT_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <Link href="/reports/new"><Button size="sm"><Plus size={14} />Nouveau CR</Button></Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              {['Type', 'Dossier', 'Auteur', 'Visibilité', 'Statut', 'Date', ''].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-zinc-500 text-xs font-medium uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {!filtered.length ? (
              <tr><td colSpan={7}><EmptyState icon={FileText} title="Aucun compte rendu" description="Rédigez votre premier compte rendu." action={<Link href="/reports/new"><Button size="sm"><Plus size={14} />Nouveau CR</Button></Link>} /></td></tr>
            ) : (
              filtered.map(r => (
                <tr key={r.id} className="hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-4 py-3"><Badge variant="default">{REPORT_TYPE_LABELS[r.type as keyof typeof REPORT_TYPE_LABELS]}</Badge></td>
                  <td className="px-4 py-3">
                    {r.cases ? (
                      <Link href={`/cases/${r.case_id}`} className="text-violet-400 hover:text-violet-300 text-sm font-mono transition-colors">{r.cases.reference}</Link>
                    ) : <span className="text-zinc-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-sm">{r.profiles?.full_name || '—'}</td>
                  <td className="px-4 py-3 text-zinc-500 text-sm">{REPORT_VISIBILITY_LABELS[r.visibility as keyof typeof REPORT_VISIBILITY_LABELS]}</td>
                  <td className="px-4 py-3"><Badge variant={STATUS_VARIANTS[r.status] ?? 'default'}>{REPORT_STATUS_LABELS[r.status as keyof typeof REPORT_STATUS_LABELS]}</Badge></td>
                  <td className="px-4 py-3 text-zinc-500 text-sm">{formatDate(r.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/reports/${r.id}`} className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors">Voir</Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
