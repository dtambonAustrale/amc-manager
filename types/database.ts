export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'admin' | 'collaborator' | 'lawyer'

export type ClientType = 'particulier' | 'entreprise' | 'association' | 'autre'
export type ClientStatus = 'actif' | 'inactif' | 'archivé'

export type CaseType = 'litige' | 'contrat' | 'recouvrement' | 'conseil_juridique' | 'titre_sejour' | 'accompagnement_admin' | 'rdv_avocat' | 'autre'
export type CaseStatus = 'ouvert' | 'en_cours' | 'en_attente' | 'a_completer' | 'rdv_prevu' | 'attente_reglement' | 'cloture' | 'archive'
export type CasePriority = 'basse' | 'normale' | 'haute' | 'urgente'

export type PaymentMethod = 'carte' | 'virement' | 'cheque' | 'especes' | 'autre'
export type PaymentStatus = 'paye' | 'en_attente' | 'partiel' | 'annule' | 'en_retard'

export type AppointmentType = 'rdv_avocat' | 'closing' | 'telephonique' | 'administratif' | 'audience' | 'autre'
export type AppointmentStatus = 'prevu' | 'realise' | 'annule' | 'reporte' | 'absent' | 'a_confirmer'
export type AppointmentLocation = 'cabinet' | 'visio' | 'telephone' | 'tribunal' | 'exterieur' | 'autre'

export type ReportType = 'closing' | 'rdv_avocat' | 'appel' | 'audience' | 'administratif' | 'interne'
export type ReportStatus = 'brouillon' | 'a_relire' | 'finalise' | 'valide' | 'archive'
export type ReportVisibility = 'interne' | 'avocat' | 'tous'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          email: string
          role: UserRole
          avatar_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
        Relationships: []
      }
      clients: {
        Row: {
          id: string
          type: ClientType
          first_name: string | null
          last_name: string | null
          company_name: string | null
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          postal_code: string | null
          status: ClientStatus
          notes: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['clients']['Insert']>
        Relationships: []
      }
      cases: {
        Row: {
          id: string
          reference: string
          client_id: string
          type: CaseType
          status: CaseStatus
          description: string | null
          lawyer_id: string | null
          priority: CasePriority
          opened_at: string
          closed_at: string | null
          estimated_amount: number | null
          notes: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['cases']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['cases']['Insert']>
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          case_id: string
          client_id: string
          amount: number
          payment_date: string
          payment_method: PaymentMethod
          reference: string | null
          status: PaymentStatus
          notes: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
        Relationships: []
      }
      appointments: {
        Row: {
          id: string
          case_id: string | null
          client_id: string
          type: AppointmentType
          status: AppointmentStatus
          scheduled_at: string
          duration_minutes: number
          location: AppointmentLocation
          notes: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['appointments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['appointments']['Insert']>
        Relationships: []
      }
      appointment_participants: {
        Row: {
          appointment_id: string
          user_id: string
        }
        Insert: Database['public']['Tables']['appointment_participants']['Row']
        Update: Partial<Database['public']['Tables']['appointment_participants']['Row']>
        Relationships: []
      }
      reports: {
        Row: {
          id: string
          case_id: string | null
          appointment_id: string | null
          type: ReportType
          status: ReportStatus
          content: string | null
          raw_notes: string | null
          visibility: ReportVisibility
          author_id: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['reports']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['reports']['Insert']>
        Relationships: []
      }
      documents: {
        Row: {
          id: string
          case_id: string
          name: string
          file_path: string
          file_size: number | null
          mime_type: string | null
          uploaded_by: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['documents']['Insert']>
        Relationships: []
      }
      activity_logs: {
        Row: {
          id: string
          entity_type: string
          entity_id: string
          action: string
          actor_id: string
          metadata: Json | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['activity_logs']['Row'], 'id' | 'created_at'>
        Update: never
        Relationships: []
      }
      email_logs: {
        Row: {
          id: string
          recipient: string
          subject: string
          type: string
          status: string
          error: string | null
          triggered_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['email_logs']['Row'], 'id' | 'created_at'>
        Update: never
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
