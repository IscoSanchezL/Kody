import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CLAVE, SUPABASE_URL } from './config';

/** Cliente único de Supabase. La sesión se guarda en este navegador y se renueva sola. */
export const supabase = createClient(SUPABASE_URL, SUPABASE_CLAVE, {
  auth: {
    flowType: 'pkce',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'kody.sesion',
  },
});
