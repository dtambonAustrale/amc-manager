'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Plus, Filter } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { formatDate } from '@/lib/utils'
import { CLIENT_TYPE_LABELS, CLIENT_STATUS_LABELS } from '@/lib/labels'
import type { Database } from '@/types/database'
import { Users } from 'lucide-react'

type Client = Database['public']['Tables']['clients']['Row']

const STATUS_VARIANTS = {
  actif: 'success',
  inactif: 'warning',
  'archivé': 'default',
} as const

interface ClientsTableProps {
  clients: Client[]
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const filtered = useMemo(() => {
    return clients.filter(c => {
      const name = (c.company_name || `${c.first_name ?? ''} ${c.last_name ?? ''}`).toLowerCase()
      const matchSearch = !search ||
        name.includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search)
      const matchStatus = statusFilter === 'all' || c.status === statusFilter
      const matchType = typeFilter === 'all' || c.type === typeFilter
      return matchSearch && matchStatus && matchType
    })
  }, [clients, search, statusFilter, typeFilter])

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 focus-within:border-zinc-700 transition-colors">
          <Search size={14} className="text-zinc-500 shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un client, email, téléphone..."
            className="bg-transparent text-sm text-zinc-300 placeholder-zinc-600 outline-none flex-1 min-w-0"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-zinc-600 hover:text-zinc-400 text-xs">✕</button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-400 focus:outline-none focus:border-zinc-700"
        >
          <option value="all">Tous les statuts</option>
          {Object.entries(CLIENT_STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-400 focus:outline-none focus:border-zinc-700"
        >
          <option value="all">Tous les types</option>
          {Object.entries(CLIENT_TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <Link href="/clients/new">
          <Button size="sm">
            <Plus size={14} />
            Nouveau client
          </Button>
        </Link>
      </div>

      {/* Count */}
      <p className="text-zinc-600 text-xs">
        {filtered.length} client{filtered.length !== 1 ? 's' : ''}
        {clients.length !== filtered.length && ` sur ${clients.length}`}
      </p>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              {['Client', 'Type', 'Email', 'Téléphone', 'Statut', 'Créé le', ''].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-zinc-500 text-xs font-medium uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {!filtered.length ? (
              <tr>
                <td colSpan={7}>
                  <EmptyState
                    icon={Users}
                    title={search || statusFilter !== 'all' || typeFilter !== 'all' ? 'Aucun résultat' : 'Aucun client'}
                    description={search ? `Aucun client ne correspond à "${search}"` : 'Créez votre premier client pour commencer.'}
                    action={!search && statusFilter === 'all' && typeFilter === 'all' ? (
                      <Link href="/clients/new"><Button size="sm"><Plus size={14} />Nouveau client</Button></Link>
                    ) : undefined}
                  />
                </td>
              </tr>
            ) : (
              filtered.map(client => {
                const name = client.company_name || `${client.first_name ?? ''} ${client.last_name ?? ''}`.trim()
                return (
                  <tr key={client.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-4 py-3">
                      <Link href={`/clients/${client.id}`} className="text-zinc-200 text-sm font-medium hover:text-violet-400 transition-colors">
                        {name || '—'}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="default">{CLIENT_TYPE_LABELS[client.type]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-sm">{client.email || '—'}</td>
                    <td className="px-4 py-3 text-zinc-500 text-sm">{client.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANTS[client.status] ?? 'default'}>
                        {CLIENT_STATUS_LABELS[client.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-sm">{formatDate(client.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/clients/${client.id}/edit`} className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors">
                          Modifier
                        </Link>
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
