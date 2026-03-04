import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, Order, ChatMessage, Chat, OrderStatus, UserRole } from '@/types';

interface AppContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, phone: string, role: UserRole, password: string) => boolean;
  logout: () => void;
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'clientId' | 'clientName' | 'status' | 'createdAt'>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, courierId?: string) => void;
  chats: Chat[];
  messages: ChatMessage[];
  sendMessage: (orderId: string, text: string) => void;
  getChat: (orderId: string) => Chat | undefined;
  getOrderMessages: (orderId: string) => ChatMessage[];
  updateProfile: (data: Partial<User>) => void;
}

const AppContext = createContext<AppContextType>({} as AppContextType);
export const useApp = () => useContext(AppContext);

// Demo data
const DEMO_ORDERS: Order[] = [
  { id: '1', clientId: 'c1', clientName: 'Иван Петров', street: '5-я просека', house: '12', apartment: '45, подъезд 2', comment: 'Два мешка мусора у двери', status: 'searching', createdAt: '2026-03-04T10:30:00', lat: 53.2200, lng: 50.1900 },
  { id: '2', clientId: 'c1', clientName: 'Иван Петров', courierId: 'k1', courierName: 'Алексей', street: 'Улица Советской Армии', house: '5', apartment: '12', comment: '', status: 'on_the_way', createdAt: '2026-03-04T09:00:00', lat: 53.2100, lng: 50.1400 },
  { id: '3', clientId: 'c2', clientName: 'Мария С.', street: '6-я просека', house: '8', apartment: '3', comment: 'Крупногабаритный мусор', status: 'searching', createdAt: '2026-03-04T11:00:00', lat: 53.2220, lng: 50.1950 },
];

const DEMO_USERS: (User & { password: string })[] = [
  { id: 'c1', name: 'Иван Петров', phone: '+7 927 111 22 33', email: 'client@test.ru', role: 'client', password: '123456', address: '5-я просека, д.12, кв.45' },
  { id: 'k1', name: 'Алексей Курьер', phone: '+7 927 444 55 66', email: 'courier@test.ru', role: 'courier', password: '123456', address: '' },
  { id: 'a1', name: 'Администратор', phone: '+7 927 000 00 00', email: 'admin@test.ru', role: 'admin', password: 'admin123', address: '' },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState(DEMO_USERS);
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cv-user');
    return saved ? JSON.parse(saved) : null;
  });
  const [orders, setOrders] = useState<Order[]>(DEMO_ORDERS);
  const [chats, setChats] = useState<Chat[]>([
    { orderId: '2', participants: ['c1', 'k1'], lastMessage: 'Уже еду!', lastMessageTime: '2026-03-04T09:15:00' },
  ]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'm1', orderId: '2', senderId: 'k1', senderName: 'Алексей', text: 'Принял ваш заказ, уже еду!', timestamp: '2026-03-04T09:10:00' },
    { id: 'm2', orderId: '2', senderId: 'c1', senderName: 'Иван', text: 'Спасибо, жду!', timestamp: '2026-03-04T09:12:00' },
    { id: 'm3', orderId: '2', senderId: 'k1', senderName: 'Алексей', text: 'Уже еду!', timestamp: '2026-03-04T09:15:00' },
  ]);

  const login = useCallback((email: string, password: string) => {
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...userData } = found;
      setUser(userData);
      localStorage.setItem('cv-user', JSON.stringify(userData));
      return true;
    }
    return false;
  }, [users]);

  const register = useCallback((name: string, email: string, phone: string, role: UserRole, password: string) => {
    if (users.find(u => u.email === email)) return false;
    const newUser = { id: `u${Date.now()}`, name, email, phone, role, password, address: '' };
    setUsers(prev => [...prev, newUser]);
    const { password: _, ...userData } = newUser;
    setUser(userData);
    localStorage.setItem('cv-user', JSON.stringify(userData));
    return true;
  }, [users]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('cv-user');
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

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus, courierId?: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        status,
        courierId: courierId || o.courierId,
        courierName: courierId ? user?.name : o.courierName,
      };
    }));
  }, [user]);

  const sendMessage = useCallback((orderId: string, text: string) => {
    if (!user) return;
    const msg: ChatMessage = {
      id: `m${Date.now()}`,
      orderId,
      senderId: user.id,
      senderName: user.name,
      text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, msg]);
    setChats(prev => {
      const existing = prev.find(c => c.orderId === orderId);
      if (existing) {
        return prev.map(c => c.orderId === orderId ? { ...c, lastMessage: text, lastMessageTime: msg.timestamp } : c);
      }
      const order = orders.find(o => o.id === orderId);
      return [...prev, { orderId, participants: [order?.clientId || '', order?.courierId || ''], lastMessage: text, lastMessageTime: msg.timestamp }];
    });
  }, [user, orders]);

  const getChat = useCallback((orderId: string) => chats.find(c => c.orderId === orderId), [chats]);
  const getOrderMessages = useCallback((orderId: string) => messages.filter(m => m.orderId === orderId), [messages]);

  const updateProfile = useCallback((data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('cv-user', JSON.stringify(updated));
  }, [user]);

  return (
    <AppContext.Provider value={{ user, login, register, logout, orders, addOrder, updateOrderStatus, chats, messages, sendMessage, getChat, getOrderMessages, updateProfile }}>
      {children}
    </AppContext.Provider>
  );
};
