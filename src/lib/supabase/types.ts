// src/lib/supabase/types.ts
// Update-Typen als string um TypeScript never-Inferenz zu vermeiden

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          role: string
          created_at: string
        }
        Insert: {
          id: string
          name: string
          role?: string
          created_at?: string
        }
        Update: {
          name?: string
          role?: string
        }
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
          resolved_at?: string
          duration_min?: number
          cost?: number
        }
      }
    }
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      calc_cost: {
        Args: { duration_minutes: number }
        Returns: number
      }
    }
  }
}

// Convenience-Typen
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Session = Database['public']['Tables']['sessions']['Row']
export type CorrectionRequest = Database['public']['Tables']['correction_requests']['Row']
