import { createClient } from '@supabase/supabase-js';

let supabase = null;

const DEFAULT_SUPABASE_URL = 'https://vlanmcttdbdosgamqxto.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_secret_GtSyDJTYX5Nj4MuIMsfotA_mzm27Sdh';

export function getSupabase() {
  if (!supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                process.env.SUPABASE_ANON_KEY || 
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                DEFAULT_SUPABASE_KEY;

    if (url && key) {
      supabase = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }
  }
  return supabase;
}
