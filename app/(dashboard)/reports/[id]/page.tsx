import { Topbar } from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { formatDate } from '@/lib/utils'
import { REPORT_TYPE_LABELS, REPORT_STATUS_LABELS, REPORT_VISIBILITY_LABELS } from '@/lib/labels'
import { FileText, Eye, User, Calendar, FolderOpen, Printer } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/types/database'

type ReportStatus = Database['public']['Tables']['reports']['Row']['status']
type Report = Database['public']['Tables']['reports']['Row']

interface Props {
  params: Promise<{ id: string }>
}

function getStatusVariant(status: ReportStatus): 'default' | 'warning' | 'info' | 'success' | 'violet' {
  const map: Record<ReportStatus, 'default' | 'warning' | 'info' | 'success' | 'violet'> = {
    brouillon: 'default',
    a_relire: 'warning',
    finalise: 'info',
    valide: 'success',
    archive: 'default',
  }
  return map[status] ?? 'default'
}

export default async function ReportDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: reportRaw } = await supabase
    .from('reports')
    .select('*, cases(reference, client_id, clients(first_name, last_name, company_name)), appointments(type, scheduled_at), profiles!reports_author_id_fkey(full_name)')
    .eq('id', id)
    .single()

  if (!reportRaw) notFound()

  const report = reportRaw as Report & {
    profiles: { full_name: string } | null
    cases: { reference: string; client_id: string; clients: { first_name: string | null; last_name: string | null; company_name: string | null } | null } | null
    appointments: { type: string; scheduled_at: string } | null
  }

  const authorProfile = report.profiles
  const caseData = report.cases
  const clientName = caseData?.clients?.company_name || `${caseData?.clients?.first_name ?? ''} ${caseData?.clients?.last_name ?? ''}`.trim()

  return (
    <div>
      <Topbar title={REPORT_TYPE_LABELS[report.type as keyof typeof REPORT_TYPE_LABELS] ?? 'Compte rendu'} />
      <div className="p-6 max-w-4xl space-y-6">
        <PageHeader
          title={REPORT_TYPE_LABELS[report.type as keyof typeof REPORT_TYPE_LABELS] ?? 'Compte rendu'}
          backHref="/reports"
          backLabel="Comptes rendus"
          actions={
            <div className="flex items-center gap-2">
              {report.status === 'brouillon' || report.status === 'a_relire' ? (
                <Link href={`/reports/${id}/edit`}>
                  <Button variant="secondary" size="sm">Modifier</Button>
                </Link>
              ) : null}
              <Link href={`/reports/${id}/print`} target="_blank">
                <Button variant="ghost" size="sm">
                  <Printer size={13} />
                  Imprimer
                </Button>
              </Link>
            </div>
          }
        />

        <div className="grid grid-cols-3 gap-6">
          {/* Meta info */}
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
              <h3 className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Informations</h3>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={getStatusVariant(report.status)}>
                  {REPORT_STATUS_LABELS[report.status as keyof typeof REPORT_STATUS_LABELS]}
                </Badge>
                <Badge variant="default">
                  <Eye size={10} />
                  {REPORT_VISIBILITY_LABELS[report.visibility as keyof typeof REPORT_VISIBILITY_LABELS]}
                </Badge>
              </div>

              <div className="space-y-2 pt-1 border-t border-zinc-800 text-sm">
                {authorProfile && (
                  <div className="flex items-center gap-2 text-zinc-400">
                    <User size={13} className="text-zinc-600 shrink-0" />
                    {authorProfile.full_name}
                  </div>
                )}
                <div className="flex items-center gap-2 text-zinc-400">
                  <Calendar size={13} className="text-zinc-600 shrink-0" />
                  {formatDate(report.created_at)}
                </div>
                {caseData && (
                  <div className="flex items-center gap-2 text-zinc-400">
                    <FolderOpen size={13} className="text-zinc-600 shrink-0" />
                    <Link href={`/cases/${report.case_id}`} className="hover:text-violet-400 transition-colors">
                      {caseData.reference}
                    </Link>
                  </div>
                )}
                {clientName && (
                  <div className="flex items-center gap-2 text-zinc-400">
                    <User size={13} className="text-zinc-600 shrink-0" />
                    {clientName}
                  </div>
                )}
              </div>
            </div>

            {report.raw_notes && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <h3 className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-3">Notes brutes</h3>
                <p className="text-zinc-500 text-xs font-mono leading-relaxed whitespace-pre-wrap">{report.raw_notes}</p>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-zinc-800">
              <FileText size={14} className="text-violet-400" />
              <h2 className="text-zinc-200 text-sm font-medium">Contenu du compte rendu</h2>
            </div>
            {report.content ? (
              <div className="prose prose-invert prose-sm max-w-none text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {report.content}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText size={20} className="text-zinc-700 mb-3" />
                <p className="text-zinc-600 text-sm">Aucun contenu rédigé</p>
                <Link href={`/reports/${id}/edit`} className="text-violet-400 hover:text-violet-300 text-xs mt-2 transition-colors">
                  Rédiger le compte rendu
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
