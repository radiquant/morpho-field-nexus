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
      anatomy_models: {
        Row: {
          applicable_organ_systems: string[] | null
          author: string | null
          body_height_normalized: boolean | null
          category: string
          created_at: string
          description: string | null
          draco_compressed: boolean | null
          file_path: string
          file_size_bytes: number | null
          gender: string | null
          id: string
          is_default: boolean | null
          license: string | null
          license_url: string | null
          metadata: Json | null
          name: string
          polygon_count: number | null
          sort_order: number | null
          source: string
          storage_type: string
          supports_meridian_mapping: boolean | null
          supports_organ_layers: boolean | null
          supports_skeleton: boolean | null
          thumbnail_url: string | null
          updated_at: string
          version: string | null
          visible_layers: string[] | null
        }
        Insert: {
          applicable_organ_systems?: string[] | null
          author?: string | null
          body_height_normalized?: boolean | null
          category?: string
          created_at?: string
          description?: string | null
          draco_compressed?: boolean | null
          file_path: string
          file_size_bytes?: number | null
          gender?: string | null
          id?: string
          is_default?: boolean | null
          license?: string | null
          license_url?: string | null
          metadata?: Json | null
          name: string
          polygon_count?: number | null
          sort_order?: number | null
          source?: string
          storage_type?: string
          supports_meridian_mapping?: boolean | null
          supports_organ_layers?: boolean | null
          supports_skeleton?: boolean | null
          thumbnail_url?: string | null
          updated_at?: string
          version?: string | null
          visible_layers?: string[] | null
        }
        Update: {
          applicable_organ_systems?: string[] | null
          author?: string | null
          body_height_normalized?: boolean | null
          category?: string
          created_at?: string
          description?: string | null
          draco_compressed?: boolean | null
          file_path?: string
          file_size_bytes?: number | null
          gender?: string | null
          id?: string
          is_default?: boolean | null
          license?: string | null
          license_url?: string | null
          metadata?: Json | null
          name?: string
          polygon_count?: number | null
          sort_order?: number | null
          source?: string
          storage_type?: string
          supports_meridian_mapping?: boolean | null
          supports_organ_layers?: boolean | null
          supports_skeleton?: boolean | null
          thumbnail_url?: string | null
          updated_at?: string
          version?: string | null
          visible_layers?: string[] | null
        }
        Relationships: []
      }
      anatomy_resonance_points: {
        Row: {
          body_region: string
          created_at: string
          description: string | null
          emotional_associations: string[] | null
          harmonic_frequencies: number[] | null
          id: string
          meridian_associations: string[] | null
          name: string
          name_latin: string | null
          organ_associations: string[] | null
          primary_frequency: number
          x_position: number
          y_position: number
          z_position: number
        }
        Insert: {
          body_region: string
          created_at?: string
          description?: string | null
          emotional_associations?: string[] | null
          harmonic_frequencies?: number[] | null
          id?: string
          meridian_associations?: string[] | null
          name: string
          name_latin?: string | null
          organ_associations?: string[] | null
          primary_frequency: number
          x_position: number
          y_position: number
          z_position: number
        }
        Update: {
          body_region?: string
          created_at?: string
          description?: string | null
          emotional_associations?: string[] | null
          harmonic_frequencies?: number[] | null
          id?: string
          meridian_associations?: string[] | null
          name?: string
          name_latin?: string | null
          organ_associations?: string[] | null
          primary_frequency?: number
          x_position?: number
          y_position?: number
          z_position?: number
        }
        Relationships: []
      }
      chreode_trajectories: {
        Row: {
          attractor_distance: number | null
          bifurcation_risk: number | null
          chreode_alignment: number | null
          client_id: string
          created_at: string
          dimensions: number[]
          entropy_modulation: number[] | null
          id: string
          phase: string | null
          session_id: string
          stability: number | null
          timestamp: string
        }
        Insert: {
          attractor_distance?: number | null
          bifurcation_risk?: number | null
          chreode_alignment?: number | null
          client_id: string
          created_at?: string
          dimensions: number[]
          entropy_modulation?: number[] | null
          id?: string
          phase?: string | null
          session_id: string
          stability?: number | null
          timestamp?: string
        }
        Update: {
          attractor_distance?: number | null
          bifurcation_risk?: number | null
          chreode_alignment?: number | null
          client_id?: string
          created_at?: string
          dimensions?: number[]
          entropy_modulation?: number[] | null
          id?: string
          phase?: string | null
          session_id?: string
          stability?: number | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "chreode_trajectories_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chreode_trajectories_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "treatment_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
        }
        Relationships: []
      }
      harmonization_jobs: {
        Row: {
          client_id: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          job_type: string
          priority: number | null
          progress: number | null
          protocol_id: string | null
          result_data: Json | null
          started_at: string | null
          status: string
          target_anatomy_points: string[] | null
          target_frequencies: number[] | null
          target_word_energies: string[] | null
          vector_id: string | null
        }
        Insert: {
          client_id: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          job_type?: string
          priority?: number | null
          progress?: number | null
          protocol_id?: string | null
          result_data?: Json | null
          started_at?: string | null
          status?: string
          target_anatomy_points?: string[] | null
          target_frequencies?: number[] | null
          target_word_energies?: string[] | null
          vector_id?: string | null
        }
        Update: {
          client_id?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          job_type?: string
          priority?: number | null
          progress?: number | null
          protocol_id?: string | null
          result_data?: Json | null
          started_at?: string | null
          status?: string
          target_anatomy_points?: string[] | null
          target_frequencies?: number[] | null
          target_word_energies?: string[] | null
          vector_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "harmonization_jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "harmonization_jobs_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "harmonization_protocols"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "harmonization_jobs_vector_id_fkey"
            columns: ["vector_id"]
            isOneToOne: false
            referencedRelation: "client_vectors"
            referencedColumns: ["id"]
          },
        ]
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
      organ_scan_points: {
        Row: {
          body_region: string
          created_at: string
          description: string | null
          dysregulation_threshold: number | null
          harmonic_frequencies: number[] | null
          id: string
          layer_depth: string | null
          organ_name_de: string
          organ_name_latin: string | null
          organ_system: string
          point_index: number
          point_name: string
          scan_frequency: number
          tissue_type: string | null
          x_position: number
          y_position: number
          z_position: number
        }
        Insert: {
          body_region: string
          created_at?: string
          description?: string | null
          dysregulation_threshold?: number | null
          harmonic_frequencies?: number[] | null
          id?: string
          layer_depth?: string | null
          organ_name_de: string
          organ_name_latin?: string | null
          organ_system: string
          point_index: number
          point_name: string
          scan_frequency: number
          tissue_type?: string | null
          x_position: number
          y_position: number
          z_position: number
        }
        Update: {
          body_region?: string
          created_at?: string
          description?: string | null
          dysregulation_threshold?: number | null
          harmonic_frequencies?: number[] | null
          id?: string
          layer_depth?: string | null
          organ_name_de?: string
          organ_name_latin?: string | null
          organ_system?: string
          point_index?: number
          point_name?: string
          scan_frequency?: number
          tissue_type?: string | null
          x_position?: number
          y_position?: number
          z_position?: number
        }
        Relationships: []
      }
      remedies: {
        Row: {
          category: string
          contraindications: string | null
          created_at: string
          description: string | null
          element: string | null
          emotional_pattern: string | null
          frequency: number | null
          id: string
          meridian_associations: string[] | null
          name: string
          name_latin: string | null
          organ_associations: string[] | null
          potency: string | null
          source: string | null
        }
        Insert: {
          category?: string
          contraindications?: string | null
          created_at?: string
          description?: string | null
          element?: string | null
          emotional_pattern?: string | null
          frequency?: number | null
          id?: string
          meridian_associations?: string[] | null
          name: string
          name_latin?: string | null
          organ_associations?: string[] | null
          potency?: string | null
          source?: string | null
        }
        Update: {
          category?: string
          contraindications?: string | null
          created_at?: string
          description?: string | null
          element?: string | null
          emotional_pattern?: string | null
          frequency?: number | null
          id?: string
          meridian_associations?: string[] | null
          name?: string
          name_latin?: string | null
          organ_associations?: string[] | null
          potency?: string | null
          source?: string | null
        }
        Relationships: []
      }
      resonance_results: {
        Row: {
          body_region: string
          client_id: string
          created_at: string
          dysregulation_score: number | null
          harmonic_pattern: number[] | null
          id: string
          intensity: number
          notes: string | null
          organ_name: string
          organ_system: string
          polarity: string
          scan_frequency: number
          scan_point_id: string | null
          session_id: string
        }
        Insert: {
          body_region: string
          client_id: string
          created_at?: string
          dysregulation_score?: number | null
          harmonic_pattern?: number[] | null
          id?: string
          intensity?: number
          notes?: string | null
          organ_name: string
          organ_system: string
          polarity?: string
          scan_frequency: number
          scan_point_id?: string | null
          session_id: string
        }
        Update: {
          body_region?: string
          client_id?: string
          created_at?: string
          dysregulation_score?: number | null
          harmonic_pattern?: number[] | null
          id?: string
          intensity?: number
          notes?: string | null
          organ_name?: string
          organ_system?: string
          polarity?: string
          scan_frequency?: number
          scan_point_id?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resonance_results_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resonance_results_scan_point_id_fkey"
            columns: ["scan_point_id"]
            isOneToOne: false
            referencedRelation: "organ_scan_points"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resonance_results_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "treatment_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      treatment_sessions: {
        Row: {
          client_id: string
          created_at: string
          diagnosis_snapshot: Json | null
          duration_seconds: number | null
          id: string
          notes: string | null
          session_date: string
          session_number: number
          status: string
          treatment_summary: Json | null
          updated_at: string
          vector_snapshot: Json | null
        }
        Insert: {
          client_id: string
          created_at?: string
          diagnosis_snapshot?: Json | null
          duration_seconds?: number | null
          id?: string
          notes?: string | null
          session_date?: string
          session_number?: number
          status?: string
          treatment_summary?: Json | null
          updated_at?: string
          vector_snapshot?: Json | null
        }
        Update: {
          client_id?: string
          created_at?: string
          diagnosis_snapshot?: Json | null
          duration_seconds?: number | null
          id?: string
          notes?: string | null
          session_date?: string
          session_number?: number
          status?: string
          treatment_summary?: Json | null
          updated_at?: string
          vector_snapshot?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "treatment_sessions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      word_energies: {
        Row: {
          amplitude: number | null
          category: string
          chakra: string | null
          created_at: string
          description: string | null
          emotional_quality: string | null
          frequency: number
          id: string
          language: string | null
          meridian: string | null
          organ_system: string | null
          word: string
        }
        Insert: {
          amplitude?: number | null
          category: string
          chakra?: string | null
          created_at?: string
          description?: string | null
          emotional_quality?: string | null
          frequency: number
          id?: string
          language?: string | null
          meridian?: string | null
          organ_system?: string | null
          word: string
        }
        Update: {
          amplitude?: number | null
          category?: string
          chakra?: string | null
          created_at?: string
          description?: string | null
          emotional_quality?: string | null
          frequency?: number
          id?: string
          language?: string | null
          meridian?: string | null
          organ_system?: string | null
          word?: string
        }
        Relationships: []
      }
      word_energy_collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
          words: string[]
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
          words?: string[]
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
          words?: string[]
        }
        Relationships: []
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
