'use server'

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function createAdminUser(prevState: any, formData: FormData) {
  // 1. Verify current user is super_admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'super_admin') {
    return { error: 'Unauthorized. Only Super Admins can create admins.' };
  }

  // 2. Create the new user using Admin Client
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;

  const supabaseAdmin = createAdminClient();

  const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    user_metadata: { full_name: fullName },
    email_confirm: true,
  });

  if (createError) return { error: createError.message };

  if (newUser.user) {
    // 3. Update the role to 'admin' (overriding the trigger's default 'user')
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', newUser.user.id);

    if (updateError) {
      // Fallback: If profile doesn't exist yet (race condition with trigger?), try insert
      // But trigger implies it should exist.
      return { error: 'User created but role update failed: ' + updateError.message };
    }
  }

  revalidatePath('/dashboard/admins'); // We will create this page
  return { success: 'Admin user created successfully!' };
}
