import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

// Extended User type for Admin View
export interface AdminViewUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'user';
  status: 'active' | 'blocked';
  joinedAt: string;
  lastLogin?: string;
}

const mapProfileFromDB = (row: any): AdminViewUser => ({
  id: row.id,
  name: row.full_name || 'Unknown',
  email: row.email || '',
  role: row.role || 'user',
  // Defaulting status and joinedAt for now as they might not be in profiles table yet
  status: 'active',
  joinedAt: new Date(row.created_at).toLocaleDateString()
});

export const userService = {
  getUsers: async (): Promise<AdminViewUser[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapProfileFromDB);
  },

  blockUser: async (id: string): Promise<void> => {
    // Requires 'status' column in profiles, for now just logging or assuming implementation
    console.log(`User ${id} blocked - Backend column missing`);
  },

  unblockUser: async (id: string): Promise<void> => {
    console.log(`User ${id} unblocked - Backend column missing`);

  },

  deleteUser: async (id: string): Promise<void> => {
    // Delete from profiles - requires cascading delete or admin privileges to delete from auth.users
    // Deleting from profiles only:
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw error;
  }
};
