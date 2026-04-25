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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          after_data: Json | null
          before_data: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      document_versions: {
        Row: {
          change_note: string | null
          document_id: string
          file_name: string
          id: string
          mime_type: string | null
          size_bytes: number | null
          storage_path: string
          uploaded_at: string
          uploaded_by: string | null
          version: number
        }
        Insert: {
          change_note?: string | null
          document_id: string
          file_name: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path: string
          uploaded_at?: string
          uploaded_by?: string | null
          version: number
        }
        Update: {
          change_note?: string | null
          document_id?: string
          file_name?: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string
          uploaded_at?: string
          uploaded_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          current_version: number
          description: string | null
          id: string
          project_id: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          current_version?: number
          description?: string | null
          id?: string
          project_id: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          current_version?: number
          description?: string | null
          id?: string
          project_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      pay_rates: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string
          effective_from: string
          effective_to: string | null
          hourly_rate: number
          id: string
          overtime_multiplier: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency?: string
          effective_from?: string
          effective_to?: string | null
          hourly_rate: number
          id?: string
          overtime_multiplier?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string
          effective_from?: string
          effective_to?: string | null
          hourly_rate?: number
          id?: string
          overtime_multiplier?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payroll_lines: {
        Row: {
          created_at: string
          currency: string
          hourly_rate: number
          id: string
          overtime_hours: number
          overtime_multiplier: number
          overtime_pay: number
          period_id: string
          regular_hours: number
          regular_pay: number
          total_pay: number
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          hourly_rate?: number
          id?: string
          overtime_hours?: number
          overtime_multiplier?: number
          overtime_pay?: number
          period_id: string
          regular_hours?: number
          regular_pay?: number
          total_pay?: number
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          hourly_rate?: number
          id?: string
          overtime_hours?: number
          overtime_multiplier?: number
          overtime_pay?: number
          period_id?: string
          regular_hours?: number
          regular_pay?: number
          total_pay?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_lines_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "payroll_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_periods: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          locked_at: string | null
          locked_by: string | null
          name: string
          notes: string | null
          paid_at: string | null
          period_end: string
          period_start: string
          status: Database["public"]["Enums"]["payroll_period_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          locked_at?: string | null
          locked_by?: string | null
          name: string
          notes?: string | null
          paid_at?: string | null
          period_end: string
          period_start: string
          status?: Database["public"]["Enums"]["payroll_period_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          locked_at?: string | null
          locked_by?: string | null
          name?: string
          notes?: string | null
          paid_at?: string | null
          period_end?: string
          period_start?: string
          status?: Database["public"]["Enums"]["payroll_period_status"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          employee_id: string | null
          full_name: string
          id: string
          job_title: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          employee_id?: string | null
          full_name?: string
          id: string
          job_title?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          employee_id?: string | null
          full_name?: string
          id?: string
          job_title?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_members: {
        Row: {
          added_at: string
          id: string
          project_id: string
          project_role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          project_id: string
          project_role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          added_at?: string
          id?: string
          project_id?: string
          project_role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget: number | null
          client_name: string | null
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          location: string | null
          name: string
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          updated_at: string
        }
        Insert: {
          budget?: number | null
          client_name?: string | null
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          name: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
        }
        Update: {
          budget?: number | null
          client_name?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          name?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
        }
        Relationships: []
      }
      task_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          reason: string | null
          task_id: string
          unassigned_at: string | null
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          reason?: string | null
          task_id: string
          unassigned_at?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          reason?: string | null
          task_id?: string
          unassigned_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_attachments: {
        Row: {
          created_at: string
          file_name: string
          id: string
          mime_type: string | null
          size_bytes: number | null
          storage_path: string
          task_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path: string
          task_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string
          task_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_attachments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_predecessors: {
        Row: {
          id: string
          predecessor_id: string
          task_id: string
        }
        Insert: {
          id?: string
          predecessor_id: string
          task_id: string
        }
        Update: {
          id?: string
          predecessor_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_predecessors_predecessor_id_fkey"
            columns: ["predecessor_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_predecessors_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          from_status: Database["public"]["Enums"]["task_status"] | null
          id: string
          reason: string | null
          task_id: string
          to_status: Database["public"]["Enums"]["task_status"]
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["task_status"] | null
          id?: string
          reason?: string | null
          task_id: string
          to_status: Database["public"]["Enums"]["task_status"]
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["task_status"] | null
          id?: string
          reason?: string | null
          task_id?: string
          to_status?: Database["public"]["Enums"]["task_status"]
        }
        Relationships: [
          {
            foreignKeyName: "task_status_history_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_updates: {
        Row: {
          created_at: string
          hours_worked: number | null
          id: string
          is_blocker: boolean
          note: string | null
          progress_pct: number | null
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hours_worked?: number | null
          id?: string
          is_blocker?: boolean
          note?: string | null
          progress_pct?: number | null
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          hours_worked?: number | null
          id?: string
          is_blocker?: boolean
          note?: string | null
          progress_pct?: number | null
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_updates_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_end: string | null
          actual_hours: number | null
          actual_start: string | null
          approved_at: string | null
          approved_by: string | null
          code: string | null
          created_at: string
          created_by: string | null
          description: string | null
          estimated_hours: number | null
          id: string
          location_zone: string | null
          planned_end: string | null
          planned_start: string | null
          priority: Database["public"]["Enums"]["task_priority"]
          progress_pct: number
          project_id: string
          rejection_reason: string | null
          status: Database["public"]["Enums"]["task_status"]
          task_type: Database["public"]["Enums"]["task_type"]
          title: string
          updated_at: string
        }
        Insert: {
          actual_end?: string | null
          actual_hours?: number | null
          actual_start?: string | null
          approved_at?: string | null
          approved_by?: string | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          location_zone?: string | null
          planned_end?: string | null
          planned_start?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          progress_pct?: number
          project_id: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          task_type?: Database["public"]["Enums"]["task_type"]
          title: string
          updated_at?: string
        }
        Update: {
          actual_end?: string | null
          actual_hours?: number | null
          actual_start?: string | null
          approved_at?: string | null
          approved_by?: string | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          location_zone?: string | null
          planned_end?: string | null
          planned_start?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          progress_pct?: number
          project_id?: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          task_type?: Database["public"]["Enums"]["task_type"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      timesheet_entries: {
        Row: {
          created_at: string
          end_time: string | null
          flags: Json
          id: string
          notes: string | null
          overtime_hours: number
          project_id: string
          regular_hours: number
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["timesheet_status"]
          submitted_at: string | null
          task_id: string | null
          updated_at: string
          user_id: string
          work_date: string
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          flags?: Json
          id?: string
          notes?: string | null
          overtime_hours?: number
          project_id: string
          regular_hours?: number
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["timesheet_status"]
          submitted_at?: string | null
          task_id?: string | null
          updated_at?: string
          user_id: string
          work_date: string
        }
        Update: {
          created_at?: string
          end_time?: string | null
          flags?: Json
          id?: string
          notes?: string | null
          overtime_hours?: number
          project_id?: string
          regular_hours?: number
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["timesheet_status"]
          submitted_at?: string | null
          task_id?: string | null
          updated_at?: string
          user_id?: string
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "timesheet_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheet_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
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
      compute_payroll_lines: {
        Args: { _period_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "project_manager"
        | "engineer"
        | "supervisor"
        | "worker"
        | "qaqc_inspector"
        | "accountant"
      payroll_period_status: "open" | "locked" | "paid"
      project_status:
        | "planning"
        | "active"
        | "on_hold"
        | "completed"
        | "cancelled"
      task_priority: "low" | "medium" | "high" | "critical"
      task_status:
        | "open"
        | "assigned"
        | "in_progress"
        | "pending_approval"
        | "approved"
        | "rejected"
        | "completed"
        | "closed"
      task_type:
        | "concrete"
        | "steel"
        | "mep"
        | "finishing"
        | "excavation"
        | "inspection"
        | "other"
      timesheet_status: "draft" | "submitted" | "approved" | "rejected"
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
      app_role: [
        "admin",
        "project_manager",
        "engineer",
        "supervisor",
        "worker",
        "qaqc_inspector",
        "accountant",
      ],
      payroll_period_status: ["open", "locked", "paid"],
      project_status: [
        "planning",
        "active",
        "on_hold",
        "completed",
        "cancelled",
      ],
      task_priority: ["low", "medium", "high", "critical"],
      task_status: [
        "open",
        "assigned",
        "in_progress",
        "pending_approval",
        "approved",
        "rejected",
        "completed",
        "closed",
      ],
      task_type: [
        "concrete",
        "steel",
        "mep",
        "finishing",
        "excavation",
        "inspection",
        "other",
      ],
      timesheet_status: ["draft", "submitted", "approved", "rejected"],
    },
  },
} as const
