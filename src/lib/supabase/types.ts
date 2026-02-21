// src/lib/supabase/types.ts
// Typen spiegeln das Datenbankschema 1:1 wider

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          role: 'admin' | 'member'
          created_at: string
        }
        Insert: {
          id: string
          name: string
          role?: 'admin' | 'member'
          created_at?: string
        }
        Update: {
          name?: string
          role?: 'admin' | 'member'
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
          status: 'confirmed' | 'cancelled'
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
          status?: 'confirmed' | 'cancelled'
          created_at?: string
        }
        Update: {
          duration_min?: number
          cost?: number
          status?: 'confirmed' | 'cancelled'
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
          status: 'pending' | 'approved' | 'rejected'
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
          status?: 'pending'
          created_at?: string
        }
        Update: {
          status?: 'pending' | 'approved' | 'rejected'
          resolved_at?: string
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
