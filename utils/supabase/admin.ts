import { createClient } from '@supabase/supabase-js';
// import { Database } from '@/types/supabase'; // Assuming types exist, if not we can omit generic or use any

export const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};
