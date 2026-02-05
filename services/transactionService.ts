import { createClient } from '@/utils/supabase/client';
import { Transaction } from '@/types';

const supabase = createClient();

const mapTransactionFromDB = (row: any): Transaction => ({
  id: row.id,
  userId: row.user_id,
  userName: row.profiles?.full_name || row.profiles?.email || 'Unknown',
  amount: row.price,
  status: row.status as 'pending' | 'approved' | 'rejected',
  method: row.payment_method,
  date: row.created_at,
  proofUrl: row.messages?.[0]?.image_url // Attempt to find proof if linked, but usually proof is in chat.
});

export const transactionService = {
  getTransactions: async (): Promise<Transaction[]> => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, profiles(full_name, email)') // Join profiles
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapTransactionFromDB);
  },

  updateStatus: async (id: string, status: 'approved' | 'rejected'): Promise<void> => {
    const { error } = await supabase
      .from('transactions')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  }
};
