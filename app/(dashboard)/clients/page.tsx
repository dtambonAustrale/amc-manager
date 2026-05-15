import { Topbar } from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/types/database'

type Client = Database['public']['Tables']['clients']['Row']

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: clientsRaw } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })
  const clients = (clientsRaw ?? []) as Client[]

  return (
    <div>
      <Topbar title="Clients">
        <div className="flex items-center gap-3 ml-4">
          <Link href="/clients/new">
            <Button size="sm">
              <Plus size={14} />
              Nouveau client
            </Button>
          </Link>
        </div>
      </Topbar>

      <div className="p-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-1.5">
              <Search size={14} className="text-zinc-500" />
              <input placeholder="Rechercher un client..." className="bg-transparent text-sm text-zinc-300 placeholder-zinc-600 outline-none flex-1 min-w-0" />
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                {['Client', 'Type', 'Email', 'Téléphone', 'Statut', 'Créé le'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-zinc-500 text-xs font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {!clients?.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-600 text-sm">
                    Aucun client pour le moment
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-4 py-3">
                      <Link href={`/clients/${client.id}`} className="text-zinc-200 text-sm font-medium hover:text-violet-400 transition-colors">
                        {client.company_name || `${client.first_name} ${client.last_name}`}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="default">{client.type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-sm">{client.email || '—'}</td>
                    <td className="px-4 py-3 text-zinc-500 text-sm">{client.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={client.status === 'actif' ? 'success' : client.status === 'archivé' ? 'default' : 'warning'}>
                        {client.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-sm">{formatDate(client.created_at)}</td>
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
