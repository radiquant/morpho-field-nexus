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
      client_vectors: {
        Row: {
          attractor_distance: number | null
          client_id: string
          created_at: string
          dimension_emotional: number
          dimension_energy: number
          dimension_mental: number
          dimension_physical: number
          dimension_stress: number
          gsr_value: number | null
          hrv_value: number | null
          id: string
          input_method: string | null
          notes: string | null
          phase: string | null
          primary_concern: string | null
          sensor_data: Json | null
          session_id: string
        }
        Insert: {
          attractor_distance?: number | null
          client_id: string
          created_at?: string
          dimension_emotional: number
          dimension_energy: number
          dimension_mental: number
          dimension_physical: number
          dimension_stress: number
          gsr_value?: number | null
          hrv_value?: number | null
          id?: string
          input_method?: string | null
          notes?: string | null
          phase?: string | null
          primary_concern?: string | null
          sensor_data?: Json | null
          session_id: string
        }
        Update: {
          attractor_distance?: number | null
          client_id?: string
          created_at?: string
          dimension_emotional?: number
          dimension_energy?: number
          dimension_mental?: number
          dimension_physical?: number
          dimension_stress?: number
          gsr_value?: number | null
          hrv_value?: number | null
          id?: string
          input_method?: string | null
          notes?: string | null
          phase?: string | null
          primary_concern?: string | null
          sensor_data?: Json | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_vectors_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          birth_date: string
          birth_place: string
          created_at: string
          field_signature: string | null
          first_name: string
          id: string
          last_name: string
          notes: string | null
          photo_url: string | null
          updated_at: string
        }
        Insert: {
          birth_date: string
          birth_place: string
          created_at?: string
          field_signature?: string | null
          first_name: string
          id?: string
          last_name: string
          notes?: string | null
          photo_url?: string | null
          updated_at?: string
        }
        Update: {
          birth_date?: string
          birth_place?: string
          created_at?: string
          field_signature?: string | null
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          photo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      harmonization_protocols: {
        Row: {
          amplitude: number
          client_id: string
          completed_at: string | null
          created_at: string
          duration_seconds: number | null
          effectiveness_rating: number | null
          frequency: number
          id: string
          modulation_depth: number | null
          modulation_enabled: boolean | null
          modulation_frequency: number | null
          modulation_type: string | null
          output_type: string
          result_notes: string | null
          started_at: string | null
          status: string | null
          vector_id: string | null
          waveform: string
        }
        Insert: {
          amplitude?: number
          client_id: string
          completed_at?: string | null
          created_at?: string
          duration_seconds?: number | null
          effectiveness_rating?: number | null
          frequency: number
          id?: string
          modulation_depth?: number | null
          modulation_enabled?: boolean | null
          modulation_frequency?: number | null
          modulation_type?: string | null
          output_type?: string
          result_notes?: string | null
          started_at?: string | null
          status?: string | null
          vector_id?: string | null
          waveform?: string
        }
        Update: {
          amplitude?: number
          client_id?: string
          completed_at?: string | null
          created_at?: string
          duration_seconds?: number | null
          effectiveness_rating?: number | null
          frequency?: number
          id?: string
          modulation_depth?: number | null
          modulation_enabled?: boolean | null
          modulation_frequency?: number | null
          modulation_type?: string | null
          output_type?: string
          result_notes?: string | null
          started_at?: string | null
          status?: string | null
          vector_id?: string | null
          waveform?: string
        }
        Relationships: [
          {
            foreignKeyName: "harmonization_protocols_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "harmonization_protocols_vector_id_fkey"
            columns: ["vector_id"]
            isOneToOne: false
            referencedRelation: "client_vectors"
            referencedColumns: ["id"]
          },
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
    Enums: {},
  },
} as const
