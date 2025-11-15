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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_models: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          max_tokens: number | null
          model_name: string
          operation_type: string
          provider: string
          temperature: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          max_tokens?: number | null
          model_name: string
          operation_type: string
          provider: string
          temperature?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          max_tokens?: number | null
          model_name?: string
          operation_type?: string
          provider?: string
          temperature?: number | null
        }
        Relationships: []
      }
      ai_operations_log: {
        Row: {
          created_at: string
          error_message: string | null
          hr_specialist_id: string
          id: string
          input_tokens: number | null
          metadata: Json | null
          model_used: string | null
          operation_type: string
          organization_id: string
          output_tokens: number | null
          prompt_version: string | null
          success: boolean
          total_tokens: number | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          hr_specialist_id: string
          id?: string
          input_tokens?: number | null
          metadata?: Json | null
          model_used?: string | null
          operation_type: string
          organization_id: string
          output_tokens?: number | null
          prompt_version?: string | null
          success: boolean
          total_tokens?: number | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          hr_specialist_id?: string
          id?: string
          input_tokens?: number | null
          metadata?: Json | null
          model_used?: string | null
          operation_type?: string
          organization_id?: string
          output_tokens?: number | null
          prompt_version?: string | null
          success?: boolean
          total_tokens?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_operations_log_hr_specialist_id_fkey"
            columns: ["hr_specialist_id"]
            isOneToOne: false
            referencedRelation: "hr_specialists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_operations_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_prompts: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          operation_type: string
          prompt_text: string
          updated_at: string | null
          version: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          operation_type: string
          prompt_text: string
          updated_at?: string | null
          version: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          operation_type?: string
          prompt_text?: string
          updated_at?: string | null
          version?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          added_by_hr_id: string
          candidate_id: string
          compatibility_score: number | null
          created_at: string
          id: string
          organization_id: string
          status: string
          updated_at: string | null
          vacancy_id: string
        }
        Insert: {
          added_by_hr_id: string
          candidate_id: string
          compatibility_score?: number | null
          created_at?: string
          id?: string
          organization_id: string
          status: string
          updated_at?: string | null
          vacancy_id: string
        }
        Update: {
          added_by_hr_id?: string
          candidate_id?: string
          compatibility_score?: number | null
          created_at?: string
          id?: string
          organization_id?: string
          status?: string
          updated_at?: string | null
          vacancy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_added_by_hr_id_fkey"
            columns: ["added_by_hr_id"]
            isOneToOne: false
            referencedRelation: "hr_specialists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_vacancy_id_fkey"
            columns: ["vacancy_id"]
            isOneToOne: false
            referencedRelation: "vacancies"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_comparisons: {
        Row: {
          candidate_ids: string[]
          content_html: string | null
          content_markdown: string | null
          created_at: string
          created_by_hr_id: string
          id: string
          organization_id: string
          ranking: Json | null
          vacancy_id: string
        }
        Insert: {
          candidate_ids: string[]
          content_html?: string | null
          content_markdown?: string | null
          created_at?: string
          created_by_hr_id: string
          id?: string
          organization_id: string
          ranking?: Json | null
          vacancy_id: string
        }
        Update: {
          candidate_ids?: string[]
          content_html?: string | null
          content_markdown?: string | null
          created_at?: string
          created_by_hr_id?: string
          id?: string
          organization_id?: string
          ranking?: Json | null
          vacancy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_comparisons_created_by_hr_id_fkey"
            columns: ["created_by_hr_id"]
            isOneToOne: false
            referencedRelation: "hr_specialists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_comparisons_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_comparisons_vacancy_id_fkey"
            columns: ["vacancy_id"]
            isOneToOne: false
            referencedRelation: "vacancies"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_full_analysis: {
        Row: {
          candidate_id: string
          content_html: string | null
          content_markdown: string | null
          created_at: string
          created_by_hr_id: string
          id: string
          is_public: boolean
          organization_id: string
          updated_at: string | null
          vacancy_ids: string[] | null
        }
        Insert: {
          candidate_id: string
          content_html?: string | null
          content_markdown?: string | null
          created_at?: string
          created_by_hr_id: string
          id?: string
          is_public?: boolean
          organization_id: string
          updated_at?: string | null
          vacancy_ids?: string[] | null
        }
        Update: {
          candidate_id?: string
          content_html?: string | null
          content_markdown?: string | null
          created_at?: string
          created_by_hr_id?: string
          id?: string
          is_public?: boolean
          organization_id?: string
          updated_at?: string | null
          vacancy_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_full_analysis_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_full_analysis_created_by_hr_id_fkey"
            columns: ["created_by_hr_id"]
            isOneToOne: false
            referencedRelation: "hr_specialists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_full_analysis_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_skills: {
        Row: {
          candidate_id: string
          canonical_skill: string
          created_at: string
          id: string
        }
        Insert: {
          candidate_id: string
          canonical_skill: string
          created_at?: string
          id?: string
        }
        Update: {
          candidate_id?: string
          canonical_skill?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_skills_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_test_results: {
        Row: {
          answers: Json | null
          candidate_id: string
          completed_at: string | null
          detailed_result: string | null
          id: string
          normalized_scores: Json | null
          raw_scores: Json | null
          retake_available_at: string | null
          started_at: string
          test_id: string
        }
        Insert: {
          answers?: Json | null
          candidate_id: string
          completed_at?: string | null
          detailed_result?: string | null
          id?: string
          normalized_scores?: Json | null
          raw_scores?: Json | null
          retake_available_at?: string | null
          started_at?: string
          test_id: string
        }
        Update: {
          answers?: Json | null
          candidate_id?: string
          completed_at?: string | null
          detailed_result?: string | null
          id?: string
          normalized_scores?: Json | null
          raw_scores?: Json | null
          retake_available_at?: string | null
          started_at?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_test_results_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_test_results_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          about: string | null
          category_id: string | null
          created_at: string
          education: string | null
          experience: string | null
          full_name: string | null
          id: string
          invited_by_hr_id: string | null
          invited_by_organization_id: string | null
          is_public: boolean
          phone: string | null
          tests_completed: number
          tests_last_updated_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          about?: string | null
          category_id?: string | null
          created_at?: string
          education?: string | null
          experience?: string | null
          full_name?: string | null
          id?: string
          invited_by_hr_id?: string | null
          invited_by_organization_id?: string | null
          is_public?: boolean
          phone?: string | null
          tests_completed?: number
          tests_last_updated_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          about?: string | null
          category_id?: string | null
          created_at?: string
          education?: string | null
          experience?: string | null
          full_name?: string | null
          id?: string
          invited_by_hr_id?: string | null
          invited_by_organization_id?: string | null
          is_public?: boolean
          phone?: string | null
          tests_completed?: number
          tests_last_updated_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "professional_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_invited_by_hr_id_fkey"
            columns: ["invited_by_hr_id"]
            isOneToOne: false
            referencedRelation: "hr_specialists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_invited_by_organization_id_fkey"
            columns: ["invited_by_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          chat_room_id: string
          created_at: string
          id: number
          is_read: boolean
          message_text: string
          read_at: string | null
          sender_id: string
          sender_type: string
        }
        Insert: {
          chat_room_id: string
          created_at?: string
          id?: number
          is_read?: boolean
          message_text: string
          read_at?: string | null
          sender_id: string
          sender_type: string
        }
        Update: {
          chat_room_id?: string
          created_at?: string
          id?: number
          is_read?: boolean
          message_text?: string
          read_at?: string | null
          sender_id?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          candidate_id: string
          created_at: string
          hr_specialist_id: string
          id: string
          last_message_at: string | null
          organization_id: string
          unread_count_candidate: number
          unread_count_hr: number
        }
        Insert: {
          candidate_id: string
          created_at?: string
          hr_specialist_id: string
          id?: string
          last_message_at?: string | null
          organization_id: string
          unread_count_candidate?: number
          unread_count_hr?: number
        }
        Update: {
          candidate_id?: string
          created_at?: string
          hr_specialist_id?: string
          id?: string
          last_message_at?: string | null
          organization_id?: string
          unread_count_candidate?: number
          unread_count_hr?: number
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_hr_specialist_id_fkey"
            columns: ["hr_specialist_id"]
            isOneToOne: false
            referencedRelation: "hr_specialists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_documents: {
        Row: {
          candidate_id: string
          content_html: string | null
          content_markdown: string | null
          created_at: string
          created_by_hr_id: string
          document_type: string
          id: string
          is_public: boolean
          organization_id: string
          title: string | null
          updated_at: string | null
          vacancy_id: string | null
        }
        Insert: {
          candidate_id: string
          content_html?: string | null
          content_markdown?: string | null
          created_at?: string
          created_by_hr_id: string
          document_type: string
          id?: string
          is_public?: boolean
          organization_id: string
          title?: string | null
          updated_at?: string | null
          vacancy_id?: string | null
        }
        Update: {
          candidate_id?: string
          content_html?: string | null
          content_markdown?: string | null
          created_at?: string
          created_by_hr_id?: string
          document_type?: string
          id?: string
          is_public?: boolean
          organization_id?: string
          title?: string | null
          updated_at?: string | null
          vacancy_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_documents_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_created_by_hr_id_fkey"
            columns: ["created_by_hr_id"]
            isOneToOne: false
            referencedRelation: "hr_specialists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_vacancy_id_fkey"
            columns: ["vacancy_id"]
            isOneToOne: false
            referencedRelation: "vacancies"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_specialists: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          is_active: boolean
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          organization_id: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_specialists_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_tokens: {
        Row: {
          created_at: string
          created_by_hr_id: string
          expires_at: string | null
          id: string
          is_used: boolean
          organization_id: string
          token: string
          used_at: string | null
          used_by_candidate_id: string | null
        }
        Insert: {
          created_at?: string
          created_by_hr_id: string
          expires_at?: string | null
          id?: string
          is_used?: boolean
          organization_id: string
          token: string
          used_at?: string | null
          used_by_candidate_id?: string | null
        }
        Update: {
          created_at?: string
          created_by_hr_id?: string
          expires_at?: string | null
          id?: string
          is_used?: boolean
          organization_id?: string
          token?: string
          used_at?: string | null
          used_by_candidate_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitation_tokens_created_by_hr_id_fkey"
            columns: ["created_by_hr_id"]
            isOneToOne: false
            referencedRelation: "hr_specialists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitation_tokens_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitation_tokens_used_by_candidate_id_fkey"
            columns: ["used_by_candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          brand_logo_url: string | null
          created_at: string
          id: string
          name: string
          owner_id: string
          token_balance: number
        }
        Insert: {
          brand_logo_url?: string | null
          created_at?: string
          id?: string
          name: string
          owner_id: string
          token_balance?: number
        }
        Update: {
          brand_logo_url?: string | null
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          token_balance?: number
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          id: string
          organization_id: string
          robokassa_data: Json | null
          robokassa_invoice_id: string | null
          status: string
          tokens_amount: number
          updated_at: string | null
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          id?: string
          organization_id: string
          robokassa_data?: Json | null
          robokassa_invoice_id?: string | null
          status: string
          tokens_amount: number
          updated_at?: string | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          organization_id?: string
          robokassa_data?: Json | null
          robokassa_invoice_id?: string | null
          status?: string
          tokens_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_categories: {
        Row: {
          id: string
          name_en: string
          name_kk: string
          name_ru: string
          sort_order: number | null
        }
        Insert: {
          id?: string
          name_en: string
          name_kk: string
          name_ru: string
          sort_order?: number | null
        }
        Update: {
          id?: string
          name_en?: string
          name_kk?: string
          name_ru?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      resume_analysis_results: {
        Row: {
          content_html: string | null
          content_markdown: string | null
          created_at: string
          created_by_hr_id: string
          id: string
          organization_id: string
          resume_count: number | null
          vacancy_ids: string[] | null
        }
        Insert: {
          content_html?: string | null
          content_markdown?: string | null
          created_at?: string
          created_by_hr_id: string
          id?: string
          organization_id: string
          resume_count?: number | null
          vacancy_ids?: string[] | null
        }
        Update: {
          content_html?: string | null
          content_markdown?: string | null
          created_at?: string
          created_by_hr_id?: string
          id?: string
          organization_id?: string
          resume_count?: number | null
          vacancy_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "resume_analysis_results_created_by_hr_id_fkey"
            columns: ["created_by_hr_id"]
            isOneToOne: false
            referencedRelation: "hr_specialists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resume_analysis_results_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      skills_dictionary: {
        Row: {
          canonical_name: string
          category: string | null
          id: string
          language: string
          name: string
        }
        Insert: {
          canonical_name: string
          category?: string | null
          id?: string
          language: string
          name: string
        }
        Update: {
          canonical_name?: string
          category?: string | null
          id?: string
          language?: string
          name?: string
        }
        Relationships: []
      }
      test_questions: {
        Row: {
          id: string
          options: Json | null
          question_number: number
          reverse_scored: boolean
          scale_code: string | null
          test_id: string
          text_en: string
          text_kk: string
          text_ru: string
        }
        Insert: {
          id?: string
          options?: Json | null
          question_number: number
          reverse_scored?: boolean
          scale_code?: string | null
          test_id: string
          text_en: string
          text_kk: string
          text_ru: string
        }
        Update: {
          id?: string
          options?: Json | null
          question_number?: number
          reverse_scored?: boolean
          scale_code?: string | null
          test_id?: string
          text_en?: string
          text_kk?: string
          text_ru?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_scales: {
        Row: {
          code: string
          description_en: string | null
          description_kk: string | null
          description_ru: string | null
          id: string
          max_value: number | null
          min_value: number | null
          name_en: string
          name_kk: string
          name_ru: string
          optimal_value: number | null
          scale_type: string | null
          sort_order: number | null
          test_id: string
        }
        Insert: {
          code: string
          description_en?: string | null
          description_kk?: string | null
          description_ru?: string | null
          id?: string
          max_value?: number | null
          min_value?: number | null
          name_en: string
          name_kk: string
          name_ru: string
          optimal_value?: number | null
          scale_type?: string | null
          sort_order?: number | null
          test_id: string
        }
        Update: {
          code?: string
          description_en?: string | null
          description_kk?: string | null
          description_ru?: string | null
          id?: string
          max_value?: number | null
          min_value?: number | null
          name_en?: string
          name_kk?: string
          name_ru?: string
          optimal_value?: number | null
          scale_type?: string | null
          sort_order?: number | null
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_scales_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          code: string
          description_en: string | null
          description_kk: string | null
          description_ru: string | null
          id: string
          is_active: boolean
          name_en: string
          name_kk: string
          name_ru: string
          sort_order: number | null
          test_type: string
          time_limit_minutes: number | null
          total_questions: number | null
        }
        Insert: {
          code: string
          description_en?: string | null
          description_kk?: string | null
          description_ru?: string | null
          id?: string
          is_active?: boolean
          name_en: string
          name_kk: string
          name_ru: string
          sort_order?: number | null
          test_type: string
          time_limit_minutes?: number | null
          total_questions?: number | null
        }
        Update: {
          code?: string
          description_en?: string | null
          description_kk?: string | null
          description_ru?: string | null
          id?: string
          is_active?: boolean
          name_en?: string
          name_kk?: string
          name_ru?: string
          sort_order?: number | null
          test_type?: string
          time_limit_minutes?: number | null
          total_questions?: number | null
        }
        Relationships: []
      }
      token_costs: {
        Row: {
          cost_tokens: number
          description_en: string | null
          description_kk: string | null
          description_ru: string | null
          id: string
          is_active: boolean
          operation_type: string
        }
        Insert: {
          cost_tokens: number
          description_en?: string | null
          description_kk?: string | null
          description_ru?: string | null
          id?: string
          is_active?: boolean
          operation_type: string
        }
        Update: {
          cost_tokens?: number
          description_en?: string | null
          description_kk?: string | null
          description_ru?: string | null
          id?: string
          is_active?: boolean
          operation_type?: string
        }
        Relationships: []
      }
      vacancies: {
        Row: {
          created_at: string
          created_by_hr_id: string
          description: string | null
          employment_type: string | null
          funnel_counts: Json | null
          id: string
          ideal_profile: Json | null
          location: string | null
          organization_id: string
          requirements: string | null
          salary_max: number | null
          salary_min: number | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          created_by_hr_id: string
          description?: string | null
          employment_type?: string | null
          funnel_counts?: Json | null
          id?: string
          ideal_profile?: Json | null
          location?: string | null
          organization_id: string
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          created_by_hr_id?: string
          description?: string | null
          employment_type?: string | null
          funnel_counts?: Json | null
          id?: string
          ideal_profile?: Json | null
          location?: string | null
          organization_id?: string
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vacancies_created_by_hr_id_fkey"
            columns: ["created_by_hr_id"]
            isOneToOne: false
            referencedRelation: "hr_specialists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vacancies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vacancy_skills: {
        Row: {
          canonical_skill: string
          created_at: string
          id: string
          is_required: boolean
          vacancy_id: string
        }
        Insert: {
          canonical_skill: string
          created_at?: string
          id?: string
          is_required?: boolean
          vacancy_id: string
        }
        Update: {
          canonical_skill?: string
          created_at?: string
          id?: string
          is_required?: boolean
          vacancy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vacancy_skills_vacancy_id_fkey"
            columns: ["vacancy_id"]
            isOneToOne: false
            referencedRelation: "vacancies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      acquire_candidate_from_market: {
        Args: {
          p_candidate_id: string
          p_hr_specialist_id: string
          p_vacancy_id: string
        }
        Returns: Json
      }
      calculate_test_results: {
        Args: { p_answers: Json; p_test_id: string }
        Returns: Json
      }
      generate_invitation_token: {
        Args: { p_hr_specialist_id: string }
        Returns: Json
      }
      get_hr_dashboard_stats: {
        Args: { p_organization_id: string }
        Returns: Json
      }
      request_test_retake: {
        Args: { p_candidate_id: string; p_test_id: string }
        Returns: Json
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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

