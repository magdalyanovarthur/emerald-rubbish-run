import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, Order, ChatMessage, Chat, OrderStatus, UserRole, Subscription, SubscriptionType } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

interface AppContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, phone: string, role: UserRole, password: string) => Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }>;
  logout: () => Promise<void>;
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'clientId' | 'clientName' | 'status' | 'createdAt'>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus, courierId?: string) => Promise<void>;
  payForOrder: (orderId: string) => Promise<void>;
  chats: Chat[];
  messages: ChatMessage[];
  sendMessage: (orderId: string, text: string) => Promise<void>;
  getChat: (orderId: string) => Chat | undefined;
  getOrderMessages: (orderId: string) => ChatMessage[];
  updateProfile: (data: Partial<User>) => void;
  subscription: Subscription | null;
  purchaseSubscription: (type: SubscriptionType) => void;
}

const AppContext = createContext<AppContextType>({} as AppContextType);
export const useApp = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(() => {
    const saved = localStorage.getItem('cv-subscription');
    return saved ? JSON.parse(saved) : null;
  });

  // --- Fetch helpers ---
  const fetchOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setOrders(data.map(mapDbOrder));
    }
  }, []);

  const fetchChats = useCallback(async () => {
    const { data } = await supabase.from('chats').select('*');
    if (data) {
      setChats(data.map(c => ({
        orderId: c.order_id,
        participants: [c.participant_client, c.participant_courier],
        lastMessage: c.last_message || undefined,
        lastMessageTime: c.last_message_time || undefined,
      })));
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true });
    if (data) {
      setMessages(data.map(m => ({
        id: m.id,
        orderId: m.order_id,
        senderId: m.sender_id,
        senderName: m.sender_name,
        text: m.text,
        timestamp: m.created_at,
      })));
    }
  }, []);

  // --- Map DB row to Order type ---
  function mapDbOrder(row: any): Order {
    return {
      id: row.id,
      clientId: row.client_id,
      clientName: row.client_name,
      courierId: row.courier_id || undefined,
      courierName: row.courier_name || undefined,
      street: row.street,
      house: row.house,
      apartment: row.apartment,
      entrance: row.entrance,
      scheduledDate: row.scheduled_date,
      scheduledTime: row.scheduled_time,
      comment: row.comment,
      status: row.status as OrderStatus,
      createdAt: row.created_at,
      lat: row.lat,
      lng: row.lng,
      paid: row.paid,
    };
  }

  // --- Auth & profile ---
  const fetchProfile = useCallback(async (userId: string, email: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (data) {
      setUser({
        id: userId,
        name: data.name || '',
        phone: data.phone || '',
        email,
        role: data.role as UserRole,
        address: data.address || '',
        avatarUrl: data.avatar_url || '',
        profileStreet: data.profile_street || '',
        profileHouse: data.profile_house || '',
        profileEntrance: data.profile_entrance || '',
        profileFloor: data.profile_floor || '',
        profileApartment: data.profile_apartment || '',
      });
    }
  }, []);

  // Initial auth + data load
  useEffect(() => {
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          await fetchProfile(newSession.user.id, newSession.user.email || '');
          fetchOrders();
          fetchChats();
          fetchMessages();
        } else {
          setUser(null);
          setOrders([]);
          setChats([]);
          setMessages([]);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id, currentSession.user.email || '');
        fetchOrders();
        fetchChats();
        fetchMessages();
      } else {
        setLoading(false);
      }
    });

    return () => authSub.unsubscribe();
  }, [fetchProfile, fetchOrders, fetchChats, fetchMessages]);

  // --- Realtime subscriptions ---
  useEffect(() => {
    const ordersChannel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    const chatsChannel = supabase
      .channel('chats-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, () => {
        fetchChats();
      })
      .subscribe();

    const msgsChannel = supabase
      .channel('messages-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(chatsChannel);
      supabase.removeChannel(msgsChannel);
    };
  }, [fetchOrders, fetchChats, fetchMessages]);

  // --- Auth actions ---
  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Email not confirmed')) {
        return { success: false, error: 'Подтвердите email перед входом. Проверьте почту.' };
      }
      return { success: false, error: 'Неверный email или пароль' };
    }
    return { success: true };
  }, []);

  const register = useCallback(async (name: string, email: string, phone: string, role: UserRole, password: string) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { name, phone, role },
      },
    });
    if (error) return { success: false, error: error.message };
    if (data.user && !data.session) return { success: true, needsConfirmation: true };
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  // --- Order actions ---
  const addOrder = useCallback(async (orderData: Omit<Order, 'id' | 'clientId' | 'clientName' | 'status' | 'createdAt'>) => {
    if (!user) return;
    const { error } = await supabase.from('orders').insert({
      client_id: user.id,
      client_name: user.name,
      street: orderData.street,
      house: orderData.house,
      apartment: orderData.apartment,
      entrance: orderData.entrance,
      scheduled_date: orderData.scheduledDate,
      scheduled_time: orderData.scheduledTime,
      comment: orderData.comment,
      lat: orderData.lat,
      lng: orderData.lng,
      paid: orderData.paid || false,
      status: 'searching',
    });
    if (error) {
      toast({ title: 'Ошибка', description: 'Не удалось создать заказ', variant: 'destructive' });
    }
    // Realtime will update the list
  }, [user]);

  const payForOrder = useCallback(async (orderId: string) => {
    await supabase.from('orders').update({ paid: true }).eq('id', orderId);
  }, []);

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus, courierId?: string) => {
    const updateData: any = { status };
    if (courierId) {
      updateData.courier_id = courierId;
      updateData.courier_name = user?.name || '';
    }
    await supabase.from('orders').update(updateData).eq('id', orderId);
  }, [user]);

  // --- Chat actions ---
  const sendMessage = useCallback(async (orderId: string, text: string) => {
    if (!user) return;

    // Insert message
    await supabase.from('chat_messages').insert({
      order_id: orderId,
      sender_id: user.id,
      sender_name: user.name,
      text,
    });

    // Upsert chat
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const existingChat = chats.find(c => c.orderId === orderId);
      if (existingChat) {
        await supabase.from('chats')
          .update({ last_message: text, last_message_time: new Date().toISOString() })
          .eq('order_id', orderId);
      } else {
        await supabase.from('chats').insert({
          order_id: orderId,
          participant_client: order.clientId,
          participant_courier: order.courierId || user.id,
          last_message: text,
          last_message_time: new Date().toISOString(),
        });
      }
    }
  }, [user, orders, chats]);

  const getChat = useCallback((orderId: string) => chats.find(c => c.orderId === orderId), [chats]);
  const getOrderMessages = useCallback((orderId: string) => messages.filter(m => m.orderId === orderId), [messages]);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    
    await supabase.from('profiles').update({
      name: updated.name,
      phone: updated.phone,
      address: updated.address,
      avatar_url: updated.avatarUrl,
      profile_street: updated.profileStreet,
      profile_house: updated.profileHouse,
      profile_entrance: updated.profileEntrance,
      profile_floor: updated.profileFloor,
      profile_apartment: updated.profileApartment,
    }).eq('user_id', user.id);
  }, [user]);

  const purchaseSubscription = useCallback((type: SubscriptionType) => {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1);
    const sub: Subscription = { type, startDate: now.toISOString(), endDate: endDate.toISOString() };
    setSubscription(sub);
    localStorage.setItem('cv-subscription', JSON.stringify(sub));
  }, []);

  return (
    <AppContext.Provider value={{ user, session, loading, login, register, logout, orders, addOrder, updateOrderStatus, payForOrder, chats, messages, sendMessage, getChat, getOrderMessages, updateProfile, subscription, purchaseSubscription }}>
      {children}
    </AppContext.Provider>
  );
};
