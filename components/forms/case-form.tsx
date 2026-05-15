'use client'

import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { caseSchema, type CaseFormData } from '@/lib/validations/case'
import { createCaseAction, updateCaseAction } from '@/app/actions/cases'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  CASE_TYPE_LABELS, CASE_STATUS_LABELS, CASE_PRIORITY_LABELS
} from '@/lib/labels'
import type { Database } from '@/types/database'

type Client = Pick<Database['public']['Tables']['clients']['Row'], 'id' | 'first_name' | 'last_name' | 'company_name'>
type Profile = Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'full_name' | 'role'>

interface CaseFormProps {
  defaultValues?: Partial<CaseFormData>
  caseId?: string
  clients: Client[]
  lawyers: Profile[]
  preselectedClientId?: string
}

const typeOptions = Object.entries(CASE_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))
const statusOptions = Object.entries(CASE_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))
const priorityOptions = Object.entries(CASE_PRIORITY_LABELS).map(([v, l]) => ({ value: v, label: l }))

function generateReference() {
  const year = new Date().getFullYear()
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `DOS-${year}-${rand}`
}

export function CaseForm({ defaultValues, caseId, clients, lawyers, preselectedClientId }: CaseFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)

  const clientOptions = clients.map(c => ({
    value: c.id,
    label: c.company_name || `${c.first_name ?? ''} ${c.last_name ?? ''}`.trim(),
  }))

  const lawyerOptions = [
    { value: '', label: 'Aucun avocat assigné' },
    ...lawyers.map(l => ({ value: l.id, label: l.full_name })),
  ]

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CaseFormData>({
    resolver: zodResolver(caseSchema) as Resolver<CaseFormData>,
    defaultValues: {
      type: 'autre',
      status: 'ouvert',
      priority: 'normale',
      opened_at: new Date().toISOString().split('T')[0],
      reference: generateReference(),
      client_id: preselectedClientId ?? '',
      ...defaultValues,
    },
  })

  const onSubmit = async (data: CaseFormData) => {
    setServerError(null)
    const result = caseId
      ? await updateCaseAction(caseId, data)
      : await createCaseAction(data)

    if (result?.error) {
      const errs = result.error as Record<string, string[]>
      setServerError(Object.values(errs).flat()[0] ?? 'Une erreur est survenue')
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
        <h2 className="text-zinc-200 text-sm font-medium">Informations du dossier</h2>
        <Separator />

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Référence" required error={errors.reference?.message}>
            <Input {...register('reference')} placeholder="DOS-2025-0001" className="font-mono" />
          </FormField>
          <FormField label="Client" required error={errors.client_id?.message}>
            <Select
              {...register('client_id')}
              options={clientOptions}
              placeholder="Sélectionner un client"
              value={watch('client_id')}
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
          <FormField label="Priorité" error={errors.priority?.message}>
            <Select {...register('priority')} options={priorityOptions} value={watch('priority')} />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Avocat assigné" error={errors.lawyer_id?.message}>
            <Select
              {...register('lawyer_id')}
              options={lawyerOptions}
              value={watch('lawyer_id') ?? ''}
            />
          </FormField>
          <FormField label="Montant estimé (€)" error={errors.estimated_amount?.message}>
            <Input
              {...register('estimated_amount', { valueAsNumber: true })}
              type="number"
              step="0.01"
              placeholder="0.00"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Date d'ouverture" required error={errors.opened_at?.message}>
            <Input {...register('opened_at')} type="date" />
          </FormField>
          <FormField label="Date de clôture" error={errors.closed_at?.message}>
            <Input {...register('closed_at')} type="date" />
          </FormField>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h2 className="text-zinc-200 text-sm font-medium">Description & Notes</h2>
        <Separator />
        <FormField label="Description / Objet du dossier" error={errors.description?.message}>
          <Textarea {...register('description')} rows={3} placeholder="Objet du dossier..." />
        </FormField>
        <FormField label="Notes internes" error={errors.notes?.message}>
          <Textarea {...register('notes')} rows={3} placeholder="Notes internes..." />
        </FormField>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={() => window.history.back()}>
          Annuler
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {caseId ? 'Enregistrer les modifications' : 'Créer le dossier'}
        </Button>
      </div>
    </form>
  )
}
