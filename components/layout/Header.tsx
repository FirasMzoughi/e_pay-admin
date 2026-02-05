'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { UserCircle, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  const user = useAuthStore((state) => state.user);
  const openSidebar = useUIStore((state) => state.openSidebar);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/80 backdrop-blur-md px-6 border-slate-100 shadow-sm">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden -ml-2" onClick={openSidebar}>
          <Menu className="h-6 w-6 text-slate-600" />
        </Button>
        <div className="font-medium text-slate-500 hidden sm:block">
          {/* Breadcrumb place holder */}
          Welcome back, <span className="text-slate-800 font-semibold">{user?.name || 'Admin'}</span>
        </div>
        {/* Mobile Title only */}
        <div className="font-bold text-slate-800 sm:hidden">
          Dashboard
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <UserCircle className="h-8 w-8 text-slate-400" />
          <div className="text-sm hidden sm:block">
            <p className="font-medium text-slate-700">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-slate-400">{user?.role || 'Role'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
