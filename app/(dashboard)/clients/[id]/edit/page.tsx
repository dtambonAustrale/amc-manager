import { Topbar } from '@/components/layout/topbar'
import { ClientForm } from '@/components/forms/client-form'
import { PageHeader } from '@/components/ui/page-header'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Database } from '@/types/database'

type Client = Database['public']['Tables']['clients']['Row']

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditClientPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: clientRaw } = await supabase.from('clients').select('*').eq('id', id).single()
  if (!clientRaw) notFound()

  const client = clientRaw as Client
  const clientName = client.company_name || `${client.first_name ?? ''} ${client.last_name ?? ''}`.trim()

  return (
    <div>
      <Topbar title={`Modifier — ${clientName}`} />
      <div className="p-6 max-w-3xl">
        <PageHeader
          title={`Modifier ${clientName}`}
          backHref={`/clients/${id}`}
          backLabel="Fiche client"
        />
        <div className="mt-6">
          <ClientForm
            clientId={id}
            defaultValues={{
              type: client.type,
              first_name: client.first_name,
              last_name: client.last_name,
              company_name: client.company_name,
              email: client.email,
              phone: client.phone,
              address: client.address,
              city: client.city,
              postal_code: client.postal_code,
              status: client.status,
              notes: client.notes,
            }}
          />
        </div>
      </div>
    </div>
  )
}
