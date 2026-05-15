import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export function Input({ className, error, ...props }: InputProps) {
  return (
    <div className="space-y-1">
      <input
        className={cn(
          'w-full bg-zinc-900 border rounded-lg px-3 py-2 text-zinc-100 text-sm placeholder-zinc-600',
          'focus:outline-none focus:ring-1 transition-all',
          error
            ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
            : 'border-zinc-800 focus:border-violet-500 focus:ring-violet-500/20',
          className
        )}
        {...props}
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}
