import { Topbar } from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { notFound } from 'next/navigation'
import { ArrowLeft, Mail, Phone, MapPin, FileText, Pencil } from 'lucide-react'
import Link from 'next/link'
import { archiveClientAction } from '@/app/actions/clients'
import { CLIENT_TYPE_LABELS, CLIENT_STATUS_LABELS, CASE_STATUS_LABELS, CASE_PRIORITY_LABELS } from '@/lib/labels'
import type { Database } from '@/types/database'

type Client = Database['public']['Tables']['clients']['Row']
type Case = Database['public']['Tables']['cases']['Row']

interface Props {
  params: Promise<{ id: string }>
}

const STATUS_VARIANTS = { actif: 'success', inactif: 'warning', 'archivé': 'default' } as const
const CASE_STATUS_VARIANTS: Record<string, 'success' | 'info' | 'warning' | 'default' | 'violet'> = {
  ouvert: 'success', en_cours: 'info', en_attente: 'warning', a_completer: 'warning',
  rdv_prevu: 'violet', attente_reglement: 'warning', cloture: 'default', archive: 'default',
}
const PRIORITY_VARIANTS: Record<string, 'danger' | 'warning' | 'default'> = {
  urgente: 'danger', haute: 'warning', normale: 'default', basse: 'default',
}

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: clientRaw } = await supabase.from('clients').select('*').eq('id', id).single()
  if (!clientRaw) notFound()
  const client = clientRaw as Client

  const { data: casesRaw } = await supabase
    .from('cases')
    .select('*')
    .eq('client_id', id)
    .order('created_at', { ascending: false })
  const cases = (casesRaw ?? []) as Case[]

  const activeCases = cases.filter(c => c.status !== 'cloture' && c.status !== 'archive')
  const clientName = client.company_name || `${client.first_name ?? ''} ${client.last_name ?? ''}`.trim()

  return (
    <div>
      <Topbar title={clientName}>
        <div className="flex items-center gap-2 ml-4">
          <Link href={`/clients/${id}/edit`}>
            <Button variant="secondary" size="sm">
              <Pencil size={13} />
              Modifier
            </Button>
          </Link>
          {client.status !== 'archivé' && (
            <form action={archiveClientAction.bind(null, id)}>
              <Button variant="ghost" size="sm" type="submit" className="text-zinc-500 hover:text-red-400">
                Archiver
              </Button>
            </form>
          )}
        </div>
      </Topbar>

      <div className="p-6 space-y-6">
        <Link href="/clients" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
          <ArrowLeft size={14} />
          Retour aux clients
        </Link>

        <div className="grid grid-cols-3 gap-6">
          {/* Infos client */}
          <div className="col-span-1 space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-zinc-100 font-semibold text-lg">{clientName}</h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="default">{CLIENT_TYPE_LABELS[client.type]}</Badge>
                    <Badge variant={STATUS_VARIANTS[client.status] ?? 'default'}>{CLIENT_STATUS_LABELS[client.status]}</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-zinc-800">
                {client.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail size={14} className="text-zinc-500 shrink-0" />
                    <a href={`mailto:${client.email}`} className="text-zinc-300 hover:text-violet-400 transition-colors">{client.email}</a>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone size={14} className="text-zinc-500 shrink-0" />
                    <a href={`tel:${client.phone}`} className="text-zinc-300 hover:text-violet-400 transition-colors">{client.phone}</a>
                  </div>
                )}
                {(client.address || client.city) && (
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin size={14} className="text-zinc-500 shrink-0 mt-0.5" />
                    <span className="text-zinc-300">
                      {[client.address, client.postal_code, client.city].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {client.notes && (
                <div className="pt-3 border-t border-zinc-800">
                  <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">Notes internes</p>
                  <p className="text-zinc-400 text-sm leading-relaxed">{client.notes}</p>
                </div>
              )}

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-600">
                <span>Créé le {formatDate(client.created_at)}</span>
                <span>{activeCases.length} dossier{activeCases.length !== 1 ? 's' : ''} actif{activeCases.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {/* Dossiers */}
          <div className="col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <h2 className="text-zinc-200 text-sm font-medium flex items-center gap-2">
                <FileText size={14} className="text-violet-400" />
                Dossiers ({cases.length})
              </h2>
              <Link href={`/cases/new`}>
                <Button variant="ghost" size="sm">+ Nouveau dossier</Button>
              </Link>
            </div>
            <div className="divide-y divide-zinc-800/60">
              {!cases.length ? (
                <div className="px-4 py-10 text-center text-zinc-600 text-sm">
                  Aucun dossier pour ce client
                </div>
              ) : (
                cases.map((c) => (
                  <Link key={c.id} href={`/cases/${c.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-zinc-800/30 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-zinc-200 text-sm font-medium font-mono">{c.reference}</span>
                        <Badge variant={PRIORITY_VARIANTS[c.priority] ?? 'default'} className="text-xs">{CASE_PRIORITY_LABELS[c.priority]}</Badge>
                      </div>
                      <p className="text-zinc-500 text-xs">{c.description?.slice(0, 60) || c.type?.replace(/_/g, ' ')}</p>
                    </div>
                    <Badge variant={CASE_STATUS_VARIANTS[c.status] ?? 'default'}>{CASE_STATUS_LABELS[c.status]}</Badge>
                    <span className="text-zinc-600 text-xs shrink-0">{formatDate(c.opened_at)}</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
