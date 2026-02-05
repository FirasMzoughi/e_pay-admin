import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient(); // Helper is now async
    const { error, data: { session } } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && session?.user) {
      // --- PROFILE SYNC LOGIC ---
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .single();

      // If not, create one
      if (!profile) {
        await supabase.from('profiles').insert({
          id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata.full_name || session.user.email?.split('@')[0],
          avatar_url: session.user.user_metadata.avatar_url,
          role: 'user', // Default role
        });
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
