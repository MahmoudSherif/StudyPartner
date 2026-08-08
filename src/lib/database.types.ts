export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          key: string
          progress: number
          unlocked: boolean
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          key: string
          progress?: number
          unlocked?: boolean
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          key?: string
          progress?: number
          unlocked?: boolean
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          end_time: string | null
          event_date: string
          id: string
          is_all_day: boolean
          start_time: string | null
          subject_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date: string
          id?: string
          is_all_day?: boolean
          start_time?: string | null
          subject_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date?: string
          id?: string
          is_all_day?: boolean
          start_time?: string | null
          subject_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_participants: {
        Row: {
          challenge_id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          joined_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_task_completions: {
        Row: {
          completed_at: string
          task_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          task_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_task_completions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "challenge_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_tasks: {
        Row: {
          challenge_id: string
          created_at: string
          description: string | null
          id: string
          points: number
          title: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          description?: string | null
          id?: string
          points?: number
          title: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          description?: string | null
          id?: string
          points?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_tasks_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          code: string
          created_at: string
          created_by: string
          description: string
          end_date: string | null
          final_points: Json | null
          id: string
          is_active: boolean
          title: string
          updated_at: string
          winner_ids: string[] | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by: string
          description?: string
          end_date?: string | null
          final_points?: Json | null
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
          winner_ids?: string[] | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          description?: string
          end_date?: string | null
          final_points?: Json | null
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
          winner_ids?: string[] | null
        }
        Relationships: []
      }
      focus_sessions: {
        Row: {
          category: string | null
          completed: boolean
          created_at: string
          duration: number
          end_time: string | null
          id: string
          is_running: boolean
          notes: string | null
          start_time: string
          title: string
          user_id: string
        }
        Insert: {
          category?: string | null
          completed?: boolean
          created_at?: string
          duration?: number
          end_time?: string | null
          id?: string
          is_running?: boolean
          notes?: string | null
          start_time: string
          title?: string
          user_id: string
        }
        Update: {
          category?: string | null
          completed?: boolean
          created_at?: string
          duration?: number
          end_time?: string | null
          id?: string
          is_running?: boolean
          notes?: string | null
          start_time?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          category: string
          created_at: string
          current: number
          deadline: string | null
          description: string | null
          id: string
          is_completed: boolean
          target: number
          title: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          current?: number
          deadline?: string | null
          description?: string | null
          id?: string
          is_completed?: boolean
          target?: number
          title: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          current?: number
          deadline?: string | null
          description?: string | null
          id?: string
          is_completed?: boolean
          target?: number
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      sticky_notes: {
        Row: {
          color: string
          content: string
          created_at: string
          height: number
          id: string
          is_pinned: boolean
          position_x: number
          position_y: number
          tags: string[]
          title: string
          updated_at: string
          user_id: string
          width: number
        }
        Insert: {
          color?: string
          content?: string
          created_at?: string
          height?: number
          id?: string
          is_pinned?: boolean
          position_x?: number
          position_y?: number
          tags?: string[]
          title?: string
          updated_at?: string
          user_id: string
          width?: number
        }
        Update: {
          color?: string
          content?: string
          created_at?: string
          height?: number
          id?: string
          is_pinned?: boolean
          position_x?: number
          position_y?: number
          tags?: string[]
          title?: string
          updated_at?: string
          user_id?: string
          width?: number
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          completed: boolean
          created_at: string
          duration: number
          end_time: string | null
          id: string
          start_time: string
          subject_id: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          duration?: number
          end_time?: string | null
          id?: string
          start_time: string
          subject_id?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          duration?: number
          end_time?: string | null
          id?: string
          start_time?: string
          subject_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          color: string
          created_at: string
          daily_target: number | null
          goal: number | null
          id: string
          name: string
          total_time: number
          user_id: string
          weekly_target: number | null
        }
        Insert: {
          color?: string
          created_at?: string
          daily_target?: number | null
          goal?: number | null
          id?: string
          name: string
          total_time?: number
          user_id: string
          weekly_target?: number | null
        }
        Update: {
          color?: string
          created_at?: string
          daily_target?: number | null
          goal?: number | null
          id?: string
          name?: string
          total_time?: number
          user_id?: string
          weekly_target?: number | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          estimated_time: number | null
          id: string
          priority: string
          subject_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_time?: number | null
          id?: string
          priority?: string
          subject_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_time?: number | null
          id?: string
          priority?: string
          subject_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          settings: Json
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          settings?: Json
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          settings?: Json
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      challenge_leaderboard: {
        Row: {
          challenge_id: string | null
          points: number | null
          tasks_completed: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_tasks_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_totals: {
        Row: {
          challenge_id: string | null
          max_points: number | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_tasks_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      create_challenge: {
        Args: { p_description?: string; p_end_date?: string; p_title: string }
        Returns: {
          code: string
          created_at: string
          created_by: string
          description: string
          end_date: string | null
          final_points: Json | null
          id: string
          is_active: boolean
          title: string
          updated_at: string
          winner_ids: string[] | null
        }
        SetofOptions: {
          from: "*"
          to: "challenges"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      end_challenge: {
        Args: { p_challenge_id: string }
        Returns: {
          code: string
          created_at: string
          created_by: string
          description: string
          end_date: string | null
          final_points: Json | null
          id: string
          is_active: boolean
          title: string
          updated_at: string
          winner_ids: string[] | null
        }
        SetofOptions: {
          from: "*"
          to: "challenges"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      generate_challenge_code: { Args: never; Returns: string }
      is_challenge_member: { Args: { cid: string }; Returns: boolean }
      is_challenge_owner: { Args: { cid: string }; Returns: boolean }
      join_challenge: {
        Args: { p_code: string }
        Returns: {
          code: string
          created_at: string
          created_by: string
          description: string
          end_date: string | null
          final_points: Json | null
          id: string
          is_active: boolean
          title: string
          updated_at: string
          winner_ids: string[] | null
        }
        SetofOptions: {
          from: "*"
          to: "challenges"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      toggle_challenge_task: { Args: { p_task_id: string }; Returns: boolean }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

