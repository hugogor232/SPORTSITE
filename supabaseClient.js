import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://xrxjmbgswtmtptqjhdkf.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyeGptYmdzd3RtdHB0cWpoZGtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MTQwMTUsImV4cCI6MjA3OTk5MDAxNX0.iWS9nzgu1PNnHi4YaTH9uHUGxE_PYAoOE0FfnWawTfM'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)