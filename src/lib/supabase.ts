import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rpywsfsvehbsbbxqjjre.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJweXdzZnN2ZWhic2JieHFqanJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5Nzg1MjksImV4cCI6MjA5MDU1NDUyOX0.MVtuBBWzEIKaPpZOzsc1g7fB53ZQDFaYubKAnZ6AesI';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Supabase environment variables are missing. Using provided fallback credentials for preview.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
