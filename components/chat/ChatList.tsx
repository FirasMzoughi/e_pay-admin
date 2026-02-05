'use client';

import { useEffect, useState } from 'react';
import { chatService, ChatUser } from '@/services/chatService';
import { Loader2, User, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

export function ChatList({
  onSelectUser,
  selectedUserId
}: {
  onSelectUser: (user: ChatUser) => void;
  selectedUserId?: string;
}) {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const data = await chatService.getConversations();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    // Subscribe to all messages to update the list order/content when a new message arrives
    const sub = chatService.subscribeToAllMessages(() => {
      // Simple strategy: Just refetch the list to reorder
      fetchUsers();
    });

    return () => {
      sub.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-4 text-center text-slate-500 text-sm">
        No conversations yet.
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {users.map((user) => (
        <button
          key={user.id}
          onClick={() => onSelectUser(user)}
          className={cn(
            "w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-center gap-3",
            selectedUserId === user.id && "bg-slate-50 border-r-2 border-indigo-500"
          )}
        >
          <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name || 'User'} className="h-full w-full object-cover" />
            ) : (
              <User className="h-5 w-5 text-slate-500" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-slate-900 truncate">
              {user.full_name || user.email || 'Unknown User'}
            </p>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              <span>
                {user.last_message_at
                  ? new Date(user.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'New'
                }
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
