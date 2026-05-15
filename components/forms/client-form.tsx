'use client'

import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { clientSchema, type ClientFormData } from '@/lib/validations/client'
import { createClientAction, updateClientAction } from '@/app/actions/clients'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CLIENT_TYPE_LABELS, CLIENT_STATUS_LABELS } from '@/lib/labels'
import type { Database } from '@/types/database'

type ClientType = Database['public']['Tables']['clients']['Row']['type']

interface ClientFormProps {
  defaultValues?: Partial<ClientFormData>
  clientId?: string
}

const typeOptions = Object.entries(CLIENT_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))
const statusOptions = Object.entries(CLIENT_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))

export function ClientForm({ defaultValues, clientId }: ClientFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema) as Resolver<ClientFormData>,
    defaultValues: {
      type: 'particulier',
      status: 'actif',
      ...defaultValues,
    },
  })

  const clientType = watch('type') as ClientType
  const isCompany = clientType === 'entreprise' || clientType === 'association'

  const onSubmit = async (data: ClientFormData) => {
    setServerError(null)
    const result = clientId
      ? await updateClientAction(clientId, data)
      : await createClientAction(data)

    if (result?.error) {
      const errs = result.error as Record<string, string[]>
      const firstError = Object.values(errs).flat()[0]
      setServerError(firstError ?? 'Une erreur est survenue')
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
        <h2 className="text-zinc-200 text-sm font-medium">Informations générales</h2>
        <Separator />

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Type de client" required error={errors.type?.message}>
            <Select
              {...register('type')}
              options={typeOptions}
              value={watch('type')}
            />
          </FormField>
          <FormField label="Statut" error={errors.status?.message}>
            <Select
              {...register('status')}
              options={statusOptions}
              value={watch('status')}
            />
          </FormField>
        </div>

        {isCompany ? (
          <FormField label="Raison sociale" required error={errors.company_name?.message}>
            <Input {...register('company_name')} placeholder="Société ABC" />
          </FormField>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Prénom" error={errors.first_name?.message}>
              <Input {...register('first_name')} placeholder="Jean" />
            </FormField>
            <FormField label="Nom" error={errors.last_name?.message}>
              <Input {...register('last_name')} placeholder="Dupont" />
            </FormField>
          </div>
        )}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h2 className="text-zinc-200 text-sm font-medium">Coordonnées</h2>
        <Separator />

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Email" error={errors.email?.message}>
            <Input {...register('email')} type="email" placeholder="contact@exemple.com" />
          </FormField>
          <FormField label="Téléphone" error={errors.phone?.message}>
            <Input {...register('phone')} placeholder="+33 6 00 00 00 00" />
          </FormField>
        </div>

        <FormField label="Adresse" error={errors.address?.message}>
          <Input {...register('address')} placeholder="12 rue de la Paix" />
        </FormField>

        <div className="grid grid-cols-3 gap-4">
          <FormField label="Code postal" error={errors.postal_code?.message} className="col-span-1">
            <Input {...register('postal_code')} placeholder="75001" />
          </FormField>
          <FormField label="Ville" error={errors.city?.message} className="col-span-2">
            <Input {...register('city')} placeholder="Paris" />
          </FormField>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h2 className="text-zinc-200 text-sm font-medium">Notes internes</h2>
        <Separator />
        <FormField error={errors.notes?.message}>
          <Textarea {...register('notes')} rows={4} placeholder="Notes internes sur ce client..." />
        </FormField>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={() => window.history.back()}>
          Annuler
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {clientId ? 'Enregistrer les modifications' : 'Créer le client'}
        </Button>
      </div>
    </form>
  )
}
