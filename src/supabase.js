import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xudtjnzonryyuxrsunmo.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1ZHRqbnpvbnJ5eXV4cnN1bm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NzYyOTMsImV4cCI6MjA2MDA1MjI5M30.g-rcgsVbyJU_pU4dOkIaSyNeMfHXXbnK0LgV0gAUU9M'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)