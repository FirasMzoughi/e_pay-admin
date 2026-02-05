'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, DollarSign, Activity, TrendingUp, ArrowUpRight } from "lucide-react";
import { dashboardService } from '@/services/dashboardService';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeUsers: 0,
    totalSales: 0,
    totalUsers: 0,
    pendingPayments: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your system's performance.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Revenue Card (Blue Accent) */}
        <Card className="hover:shadow-md transition-shadow border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Revenue</CardTitle>
            <div className="p-2 bg-blue-50 rounded-full text-blue-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TND' }).format(stats.totalRevenue)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-green-600 font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>Real-time data</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Users (Green Accent) */}
        <Card className="hover:shadow-md transition-shadow border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Users</CardTitle>
            <div className="p-2 bg-emerald-50 rounded-full text-emerald-600">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.totalUsers}</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-green-600 font-medium">
              <ArrowUpRight className="w-3 h-3" />
              <span>Registered accounts</span>
            </div>
          </CardContent>
        </Card>

        {/* Transactions/Sales (Purple Accent) */}
        <Card className="hover:shadow-md transition-shadow border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Transactions</CardTitle>
            <div className="p-2 bg-purple-50 rounded-full text-purple-600">
              <CreditCard className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.totalSales}</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500 font-medium">
              <span>All time</span>
            </div>
          </CardContent>
        </Card>

        {/* Pending Payments (Orange Accent) */}
        <Card className="hover:shadow-md transition-shadow border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pending</CardTitle>
            <div className="p-2 bg-orange-50 rounded-full text-orange-600">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.pendingPayments}</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-orange-600 font-medium">
              <span>Requires attention</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Table Placeholder */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-slate-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-slate-800">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center border border-slate-100 rounded-lg bg-slate-50/50">
              <p className="text-sm text-slate-400">Transaction table coming soon...</p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 border-slate-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-slate-800">Global Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center border border-slate-100 rounded-lg bg-slate-50/50">
              <p className="text-sm text-slate-400">Map / Demographics</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
