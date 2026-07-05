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
          last_login_at?: string | null
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
      news: {
        Row: {
          id: string
          title: string
          body: string
          image_url: string | null
          link_target: string | null
          link_label: string | null
          published_at: string
          expires_at: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          title: string
          body: string
          image_url?: string | null
          link_target?: string | null
          link_label?: string | null
          published_at?: string
          expires_at?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          title?: string
          body?: string
          image_url?: string | null
          link_target?: string | null
          link_label?: string | null
          published_at?: string
          expires_at?: string | null
        }
        Relationships: []
      }
      news_reads: {
        Row: {
          user_id: string
          news_id: string
          read_at: string
        }
        Insert: {
          user_id: string
          news_id: string
          read_at?: string
        }
        Update: {
          read_at?: string
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
      check_email_available: {
        Args: { p_email: string }
        Returns: string   // 'available' | 'registered' | 'pending' | 'invited' | 'rejected'
      }
      get_profiles_with_last_login: {
        Args: Record<string, never>
        Returns: Array<{
          id: string
          name: string
          first_name: string | null
          last_name: string | null
          email: string | null
          role: string
          created_at: string
          last_login_at: string | null
        }>
      }
      get_unread_news_count: {
        Args: Record<string, never>
        Returns: number
      }
      mark_all_news_read: {
        Args: Record<string, never>
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
export type News = Database['public']['Tables']['news']['Row']
export type NewsRead = Database['public']['Tables']['news_reads']['Row']
