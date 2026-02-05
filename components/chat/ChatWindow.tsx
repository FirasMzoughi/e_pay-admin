'use client';

import { useEffect, useState, useRef } from 'react';
import { chatService, ChatMessage, ChatUser, SavedReply } from '@/services/chatService';
import { Send, User, Loader2, Image as ImageIcon, Paperclip, Zap, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function ChatWindow({ user }: { user: ChatUser }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Image Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Saved Replies State
  const [savedReplies, setSavedReplies] = useState<SavedReply[]>([]);
  const [isSavedRepliesOpen, setIsSavedRepliesOpen] = useState(false);
  const [isCreateReplyOpen, setIsCreateReplyOpen] = useState(false);
  const [newReplyTitle, setNewReplyTitle] = useState('');
  const [newReplyContent, setNewReplyContent] = useState('');

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const msgs = await chatService.getMessages(user.id);
      setMessages(msgs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const fetchSavedReplies = async () => {
    try {
      const replies = await chatService.getSavedReplies();
      setSavedReplies(replies);
    } catch (e) {
      console.error("Failed to fetch saved replies", e);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  };

  useEffect(() => {
    fetchMessages();
    fetchSavedReplies();

    const sub = chatService.subscribeToMessages(user.id, (payload) => {
      const newMessage = payload.new as ChatMessage;
      setMessages((prev) => [...prev, newMessage]);
      scrollToBottom();
    });

    return () => {
      sub.unsubscribe();
    };
  }, [user.id]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    setSending(true);
    try {
      await chatService.sendMessage(user.id, inputValue.trim());
      setInputValue('');
    } catch (e) {
      console.error(e);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const imageUrl = await chatService.uploadImage(file);
      await chatService.sendMessage(user.id, "Sent an image", imageUrl);
    } catch (e) {
      console.error(e);
      alert("Failed to upload image");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveReply = async () => {
    if (!newReplyTitle || !newReplyContent) return;
    try {
      await chatService.createSavedReply(newReplyTitle, newReplyContent);
      setNewReplyTitle('');
      setNewReplyContent('');
      setIsCreateReplyOpen(false);
      fetchSavedReplies();
    } catch (e) {
      console.error(e);
      alert("Failed to create saved reply");
    }
  };

  const handleDeleteReply = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure?")) return;
    try {
      await chatService.deleteSavedReply(id);
      fetchSavedReplies();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.full_name || 'User'} className="h-full w-full object-cover rounded-full" />
          ) : (
            <User className="h-5 w-5 text-slate-500" />
          )}
        </div>
        <div>
          <h2 className="font-semibold text-slate-800">{user.full_name || user.email}</h2>
          <p className="text-xs text-slate-400">User ID: {user.id}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <p>No messages yet.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isAdmin = msg.is_admin;
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex w-full mb-4",
                  isAdmin ? "justify-end" : "justify-start"
                )}
              >
                <div className={cn("flex flex-col gap-1 max-w-[75%]", isAdmin ? "items-end" : "items-start")}>
                  {msg.image_url && (
                    <div className="mb-1 rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                      <a href={msg.image_url} target="_blank" rel="noopener noreferrer">
                        <img src={msg.image_url} alt="Attachment" className="max-w-full max-h-[300px] object-cover" />
                      </a>
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm shadow-sm",
                      isAdmin
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-slate-100 text-slate-800 rounded-bl-none"
                    )}
                  >
                    {msg.content}
                    <div className={cn("text-[10px] mt-1 opacity-70", isAdmin ? "text-indigo-200" : "text-slate-400")}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex gap-2 items-end">
          {/* Saved Replies Popover */}
          <Popover open={isSavedRepliesOpen} onOpenChange={setIsSavedRepliesOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-full shrink-0" title="Saved Replies">
                <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                <h4 className="font-medium text-sm">Saved Replies</h4>
                <Dialog open={isCreateReplyOpen} onOpenChange={setIsCreateReplyOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <span className="text-xl leading-none">+</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>New Saved Reply</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Title</Label>
                        <Input
                          value={newReplyTitle}
                          onChange={(e) => setNewReplyTitle(e.target.value)}
                          placeholder="e.g., Greeting"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Message</Label>
                        <Textarea
                          value={newReplyContent}
                          onChange={(e) => setNewReplyContent(e.target.value)}
                          placeholder="Hello! How can I help you today?"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleSaveReply}>Save Reply</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {savedReplies.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">No saved replies yet.</div>
                ) : (
                  savedReplies.map(reply => (
                    <div
                      key={reply.id}
                      className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 group flex items-start gap-2"
                      onClick={() => {
                        setInputValue(reply.content);
                        setIsSavedRepliesOpen(false);
                      }}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-slate-900 text-xs mb-1">{reply.title}</div>
                        <div className="text-slate-500 text-xs line-clamp-2">{reply.content}</div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteReply(reply.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Image Upload */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full shrink-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            title="Send Image"
          >
            {uploadingImage ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5 text-slate-500" />}
          </Button>

          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your reply..."
            className="flex-1 min-h-[48px] max-h-[120px] resize-none border-0 bg-white rounded-[24px] px-4 py-3 shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-500 text-slate-700"
            disabled={sending}
          />
          <Button
            onClick={handleSend}
            className="rounded-full h-12 w-12 shrink-0 p-0 bg-indigo-600 hover:bg-indigo-700 shadow-md mb-[2px]" // Align with bottom of textarea
            disabled={sending || (!inputValue.trim() && !uploadingImage)}
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
