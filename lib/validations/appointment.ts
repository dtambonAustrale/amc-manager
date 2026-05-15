import { z } from 'zod'

export const appointmentSchema = z.object({
  client_id: z.string().uuid('Client requis'),
  case_id: z.string().uuid().optional().nullable(),
  type: z.enum(['rdv_avocat', 'closing', 'telephonique', 'administratif', 'audience', 'autre']),
  status: z.enum(['prevu', 'realise', 'annule', 'reporte', 'absent', 'a_confirmer']).default('prevu'),
  scheduled_at: z.string().min(1, 'La date est requise'),
  duration_minutes: z.number().int().positive().default(60),
  location: z.enum(['cabinet', 'visio', 'telephone', 'tribunal', 'exterieur', 'autre']).default('cabinet'),
  notes: z.string().optional().nullable(),
  send_confirmation: z.boolean().default(false),
})

export type AppointmentFormData = z.output<typeof appointmentSchema>
