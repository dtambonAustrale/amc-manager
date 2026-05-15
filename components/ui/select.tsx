import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export function Select({ className, error, options, placeholder, ...props }: SelectProps) {
  return (
    <div className="space-y-1 relative">
      <select
        className={cn(
          'w-full bg-zinc-900 border rounded-lg px-3 py-2 text-sm appearance-none cursor-pointer',
          'focus:outline-none focus:ring-1 transition-all pr-8',
          error
            ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20 text-zinc-100'
            : 'border-zinc-800 focus:border-violet-500 focus:ring-violet-500/20',
          !props.value && props.value !== 0 ? 'text-zinc-500' : 'text-zinc-100',
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-zinc-900 text-zinc-100">
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}
