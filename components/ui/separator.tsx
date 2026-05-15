import { cn } from '@/lib/utils'

export function Separator({ className }: { className?: string }) {
  return <div className={cn('border-t border-zinc-800', className)} />
}
