'use client';

import { useState } from 'react';
import { ChatList } from '@/components/chat/ChatList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ChatUser } from '@/services/chatService';

export default function ChatPage() {
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);

  return (
    <div className="flex h-[calc(100vh-4rem)] border rounded-xl overflow-hidden shadow-sm bg-white">
      {/* Sidebar List */}
      <div className="w-1/3 border-r border-slate-100 bg-white flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Support Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ChatList
            onSelectUser={setSelectedUser}
            selectedUserId={selectedUser?.id}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-slate-50 relative">
        {selectedUser ? (
          <ChatWindow user={selectedUser} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <p>Select a conversation to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
}
