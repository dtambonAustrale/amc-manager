'use client'

import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { paymentSchema, type PaymentFormData } from '@/lib/validations/payment'
import { createPaymentAction } from '@/app/actions/payments'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/labels'

type CaseOption = {
  id: string
  reference: string
  client_id: string
  clients: { first_name: string | null; last_name: string | null; company_name: string | null } | null
}

interface PaymentFormProps {
  cases: CaseOption[]
  preselectedCaseId?: string
}

const methodOptions = Object.entries(PAYMENT_METHOD_LABELS).map(([v, l]) => ({ value: v, label: l }))
const statusOptions = Object.entries(PAYMENT_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))

export function PaymentForm({ cases, preselectedCaseId }: PaymentFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)

  const caseOptions = cases.map(c => {
    const clientName = c.clients?.company_name || `${c.clients?.first_name ?? ''} ${c.clients?.last_name ?? ''}`.trim()
    return { value: c.id, label: `${c.reference} — ${clientName}` }
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema) as Resolver<PaymentFormData>,
    defaultValues: {
      payment_method: 'virement',
      status: 'en_attente',
      payment_date: new Date().toISOString().split('T')[0],
      case_id: preselectedCaseId ?? '',
      client_id: '',
    },
  })

  const selectedCaseId = watch('case_id')

  const handleCaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = cases.find(c => c.id === e.target.value)
    if (selected) {
      setValue('case_id', selected.id)
      setValue('client_id', selected.client_id)
    }
  }

  const onSubmit = async (data: PaymentFormData) => {
    setServerError(null)
    const result = await createPaymentAction(data)
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
        <h2 className="text-zinc-200 text-sm font-medium">Informations du règlement</h2>
        <Separator />

        <FormField label="Dossier" required error={errors.case_id?.message}>
          <Select
            {...register('case_id')}
            onChange={handleCaseChange}
            options={caseOptions}
            placeholder="Sélectionner un dossier"
            value={selectedCaseId}
          />
        </FormField>
        <input type="hidden" {...register('client_id')} />

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Montant (€)" required error={errors.amount?.message}>
            <Input
              {...register('amount', { valueAsNumber: true })}
              type="number"
              step="0.01"
              placeholder="0.00"
            />
          </FormField>
          <FormField label="Date du règlement" required error={errors.payment_date?.message}>
            <Input {...register('payment_date')} type="date" />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Mode de paiement" error={errors.payment_method?.message}>
            <Select {...register('payment_method')} options={methodOptions} value={watch('payment_method')} />
          </FormField>
          <FormField label="Statut" error={errors.status?.message}>
            <Select {...register('status')} options={statusOptions} value={watch('status')} />
          </FormField>
        </div>

        <FormField label="Référence paiement" error={errors.reference?.message} hint="Numéro de chèque, référence virement...">
          <Input {...register('reference')} placeholder="REF-2025-001" />
        </FormField>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h2 className="text-zinc-200 text-sm font-medium">Notes</h2>
        <Separator />
        <FormField error={errors.notes?.message}>
          <Textarea {...register('notes')} rows={3} placeholder="Notes sur ce règlement..." />
        </FormField>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={() => window.history.back()}>
          Annuler
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Enregistrer le règlement
        </Button>
      </div>
    </form>
  )
}
