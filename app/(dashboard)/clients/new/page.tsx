import { Topbar } from '@/components/layout/topbar'
import { ClientForm } from '@/components/forms/client-form'
import { PageHeader } from '@/components/ui/page-header'

export default function NewClientPage() {
  return (
    <div>
      <Topbar title="Nouveau client" />
      <div className="p-6 max-w-3xl">
        <PageHeader
          title="Nouveau client"
          description="Créer un nouveau client dans le système"
          backHref="/clients"
          backLabel="Clients"
        />
        <div className="mt-6">
          <ClientForm />
        </div>
      </div>
    </div>
  )
}
