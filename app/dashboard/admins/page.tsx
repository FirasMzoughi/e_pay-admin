import { AddAdminForm } from '@/components/admins/AddAdminForm';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null };

  if (profile?.role !== 'super_admin') {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Unauthorized</h1>
        <p className="text-slate-600 mt-2">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Manage Admins</h1>
        <p className="text-slate-500">Only Super Admins can access this page.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AddAdminForm />

        {/* Placeholder for list of existing admins if needed later */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 border-dashed flex items-center justify-center text-slate-400">
          List of admins will appear here (Future Feature)
        </div>
      </div>
    </div>
  );
}
