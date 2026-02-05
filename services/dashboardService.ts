import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export const dashboardService = {
  getStats: async () => {
    // 1. Total Users
    const { count: userCount, error: userError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // 2. Total Products
    const { count: productCount, error: prodError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // 3. Transactions (Sales)
    // Assuming transactions are strictly sales for now
    const { count: salesCount, error: salesError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true });

    // 4. Calculate Revenue
    // Limitation: This is client-side sum if we don't use a specialized RPC function.
    // For large datasets, we should create a Postgres function `get_total_revenue`.
    // For now, we'll fetch only amount column.
    const { data: revenueData, error: revError } = await supabase
      .from('transactions')
      .select('amount');

    if (userError || prodError || salesError || revError) {
      console.error('Error fetching stats', userError, prodError, salesError, revError);
      // Fallback to 0
    }

    const totalRevenue = revenueData?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;
    const activeUsers = 0; // Requires 'last_sign_in_at' or specific status tracking which we mocked in UserService

    return {
      totalRevenue,
      activeUsers: activeUsers || Math.floor((userCount || 0) * 0.8), // Mock logic: 80% are active
      totalSales: salesCount || 0,
      totalUsers: userCount || 0,
      pendingPayments: 0, // Need to filter transactions by status='pending'
      recentTransactions: [] // Fetch top 5
    };
  }
};
