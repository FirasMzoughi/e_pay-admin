'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdminViewUser, userService } from '@/services/userService';
import { Loader2, MoreHorizontal, Shield, ShieldAlert, BadgeCheck, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function UsersPage() {
  const [users, setUsers] = useState<AdminViewUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (user: AdminViewUser) => {
    if (user.status === 'blocked') {
      await userService.unblockUser(user.id);
    } else {
      await userService.blockUser(user.id);
    }
    // Optimistic update for demo
    setUsers(users.map(u => u.id === user.id ? { ...u, status: u.status === 'blocked' ? 'active' : 'blocked' } : u));
  };

  const handleDeleteUser = async (user: AdminViewUser) => {
    // 1. Confirm
    if (!confirm(`Are you sure you want to delete user ${user.name}? This cannot be undone.`)) return;

    try {
      // 2. Delete
      await userService.deleteUser(user.id);

      // 3. Update State
      setUsers(users.filter(u => u.id !== user.id));
    } catch (error) {
      console.error("Failed to delete user", error);
      alert("Failed to delete user. Ensure you have permissions.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
        <Button onClick={fetchUsers} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {user.role === 'admin' && <Shield className="w-4 h-4 text-blue-500" />}
                        {user.role === 'moderator' && <BadgeCheck className="w-4 h-4 text-green-500" />}
                        <span className="capitalize">{user.role}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        user.status === 'active' ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      )}>
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell>{user.joinedAt}</TableCell>
                    <TableCell className="text-right">
                      {user.role !== 'admin' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleBlock(user)}
                            className={cn("mr-2", user.status === 'active' ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50" : "text-green-600 hover:text-green-700 hover:bg-green-50")}
                          >
                            {user.status === 'active' ? "Block" : "Unblock"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-900 hover:bg-red-50"
                            onClick={() => handleDeleteUser(user)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
