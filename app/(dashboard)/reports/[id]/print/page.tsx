import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { REPORT_TYPE_LABELS, REPORT_STATUS_LABELS, REPORT_VISIBILITY_LABELS } from '@/lib/labels'
import type { Database } from '@/types/database'

type Report = Database['public']['Tables']['reports']['Row']

interface Props {
  params: Promise<{ id: string }>
}

export default async function ReportPrintPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: reportRaw } = await supabase
    .from('reports')
    .select('*, cases(reference, clients(first_name, last_name, company_name)), appointments(type, scheduled_at), profiles!reports_author_id_fkey(full_name)')
    .eq('id', id)
    .single()

  if (!reportRaw) notFound()

  const report = reportRaw as Report & {
    profiles: { full_name: string } | null
    cases: { reference: string; clients: { first_name: string | null; last_name: string | null; company_name: string | null } | null } | null
    appointments: { type: string; scheduled_at: string } | null
  }

  const caseData = report.cases
  const clientName = caseData?.clients?.company_name || `${caseData?.clients?.first_name ?? ''} ${caseData?.clients?.last_name ?? ''}`.trim()
  const typeLabel = REPORT_TYPE_LABELS[report.type as keyof typeof REPORT_TYPE_LABELS] ?? 'Compte rendu'
  const statusLabel = REPORT_STATUS_LABELS[report.status as keyof typeof REPORT_STATUS_LABELS] ?? report.status
  const visibilityLabel = REPORT_VISIBILITY_LABELS[report.visibility as keyof typeof REPORT_VISIBILITY_LABELS] ?? report.visibility

  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{typeLabel} — {caseData?.reference ?? 'Compte rendu'}</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Georgia', serif; font-size: 12pt; color: #1a1a1a; background: #fff; }
          .page { max-width: 210mm; margin: 0 auto; padding: 20mm 20mm 25mm; }
          .header { display: flex; align-items: flex-start; justify-content: space-between; padding-bottom: 16px; border-bottom: 2px solid #1a1a1a; margin-bottom: 24px; }
          .logo { font-size: 22pt; font-weight: 700; letter-spacing: -0.5px; color: #1a1a1a; font-family: 'Helvetica Neue', sans-serif; }
          .logo span { color: #6d28d9; }
          .doc-type { text-align: right; }
          .doc-type h1 { font-size: 14pt; font-weight: 600; color: #1a1a1a; font-family: 'Helvetica Neue', sans-serif; }
          .doc-type p { font-size: 9pt; color: #6b7280; margin-top: 2px; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 28px; }
          .meta-block { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; }
          .meta-block h3 { font-size: 7.5pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #9ca3af; margin-bottom: 8px; font-family: 'Helvetica Neue', sans-serif; }
          .meta-row { display: flex; gap: 6px; margin-bottom: 4px; font-size: 9.5pt; }
          .meta-label { color: #6b7280; min-width: 80px; font-family: 'Helvetica Neue', sans-serif; }
          .meta-value { color: #1a1a1a; font-weight: 500; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 3px; font-size: 8pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; font-family: 'Helvetica Neue', sans-serif; }
          .badge-default { background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; }
          .badge-warning { background: #fffbeb; color: #92400e; border: 1px solid #fcd34d; }
          .badge-info { background: #eff6ff; color: #1e40af; border: 1px solid #93c5fd; }
          .badge-success { background: #f0fdf4; color: #166534; border: 1px solid #86efac; }
          .badge-violet { background: #f5f3ff; color: #5b21b6; border: 1px solid #c4b5fd; }
          .content-section { margin-bottom: 24px; }
          .content-section h2 { font-size: 10pt; font-weight: 600; color: #374151; font-family: 'Helvetica Neue', sans-serif; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 14px; }
          .content-body { font-size: 11pt; line-height: 1.7; color: #1a1a1a; white-space: pre-wrap; text-align: justify; }
          .notes-body { font-size: 9.5pt; line-height: 1.6; color: #4b5563; white-space: pre-wrap; font-family: 'Courier New', monospace; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; padding: 12px; }
          .empty { color: #9ca3af; font-style: italic; font-size: 10pt; }
          .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
          .footer p { font-size: 8pt; color: #9ca3af; font-family: 'Helvetica Neue', sans-serif; }
          .print-bar { position: fixed; bottom: 0; left: 0; right: 0; background: #1a1a2e; border-top: 1px solid #2d2d44; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; z-index: 100; }
          .print-bar p { color: #a1a1aa; font-size: 13px; font-family: 'Helvetica Neue', sans-serif; }
          .print-bar a { color: #a1a1aa; font-size: 13px; font-family: 'Helvetica Neue', sans-serif; text-decoration: none; padding: 6px 12px; border: 1px solid #3f3f5a; border-radius: 6px; }
          .print-bar button { background: #6d28d9; color: #fff; border: none; padding: 8px 18px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Helvetica Neue', sans-serif; }
          .print-bar button:hover { background: #5b21b6; }
          @media print {
            .print-bar { display: none; }
            body { background: #fff; }
            .page { padding: 15mm 20mm 20mm; }
          }
        `}</style>
      </head>
      <body>
        <div className="page">
          {/* Header */}
          <div className="header">
            <div className="logo">NEXIS<span>.</span></div>
            <div className="doc-type">
              <h1>{typeLabel}</h1>
              <p>Généré le {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Meta grid */}
          <div className="meta-grid">
            <div className="meta-block">
              <h3>Dossier & Client</h3>
              {caseData && (
                <div className="meta-row">
                  <span className="meta-label">Référence</span>
                  <span className="meta-value">{caseData.reference}</span>
                </div>
              )}
              {clientName && (
                <div className="meta-row">
                  <span className="meta-label">Client</span>
                  <span className="meta-value">{clientName}</span>
                </div>
              )}
            </div>

            <div className="meta-block">
              <h3>Informations</h3>
              <div className="meta-row">
                <span className="meta-label">Statut</span>
                <span className={`badge badge-${getStatusBadgeClass(report.status)}`}>{statusLabel}</span>
              </div>
              <div className="meta-row" style={{ marginTop: 6 }}>
                <span className="meta-label">Visibilité</span>
                <span className="meta-value">{visibilityLabel}</span>
              </div>
              {report.profiles && (
                <div className="meta-row">
                  <span className="meta-label">Auteur</span>
                  <span className="meta-value">{report.profiles.full_name}</span>
                </div>
              )}
              <div className="meta-row">
                <span className="meta-label">Date</span>
                <span className="meta-value">{formatDate(report.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="content-section">
            <h2>Contenu du compte rendu</h2>
            {report.content ? (
              <div className="content-body">{report.content}</div>
            ) : (
              <p className="empty">Aucun contenu rédigé.</p>
            )}
          </div>

          {/* Raw notes */}
          {report.raw_notes && (
            <div className="content-section">
              <h2>Notes brutes</h2>
              <div className="notes-body">{report.raw_notes}</div>
            </div>
          )}

          {/* Footer */}
          <div className="footer">
            <p>NEXIS — Cabinet juridique</p>
            <p>{typeLabel} · {caseData?.reference ?? '—'} · {formatDate(report.created_at)}</p>
          </div>
        </div>

        {/* Print bar (hidden on print) */}
        <div className="print-bar">
          <p>Aperçu avant impression</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <a href={`/reports/${id}`}>← Retour</a>
            <button onClick={() => window.print()}>Imprimer / Enregistrer en PDF</button>
          </div>
        </div>

        <script dangerouslySetInnerHTML={{ __html: `
          document.querySelector('.print-bar button').addEventListener('click', function() {
            window.print();
          });
        ` }} />
      </body>
    </html>
  )
}

function getStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    brouillon: 'default',
    a_relire: 'warning',
    finalise: 'info',
    valide: 'success',
    archive: 'default',
  }
  return map[status] ?? 'default'
}
