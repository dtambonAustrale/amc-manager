import { z } from 'zod'

export const reportSchema = z.object({
  case_id: z.string().uuid().optional().nullable(),
  appointment_id: z.string().uuid().optional().nullable(),
  type: z.enum(['closing', 'rdv_avocat', 'appel', 'audience', 'administratif', 'interne']),
  status: z.enum(['brouillon', 'a_relire', 'finalise', 'valide', 'archive']).default('brouillon'),
  content: z.string().optional().nullable(),
  raw_notes: z.string().optional().nullable(),
  visibility: z.enum(['interne', 'avocat', 'tous']).default('interne'),
})

export type ReportFormData = z.output<typeof reportSchema>
