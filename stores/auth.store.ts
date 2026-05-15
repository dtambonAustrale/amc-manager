import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import type { UserRole } from '@/types/database'

interface Profile {
  id: string
  user_id: string
  full_name: string
  email: string
  role: UserRole
  avatar_url: string | null
  is_active: boolean
}

interface AuthStore {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ user: null, profile: null, isLoading: false }),
}))
