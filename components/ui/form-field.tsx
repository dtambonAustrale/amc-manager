import { cn } from '@/lib/utils'
import { Label } from './label'

interface FormFieldProps {
  label?: string
  required?: boolean
  error?: string
  className?: string
  children: React.ReactNode
  hint?: string
}

export function FormField({ label, required, error, className, children, hint }: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <Label required={required}>{label}</Label>}
      {children}
      {hint && !error && <p className="text-zinc-600 text-xs">{hint}</p>}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}
