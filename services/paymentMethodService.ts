import { PaymentMethod } from '@/types';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

const mapPaymentMethodFromDB = (row: any): PaymentMethod => ({
  id: row.id,
  name: row.name,
  description: row.description || '',
  imageUrl: row.image_url || '',
  isEnabled: row.is_enabled
});

export const paymentMethodService = {
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapPaymentMethodFromDB);
  },

  createPaymentMethod: async (method: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> => {
    const { data, error } = await supabase
      .from('payment_methods')
      .insert({
        name: method.name,
        description: method.description,
        image_url: method.imageUrl,
        is_enabled: method.isEnabled
      } as any)
      .select()
      .single();

    if (error) throw error;
    return mapPaymentMethodFromDB(data);
  },

  deletePaymentMethod: async (id: string): Promise<void> => {
    const { error } = await supabase.from('payment_methods').delete().eq('id', id);
    if (error) throw error;
  },

  togglePaymentMethod: async (id: string): Promise<void> => {
    // First get current status to toggle it (or we could pass the new status, but typical toggle implies switch)
    // For concurrency safety, best to do it in one query or function, but for now simple read-update is fine for admin panel.
    const { data: current } = await supabase.from('payment_methods').select('is_enabled').eq('id', id).single();

    if (current) {
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_enabled: !(current as any).is_enabled } as any)
        .eq('id', id);

      if (error) throw error;
    }
  }
};
