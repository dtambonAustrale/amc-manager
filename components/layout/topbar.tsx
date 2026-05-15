'use client'

import { Bell } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { ROLE_LABELS } from '@/lib/permissions/roles'
import { Badge } from '@/components/ui/badge'

interface TopbarProps {
  title?: string
  children?: React.ReactNode
}

export function Topbar({ title, children }: TopbarProps) {
  const profile = useAuthStore((s) => s.profile)

  return (
    <header className="h-14 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm flex items-center px-6 gap-4 sticky top-0 z-30">
      {title && (
        <h1 className="text-zinc-100 font-semibold text-base">{title}</h1>
      )}
      <div className="flex-1">{children}</div>
      <div className="flex items-center gap-3 ml-auto">
        <button className="text-zinc-500 hover:text-zinc-300 transition-colors">
          <Bell size={18} />
        </button>
        {profile && (
          <Badge variant="violet">
            {ROLE_LABELS[profile.role]}
          </Badge>
        )}
      </div>
    </header>
  )
}
