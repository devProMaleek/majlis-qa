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
      events: {
        Row: {
          created_at: string;
          description: string;
          ends_on: string | null;
          id: string;
          name: string;
          organisation_id: string;
          published_at: string | null;
          slug: string;
          starts_on: string | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          description?: string;
          ends_on?: string | null;
          id?: string;
          name: string;
          organisation_id: string;
          published_at?: string | null;
          slug: string;
          starts_on?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          ends_on?: string | null;
          id?: string;
          name?: string;
          organisation_id?: string;
          published_at?: string | null;
          slug?: string;
          starts_on?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "events_organisation_id_fkey";
            columns: ["organisation_id"];
            isOneToOne: false;
            referencedRelation: "organisations";
            referencedColumns: ["id"];
          },
        ];
      };
      lecture_sessions: {
        Row: {
          created_at: string;
          event_id: string;
          id: string;
          lecturer_name: string | null;
          organisation_id: string;
          position: number;
          revision: number;
          status: Database["public"]["Enums"]["session_status"];
          title: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          event_id: string;
          id?: string;
          lecturer_name?: string | null;
          organisation_id: string;
          position?: number;
          revision?: number;
          status?: Database["public"]["Enums"]["session_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          event_id?: string;
          id?: string;
          lecturer_name?: string | null;
          organisation_id?: string;
          position?: number;
          revision?: number;
          status?: Database["public"]["Enums"]["session_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lecture_sessions_event_id_organisation_id_fkey";
            columns: ["event_id", "organisation_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id", "organisation_id"];
          },
        ];
      };
      moderator_assignments: {
        Row: {
          created_at: string;
          organisation_id: string;
          session_id: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          organisation_id: string;
          session_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          organisation_id?: string;
          session_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "moderator_assignments_organisation_id_user_id_fkey";
            columns: ["organisation_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "organisation_memberships";
            referencedColumns: ["organisation_id", "user_id"];
          },
          {
            foreignKeyName: "moderator_assignments_session_id_organisation_id_fkey";
            columns: ["session_id", "organisation_id"];
            isOneToOne: false;
            referencedRelation: "lecture_sessions";
            referencedColumns: ["id", "organisation_id"];
          },
        ];
      };
      organisation_memberships: {
        Row: {
          created_at: string;
          organisation_id: string;
          role: Database["public"]["Enums"]["staff_role"];
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          organisation_id: string;
          role: Database["public"]["Enums"]["staff_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          organisation_id?: string;
          role?: Database["public"]["Enums"]["staff_role"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organisation_memberships_organisation_id_fkey";
            columns: ["organisation_id"];
            isOneToOne: false;
            referencedRelation: "organisations";
            referencedColumns: ["id"];
          },
        ];
      };
      organisations: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          slug: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          body: string;
          created_at: string;
          event_id: string;
          id: string;
          organisation_id: string;
          revision: number;
          session_id: string;
          status: Database["public"]["Enums"]["question_status"];
          submission_id: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          body: string;
          created_at?: string;
          event_id: string;
          id?: string;
          organisation_id: string;
          revision?: number;
          session_id: string;
          status?: Database["public"]["Enums"]["question_status"];
          submission_id: string;
          updated_at?: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          event_id?: string;
          id?: string;
          organisation_id?: string;
          revision?: number;
          session_id?: string;
          status?: Database["public"]["Enums"]["question_status"];
          submission_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "questions_session_id_event_id_organisation_id_fkey";
            columns: ["session_id", "event_id", "organisation_id"];
            isOneToOne: false;
            referencedRelation: "lecture_sessions";
            referencedColumns: ["id", "event_id", "organisation_id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      set_session_status: {
        Args: {
          desired_status: Database["public"]["Enums"]["session_status"];
          expected_revision: number;
          target_session_id: string;
        };
        Returns: {
          created_at: string;
          event_id: string;
          id: string;
          lecturer_name: string | null;
          organisation_id: string;
          position: number;
          revision: number;
          status: Database["public"]["Enums"]["session_status"];
          title: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "lecture_sessions";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
    };
    Enums: {
      question_status: "new" | "selected" | "answered" | "dismissed";
      session_status: "scheduled" | "open" | "closed";
      staff_role: "organisation_admin" | "moderator";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      question_status: ["new", "selected", "answered", "dismissed"],
      session_status: ["scheduled", "open", "closed"],
      staff_role: ["organisation_admin", "moderator"],
    },
  },
} as const;
