'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Users, FolderOpen, CreditCard, Calendar,
  FileText, Settings, LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'

const navItems = [
  { href: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/cases', label: 'Dossiers', icon: FolderOpen },
  { href: '/payments', label: 'Règlements', icon: CreditCard },
  { href: '/appointments', label: 'Rendez-vous', icon: Calendar },
  { href: '/reports', label: 'Comptes rendus', icon: FileText },
]

const bottomItems = [
  { href: '/settings', label: 'Paramètres', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const profile = useAuthStore((s) => s.profile)
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-zinc-950 border-r border-zinc-800/60 flex flex-col z-40">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-zinc-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-violet-500 rounded-md flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xs">N</span>
          </div>
          <span className="text-zinc-100 font-semibold tracking-tight">NEXIS</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all group relative',
                isActive
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-zinc-800 rounded-md"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <item.icon size={16} className={cn('shrink-0 relative z-10', isActive ? 'text-violet-400' : '')} />
              <span className="relative z-10">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-3 border-t border-zinc-800/60 space-y-0.5">
        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all',
              pathname.startsWith(item.href)
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
            )}
          >
            <item.icon size={16} className="shrink-0" />
            {item.label}
          </Link>
        ))}

        {/* User */}
        <div className="mt-2 px-3 py-2 flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
            <span className="text-violet-300 text-xs font-medium">
              {profile?.full_name?.charAt(0) ?? '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-zinc-300 text-xs font-medium truncate">{profile?.full_name ?? 'Utilisateur'}</p>
            <p className="text-zinc-600 text-xs truncate">{profile?.email}</p>
          </div>
          <button onClick={handleSignOut} className="text-zinc-600 hover:text-zinc-400 transition-colors shrink-0">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
