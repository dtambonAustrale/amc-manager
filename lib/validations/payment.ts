import { z } from 'zod'

export const paymentSchema = z.object({
  case_id: z.string().uuid('Dossier requis'),
  client_id: z.string().uuid('Client requis'),
  amount: z.number({ error: 'Montant requis' }).positive('Le montant doit être positif'),
  payment_date: z.string().min(1, 'La date est requise'),
  payment_method: z.enum(['carte', 'virement', 'cheque', 'especes', 'autre']),
  reference: z.string().optional().nullable(),
  status: z.enum(['paye', 'en_attente', 'partiel', 'annule', 'en_retard']).default('en_attente'),
  notes: z.string().optional().nullable(),
})

export type PaymentFormData = z.output<typeof paymentSchema>
