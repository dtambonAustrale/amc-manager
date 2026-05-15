'use client'

import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { reportSchema, type ReportFormData } from '@/lib/validations/report'
import { createReportAction, updateReportAction } from '@/app/actions/reports'
import { FormField } from '@/components/ui/form-field'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { REPORT_TYPE_LABELS, REPORT_STATUS_LABELS, REPORT_VISIBILITY_LABELS } from '@/lib/labels'
import { Sparkles } from 'lucide-react'
import type { Database } from '@/types/database'

type CaseOption = Pick<Database['public']['Tables']['cases']['Row'], 'id' | 'reference'>
type AppointmentOption = Pick<Database['public']['Tables']['appointments']['Row'], 'id' | 'type' | 'scheduled_at'>

interface ReportFormProps {
  defaultValues?: Partial<ReportFormData>
  reportId?: string
  cases: CaseOption[]
  appointments: AppointmentOption[]
  preselectedCaseId?: string
}

const typeOptions = Object.entries(REPORT_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))
const statusOptions = Object.entries(REPORT_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))
const visibilityOptions = Object.entries(REPORT_VISIBILITY_LABELS).map(([v, l]) => ({ value: v, label: l }))

export function ReportForm({ defaultValues, reportId, cases, appointments, preselectedCaseId }: ReportFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)

  const caseOptions = [
    { value: '', label: 'Aucun dossier lié' },
    ...cases.map(c => ({ value: c.id, label: c.reference })),
  ]
  const appointmentOptions = [
    { value: '', label: 'Aucun rendez-vous lié' },
    ...appointments.map(a => ({
      value: a.id,
      label: `${a.type?.replace(/_/g, ' ')} — ${new Date(a.scheduled_at).toLocaleDateString('fr-FR')}`,
    })),
  ]

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema) as Resolver<ReportFormData>,
    defaultValues: {
      type: 'interne',
      status: 'brouillon',
      visibility: 'interne',
      case_id: preselectedCaseId ?? '',
      ...defaultValues,
    },
  })

  const onSubmit = async (data: ReportFormData) => {
    setServerError(null)
    const result = reportId
      ? await updateReportAction(reportId, data)
      : await createReportAction(data)
    if (result?.error) {
      setServerError(Object.values(result.error as Record<string, string[]>).flat()[0] ?? 'Erreur')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
          {serverError}
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h2 className="text-zinc-200 text-sm font-medium">Paramètres du compte rendu</h2>
        <Separator />

        <div className="grid grid-cols-3 gap-4">
          <FormField label="Type" required error={errors.type?.message}>
            <Select {...register('type')} options={typeOptions} value={watch('type')} />
          </FormField>
          <FormField label="Statut" error={errors.status?.message}>
            <Select {...register('status')} options={statusOptions} value={watch('status')} />
          </FormField>
          <FormField label="Visibilité" error={errors.visibility?.message}>
            <Select {...register('visibility')} options={visibilityOptions} value={watch('visibility')} />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Dossier lié" error={errors.case_id?.message}>
            <Select {...register('case_id')} options={caseOptions} value={watch('case_id') ?? ''} />
          </FormField>
          <FormField label="Rendez-vous lié" error={errors.appointment_id?.message}>
            <Select {...register('appointment_id')} options={appointmentOptions} value={watch('appointment_id') ?? ''} />
          </FormField>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-zinc-200 text-sm font-medium">Notes brutes</h2>
          <span className="text-zinc-600 text-xs">Optionnel — vos notes de travail</span>
        </div>
        <Separator />
        <FormField error={errors.raw_notes?.message}>
          <Textarea {...register('raw_notes')} rows={5} placeholder="Notez ici vos notes brutes, points importants, actions à faire..." className="font-mono text-xs" />
        </FormField>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-zinc-200 text-sm font-medium">Compte rendu</h2>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-violet-400 hover:text-violet-300 text-xs transition-colors"
            onClick={() => {
              const notes = watch('raw_notes')
              if (notes) {
                setValue('content', `[IA] Compte rendu généré à partir des notes :\n\n${notes}\n\n[Veuillez éditer ce texte avant de finaliser]`)
              }
            }}
          >
            <Sparkles size={12} />
            Assistance IA (bientôt)
          </button>
        </div>
        <Separator />
        <FormField error={errors.content?.message}>
          <Textarea
            {...register('content')}
            rows={12}
            placeholder="Rédigez le compte rendu ici. Ce contenu sera le document final."
            className="leading-relaxed"
          />
        </FormField>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={() => window.history.back()}>
          Annuler
        </Button>
        <Button
          type="submit"
          variant="secondary"
          isLoading={isSubmitting}
          onClick={() => setValue('status', 'brouillon')}
        >
          Sauvegarder brouillon
        </Button>
        <Button
          type="submit"
          isLoading={isSubmitting}
          onClick={() => setValue('status', 'finalise')}
        >
          Finaliser
        </Button>
      </div>
    </form>
  )
}
