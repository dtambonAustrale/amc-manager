'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

const Tabs = TabsPrimitive.Root

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        'flex items-center gap-1 border-b border-zinc-800 px-1',
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'relative flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-zinc-500 transition-colors',
        'hover:text-zinc-300',
        'data-[state=active]:text-zinc-100',
        'focus-visible:outline-none',
        'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-violet-500',
        'after:scale-x-0 data-[state=active]:after:scale-x-100',
        'after:transition-transform after:duration-200',
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn('focus-visible:outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
