'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import Link from 'next/link'
import { cn, formatDate, formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import {
  PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS, APPOINTMENT_STATUS_LABELS, APPOINTMENT_LOCATION_LABELS,
  REPORT_TYPE_LABELS, REPORT_STATUS_LABELS,
  CASE_STATUS_LABELS, CASE_TYPE_LABELS, CASE_PRIORITY_LABELS,
} from '@/lib/labels'
import {
  CreditCard, Calendar, FileText, Plus, TrendingUp, Clock, AlertCircle, User, Paperclip,
} from 'lucide-react'
import type { Database } from '@/types/database'

type Case = Database['public']['Tables']['cases']['Row']
type Payment = Database['public']['Tables']['payments']['Row']
type Appointment = Database['public']['Tables']['appointments']['Row']
type ReportRow = Database['public']['Tables']['reports']['Row']
type Document = Database['public']['Tables']['documents']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type Client = Database['public']['Tables']['clients']['Row']

interface ReportWithProfile extends ReportRow {
  profiles: { full_name: string } | null
}

interface CaseTabsProps {
  caseData: Case
  client: Client | null
  lawyer: Profile | null
  payments: Payment[]
  appointments: Appointment[]
  reports: ReportWithProfile[]
  documents: Document[]
}

const PAYMENT_STATUS_VARIANTS: Record<string, 'success' | 'warning' | 'danger' | 'default' | 'info'> = {
  paye: 'success', en_attente: 'warning', partiel: 'info', annule: 'default', en_retard: 'danger',
}
const APPOINTMENT_STATUS_VARIANTS: Record<string, 'success' | 'warning' | 'danger' | 'default' | 'violet'> = {
  prevu: 'violet', realise: 'success', annule: 'danger', reporte: 'warning', absent: 'danger', a_confirmer: 'warning',
}
const REPORT_STATUS_VARIANTS: Record<string, 'default' | 'warning' | 'info' | 'success'> = {
  brouillon: 'default', a_relire: 'warning', finalise: 'info', valide: 'success', archive: 'default',
}

function TabsList({ children }: { children: React.ReactNode }) {
  return (
    <TabsPrimitive.List className="flex items-center border-b border-zinc-800 px-1">
      {children}
    </TabsPrimitive.List>
  )
}

function TabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <TabsPrimitive.Trigger
      value={value}
      className={cn(
        'relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium text-zinc-500 transition-colors',
        'hover:text-zinc-300 focus-visible:outline-none',
        'data-[state=active]:text-zinc-100',
        'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-violet-500',
        'after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-200'
      )}
    >
      {children}
    </TabsPrimitive.Trigger>
  )
}

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 px-4 border-b border-zinc-800">
      <h3 className="text-zinc-400 text-xs font-medium uppercase tracking-wider">{title}</h3>
      {action}
    </div>
  )
}

export function CaseTabs({ caseData, client, lawyer, payments, appointments, reports, documents }: CaseTabsProps) {
  const totalPaid = payments.filter(p => p.status === 'paye').reduce((s, p) => s + p.amount, 0)
  const totalPending = payments.filter(p => ['en_attente', 'partiel'].includes(p.status)).reduce((s, p) => s + p.amount, 0)
  const totalOverdue = payments.filter(p => p.status === 'en_retard').reduce((s, p) => s + p.amount, 0)
  const remaining = caseData.estimated_amount ? Math.max(0, caseData.estimated_amount - totalPaid) : null
  const clientName = client?.company_name || `${client?.first_name ?? ''} ${client?.last_name ?? ''}`.trim()

  return (
    <TabsPrimitive.Root defaultValue="resume" className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <TabsList>
        <TabsTrigger value="resume">Résumé</TabsTrigger>
        <TabsTrigger value="reglements">
          Règlements {payments.length > 0 && <span className="text-xs text-zinc-600">({payments.length})</span>}
        </TabsTrigger>
        <TabsTrigger value="rdv">
          Rendez-vous {appointments.length > 0 && <span className="text-xs text-zinc-600">({appointments.length})</span>}
        </TabsTrigger>
        <TabsTrigger value="cr">
          Comptes rendus {reports.length > 0 && <span className="text-xs text-zinc-600">({reports.length})</span>}
        </TabsTrigger>
        <TabsTrigger value="documents">
          Documents {documents.length > 0 && <span className="text-xs text-zinc-600">({documents.length})</span>}
        </TabsTrigger>
      </TabsList>

      {/* RÉSUMÉ */}
      <TabsPrimitive.Content value="resume" className="p-5 space-y-5">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Dossier</h4>
            <dl className="space-y-2 text-sm">
              {[
                { label: 'Référence', value: <span className="font-mono text-zinc-200">{caseData.reference}</span> },
                { label: 'Type', value: <Badge variant="default">{CASE_TYPE_LABELS[caseData.type]}</Badge> },
                {
                  label: 'Statut', value: <Badge variant={
                    caseData.status === 'ouvert' ? 'success' : caseData.status === 'en_cours' ? 'info' :
                    caseData.status === 'cloture' ? 'default' : 'warning'
                  }>{CASE_STATUS_LABELS[caseData.status]}</Badge>
                },
                {
                  label: 'Priorité', value: <Badge variant={
                    caseData.priority === 'urgente' ? 'danger' : caseData.priority === 'haute' ? 'warning' : 'default'
                  }>{CASE_PRIORITY_LABELS[caseData.priority]}</Badge>
                },
                { label: 'Ouvert le', value: <span className="text-zinc-300">{formatDate(caseData.opened_at)}</span> },
                ...(caseData.closed_at ? [{ label: 'Clôturé le', value: <span className="text-zinc-300">{formatDate(caseData.closed_at)}</span> }] : []),
                ...(caseData.estimated_amount ? [{ label: 'Montant estimé', value: <span className="text-zinc-200 font-medium">{formatCurrency(caseData.estimated_amount)}</span> }] : []),
                ...(lawyer ? [{ label: 'Avocat', value: <span className="text-zinc-300">{lawyer.full_name}</span> }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-4">
                  <dt className="text-zinc-500 shrink-0">{label}</dt>
                  <dd className="text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="space-y-3">
            <h4 className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Client</h4>
            {client ? (
              <div className="space-y-2 text-sm">
                <Link href={`/clients/${client.id}`} className="text-violet-400 hover:text-violet-300 font-medium transition-colors block">
                  {clientName}
                </Link>
                {client.email && <a href={`mailto:${client.email}`} className="text-zinc-400 hover:text-violet-400 transition-colors block">{client.email}</a>}
                {client.phone && <a href={`tel:${client.phone}`} className="text-zinc-400 hover:text-violet-400 transition-colors block">{client.phone}</a>}
                {client.city && <p className="text-zinc-500">{[client.address, client.postal_code, client.city].filter(Boolean).join(', ')}</p>}
              </div>
            ) : (
              <p className="text-zinc-600 text-sm">Client non trouvé</p>
            )}
          </div>
        </div>
        {caseData.description && (
          <div className="pt-4 border-t border-zinc-800">
            <h4 className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">Description</h4>
            <p className="text-zinc-300 text-sm leading-relaxed">{caseData.description}</p>
          </div>
        )}
        {caseData.notes && (
          <div className="pt-4 border-t border-zinc-800">
            <h4 className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">Notes internes</h4>
            <p className="text-zinc-400 text-sm leading-relaxed">{caseData.notes}</p>
          </div>
        )}
      </TabsPrimitive.Content>

      {/* RÈGLEMENTS */}
      <TabsPrimitive.Content value="reglements">
        <div className="grid grid-cols-3 border-b border-zinc-800">
          {[
            { label: 'Encaissé', value: formatCurrency(totalPaid), color: 'text-emerald-400', icon: TrendingUp, iconColor: 'text-emerald-400' },
            { label: 'En attente', value: formatCurrency(totalPending), color: 'text-amber-400', icon: Clock, iconColor: 'text-amber-400' },
            { label: remaining !== null ? 'Reste à payer' : 'En retard', value: remaining !== null ? formatCurrency(remaining) : formatCurrency(totalOverdue), color: remaining && remaining > 0 ? 'text-zinc-300' : totalOverdue > 0 ? 'text-red-400' : 'text-zinc-600', icon: AlertCircle, iconColor: totalOverdue > 0 ? 'text-red-400' : 'text-zinc-600' },
          ].map((item, i) => (
            <div key={item.label} className={cn('p-4', i < 2 && 'border-r border-zinc-800')}>
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <item.icon size={11} className={item.iconColor} />{item.label}
              </p>
              <p className={cn('font-semibold text-lg', item.color)}>{item.value}</p>
            </div>
          ))}
        </div>
        <SectionHeader title={`${payments.length} règlement${payments.length !== 1 ? 's' : ''}`} action={<Link href="/payments/new"><Button variant="ghost" size="sm"><Plus size={13} />Ajouter</Button></Link>} />
        <div className="divide-y divide-zinc-800/60">
          {!payments.length ? (
            <EmptyState icon={CreditCard} title="Aucun règlement" description="Ajoutez le premier règlement pour ce dossier." action={<Link href="/payments/new"><Button size="sm"><Plus size={14} />Ajouter</Button></Link>} className="py-8" />
          ) : payments.map(p => (
            <div key={p.id} className="flex items-center gap-4 px-4 py-3 hover:bg-zinc-800/20 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-zinc-200 font-semibold text-sm">{formatCurrency(p.amount)}</p>
                  <span className="text-zinc-600 text-xs">·</span>
                  <span className="text-zinc-500 text-xs">{PAYMENT_METHOD_LABELS[p.payment_method]}</span>
                  {p.reference && <span className="text-zinc-600 text-xs font-mono">#{p.reference}</span>}
                </div>
                <p className="text-zinc-600 text-xs mt-0.5">{formatDate(p.payment_date)}</p>
              </div>
              <Badge variant={PAYMENT_STATUS_VARIANTS[p.status] ?? 'default'}>{PAYMENT_STATUS_LABELS[p.status]}</Badge>
            </div>
          ))}
        </div>
      </TabsPrimitive.Content>

      {/* RENDEZ-VOUS */}
      <TabsPrimitive.Content value="rdv">
        <SectionHeader title={`${appointments.length} rendez-vous`} action={<Link href="/appointments/new"><Button variant="ghost" size="sm"><Plus size={13} />Planifier</Button></Link>} />
        <div className="divide-y divide-zinc-800/60">
          {!appointments.length ? (
            <EmptyState icon={Calendar} title="Aucun rendez-vous" description="Planifiez un rendez-vous pour ce dossier." action={<Link href="/appointments/new"><Button size="sm"><Plus size={14} />Planifier</Button></Link>} className="py-8" />
          ) : appointments.map(a => {
            const date = new Date(a.scheduled_at)
            const isPast = date < new Date()
            return (
              <Link key={a.id} href={`/appointments/${a.id}`} className={cn('flex items-center gap-4 px-4 py-3 hover:bg-zinc-800/20 transition-colors', isPast && a.status === 'prevu' && 'opacity-60')}>
                <div className="w-9 h-9 rounded-lg bg-zinc-800 flex flex-col items-center justify-center shrink-0">
                  <p className="text-zinc-300 text-xs font-bold leading-none">{date.getDate()}</p>
                  <p className="text-zinc-600 text-xs leading-none mt-0.5">{date.toLocaleDateString('fr-FR', { month: 'short' })}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-200 text-sm font-medium">{APPOINTMENT_TYPE_LABELS[a.type as keyof typeof APPOINTMENT_TYPE_LABELS]}</p>
                  <p className="text-zinc-500 text-xs">
                    {date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    {' · '}{APPOINTMENT_LOCATION_LABELS[a.location as keyof typeof APPOINTMENT_LOCATION_LABELS]}
                  </p>
                </div>
                <Badge variant={APPOINTMENT_STATUS_VARIANTS[a.status] ?? 'default'}>{APPOINTMENT_STATUS_LABELS[a.status as keyof typeof APPOINTMENT_STATUS_LABELS]}</Badge>
              </Link>
            )
          })}
        </div>
      </TabsPrimitive.Content>

      {/* COMPTES RENDUS */}
      <TabsPrimitive.Content value="cr">
        <SectionHeader title={`${reports.length} compte${reports.length !== 1 ? 's' : ''} rendu${reports.length !== 1 ? 's' : ''}`} action={<Link href="/reports/new"><Button variant="ghost" size="sm"><Plus size={13} />Rédiger</Button></Link>} />
        <div className="divide-y divide-zinc-800/60">
          {!reports.length ? (
            <EmptyState icon={FileText} title="Aucun compte rendu" description="Rédigez le premier compte rendu pour ce dossier." action={<Link href="/reports/new"><Button size="sm"><Plus size={14} />Rédiger</Button></Link>} className="py-8" />
          ) : reports.map(r => (
            <Link key={r.id} href={`/reports/${r.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-zinc-800/20 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                <FileText size={14} className="text-zinc-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-zinc-200 text-sm font-medium">{REPORT_TYPE_LABELS[r.type as keyof typeof REPORT_TYPE_LABELS]}</p>
                <p className="text-zinc-500 text-xs">{r.profiles?.full_name} · {formatDate(r.created_at)}</p>
              </div>
              <Badge variant={REPORT_STATUS_VARIANTS[r.status] ?? 'default'}>{REPORT_STATUS_LABELS[r.status as keyof typeof REPORT_STATUS_LABELS]}</Badge>
            </Link>
          ))}
        </div>
      </TabsPrimitive.Content>

      {/* DOCUMENTS */}
      <TabsPrimitive.Content value="documents">
        <SectionHeader title={`${documents.length} document${documents.length !== 1 ? 's' : ''}`} />
        <div className="divide-y divide-zinc-800/60">
          {!documents.length ? (
            <EmptyState icon={Paperclip} title="Aucun document" description="Les documents apparaîtront ici une fois Supabase Storage configuré (bucket 'documents')." className="py-8" />
          ) : documents.map(doc => (
            <div key={doc.id} className="flex items-center gap-4 px-4 py-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                <Paperclip size={14} className="text-zinc-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-zinc-200 text-sm font-medium truncate">{doc.name}</p>
                <p className="text-zinc-600 text-xs">{doc.file_size ? `${Math.round(doc.file_size / 1024)} Ko · ` : ''}{formatDate(doc.created_at)}</p>
              </div>
              <a href={doc.file_path} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 text-xs transition-colors shrink-0">
                Télécharger
              </a>
            </div>
          ))}
        </div>
      </TabsPrimitive.Content>
    </TabsPrimitive.Root>
  )
}
