export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string | null
          phone: string | null
          avatar_url: string | null
          trust_score: number | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          trust_score?: number | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          trust_score?: number | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tontines: {
        Row: {
          id: string
          creator_id: string
          title: string
          amount: number
          frequency: 'weekly' | 'monthly'
          currency: string | null
          total_members: number
          current_round: number | null
          distribution_logic: 'fixed' | 'random' | 'trust' | null
          status: 'draft' | 'active' | 'completed' | null
          start_date: string | null
          next_deadline: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          title: string
          amount: number
          frequency: 'weekly' | 'monthly'
          currency?: string | null
          total_members: number
          current_round?: number | null
          distribution_logic?: 'fixed' | 'random' | 'trust' | null
          status?: 'draft' | 'active' | 'completed' | null
          start_date?: string | null
          next_deadline?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          title?: string
          amount?: number
          frequency?: 'weekly' | 'monthly'
          currency?: string | null
          total_members?: number
          current_round?: number | null
          distribution_logic?: 'fixed' | 'random' | 'trust' | null
          status?: 'draft' | 'active' | 'completed' | null
          start_date?: string | null
          next_deadline?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tontines_creator_id_fkey'
            columns: ['creator_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      tontine_members: {
        Row: {
          id: string
          tontine_id: string
          user_id: string | null
          name: string
          phone: string | null
          payout_order: number
          role: 'admin' | 'member' | null
          joined_at: string
        }
        Insert: {
          id?: string
          tontine_id: string
          user_id?: string | null
          name: string
          phone?: string | null
          payout_order: number
          role?: 'admin' | 'member' | null
          joined_at?: string
        }
        Update: {
          id?: string
          tontine_id?: string
          user_id?: string | null
          name?: string
          phone?: string | null
          payout_order?: number
          role?: 'admin' | 'member' | null
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tontine_members_tontine_id_fkey'
            columns: ['tontine_id']
            isOneToOne: false
            referencedRelation: 'tontines'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tontine_members_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      rounds: {
        Row: {
          id: string
          tontine_id: string
          round_number: number
          beneficiary_id: string | null
          status: 'current' | 'upcoming' | 'completed' | null
          scheduled_date: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tontine_id: string
          round_number: number
          beneficiary_id?: string | null
          status?: 'current' | 'upcoming' | 'completed' | null
          scheduled_date?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tontine_id?: string
          round_number?: number
          beneficiary_id?: string | null
          status?: 'current' | 'upcoming' | 'completed' | null
          scheduled_date?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'rounds_tontine_id_fkey'
            columns: ['tontine_id']
            isOneToOne: false
            referencedRelation: 'tontines'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'rounds_beneficiary_id_fkey'
            columns: ['beneficiary_id']
            isOneToOne: false
            referencedRelation: 'tontine_members'
            referencedColumns: ['id']
          }
        ]
      }
      payments: {
        Row: {
          id: string
          round_id: string
          member_id: string
          amount: number
          method: 'cash' | 'bank' | 'd17' | 'flouci' | null
          status: 'unpaid' | 'declared' | 'paid' | 'late' | null
          reference: string | null
          declared_at: string | null
          confirmed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          round_id: string
          member_id: string
          amount: number
          method?: 'cash' | 'bank' | 'd17' | 'flouci' | null
          status?: 'unpaid' | 'declared' | 'paid' | 'late' | null
          reference?: string | null
          declared_at?: string | null
          confirmed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          round_id?: string
          member_id?: string
          amount?: number
          method?: 'cash' | 'bank' | 'd17' | 'flouci' | null
          status?: 'unpaid' | 'declared' | 'paid' | 'late' | null
          reference?: string | null
          declared_at?: string | null
          confirmed_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'payments_round_id_fkey'
            columns: ['round_id']
            isOneToOne: false
            referencedRelation: 'rounds'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'payments_member_id_fkey'
            columns: ['member_id']
            isOneToOne: false
            referencedRelation: 'tontine_members'
            referencedColumns: ['id']
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          tontine_id: string | null
          type: string
          title: string
          body: string | null
          read: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tontine_id?: string | null
          type: string
          title: string
          body?: string | null
          read?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tontine_id?: string | null
          type?: string
          title?: string
          body?: string | null
          read?: boolean | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'notifications_tontine_id_fkey'
            columns: ['tontine_id']
            isOneToOne: false
            referencedRelation: 'tontines'
            referencedColumns: ['id']
          }
        ]
      }
      invitations: {
        Row: {
          id: string
          tontine_id: string
          code: string
          created_by: string
          expires_at: string
          max_uses: number | null
          used_count: number | null
          created_at: string
        }
        Insert: {
          id?: string
          tontine_id: string
          code: string
          created_by: string
          expires_at: string
          max_uses?: number | null
          used_count?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          tontine_id?: string
          code?: string
          created_by?: string
          expires_at?: string
          max_uses?: number | null
          used_count?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'invitations_tontine_id_fkey'
            columns: ['tontine_id']
            isOneToOne: false
            referencedRelation: 'tontines'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'invitations_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Convenience type aliases
export type Profile = Tables<'profiles'>
export type Tontine = Tables<'tontines'>
export type TontineMember = Tables<'tontine_members'>
export type Round = Tables<'rounds'>
export type Payment = Tables<'payments'>
export type Notification = Tables<'notifications'>
export type Invitation = Tables<'invitations'>
