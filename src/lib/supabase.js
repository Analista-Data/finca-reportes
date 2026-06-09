import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://oyhotpwtqoeqmxoelxlm.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95aG90cHd0cW9lcW14b2VseGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NzE4NDcsImV4cCI6MjA5NTA0Nzg0N30.WwkBoTVbUd8yUGYP-ZCNCybuEZYVXeI4YVMAeMkJ180'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)