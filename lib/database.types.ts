export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          app_kill_switch: boolean
          id: string
          maintenance_message: string | null
          maintenance_mode: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          app_kill_switch?: boolean
          id?: string
          maintenance_message?: string | null
          maintenance_mode?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          app_kill_switch?: boolean
          id?: string
          maintenance_message?: string | null
          maintenance_mode?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "v_restricted_users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          tontine_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          tontine_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          tontine_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_tontine_id_fkey"
            columns: ["tontine_id"]
            isOneToOne: false
            referencedRelation: "tontines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_tontine_id_fkey"
            columns: ["tontine_id"]
            isOneToOne: false
            referencedRelation: "v_active_disputes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_restricted_users"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_audit_log: {
        Row: {
          action_type: string
          created_at: string
          id: string
          metadata: Json | null
          performed_by: string
          reason: string | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          metadata?: Json | null
          performed_by: string
          reason?: string | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          performed_by?: string
          reason?: string | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "governance_audit_log_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "governance_audit_log_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "v_restricted_users"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          code: string
          created_at: string | null
          created_by: string
          expires_at: string
          id: string
          max_uses: number | null
          tontine_id: string
          used_count: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by: string
          expires_at: string
          id?: string
          max_uses?: number | null
          tontine_id: string
          used_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string
          expires_at?: string
          id?: string
          max_uses?: number | null
          tontine_id?: string
          used_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_restricted_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_tontine_id_fkey"
            columns: ["tontine_id"]
            isOneToOne: false
            referencedRelation: "tontines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_tontine_id_fkey"
            columns: ["tontine_id"]
            isOneToOne: false
            referencedRelation: "v_active_disputes"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          read: boolean | null
          title: string
          tontine_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          read?: boolean | null
          title: string
          tontine_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          read?: boolean | null
          title?: string
          tontine_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_tontine_id_fkey"
            columns: ["tontine_id"]
            isOneToOne: false
            referencedRelation: "tontines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_tontine_id_fkey"
            columns: ["tontine_id"]
            isOneToOne: false
            referencedRelation: "v_active_disputes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_restricted_users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          confirmed_at: string | null
          created_at: string | null
          declared_at: string | null
          id: string
          member_id: string
          method: string | null
          reference: string | null
          round_id: string
          status: string | null
        }
        Insert: {
          amount: number
          confirmed_at?: string | null
          created_at?: string | null
          declared_at?: string | null
          id?: string
          member_id: string
          method?: string | null
          reference?: string | null
          round_id: string
          status?: string | null
        }
        Update: {
          amount?: number
          confirmed_at?: string | null
          created_at?: string | null
          declared_at?: string | null
          id?: string
          member_id?: string
          method?: string | null
          reference?: string | null
          round_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "tontine_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: Database["public"]["Enums"]["account_status_enum"]
          avatar_url: string | null
          banned_at: string | null
          banned_reason: string | null
          created_at: string | null
          full_name: string
          id: string
          last_login_ip: string | null
          phone: string | null
          role: string
          suspended_at: string | null
          suspended_reason: string | null
          tos_version_accepted: string | null
          trust_score: number | null
          updated_at: string | null
        }
        Insert: {
          account_status?: Database["public"]["Enums"]["account_status_enum"]
          avatar_url?: string | null
          banned_at?: string | null
          banned_reason?: string | null
          created_at?: string | null
          full_name?: string
          id: string
          last_login_ip?: string | null
          phone?: string | null
          role?: string
          suspended_at?: string | null
          suspended_reason?: string | null
          tos_version_accepted?: string | null
          trust_score?: number | null
          updated_at?: string | null
        }
        Update: {
          account_status?: Database["public"]["Enums"]["account_status_enum"]
          avatar_url?: string | null
          banned_at?: string | null
          banned_reason?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          last_login_ip?: string | null
          phone?: string | null
          role?: string
          suspended_at?: string | null
          suspended_reason?: string | null
          tos_version_accepted?: string | null
          trust_score?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rounds: {
        Row: {
          beneficiary_id: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          round_number: number
          scheduled_date: string | null
          status: string | null
          tontine_id: string
        }
        Insert: {
          beneficiary_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          round_number: number
          scheduled_date?: string | null
          status?: string | null
          tontine_id: string
        }
        Update: {
          beneficiary_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          round_number?: number
          scheduled_date?: string | null
          status?: string | null
          tontine_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rounds_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "tontine_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rounds_tontine_id_fkey"
            columns: ["tontine_id"]
            isOneToOne: false
            referencedRelation: "tontines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rounds_tontine_id_fkey"
            columns: ["tontine_id"]
            isOneToOne: false
            referencedRelation: "v_active_disputes"
            referencedColumns: ["id"]
          },
        ]
      }
      tontine_members: {
        Row: {
          id: string
          joined_at: string | null
          name: string
          payout_order: number
          phone: string | null
          role: string | null
          tontine_id: string
          user_id: string | null
        }
        Insert: {
          id?: string
          joined_at?: string | null
          name: string
          payout_order: number
          phone?: string | null
          role?: string | null
          tontine_id: string
          user_id?: string | null
        }
        Update: {
          id?: string
          joined_at?: string | null
          name?: string
          payout_order?: number
          phone?: string | null
          role?: string | null
          tontine_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tontine_members_tontine_id_fkey"
            columns: ["tontine_id"]
            isOneToOne: false
            referencedRelation: "tontines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tontine_members_tontine_id_fkey"
            columns: ["tontine_id"]
            isOneToOne: false
            referencedRelation: "v_active_disputes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tontine_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tontine_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_restricted_users"
            referencedColumns: ["id"]
          },
        ]
      }
      tontines: {
        Row: {
          amount: number
          created_at: string | null
          creator_id: string
          currency: string | null
          current_round: number | null
          distribution_logic: string | null
          frequency: string
          frozen_at: string | null
          frozen_reason: string | null
          governance_flag: Database["public"]["Enums"]["governance_flag_enum"]
          governance_notes: string | null
          id: string
          is_frozen: boolean
          next_deadline: string | null
          start_date: string | null
          status: string | null
          title: string
          total_members: number
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          creator_id: string
          currency?: string | null
          current_round?: number | null
          distribution_logic?: string | null
          frequency: string
          frozen_at?: string | null
          frozen_reason?: string | null
          governance_flag?: Database["public"]["Enums"]["governance_flag_enum"]
          governance_notes?: string | null
          id?: string
          is_frozen?: boolean
          next_deadline?: string | null
          start_date?: string | null
          status?: string | null
          title: string
          total_members: number
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          creator_id?: string
          currency?: string | null
          current_round?: number | null
          distribution_logic?: string | null
          frequency?: string
          frozen_at?: string | null
          frozen_reason?: string | null
          governance_flag?: Database["public"]["Enums"]["governance_flag_enum"]
          governance_notes?: string | null
          id?: string
          is_frozen?: boolean
          next_deadline?: string | null
          start_date?: string | null
          status?: string | null
          title?: string
          total_members?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tontines_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tontines_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "v_restricted_users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_active_disputes: {
        Row: {
          amount: number | null
          created_at: string | null
          creator_id: string | null
          creator_name: string | null
          currency: string | null
          current_round: number | null
          frozen_at: string | null
          frozen_reason: string | null
          governance_flag:
            | Database["public"]["Enums"]["governance_flag_enum"]
            | null
          governance_notes: string | null
          id: string | null
          is_frozen: boolean | null
          title: string | null
          tontine_status: string | null
          total_members: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tontines_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tontines_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "v_restricted_users"
            referencedColumns: ["id"]
          },
        ]
      }
      v_invitation_failures: {
        Row: {
          code: string | null
          created_at: string | null
          created_by: string | null
          creator_name: string | null
          expires_at: string | null
          id: string | null
          max_uses: number | null
          time_since_expiry: unknown
          tontine_id: string | null
          tontine_title: string | null
          used_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_restricted_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_tontine_id_fkey"
            columns: ["tontine_id"]
            isOneToOne: false
            referencedRelation: "tontines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_tontine_id_fkey"
            columns: ["tontine_id"]
            isOneToOne: false
            referencedRelation: "v_active_disputes"
            referencedColumns: ["id"]
          },
        ]
      }
      v_payment_defaults: {
        Row: {
          amount: number | null
          created_at: string | null
          days_overdue: unknown
          full_name: string | null
          id: string | null
          member_id: string | null
          member_name: string | null
          round_id: string | null
          round_number: number | null
          round_scheduled_date: string | null
          status: string | null
          tontine_id: string | null
          tontine_title: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "tontine_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rounds_tontine_id_fkey"
            columns: ["tontine_id"]
            isOneToOne: false
            referencedRelation: "tontines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rounds_tontine_id_fkey"
            columns: ["tontine_id"]
            isOneToOne: false
            referencedRelation: "v_active_disputes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tontine_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tontine_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_restricted_users"
            referencedColumns: ["id"]
          },
        ]
      }
      v_restricted_users: {
        Row: {
          account_status:
            | Database["public"]["Enums"]["account_status_enum"]
            | null
          active_tontines: number | null
          banned_at: string | null
          banned_reason: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          last_login_ip: string | null
          phone: string | null
          suspended_at: string | null
          suspended_reason: string | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_governance_metrics: { Args: Record<string, never>; Returns: Json }
      is_admin:
        | { Args: Record<string, never>; Returns: boolean }
        | { Args: { user_id: string }; Returns: boolean }
      is_tontine_admin: {
        Args: { p_tontine_id: string; p_user_id: string }
        Returns: boolean
      }
      is_tontine_creator: {
        Args: { p_tontine_id: string; p_user_id: string }
        Returns: boolean
      }
      is_tontine_frozen: { Args: { tontine_id: string }; Returns: boolean }
      is_tontine_member: {
        Args: { p_tontine_id: string; p_user_id: string }
        Returns: boolean
      }
      is_user_active: { Args: { user_id: string }; Returns: boolean }
      set_app_kill_switch: { Args: { enabled: boolean }; Returns: Json }
      set_maintenance_mode: {
        Args: { enabled: boolean; message?: string }
        Returns: Json
      }
      set_user_status: {
        Args: {
          new_status: Database["public"]["Enums"]["account_status_enum"]
          status_reason?: string
          target_user_id: string
        }
        Returns: Json
      }
      toggle_tontine_freeze: {
        Args: {
          freeze_reason?: string
          freeze_status: boolean
          target_tontine_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      account_status_enum: "active" | "suspended" | "banned"
      governance_flag_enum: "none" | "under_review" | "disputed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_status_enum: ["active", "suspended", "banned"],
      governance_flag_enum: ["none", "under_review", "disputed"],
    },
  },
} as const
