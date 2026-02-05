import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export interface ChatMessage {
  id: string;
  user_id: string;
  is_admin: boolean;
  content: string;
  image_url: string | null;
  created_at: string;
}

export interface ChatUser {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  last_message_at?: string;
}

export interface SavedReply {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export const chatService = {
  // --- Conversations (Users who have chatted) ---
  getConversations: async (): Promise<ChatUser[]> => {
    // 1. Get unique user_ids from messages, ordered by most recent
    const { data: messages, error } = await (supabase
      .from('messages') as any)
      .select('user_id, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const uniqueUserIds = Array.from(new Set(messages.map((m: any) => m.user_id)));

    if (uniqueUserIds.length === 0) return [];

    // 2. Fetch profiles for these users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url')
      .in('id', uniqueUserIds);

    if (profilesError) throw profilesError;

    // 3. Attach last message time
    const usersWithTime = profiles.map((p: any) => {
      const lastMsg = messages.find((m: any) => m.user_id === p.id);
      return {
        ...p,
        last_message_at: lastMsg ? lastMsg.created_at : null // safe access
      };
    });

    // Sort by last message
    return usersWithTime.sort((a: any, b: any) =>
      new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
    );
  },

  // --- Messages ---
  getMessages: async (userId: string): Promise<ChatMessage[]> => {
    const { data, error } = await (supabase
      .from('messages') as any)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as ChatMessage[];
  },

  sendMessage: async (userId: string, content: string, imageUrl?: string): Promise<ChatMessage> => {
    const { data, error } = await (supabase
      .from('messages') as any)
      .insert({
        user_id: userId,
        content: content,
        image_url: imageUrl || null,
        is_admin: true
      })
      .select()
      .single();

    if (error) throw error;
    return data as ChatMessage;
  },

  uploadImage: async (file: File): Promise<string> => {
    // 1. Upload to 'images' bucket. Assume valid path.
    const fileExt = file.name.split('.').pop();
    const fileName = `chat/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // 2. Get Public URL
    const { data } = supabase.storage.from('images').getPublicUrl(fileName);
    return data.publicUrl;
  },

  // --- Saved Replies ---
  getSavedReplies: async (): Promise<SavedReply[]> => {
    const { data, error } = await (supabase
      .from('saved_replies') as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as SavedReply[];
  },

  createSavedReply: async (title: string, content: string): Promise<SavedReply> => {
    const { data, error } = await (supabase
      .from('saved_replies') as any)
      .insert({ title, content })
      .select()
      .single();

    if (error) throw error;
    return data as SavedReply;
  },

  deleteSavedReply: async (id: string): Promise<void> => {
    const { error } = await (supabase
      .from('saved_replies') as any)
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // --- Realtime ---
  subscribeToMessages: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`chat:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  },

  subscribeToAllMessages: (callback: (payload: any) => void) => {
    return supabase
      .channel('chat_all')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        callback
      )
      .subscribe();
  }
};
