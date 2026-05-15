import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-4">
          <Icon size={20} className="text-zinc-500" />
        </div>
      )}
      <h3 className="text-zinc-300 font-medium text-sm mb-1">{title}</h3>
      {description && <p className="text-zinc-600 text-xs mb-4 max-w-xs">{description}</p>}
      {action}
    </div>
  )
}
