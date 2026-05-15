import { Topbar } from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { Plus, Search, FolderOpen } from 'lucide-react'
import Link from 'next/link'

export default async function CasesPage() {
  const supabase = await createClient()
  const { data: cases } = await supabase
    .from('cases')
    .select('*, clients(first_name, last_name, company_name)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <Topbar title="Dossiers">
        <div className="flex items-center gap-3 ml-4">
          <Link href="/cases/new">
            <Button size="sm">
              <Plus size={14} />
              Nouveau dossier
            </Button>
          </Link>
        </div>
      </Topbar>

      <div className="p-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-1.5">
              <Search size={14} className="text-zinc-500" />
              <input placeholder="Rechercher un dossier..." className="bg-transparent text-sm text-zinc-300 placeholder-zinc-600 outline-none flex-1 min-w-0" />
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                {['Référence', 'Client', 'Type', 'Priorité', 'Statut', 'Ouvert le'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-zinc-500 text-xs font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {!cases?.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-600 text-sm">
                    <FolderOpen size={24} className="mx-auto mb-2 text-zinc-700" />
                    Aucun dossier pour le moment
                  </td>
                </tr>
              ) : (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                cases.map((c: any) => (
                  <tr key={c.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-4 py-3">
                      <Link href={`/cases/${c.id}`} className="text-zinc-200 text-sm font-medium font-mono hover:text-violet-400 transition-colors">
                        {c.reference}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-sm">
                      {c.clients?.company_name || `${c.clients?.first_name} ${c.clients?.last_name}`}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="default">{c.type?.replace(/_/g, ' ')}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={
                        c.priority === 'urgente' ? 'danger' :
                        c.priority === 'haute' ? 'warning' :
                        c.priority === 'normale' ? 'info' :
                        'default'
                      }>{c.priority}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={
                        c.status === 'cloture' ? 'default' :
                        c.status === 'en_cours' ? 'info' :
                        c.status === 'ouvert' ? 'success' :
                        'warning'
                      }>{c.status?.replace(/_/g, ' ')}</Badge>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-sm">{formatDate(c.opened_at)}</td>
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
