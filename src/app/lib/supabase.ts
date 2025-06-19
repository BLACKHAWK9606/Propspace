import { createClient } from '@supabase/supabase-js';

// Use environment variables (recommended)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nbiyzeeunsvlofifbmdu.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iaXl6ZWV1bnN2bG9maWZibWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5MDc3NjMsImV4cCI6MjA1NzQ4Mzc2M30.O6B7Fvjq0OsgOEq5FYW4sTGilMKKcvW981K9zfBO__M';

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});