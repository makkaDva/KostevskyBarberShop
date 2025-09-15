// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Privremeno: direktne vrednosti
const SUPABASE_URL = 'https://hjfgfktbgbdkcdutcjjx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqZmdma3RiZ2Jka2NkdXRjamp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5MDA3OTQsImV4cCI6MjA1NzQ3Njc5NH0.9xfAd7P48ChzKh6fpdKW7C-Jwu3hptMiVPNfBrklJLA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);