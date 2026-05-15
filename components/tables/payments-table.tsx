'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Plus, CreditCard, TrendingUp, Clock, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { formatDate, formatCurrency } from '@/lib/utils'
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/labels'
import type { Database } from '@/types/database'

type Payment = Database['public']['Tables']['payments']['Row'] & {
  clients: { first_name: string | null; last_name: string | null; company_name: string | null } | null
  cases: { reference: string } | null
}

const STATUS_VARIANTS: Record<string, 'success' | 'warning' | 'danger' | 'default' | 'info'> = {
  paye: 'success',
  en_attente: 'warning',
  partiel: 'info',
  annule: 'default',
  en_retard: 'danger',
}

interface PaymentsTableProps {
  payments: Payment[]
}

export function PaymentsTable({ payments }: PaymentsTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')

  const filtered = useMemo(() => {
    return payments.filter(p => {
      const clientName = p.clients?.company_name || `${p.clients?.first_name ?? ''} ${p.clients?.last_name ?? ''}`
      const matchSearch = !search ||
        clientName.toLowerCase().includes(search.toLowerCase()) ||
        p.cases?.reference.toLowerCase().includes(search.toLowerCase()) ||
        p.reference?.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || p.status === statusFilter
      const matchMethod = methodFilter === 'all' || p.payment_method === methodFilter
      return matchSearch && matchStatus && matchMethod
    })
  }, [payments, search, statusFilter, methodFilter])

  const totalPaid = payments.filter(p => p.status === 'paye').reduce((s, p) => s + p.amount, 0)
  const totalPending = payments.filter(p => p.status === 'en_attente' || p.status === 'partiel').reduce((s, p) => s + p.amount, 0)
  const totalOverdue = payments.filter(p => p.status === 'en_retard').reduce((s, p) => s + p.amount, 0)

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Encaissé</span>
            <TrendingUp size={14} className="text-emerald-400" />
          </div>
          <p className="text-emerald-400 text-xl font-semibold">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">En attente</span>
            <Clock size={14} className="text-amber-400" />
          </div>
          <p className="text-amber-400 text-xl font-semibold">{formatCurrency(totalPending)}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">En retard</span>
            <AlertCircle size={14} className="text-red-400" />
          </div>
          <p className="text-red-400 text-xl font-semibold">{formatCurrency(totalOverdue)}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 focus-within:border-zinc-700 transition-colors">
          <Search size={14} className="text-zinc-500 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Client, dossier, référence..." className="bg-transparent text-sm text-zinc-300 placeholder-zinc-600 outline-none flex-1 min-w-0" />
          {search && <button onClick={() => setSearch('')} className="text-zinc-600 hover:text-zinc-400 text-xs">✕</button>}
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-400 focus:outline-none focus:border-zinc-700">
          <option value="all">Tous les statuts</option>
          {Object.entries(PAYMENT_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-400 focus:outline-none focus:border-zinc-700">
          <option value="all">Tous les modes</option>
          {Object.entries(PAYMENT_METHOD_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <Link href="/payments/new"><Button size="sm"><Plus size={14} />Nouveau règlement</Button></Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              {['Montant', 'Client', 'Dossier', 'Mode', 'Date', 'Référence', 'Statut'].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-zinc-500 text-xs font-medium uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {!filtered.length ? (
              <tr><td colSpan={7}><EmptyState icon={CreditCard} title="Aucun règlement" description="Enregistrez un premier paiement." action={<Link href="/payments/new"><Button size="sm"><Plus size={14} />Nouveau règlement</Button></Link>} /></td></tr>
            ) : (
              filtered.map(p => {
                const clientName = p.clients?.company_name || `${p.clients?.first_name ?? ''} ${p.clients?.last_name ?? ''}`.trim()
                return (
                  <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 text-zinc-100 font-semibold text-sm">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3 text-zinc-300 text-sm">{clientName || '—'}</td>
                    <td className="px-4 py-3">
                      {p.cases ? (
                        <Link href={`/cases/${p.case_id}`} className="text-violet-400 hover:text-violet-300 text-sm font-mono transition-colors">{p.cases.reference}</Link>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-sm">{PAYMENT_METHOD_LABELS[p.payment_method]}</td>
                    <td className="px-4 py-3 text-zinc-500 text-sm">{formatDate(p.payment_date)}</td>
                    <td className="px-4 py-3 text-zinc-600 text-xs font-mono">{p.reference || '—'}</td>
                    <td className="px-4 py-3"><Badge variant={STATUS_VARIANTS[p.status] ?? 'default'}>{PAYMENT_STATUS_LABELS[p.status]}</Badge></td>
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
