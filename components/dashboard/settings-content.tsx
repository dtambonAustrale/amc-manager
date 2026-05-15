'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ROLE_LABELS } from '@/lib/permissions/roles'
import {
  updateOwnProfileAction,
  updatePasswordAction,
  createUserAction,
  updateUserRoleAction,
  toggleUserActiveAction,
} from '@/app/actions/users'
import { Users, Shield, Plus, X } from 'lucide-react'
import type { Database } from '@/types/database'
import type { UserRole } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

interface SettingsContentProps {
  profile: Profile
  allProfiles: Profile[]
  isAdmin: boolean
}

const profileSchema = z.object({ full_name: z.string().min(2, 'Nom requis') })
const passwordSchema = z.object({
  password: z.string().min(8, '8 caractères minimum'),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, { message: 'Les mots de passe ne correspondent pas', path: ['confirm'] })
const newUserSchema = z.object({
  full_name: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, '8 caractères minimum'),
  role: z.enum(['admin', 'collaborator', 'lawyer']),
})

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>
type NewUserForm = z.infer<typeof newUserSchema>

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Administrateur' },
  { value: 'collaborator', label: 'Collaborateur' },
  { value: 'lawyer', label: 'Avocat' },
]

const ROLE_BADGE_VARIANT: Record<UserRole, 'danger' | 'violet' | 'info'> = {
  admin: 'danger',
  collaborator: 'violet',
  lawyer: 'info',
}

export function SettingsContent({ profile, allProfiles, isAdmin }: SettingsContentProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'users'>('profile')
  const [showNewUser, setShowNewUser] = useState(false)

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema) as any,
    defaultValues: { full_name: profile.full_name },
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema) as any,
  })

  const newUserForm = useForm<NewUserForm>({
    resolver: zodResolver(newUserSchema) as any,
    defaultValues: { role: 'collaborator' },
  })

  const handleProfileSubmit = async (data: ProfileForm) => {
    const result = await updateOwnProfileAction(data)
    if (result?.error) toast.error('Erreur lors de la mise à jour')
    else toast.success('Profil mis à jour')
  }

  const handlePasswordSubmit = async (data: PasswordForm) => {
    const result = await updatePasswordAction(data)
    if (result?.error) toast.error('Erreur lors du changement de mot de passe')
    else { toast.success('Mot de passe mis à jour'); passwordForm.reset() }
  }

  const handleNewUser = async (data: NewUserForm) => {
    const result = await createUserAction(data)
    if (result?.error) toast.error('Erreur lors de la création')
    else { toast.success('Utilisateur créé'); newUserForm.reset(); setShowNewUser(false) }
  }

  const handleRoleChange = async (profileId: string, role: UserRole) => {
    const result = await updateUserRoleAction(profileId, role)
    if (result?.error) toast.error('Erreur')
    else toast.success('Rôle mis à jour')
  }

  const handleToggleActive = async (profileId: string, isActive: boolean) => {
    const result = await toggleUserActiveAction(profileId, !isActive)
    if (result?.error) toast.error('Erreur')
    else toast.success(isActive ? 'Utilisateur désactivé' : 'Utilisateur réactivé')
  }

  const tabs = [
    { id: 'profile' as const, label: 'Profil', icon: Users },
    { id: 'security' as const, label: 'Sécurité', icon: Shield },
    ...(isAdmin ? [{ id: 'users' as const, label: 'Utilisateurs', icon: Users }] : []),
  ]

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-zinc-100 font-semibold text-xl tracking-tight">Paramètres</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Gérez votre profil et les accès utilisateurs.</p>
      </div>

      {/* Tab nav */}
      <div className="flex items-center gap-1 border-b border-zinc-800">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative',
              activeTab === tab.id
                ? 'text-zinc-100 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-violet-500'
                : 'text-zinc-500 hover:text-zinc-300',
            ].join(' ')}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile */}
      {activeTab === 'profile' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5 max-w-xl">
          <div>
            <h2 className="text-zinc-200 font-medium">Informations personnelles</h2>
            <p className="text-zinc-500 text-sm mt-0.5">Modifiez votre nom affiché dans l'application.</p>
          </div>
          <Separator />
          <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nom complet</Label>
              <Input {...profileForm.register('full_name')} error={profileForm.formState.errors.full_name?.message} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={profile.email} disabled className="opacity-50 cursor-not-allowed" />
              <p className="text-zinc-600 text-xs">L'email ne peut pas être modifié ici.</p>
            </div>
            <div className="space-y-1.5">
              <Label>Rôle</Label>
              <div>
                <Badge variant={ROLE_BADGE_VARIANT[profile.role as UserRole] ?? 'default'}>
                  {ROLE_LABELS[profile.role as UserRole]}
                </Badge>
              </div>
            </div>
            <Button type="submit" size="sm" isLoading={profileForm.formState.isSubmitting}>
              Enregistrer
            </Button>
          </form>
        </div>
      )}

      {/* Security */}
      {activeTab === 'security' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5 max-w-xl">
          <div>
            <h2 className="text-zinc-200 font-medium">Changer le mot de passe</h2>
            <p className="text-zinc-500 text-sm mt-0.5">Choisissez un mot de passe sécurisé d'au moins 8 caractères.</p>
          </div>
          <Separator />
          <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nouveau mot de passe</Label>
              <Input {...passwordForm.register('password')} type="password" error={passwordForm.formState.errors.password?.message} />
            </div>
            <div className="space-y-1.5">
              <Label>Confirmer</Label>
              <Input {...passwordForm.register('confirm')} type="password" error={passwordForm.formState.errors.confirm?.message} />
            </div>
            <Button type="submit" size="sm" isLoading={passwordForm.formState.isSubmitting}>
              Mettre à jour
            </Button>
          </form>
        </div>
      )}

      {/* Users (admin) */}
      {activeTab === 'users' && isAdmin && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-zinc-200 font-medium">Gestion des utilisateurs</h2>
              <p className="text-zinc-500 text-sm mt-0.5">{allProfiles.length} utilisateur{allProfiles.length !== 1 ? 's' : ''} dans le système.</p>
            </div>
            <Button size="sm" onClick={() => setShowNewUser(v => !v)}>
              <Plus size={14} />
              Nouvel utilisateur
            </Button>
          </div>

          {showNewUser && (
            <div className="bg-zinc-900 border border-violet-500/30 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-zinc-200 text-sm font-medium">Créer un utilisateur</h3>
                <button onClick={() => setShowNewUser(false)} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={newUserForm.handleSubmit(handleNewUser)} className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label required>Nom complet</Label>
                  <Input {...newUserForm.register('full_name')} placeholder="Jean Dupont" error={newUserForm.formState.errors.full_name?.message} />
                </div>
                <div className="space-y-1.5">
                  <Label required>Email</Label>
                  <Input {...newUserForm.register('email')} type="email" placeholder="jean@exemple.com" error={newUserForm.formState.errors.email?.message} />
                </div>
                <div className="space-y-1.5">
                  <Label required>Mot de passe temporaire</Label>
                  <Input {...newUserForm.register('password')} type="password" placeholder="••••••••" error={newUserForm.formState.errors.password?.message} />
                </div>
                <div className="space-y-1.5">
                  <Label>Rôle</Label>
                  <select
                    {...newUserForm.register('role')}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-violet-500"
                  >
                    {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div className="col-span-2 flex justify-end gap-2 pt-1">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setShowNewUser(false)}>Annuler</Button>
                  <Button type="submit" size="sm" isLoading={newUserForm.formState.isSubmitting}>Créer</Button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['Utilisateur', 'Email', 'Rôle', 'Statut', ''].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-zinc-500 text-xs font-medium uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {allProfiles.map(p => (
                  <tr key={p.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                          <span className="text-violet-300 text-xs font-semibold">{p.full_name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-zinc-200 text-sm font-medium">{p.full_name}</p>
                          {p.id === profile.id && <span className="text-violet-400 text-xs">Vous</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-sm">{p.email}</td>
                    <td className="px-4 py-3">
                      {p.id === profile.id ? (
                        <Badge variant={ROLE_BADGE_VARIANT[p.role as UserRole] ?? 'default'}>
                          {ROLE_LABELS[p.role as UserRole]}
                        </Badge>
                      ) : (
                        <select
                          defaultValue={p.role}
                          onChange={e => handleRoleChange(p.id, e.target.value as UserRole)}
                          className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-violet-500"
                        >
                          {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={p.is_active ? 'success' : 'default'}>{p.is_active ? 'Actif' : 'Inactif'}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {p.id !== profile.id && (
                        <button
                          onClick={() => handleToggleActive(p.id, p.is_active)}
                          className={`text-xs transition-colors ${p.is_active ? 'text-zinc-600 hover:text-red-400' : 'text-zinc-600 hover:text-emerald-400'}`}
                        >
                          {p.is_active ? 'Désactiver' : 'Réactiver'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
