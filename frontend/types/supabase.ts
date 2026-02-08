export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.1';
  };
  public: {
    Tables: {
      candidates: {
        Row: {
          created_at: string | null;
          email: string;
          first_name: string;
          id: string;
          job_id: string;
          last_name: string;
          phone: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          first_name: string;
          id?: string;
          job_id: string;
          last_name: string;
          phone?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          first_name?: string;
          id?: string;
          job_id?: string;
          last_name?: string;
          phone?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'candidates_job_id_fkey';
            columns: ['job_id'];
            isOneToOne: false;
            referencedRelation: 'jobs';
            referencedColumns: ['id'];
          },
        ];
      };
      interview_answers: {
        Row: {
          answer_text: string;
          created_at: string | null;
          id: string;
          interview_id: string;
          off_screen_seconds: number | null;
          paste_count: number | null;
          question_id: string;
          tab_switches: number | null;
          time_spent_seconds: number | null;
        };
        Insert: {
          answer_text: string;
          created_at?: string | null;
          id?: string;
          interview_id: string;
          off_screen_seconds?: number | null;
          paste_count?: number | null;
          question_id: string;
          tab_switches?: number | null;
          time_spent_seconds?: number | null;
        };
        Update: {
          answer_text?: string;
          created_at?: string | null;
          id?: string;
          interview_id?: string;
          off_screen_seconds?: number | null;
          paste_count?: number | null;
          question_id?: string;
          tab_switches?: number | null;
          time_spent_seconds?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'interview_answers_interview_id_fkey';
            columns: ['interview_id'];
            isOneToOne: false;
            referencedRelation: 'interviews';
            referencedColumns: ['id'];
          },
        ];
      };
      interviews: {
        Row: {
          candidate_id: string;
          created_at: string | null;
          end_time: string | null;
          id: string;
          job_id: string;
          start_time: string | null;
          status: Database['public']['Enums']['interview_status'] | null;
          updated_at: string | null;
        };
        Insert: {
          candidate_id: string;
          created_at?: string | null;
          end_time?: string | null;
          id?: string;
          job_id: string;
          start_time?: string | null;
          status?: Database['public']['Enums']['interview_status'] | null;
          updated_at?: string | null;
        };
        Update: {
          candidate_id?: string;
          created_at?: string | null;
          end_time?: string | null;
          id?: string;
          job_id?: string;
          start_time?: string | null;
          status?: Database['public']['Enums']['interview_status'] | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'interviews_candidate_id_fkey';
            columns: ['candidate_id'];
            isOneToOne: false;
            referencedRelation: 'candidates';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'interviews_job_id_fkey';
            columns: ['job_id'];
            isOneToOne: false;
            referencedRelation: 'jobs';
            referencedColumns: ['id'];
          },
        ];
      };
      jobs: {
        Row: {
          created_at: string | null;
          description: string;
          id: string;
          notes: string | null;
          recruiter_id: string;
          status: string | null;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description: string;
          id?: string;
          notes?: string | null;
          recruiter_id: string;
          status?: string | null;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string;
          id?: string;
          notes?: string | null;
          recruiter_id?: string;
          status?: string | null;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'jobs_recruiter_id_fkey';
            columns: ['recruiter_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string | null;
          email: string;
          full_name: string | null;
          id: string;
          role: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          full_name?: string | null;
          id: string;
          role?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          full_name?: string | null;
          id?: string;
          role?: string | null;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          created_at: string | null;
          id: string;
          ideal_answer: string;
          job_id: string;
          order_index: number | null;
          text: string;
          time_limit: number | null;
          weight: number | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          ideal_answer: string;
          job_id: string;
          order_index?: number | null;
          text: string;
          time_limit?: number | null;
          weight?: number | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          ideal_answer?: string;
          job_id?: string;
          order_index?: number | null;
          text?: string;
          time_limit?: number | null;
          weight?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'questions_job_id_fkey';
            columns: ['job_id'];
            isOneToOne: false;
            referencedRelation: 'jobs';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      interview_status: 'in_progress' | 'completed' | 'abandoned';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      interview_status: ['in_progress', 'completed', 'abandoned'],
    },
  },
} as const;
