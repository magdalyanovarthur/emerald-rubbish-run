import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, Order, ChatMessage, Chat, OrderStatus, UserRole, Subscription, SubscriptionType } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

interface AppContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, phone: string, role: UserRole, password: string) => Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }>;
  logout: () => Promise<void>;
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'clientId' | 'clientName' | 'status' | 'createdAt'>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, courierId?: string) => void;
  payForOrder: (orderId: string) => void;
  chats: Chat[];
  messages: ChatMessage[];
  sendMessage: (orderId: string, text: string) => void;
  getChat: (orderId: string) => Chat | undefined;
  getOrderMessages: (orderId: string) => ChatMessage[];
  updateProfile: (data: Partial<User>) => void;
  subscription: Subscription | null;
  purchaseSubscription: (type: SubscriptionType) => void;
}

const AppContext = createContext<AppContextType>({} as AppContextType);
export const useApp = () => useContext(AppContext);

const DEMO_ORDERS: Order[] = [
  { id: '1', clientId: 'c1', clientName: 'Иван Петров', street: '5-я просека', house: '12', apartment: '45', entrance: '2', scheduledDate: '2026-03-04', scheduledTime: '14:00', comment: 'Два мешка мусора у двери', status: 'searching', createdAt: '2026-03-04T10:30:00', lat: 53.2200, lng: 50.1900, paid: true },
  { id: '2', clientId: 'c1', clientName: 'Иван Петров', courierId: 'k1', courierName: 'Алексей', street: 'Улица Советской Армии', house: '5', apartment: '12', entrance: '1', scheduledDate: '2026-03-04', scheduledTime: '10:00', comment: '', status: 'on_the_way', createdAt: '2026-03-04T09:00:00', lat: 53.2100, lng: 50.1400, paid: true },
  { id: '3', clientId: 'c2', clientName: 'Мария С.', street: '6-я просека', house: '8', apartment: '3', entrance: '3', scheduledDate: '2026-03-05', scheduledTime: '09:30', comment: 'Крупногабаритный мусор', status: 'searching', createdAt: '2026-03-04T11:00:00', lat: 53.2220, lng: 50.1950, paid: true },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>(DEMO_ORDERS);
  const [chats, setChats] = useState<Chat[]>([
    { orderId: '2', participants: ['c1', 'k1'], lastMessage: 'Уже еду!', lastMessageTime: '2026-03-04T09:15:00' },
  ]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'm1', orderId: '2', senderId: 'k1', senderName: 'Алексей', text: 'Принял ваш заказ, уже еду!', timestamp: '2026-03-04T09:10:00' },
    { id: 'm2', orderId: '2', senderId: 'c1', senderName: 'Иван', text: 'Спасибо, жду!', timestamp: '2026-03-04T09:12:00' },
    { id: 'm3', orderId: '2', senderId: 'k1', senderName: 'Алексей', text: 'Уже еду!', timestamp: '2026-03-04T09:15:00' },
  ]);
  const [subscription, setSubscription] = useState<Subscription | null>(() => {
    const saved = localStorage.getItem('cv-subscription');
    return saved ? JSON.parse(saved) : null;
  });

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

  useEffect(() => {
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          await fetchProfile(newSession.user.id, newSession.user.email || '');
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id, currentSession.user.email || '');
      } else {
        setLoading(false);
      }
    });

    return () => authSub.unsubscribe();
  }, [fetchProfile]);

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
    if (error) {
      return { success: false, error: error.message };
    }
    // If email confirmation is required, user won't have a session yet
    if (data.user && !data.session) {
      return { success: true, needsConfirmation: true };
    }
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  const addOrder = useCallback((orderData: Omit<Order, 'id' | 'clientId' | 'clientName' | 'status' | 'createdAt'>) => {
    if (!user) return;
    const newOrder: Order = {
      ...orderData,
      id: `o${Date.now()}`,
      clientId: user.id,
      clientName: user.name,
      status: 'searching',
      createdAt: new Date().toISOString(),
    };
    setOrders(prev => [newOrder, ...prev]);
  }, [user]);

  const payForOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.map(o => o.id !== orderId ? o : { ...o, paid: true }));
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus, courierId?: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      return { ...o, status, courierId: courierId || o.courierId, courierName: courierId ? user?.name : o.courierName };
    }));
  }, [user]);

  const sendMessage = useCallback((orderId: string, text: string) => {
    if (!user) return;
    const msg: ChatMessage = { id: `m${Date.now()}`, orderId, senderId: user.id, senderName: user.name, text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, msg]);
    setChats(prev => {
      const existing = prev.find(c => c.orderId === orderId);
      if (existing) return prev.map(c => c.orderId === orderId ? { ...c, lastMessage: text, lastMessageTime: msg.timestamp } : c);
      const order = orders.find(o => o.id === orderId);
      return [...prev, { orderId, participants: [order?.clientId || '', order?.courierId || ''], lastMessage: text, lastMessageTime: msg.timestamp }];
    });
  }, [user, orders]);

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
