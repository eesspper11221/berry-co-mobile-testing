import {createClient} from '@supabase/supabase-js';

export const supabase = createClient(
  __BERRYCO_SUPABASE_URL__,
  __BERRYCO_SUPABASE_PUBLISHABLE_KEY__,
  {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
      storage: window.localStorage,
    },
  },
);