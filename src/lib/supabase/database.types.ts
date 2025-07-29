export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          email: string | null
          avatar_url: string | null
          bio: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          email?: string | null
          avatar_url?: string | null
          bio?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string | null
          avatar_url?: string | null
          bio?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      quizzes: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string | null
          difficulty: 'easy' | 'medium' | 'hard' | null
          is_public: boolean
          questions: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category?: string | null
          difficulty?: 'easy' | 'medium' | 'hard' | null
          is_public?: boolean
          questions: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: string | null
          difficulty?: 'easy' | 'medium' | 'hard' | null
          is_public?: boolean
          questions?: Json
          created_at?: string
          updated_at?: string
        }
      }
      diagnoses: {
        Row: {
          id: string
          user_id: string
          quiz_id: string
          answers: Json
          result: Json
          score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          quiz_id: string
          answers: Json
          result: Json
          score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          quiz_id?: string
          answers?: Json
          result?: Json
          score?: number | null
          created_at?: string
        }
      }
      quiz_statistics: {
        Row: {
          id: string
          quiz_id: string
          total_attempts: number
          average_score: number | null
          completion_rate: number | null
          updated_at: string
        }
        Insert: {
          id?: string
          quiz_id: string
          total_attempts?: number
          average_score?: number | null
          completion_rate?: number | null
          updated_at?: string
        }
        Update: {
          id?: string
          quiz_id?: string
          total_attempts?: number
          average_score?: number | null
          completion_rate?: number | null
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          ip_address: string | null
          user_agent: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          resource_type?: string
          resource_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json | null
          created_at?: string
        }
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