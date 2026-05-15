import { Topbar } from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { notFound } from 'next/navigation'
import { ArrowLeft, Pencil } from 'lucide-react'
import Link from 'next/link'
import { CaseTabs } from '@/components/dashboard/case-tabs'
import { CASE_STATUS_LABELS } from '@/lib/labels'
import type { Database } from '@/types/database'

type CaseStatus = Database['public']['Tables']['cases']['Row']['status']

const STATUS_VARIANTS: Record<CaseStatus, 'success' | 'info' | 'warning' | 'default' | 'violet'> = {
  ouvert: 'success', en_cours: 'info', en_attente: 'warning', a_completer: 'warning',
  rdv_prevu: 'violet', attente_reglement: 'warning', cloture: 'default', archive: 'default',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function CaseDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: caseRaw },
    { data: payments },
    { data: appointments },
    { data: reports },
    { data: documents },
  ] = await Promise.all([
    supabase.from('cases').select('*, clients(*), profiles!cases_lawyer_id_fkey(*)').eq('id', id).single(),
    supabase.from('payments').select('*').eq('case_id', id).order('payment_date', { ascending: false }),
    supabase.from('appointments').select('*').eq('case_id', id).order('scheduled_at', { ascending: false }),
    supabase.from('reports').select('*, profiles!reports_author_id_fkey(full_name)').eq('case_id', id).order('created_at', { ascending: false }),
    supabase.from('documents').select('*').eq('case_id', id).order('created_at', { ascending: false }),
  ])

  if (!caseRaw) notFound()

  const caseData = caseRaw as Database['public']['Tables']['cases']['Row']
  const client = (caseRaw as any).clients as Database['public']['Tables']['clients']['Row'] | null
  const lawyer = (caseRaw as any).profiles as Database['public']['Tables']['profiles']['Row'] | null

  return (
    <div>
      <Topbar title={`Dossier ${caseData.reference}`}>
        <div className="flex items-center gap-2 ml-4">
          <Badge variant={STATUS_VARIANTS[caseData.status]}>
            {CASE_STATUS_LABELS[caseData.status]}
          </Badge>
          <Link href={`/cases/${id}/edit`}>
            <Button variant="secondary" size="sm">
              <Pencil size={13} />
              Modifier
            </Button>
          </Link>
        </div>
      </Topbar>

      <div className="p-6 space-y-4">
        <Link href="/cases" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
          <ArrowLeft size={14} />
          Retour aux dossiers
        </Link>

        <CaseTabs
          caseData={caseData}
          client={client}
          lawyer={lawyer}
          payments={(payments ?? []) as Database['public']['Tables']['payments']['Row'][]}
          appointments={(appointments ?? []) as Database['public']['Tables']['appointments']['Row'][]}
          reports={(reports ?? []) as any}
          documents={(documents ?? []) as Database['public']['Tables']['documents']['Row'][]}
        />
      </div>
    </div>
  )
}
