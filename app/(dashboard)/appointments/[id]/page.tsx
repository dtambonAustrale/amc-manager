import { Topbar } from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { notFound } from 'next/navigation'
import { ArrowLeft, User, Calendar, MapPin, Clock, FileText } from 'lucide-react'
import Link from 'next/link'
import {
  APPOINTMENT_TYPE_LABELS, APPOINTMENT_STATUS_LABELS, APPOINTMENT_LOCATION_LABELS
} from '@/lib/labels'
import type { Database } from '@/types/database'

type AppointmentStatus = Database['public']['Tables']['appointments']['Row']['status']

const STATUS_VARIANTS: Record<AppointmentStatus, 'success' | 'warning' | 'danger' | 'default' | 'violet'> = {
  prevu: 'violet', realise: 'success', annule: 'danger', reporte: 'warning', absent: 'danger', a_confirmer: 'warning',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function AppointmentDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: aptRaw } = await supabase
    .from('appointments')
    .select('*, clients(id, first_name, last_name, company_name, email, phone), cases(id, reference)')
    .eq('id', id)
    .single()

  if (!aptRaw) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apt = aptRaw as any
  const client = apt.clients as { id: string; first_name: string | null; last_name: string | null; company_name: string | null; email: string | null; phone: string | null } | null
  const caseData = apt.cases as { id: string; reference: string } | null
  const clientName = client?.company_name || `${client?.first_name ?? ''} ${client?.last_name ?? ''}`.trim()
  const date = new Date(apt.scheduled_at)

  return (
    <div>
      <Topbar title={APPOINTMENT_TYPE_LABELS[apt.type as keyof typeof APPOINTMENT_TYPE_LABELS]} />
      <div className="p-6 space-y-6 max-w-3xl">
        <Link href="/appointments" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
          <ArrowLeft size={14} />
          Retour aux rendez-vous
        </Link>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-zinc-100 font-semibold text-lg">
                {APPOINTMENT_TYPE_LABELS[apt.type as keyof typeof APPOINTMENT_TYPE_LABELS]}
              </h1>
              <p className="text-zinc-500 text-sm mt-0.5">
                {date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <Badge variant={STATUS_VARIANTS[apt.status as AppointmentStatus] ?? 'default'}>
              {APPOINTMENT_STATUS_LABELS[apt.status as keyof typeof APPOINTMENT_STATUS_LABELS]}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-800">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={14} className="text-zinc-500 shrink-0" />
                <div>
                  <p className="text-zinc-400 text-xs mb-0.5">Date &amp; Heure</p>
                  <p className="text-zinc-200">
                    {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} à {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock size={14} className="text-zinc-500 shrink-0" />
                <div>
                  <p className="text-zinc-400 text-xs mb-0.5">Durée</p>
                  <p className="text-zinc-200">{apt.duration_minutes} min</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin size={14} className="text-zinc-500 shrink-0" />
                <div>
                  <p className="text-zinc-400 text-xs mb-0.5">Lieu</p>
                  <p className="text-zinc-200">{APPOINTMENT_LOCATION_LABELS[apt.location as keyof typeof APPOINTMENT_LOCATION_LABELS]}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {client && (
                <div className="flex items-center gap-3 text-sm">
                  <User size={14} className="text-zinc-500 shrink-0" />
                  <div>
                    <p className="text-zinc-400 text-xs mb-0.5">Client</p>
                    <Link href={`/clients/${client.id}`} className="text-violet-400 hover:text-violet-300 transition-colors">{clientName}</Link>
                    {client.phone && <p className="text-zinc-500 text-xs">{client.phone}</p>}
                  </div>
                </div>
              )}
              {caseData && (
                <div className="flex items-center gap-3 text-sm">
                  <FileText size={14} className="text-zinc-500 shrink-0" />
                  <div>
                    <p className="text-zinc-400 text-xs mb-0.5">Dossier</p>
                    <Link href={`/cases/${caseData.id}`} className="text-violet-400 hover:text-violet-300 font-mono transition-colors">{caseData.reference}</Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {apt.notes && (
            <div className="pt-4 border-t border-zinc-800">
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">Notes de préparation</p>
              <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{apt.notes}</p>
            </div>
          )}

          <div className="pt-4 border-t border-zinc-800 flex items-center gap-2">
            <Link href={`/reports/new`}>
              <Button variant="secondary" size="sm">
                <FileText size={13} />
                Rédiger un compte rendu
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
