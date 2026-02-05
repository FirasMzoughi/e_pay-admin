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
          email: string | null
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'user'
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'user'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'user'
          created_at?: string
        }
      },
      messages: {
        Row: {
          id: string
          user_id: string
          is_admin: boolean
          content: string
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          is_admin?: boolean
          content: string
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          is_admin?: boolean
          content?: string
          image_url?: string | null
          created_at?: string
        }
      },
      saved_replies: {
        Row: {
          id: string
          title: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          created_at?: string
        }
      }
    }
  },
  Views: {
    [_ in never]: never
  },
  Functions: {
    [_ in never]: never
  },
  Enums: {
    [_ in never]: never
  }
}
