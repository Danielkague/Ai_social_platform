import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'SET' : 'MISSING',
    key: supabaseAnonKey ? 'SET' : 'MISSING'
  })
}

export const supabase = createClient(
  supabaseUrl || 'https://iwemxnniterxwqzdrqka.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3ZW14bm5pdGVyeHdxemRycWthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NzgwMDAsImV4cCI6MjA2ODA1NDAwMH0.xa50m2oeq7efKQH-HBcf-aQSb6En5ueN-a1M1hS42_0',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
) 