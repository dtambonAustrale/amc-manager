import { Topbar } from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { notFound } from 'next/navigation'
import { ArrowLeft, Mail, Phone, MapPin, FileText } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/types/database'

type Client = Database['public']['Tables']['clients']['Row']
type Case = Database['public']['Tables']['cases']['Row']

interface Props {
  params: Promise<{ id: string }>
}

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: clientRaw } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (!clientRaw) notFound()
  const client = clientRaw as Client

  const { data: casesRaw } = await supabase
    .from('cases')
    .select('*')
    .eq('client_id', id)
    .order('created_at', { ascending: false })
  const cases = (casesRaw ?? []) as Case[]

  const clientName = client.company_name || `${client.first_name ?? ''} ${client.last_name ?? ''}`.trim()

  return (
    <div>
      <Topbar title={clientName} />
      <div className="p-6 space-y-6">
        {/* Back link */}
        <Link href="/clients" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
          <ArrowLeft size={14} />
          Retour aux clients
        </Link>

        <div className="grid grid-cols-3 gap-6">
          {/* Client info */}
          <div className="col-span-1 bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-zinc-100 font-semibold text-lg">{clientName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="default">{client.type}</Badge>
                  <Badge variant={client.status === 'actif' ? 'success' : 'default'}>{client.status}</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-zinc-800">
              {client.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={14} className="text-zinc-500 shrink-0" />
                  <span className="text-zinc-300">{client.email}</span>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={14} className="text-zinc-500 shrink-0" />
                  <span className="text-zinc-300">{client.phone}</span>
                </div>
              )}
              {client.address && (
                <div className="flex items-start gap-3 text-sm">
                  <MapPin size={14} className="text-zinc-500 shrink-0 mt-0.5" />
                  <span className="text-zinc-300">
                    {client.address}
                    {client.postal_code && `, ${client.postal_code}`}
                    {client.city && ` ${client.city}`}
                  </span>
                </div>
              )}
            </div>

            {client.notes && (
              <div className="pt-2 border-t border-zinc-800">
                <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">Notes</p>
                <p className="text-zinc-400 text-sm leading-relaxed">{client.notes}</p>
              </div>
            )}

            <div className="pt-2 border-t border-zinc-800 text-xs text-zinc-600">
              Créé le {formatDate(client.created_at)}
            </div>
          </div>

          {/* Cases */}
          <div className="col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <h2 className="text-zinc-200 text-sm font-medium flex items-center gap-2">
                <FileText size={14} className="text-violet-400" />
                Dossiers ({cases?.length ?? 0})
              </h2>
            </div>
            <div className="divide-y divide-zinc-800/60">
              {!cases?.length ? (
                <div className="px-4 py-8 text-center text-zinc-600 text-sm">
                  Aucun dossier pour ce client
                </div>
              ) : (
                cases.map((c: Case) => (
                  <Link
                    key={c.id}
                    href={`/cases/${c.id}`}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-zinc-200 text-sm font-medium">{c.reference}</span>
                        <Badge variant={
                          c.priority === 'urgente' ? 'danger' :
                          c.priority === 'haute' ? 'warning' :
                          'default'
                        }>{c.priority}</Badge>
                      </div>
                      <p className="text-zinc-500 text-xs">{c.type?.replace(/_/g, ' ')}</p>
                    </div>
                    <Badge variant={
                      c.status === 'cloture' ? 'default' :
                      c.status === 'en_cours' ? 'info' :
                      c.status === 'ouvert' ? 'success' :
                      'warning'
                    }>{c.status?.replace(/_/g, ' ')}</Badge>
                    <span className="text-zinc-600 text-xs">{formatDate(c.created_at)}</span>
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
