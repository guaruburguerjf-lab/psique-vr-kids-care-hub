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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      ai_characters: {
        Row: {
          audience: Database["public"]["Enums"]["audience"]
          created_at: string
          description: string | null
          enabled_for_patients: boolean
          id: string
          name: string
          owner_id: string | null
          persona: string | null
          safety_config: Json
          slug: string
          updated_at: string
        }
        Insert: {
          audience?: Database["public"]["Enums"]["audience"]
          created_at?: string
          description?: string | null
          enabled_for_patients?: boolean
          id?: string
          name: string
          owner_id?: string | null
          persona?: string | null
          safety_config?: Json
          slug: string
          updated_at?: string
        }
        Update: {
          audience?: Database["public"]["Enums"]["audience"]
          created_at?: string
          description?: string | null
          enabled_for_patients?: boolean
          id?: string
          name?: string
          owner_id?: string | null
          persona?: string | null
          safety_config?: Json
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_content: {
        Row: {
          approved: boolean
          approved_at: string | null
          body: string
          character_id: string
          content_type: string
          created_at: string
          id: string
          owner_id: string
          title: string
          updated_at: string
        }
        Insert: {
          approved?: boolean
          approved_at?: string | null
          body: string
          character_id: string
          content_type: string
          created_at?: string
          id?: string
          owner_id?: string
          title: string
          updated_at?: string
        }
        Update: {
          approved?: boolean
          approved_at?: string | null
          body?: string
          character_id?: string
          content_type?: string
          created_at?: string
          id?: string
          owner_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_content_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "ai_characters"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          created_at: string
          id: string
          instrument: string
          moment: string | null
          notes: string | null
          owner_id: string
          patient_id: string
          responses: Json
          score: number | null
          session_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          instrument: string
          moment?: string | null
          notes?: string | null
          owner_id?: string
          patient_id: string
          responses?: Json
          score?: number | null
          session_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          instrument?: string
          moment?: string | null
          notes?: string | null
          owner_id?: string
          patient_id?: string
          responses?: Json
          score?: number | null
          session_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          owner_id: string
          summary: string | null
          updated_at: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          owner_id: string
          summary?: string | null
          updated_at?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          owner_id?: string
          summary?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      clinical_goals: {
        Row: {
          created_at: string
          description: string | null
          id: string
          owner_id: string
          patient_id: string
          status: Database["public"]["Enums"]["goal_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          owner_id?: string
          patient_id: string
          status?: Database["public"]["Enums"]["goal_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          owner_id?: string
          patient_id?: string
          status?: Database["public"]["Enums"]["goal_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinical_goals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          owner_id: string
          patient_id: string
          session_id: string | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          owner_id?: string
          patient_id: string
          session_id?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          owner_id?: string
          patient_id?: string
          session_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinical_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      consents: {
        Row: {
          consent_type: string
          created_at: string
          document_version: string | null
          granted_at: string | null
          guardian_id: string | null
          id: string
          notes: string | null
          owner_id: string
          patient_id: string
          revoked_at: string | null
          status: Database["public"]["Enums"]["consent_status"]
          updated_at: string
        }
        Insert: {
          consent_type: string
          created_at?: string
          document_version?: string | null
          granted_at?: string | null
          guardian_id?: string | null
          id?: string
          notes?: string | null
          owner_id?: string
          patient_id: string
          revoked_at?: string | null
          status?: Database["public"]["Enums"]["consent_status"]
          updated_at?: string
        }
        Update: {
          consent_type?: string
          created_at?: string
          document_version?: string | null
          granted_at?: string | null
          guardian_id?: string | null
          id?: string
          notes?: string | null
          owner_id?: string
          patient_id?: string
          revoked_at?: string | null
          status?: Database["public"]["Enums"]["consent_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consents_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "guardians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      experiences: {
        Row: {
          audience: Database["public"]["Enums"]["audience"]
          category: string
          contraindications: string | null
          created_at: string
          description: string | null
          id: string
          indications: string | null
          min_age: number
          name: string
          objective: string | null
          owner_id: string | null
          requires_vr: boolean
          settings: Json
          slug: string
          status: Database["public"]["Enums"]["publication_status"]
          suggested_duration_min: number
          updated_at: string
        }
        Insert: {
          audience: Database["public"]["Enums"]["audience"]
          category: string
          contraindications?: string | null
          created_at?: string
          description?: string | null
          id?: string
          indications?: string | null
          min_age?: number
          name: string
          objective?: string | null
          owner_id?: string | null
          requires_vr?: boolean
          settings?: Json
          slug: string
          status?: Database["public"]["Enums"]["publication_status"]
          suggested_duration_min?: number
          updated_at?: string
        }
        Update: {
          audience?: Database["public"]["Enums"]["audience"]
          category?: string
          contraindications?: string | null
          created_at?: string
          description?: string | null
          id?: string
          indications?: string | null
          min_age?: number
          name?: string
          objective?: string | null
          owner_id?: string | null
          requires_vr?: boolean
          settings?: Json
          slug?: string
          status?: Database["public"]["Enums"]["publication_status"]
          suggested_duration_min?: number
          updated_at?: string
        }
        Relationships: []
      }
      guardians: {
        Row: {
          authorization_date: string | null
          authorization_granted: boolean
          authorization_notes: string | null
          created_at: string
          document: string | null
          email: string | null
          full_name: string
          id: string
          is_legal_guardian: boolean
          owner_id: string
          patient_id: string
          phone: string | null
          relationship: string
          updated_at: string
        }
        Insert: {
          authorization_date?: string | null
          authorization_granted?: boolean
          authorization_notes?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          full_name: string
          id?: string
          is_legal_guardian?: boolean
          owner_id?: string
          patient_id: string
          phone?: string | null
          relationship: string
          updated_at?: string
        }
        Update: {
          authorization_date?: string | null
          authorization_granted?: boolean
          authorization_notes?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_legal_guardian?: boolean
          owner_id?: string
          patient_id?: string
          phone?: string | null
          relationship?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guardians_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          birth_date: string
          consent_status: Database["public"]["Enums"]["consent_status"]
          created_at: string
          full_name: string
          id: string
          internal_code: string
          is_demo: boolean
          modality: Database["public"]["Enums"]["patient_modality"]
          owner_id: string
          professional_notes: string | null
          therapeutic_goals: string | null
          updated_at: string
        }
        Insert: {
          birth_date: string
          consent_status?: Database["public"]["Enums"]["consent_status"]
          created_at?: string
          full_name: string
          id?: string
          internal_code: string
          is_demo?: boolean
          modality: Database["public"]["Enums"]["patient_modality"]
          owner_id?: string
          professional_notes?: string | null
          therapeutic_goals?: string | null
          updated_at?: string
        }
        Update: {
          birth_date?: string
          consent_status?: Database["public"]["Enums"]["consent_status"]
          created_at?: string
          full_name?: string
          id?: string
          internal_code?: string
          is_demo?: boolean
          modality?: Database["public"]["Enums"]["patient_modality"]
          owner_id?: string
          professional_notes?: string | null
          therapeutic_goals?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          crp: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          crp?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          crp?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      session_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          occurred_at: string
          owner_id: string
          payload: Json
          session_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          occurred_at?: string
          owner_id?: string
          payload?: Json
          session_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          occurred_at?: string
          owner_id?: string
          payload?: Json
          session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          access_code_expires_at: string | null
          access_code_hash: string | null
          access_code_used_at: string | null
          created_at: string
          ended_at: string | null
          experience_id: string | null
          id: string
          mode: Database["public"]["Enums"]["session_mode"]
          notes: string | null
          objective: string | null
          owner_id: string
          patient_id: string
          planned_duration_min: number
          scheduled_at: string | null
          self_report: Json | null
          started_at: string | null
          status: Database["public"]["Enums"]["session_status"]
          updated_at: string
        }
        Insert: {
          access_code_expires_at?: string | null
          access_code_hash?: string | null
          access_code_used_at?: string | null
          created_at?: string
          ended_at?: string | null
          experience_id?: string | null
          id?: string
          mode?: Database["public"]["Enums"]["session_mode"]
          notes?: string | null
          objective?: string | null
          owner_id?: string
          patient_id: string
          planned_duration_min?: number
          scheduled_at?: string | null
          self_report?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["session_status"]
          updated_at?: string
        }
        Update: {
          access_code_expires_at?: string | null
          access_code_hash?: string | null
          access_code_used_at?: string | null
          created_at?: string
          ended_at?: string | null
          experience_id?: string | null
          id?: string
          mode?: Database["public"]["Enums"]["session_mode"]
          notes?: string | null
          objective?: string | null
          owner_id?: string
          patient_id?: string
          planned_duration_min?: number
          scheduled_at?: string | null
          self_report?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["session_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      owns_patient: { Args: { _patient_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin"
      audience: "adulto" | "infantil"
      consent_status: "pendente" | "concedido" | "revogado"
      goal_status: "ativo" | "alcancado" | "pausado"
      patient_modality: "adulto" | "infantil"
      publication_status: "rascunho" | "publicado" | "arquivado"
      session_mode: "vr" | "tela"
      session_status:
        | "agendada"
        | "em_andamento"
        | "interrompida"
        | "concluida"
        | "cancelada"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin"],
      audience: ["adulto", "infantil"],
      consent_status: ["pendente", "concedido", "revogado"],
      goal_status: ["ativo", "alcancado", "pausado"],
      patient_modality: ["adulto", "infantil"],
      publication_status: ["rascunho", "publicado", "arquivado"],
      session_mode: ["vr", "tela"],
      session_status: [
        "agendada",
        "em_andamento",
        "interrompida",
        "concluida",
        "cancelada",
      ],
    },
  },
} as const
