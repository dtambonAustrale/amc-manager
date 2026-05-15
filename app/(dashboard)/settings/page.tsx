import { Topbar } from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/server'
import { Users, Shield, Bell } from 'lucide-react'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profileRaw } = user ? await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single() : { data: null }
  const profile = profileRaw as Profile | null

  return (
    <div>
      <Topbar title="Paramètres" />
      <div className="p-6 max-w-3xl space-y-6">
        {/* Profile section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-3">
            <Users size={15} className="text-violet-400" />
            <h2 className="text-zinc-200 text-sm font-medium">Profil</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                <span className="text-violet-300 font-semibold">
                  {profile?.full_name?.charAt(0) ?? '?'}
                </span>
              </div>
              <div>
                <p className="text-zinc-100 font-medium">{profile?.full_name ?? 'Utilisateur'}</p>
                <p className="text-zinc-500 text-sm">{profile?.email ?? user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Nom complet</label>
                <input
                  defaultValue={profile?.full_name ?? ''}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
                  placeholder="Votre nom"
                />
              </div>
              <div>
                <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Email</label>
                <input
                  defaultValue={profile?.email ?? ''}
                  disabled
                  className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-2 text-zinc-500 text-sm cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                Sauvegarder
              </button>
            </div>
          </div>
        </div>

        {/* Security section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-3">
            <Shield size={15} className="text-violet-400" />
            <h2 className="text-zinc-200 text-sm font-medium">Sécurité</h2>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Nouveau mot de passe</label>
              <input
                type="password"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Confirmer le mot de passe</label>
              <input
                type="password"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
            <div className="flex justify-end">
              <button className="bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                Changer le mot de passe
              </button>
            </div>
          </div>
        </div>

        {/* Notifications section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-3">
            <Bell size={15} className="text-violet-400" />
            <h2 className="text-zinc-200 text-sm font-medium">Notifications</h2>
          </div>
          <div className="p-5 space-y-3">
            {[
              { label: 'Nouveaux rendez-vous', desc: 'Recevoir un email lors d\'un nouveau rendez-vous' },
              { label: 'Rappels de rendez-vous', desc: 'Rappel 24h avant chaque rendez-vous' },
              { label: 'Mises à jour de dossiers', desc: 'Notification lors de changements sur vos dossiers' },
            ].map((notif) => (
              <div key={notif.label} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-zinc-200 text-sm font-medium">{notif.label}</p>
                  <p className="text-zinc-500 text-xs">{notif.desc}</p>
                </div>
                <button
                  role="switch"
                  aria-checked="true"
                  className="w-10 h-6 bg-violet-600 rounded-full relative transition-colors"
                >
                  <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
