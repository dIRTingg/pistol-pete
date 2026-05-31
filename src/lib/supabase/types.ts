// src/lib/supabase/types.ts

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          first_name: string | null
          last_name: string | null
          email: string | null
          role: string
          created_at: string
        }
        Insert: {
          id: string
          name: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          role?: string
          created_at?: string
        }
        Update: {
          name?: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          role?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          user_name: string
          start_at: string
          duration_min: number
          cost: number
          note: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_name: string
          start_at: string
          duration_min: number
          cost: number
          note?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          duration_min?: number
          cost?: number
          status?: string
          note?: string | null
        }
        Relationships: []
      }
      correction_requests: {
        Row: {
          id: string
          session_id: string
          user_id: string
          user_name: string
          requested_duration: number
          note: string | null
          status: string
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          user_name: string
          requested_duration: number
          note?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          status?: string
          resolved_at?: string | null
          duration_min?: number
          cost?: number
        }
        Relationships: []
      }
      registration_requests: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          accepted_terms: boolean
          accepted_billing: boolean
          accepted_privacy: boolean
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          accepted_terms: boolean
          accepted_billing: boolean
          accepted_privacy: boolean
          status?: string
          created_at?: string
        }
        Update: {
          status?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          id: string
          value: string
        }
        Insert: {
          id: string
          value: string
        }
        Update: {
          value?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      calc_cost: {
        Args: { duration_minutes: number }
        Returns: number
      }
      resolve_correction: {
        Args: { p_correction_id: string; p_approve: boolean }
        Returns: undefined
      }
    }
  }
}

// Convenience-Typen
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Session = Database['public']['Tables']['sessions']['Row']
export type CorrectionRequest = Database['public']['Tables']['correction_requests']['Row']
export type RegistrationRequest = Database['public']['Tables']['registration_requests']['Row']
export type Setting = Database['public']['Tables']['settings']['Row']
