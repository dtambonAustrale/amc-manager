import { Topbar } from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { Plus, Search, FileText } from 'lucide-react'
import Link from 'next/link'

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: reports } = await supabase
    .from('reports')
    .select('*, cases(reference), profiles!author_id(full_name)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <Topbar title="Comptes rendus">
        <div className="flex items-center gap-3 ml-4">
          <Link href="/reports/new">
            <Button size="sm">
              <Plus size={14} />
              Nouveau compte rendu
            </Button>
          </Link>
        </div>
      </Topbar>

      <div className="p-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-1.5">
              <Search size={14} className="text-zinc-500" />
              <input placeholder="Rechercher un compte rendu..." className="bg-transparent text-sm text-zinc-300 placeholder-zinc-600 outline-none flex-1 min-w-0" />
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                {['Dossier', 'Type', 'Auteur', 'Visibilité', 'Statut', 'Créé le'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-zinc-500 text-xs font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {!reports?.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-600 text-sm">
                    <FileText size={24} className="mx-auto mb-2 text-zinc-700" />
                    Aucun compte rendu pour le moment
                  </td>
                </tr>
              ) : (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                reports.map((r: any) => (
                  <tr key={r.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-4 py-3">
                      {r.cases?.reference ? (
                        <Link href={`/cases/${r.case_id}`} className="text-zinc-400 font-mono text-xs hover:text-violet-400 transition-colors">
                          {r.cases.reference}
                        </Link>
                      ) : (
                        <span className="text-zinc-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="violet">{r.type?.replace(/_/g, ' ')}</Badge>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-sm">
                      {r.profiles?.full_name ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={
                        r.visibility === 'tous' ? 'success' :
                        r.visibility === 'avocat' ? 'info' :
                        'default'
                      }>{r.visibility}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={
                        r.status === 'valide' ? 'success' :
                        r.status === 'finalise' ? 'info' :
                        r.status === 'a_relire' ? 'warning' :
                        r.status === 'archive' ? 'default' :
                        'outline'
                      }>{r.status?.replace(/_/g, ' ')}</Badge>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-sm">{formatDate(r.created_at)}</td>
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
