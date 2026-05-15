import { z } from 'zod'

export const clientSchema = z.object({
  type: z.enum(['particulier', 'entreprise', 'association', 'autre']),
  first_name: z.string().optional().nullable(),
  last_name: z.string().optional().nullable(),
  company_name: z.string().optional().nullable(),
  email: z.string().email('Email invalide').optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
  status: z.enum(['actif', 'inactif', 'archivé']).default('actif'),
  notes: z.string().optional().nullable(),
}).refine(data => {
  if (data.type === 'entreprise' || data.type === 'association') {
    return !!data.company_name
  }
  return !!(data.first_name || data.last_name)
}, {
  message: 'Le nom est requis (raison sociale pour entreprise/association, nom/prénom sinon)',
  path: ['first_name'],
})

export type ClientFormData = z.infer<typeof clientSchema>
