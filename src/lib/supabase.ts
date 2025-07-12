import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      resumes: {
        Row: {
          id: string
          user_id: string
          title: string
          personal_info: any
          summary: string | null
          experience: any
          education: any
          skills: any
          projects: any
          is_default: boolean
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          personal_info?: any
          summary?: string | null
          experience?: any
          education?: any
          skills?: any
          projects?: any
          is_default?: boolean
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          personal_info?: any
          summary?: string | null
          experience?: any
          education?: any
          skills?: any
          projects?: any
          is_default?: boolean
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      cover_letters: {
        Row: {
          id: string
          user_id: string
          resume_id: string
          title: string
          content: string
          job_description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resume_id: string
          title: string
          content: string
          job_description: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          resume_id?: string
          title?: string
          content?: string
          job_description?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}