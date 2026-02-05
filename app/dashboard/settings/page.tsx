'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/useAuthStore';
import { Moon, Sun, Monitor } from 'lucide-react';

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-3xl font-bold tracking-tight">Settings</h2>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage your account settings and preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" defaultValue={user?.email || ''} disabled />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Display Name</Label>
            <Input id="name" defaultValue={user?.name || ''} />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Change your admin password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" />
          </div>
          <Button variant="outline">Update Password</Button>
        </CardContent>
      </Card>

      {/* Theme Settings (Placeholder mainly, Tailwind dark mode logic would need NextThemes provider) */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the interface theme.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center gap-2 cursor-pointer p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <Sun className="h-6 w-6" />
              <span className="text-sm font-medium">Light</span>
            </div>
            <div className="flex flex-col items-center gap-2 cursor-pointer p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 bg-gray-100 dark:bg-gray-800 border-blue-500">
              <Monitor className="h-6 w-6" />
              <span className="text-sm font-medium">System</span>
            </div>
            <div className="flex flex-col items-center gap-2 cursor-pointer p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <Moon className="h-6 w-6" />
              <span className="text-sm font-medium">Dark</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="pt-6">
        <p className="text-sm text-gray-500 text-center">Version 1.0.0 • E-Pay Admin Panel</p>
      </div>
    </div>
  );
}
