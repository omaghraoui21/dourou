export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string;
          created_at: string | null;
          details: Json | null;
          id: string;
          tontine_id: string | null;
          user_id: string | null;
        };
        Insert: {
          action: string;
          created_at?: string | null;
          details?: Json | null;
          id?: string;
          tontine_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string | null;
          details?: Json | null;
          id?: string;
          tontine_id?: string | null;
          user_id?: string | null;
        };
      };
      invitations: {
        Row: {
          code: string;
          created_at: string | null;
          created_by: string;
          expires_at: string;
          id: string;
          max_uses: number | null;
          tontine_id: string;
          used_count: number | null;
        };
        Insert: {
          code: string;
          created_at?: string | null;
          created_by: string;
          expires_at: string;
          id?: string;
          max_uses?: number | null;
          tontine_id: string;
          used_count?: number | null;
        };
        Update: {
          code?: string;
          created_at?: string | null;
          created_by?: string;
          expires_at?: string;
          id?: string;
          max_uses?: number | null;
          tontine_id?: string;
          used_count?: number | null;
        };
      };
      notifications: {
        Row: {
          body: string | null;
          created_at: string | null;
          id: string;
          read: boolean | null;
          title: string;
          tontine_id: string | null;
          type: string;
          user_id: string;
        };
        Insert: {
          body?: string | null;
          created_at?: string | null;
          id?: string;
          read?: boolean | null;
          title: string;
          tontine_id?: string | null;
          type: string;
          user_id: string;
        };
        Update: {
          body?: string | null;
          created_at?: string | null;
          id?: string;
          read?: boolean | null;
          title?: string;
          tontine_id?: string | null;
          type?: string;
          user_id?: string;
        };
      };
      payments: {
        Row: {
          amount: number;
          confirmed_at: string | null;
          created_at: string | null;
          declared_at: string | null;
          id: string;
          member_id: string;
          method: string | null;
          reference: string | null;
          round_id: string;
          status: string | null;
        };
        Insert: {
          amount: number;
          confirmed_at?: string | null;
          created_at?: string | null;
          declared_at?: string | null;
          id?: string;
          member_id: string;
          method?: string | null;
          reference?: string | null;
          round_id: string;
          status?: string | null;
        };
        Update: {
          amount?: number;
          confirmed_at?: string | null;
          created_at?: string | null;
          declared_at?: string | null;
          id?: string;
          member_id?: string;
          method?: string | null;
          reference?: string | null;
          round_id?: string;
          status?: string | null;
        };
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          full_name: string;
          id: string;
          phone: string | null;
          trust_score: number | null;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          full_name?: string;
          id: string;
          phone?: string | null;
          trust_score?: number | null;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          full_name?: string;
          id?: string;
          phone?: string | null;
          trust_score?: number | null;
          updated_at?: string | null;
        };
      };
      rounds: {
        Row: {
          beneficiary_id: string | null;
          completed_at: string | null;
          created_at: string | null;
          id: string;
          round_number: number;
          scheduled_date: string | null;
          status: string | null;
          tontine_id: string;
        };
        Insert: {
          beneficiary_id?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
          id?: string;
          round_number: number;
          scheduled_date?: string | null;
          status?: string | null;
          tontine_id: string;
        };
        Update: {
          beneficiary_id?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
          id?: string;
          round_number?: number;
          scheduled_date?: string | null;
          status?: string | null;
          tontine_id?: string;
        };
      };
      tontine_members: {
        Row: {
          id: string;
          joined_at: string | null;
          name: string;
          payout_order: number;
          phone: string | null;
          role: string | null;
          tontine_id: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          joined_at?: string | null;
          name: string;
          payout_order: number;
          phone?: string | null;
          role?: string | null;
          tontine_id: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          joined_at?: string | null;
          name?: string;
          payout_order?: number;
          phone?: string | null;
          role?: string | null;
          tontine_id?: string;
          user_id?: string | null;
        };
      };
      tontines: {
        Row: {
          amount: number;
          created_at: string | null;
          creator_id: string;
          currency: string | null;
          current_round: number | null;
          distribution_logic: string | null;
          frequency: string;
          id: string;
          next_deadline: string | null;
          start_date: string | null;
          status: string | null;
          title: string;
          total_members: number;
          updated_at: string | null;
        };
        Insert: {
          amount: number;
          created_at?: string | null;
          creator_id: string;
          currency?: string | null;
          current_round?: number | null;
          distribution_logic?: string | null;
          frequency: string;
          id?: string;
          next_deadline?: string | null;
          start_date?: string | null;
          status?: string | null;
          title: string;
          total_members: number;
          updated_at?: string | null;
        };
        Update: {
          amount?: number;
          created_at?: string | null;
          creator_id?: string;
          currency?: string | null;
          current_round?: number | null;
          distribution_logic?: string | null;
          frequency?: string;
          id?: string;
          next_deadline?: string | null;
          start_date?: string | null;
          status?: string | null;
          title?: string;
          total_members?: number;
          updated_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// Convenience type aliases
export type DbProfile = Database['public']['Tables']['profiles']['Row'];
export type DbTontine = Database['public']['Tables']['tontines']['Row'];
export type DbTontineMember = Database['public']['Tables']['tontine_members']['Row'];
export type DbRound = Database['public']['Tables']['rounds']['Row'];
export type DbPayment = Database['public']['Tables']['payments']['Row'];
export type DbInvitation = Database['public']['Tables']['invitations']['Row'];
export type DbNotification = Database['public']['Tables']['notifications']['Row'];
export type DbAuditLog = Database['public']['Tables']['audit_log']['Row'];
