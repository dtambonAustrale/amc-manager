'use client'

import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { appointmentSchema, type AppointmentFormData } from '@/lib/validations/appointment'
import { createAppointmentAction } from '@/app/actions/appointments'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  APPOINTMENT_TYPE_LABELS, APPOINTMENT_STATUS_LABELS, APPOINTMENT_LOCATION_LABELS
} from '@/lib/labels'
import type { Database } from '@/types/database'

type Client = Pick<Database['public']['Tables']['clients']['Row'], 'id' | 'first_name' | 'last_name' | 'company_name'>
type CaseOption = Pick<Database['public']['Tables']['cases']['Row'], 'id' | 'reference' | 'client_id'>

interface AppointmentFormProps {
  clients: Client[]
  cases: CaseOption[]
  preselectedClientId?: string
  preselectedCaseId?: string
}

const typeOptions = Object.entries(APPOINTMENT_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))
const statusOptions = Object.entries(APPOINTMENT_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))
const locationOptions = Object.entries(APPOINTMENT_LOCATION_LABELS).map(([v, l]) => ({ value: v, label: l }))
const durationOptions = [
  { value: '30', label: '30 min' },
  { value: '60', label: '1 heure' },
  { value: '90', label: '1h30' },
  { value: '120', label: '2 heures' },
  { value: '180', label: '3 heures' },
]

export function AppointmentForm({ clients, cases, preselectedClientId, preselectedCaseId }: AppointmentFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)

  const clientOptions = clients.map(c => ({
    value: c.id,
    label: c.company_name || `${c.first_name ?? ''} ${c.last_name ?? ''}`.trim(),
  }))

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema) as Resolver<AppointmentFormData>,
    defaultValues: {
      type: 'rdv_avocat',
      status: 'prevu',
      location: 'cabinet',
      duration_minutes: 60,
      scheduled_at: '',
      client_id: preselectedClientId ?? '',
      case_id: preselectedCaseId ?? '',
      send_confirmation: false,
    },
  })

  const selectedClientId = watch('client_id')
  const filteredCases = cases.filter(c => !selectedClientId || c.client_id === selectedClientId)
  const caseOptions = [
    { value: '', label: 'Aucun dossier lié' },
    ...filteredCases.map(c => ({ value: c.id, label: c.reference })),
  ]

  const onSubmit = async (data: AppointmentFormData) => {
    setServerError(null)
    const result = await createAppointmentAction(data)
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
        <h2 className="text-zinc-200 text-sm font-medium">Informations du rendez-vous</h2>
        <Separator />

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Client" required error={errors.client_id?.message}>
            <Select
              {...register('client_id')}
              options={[{ value: '', label: 'Sélectionner un client' }, ...clientOptions]}
              value={selectedClientId}
              onChange={e => {
                setValue('client_id', e.target.value)
                setValue('case_id', '')
              }}
            />
          </FormField>
          <FormField label="Dossier lié" error={errors.case_id?.message}>
            <Select
              {...register('case_id')}
              options={caseOptions}
              value={watch('case_id') ?? ''}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField label="Type" required error={errors.type?.message}>
            <Select {...register('type')} options={typeOptions} value={watch('type')} />
          </FormField>
          <FormField label="Statut" error={errors.status?.message}>
            <Select {...register('status')} options={statusOptions} value={watch('status')} />
          </FormField>
          <FormField label="Lieu" error={errors.location?.message}>
            <Select {...register('location')} options={locationOptions} value={watch('location')} />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Date et heure" required error={errors.scheduled_at?.message}>
            <Input {...register('scheduled_at')} type="datetime-local" />
          </FormField>
          <FormField label="Durée" error={errors.duration_minutes?.message}>
            <Select
              {...register('duration_minutes', { valueAsNumber: true })}
              options={durationOptions}
              value={String(watch('duration_minutes'))}
            />
          </FormField>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h2 className="text-zinc-200 text-sm font-medium">Notes de préparation</h2>
        <Separator />
        <FormField error={errors.notes?.message}>
          <Textarea {...register('notes')} rows={4} placeholder="Notes pour préparer ce rendez-vous..." />
        </FormField>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" {...register('send_confirmation')} className="rounded border-zinc-700 bg-zinc-900 text-violet-500 focus:ring-violet-500" />
          <span className="text-zinc-400 text-sm">Envoyer un email de confirmation au client</span>
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={() => window.history.back()}>
          Annuler
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Créer le rendez-vous
        </Button>
      </div>
    </form>
  )
}
