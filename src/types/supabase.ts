// Supabase Types (fixes TS errors)
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          role: string
          role_level: string
          hourly_rate: number | null
          portal_access: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          role?: string
          role_level?: string
          hourly_rate?: number | null
          portal_access?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          role?: string
          role_level?: string
          hourly_rate?: number | null
          portal_access?: boolean
          created_at?: string
          updated_at?: string | null
        }
      }
      clients: {
        Row: {
          id: string
          contact_person: string
          company_name: string | null
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          status: string
          portal_access: string
          service_interest: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          contact_person: string
          company_name?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          status?: string
          portal_access?: string
          service_interest?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      employees: {
        Row: {
          id: string
          first_name: string
          last_name: string
          role: string
          email: string | null
          phone: string | null
          address: string | null
          role_level: string
          hourly_rate: number | null
          start_date: string | null
          bio: string | null
          portal_access: boolean
          created_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          role: string
          email?: string | null
          phone?: string | null
          address?: string | null
          role_level?: string
          hourly_rate?: number | null
          start_date?: string | null
          bio?: string | null
          portal_access?: boolean
          created_at?: string
        }
      }
    }
  }
}

declare module '@/lib/supabase' {
  export interface SupabaseQueryResult<T> {
    data: T[]
    error: any | null
  }
}
