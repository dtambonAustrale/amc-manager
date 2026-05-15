import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  backHref?: string
  backLabel?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, backHref, backLabel, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('space-y-1', className)}>
      {backHref && (
        <Link href={backHref} className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-xs transition-colors mb-3">
          <ArrowLeft size={13} />
          {backLabel ?? 'Retour'}
        </Link>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-zinc-100 font-semibold text-xl tracking-tight">{title}</h1>
          {description && <p className="text-zinc-500 text-sm mt-0.5">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}
