import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-zinc-800 text-zinc-300 ring-zinc-700',
        success: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
        warning: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
        danger: 'bg-red-500/10 text-red-400 ring-red-500/20',
        info: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
        violet: 'bg-violet-500/10 text-violet-400 ring-violet-500/20',
        outline: 'bg-transparent text-zinc-400 ring-zinc-700',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
