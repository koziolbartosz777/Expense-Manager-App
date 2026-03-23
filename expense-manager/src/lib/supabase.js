import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Tymczasowo — pozwala aplikacji działać bez Supabase
export const supabase = (supabaseUrl && supabaseKey && 
  supabaseUrl !== 'your_supabase_url_here')
  ? createClient(supabaseUrl, supabaseKey)
  : null