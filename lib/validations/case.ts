import { z } from 'zod'

export const caseSchema = z.object({
  client_id: z.string().uuid('Client requis'),
  reference: z.string().min(1, 'La référence est requise'),
  type: z.enum(['litige', 'contrat', 'recouvrement', 'conseil_juridique', 'titre_sejour', 'accompagnement_admin', 'rdv_avocat', 'autre']),
  status: z.enum(['ouvert', 'en_cours', 'en_attente', 'a_completer', 'rdv_prevu', 'attente_reglement', 'cloture', 'archive']).default('ouvert'),
  description: z.string().optional().nullable(),
  lawyer_id: z.string().uuid().optional().nullable(),
  priority: z.enum(['basse', 'normale', 'haute', 'urgente']).default('normale'),
  opened_at: z.string().min(1, "La date d'ouverture est requise"),
  closed_at: z.string().optional().nullable(),
  estimated_amount: z.number().positive().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export type CaseFormData = z.output<typeof caseSchema>
