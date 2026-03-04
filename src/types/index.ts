export type UserRole = 'client' | 'courier' | 'admin';

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  address?: string;
}

export type OrderStatus = 'searching' | 'on_the_way' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  courierId?: string;
  courierName?: string;
  street: string;
  house: string;
  apartment: string;
  entrance: string;
  scheduledDate: string;
  scheduledTime: string;
  comment: string;
  status: OrderStatus;
  createdAt: string;
  lat: number;
  lng: number;
}

export interface ChatMessage {
  id: string;
  orderId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface Chat {
  orderId: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: string;
}

export const STREETS = [
  '5-я просека',
  '6-я просека',
  'Улица Советской Армии',
  'Улица Солнечная',
  'Улица Шверника',
  'Улица 22-го Партсъезда',
] as const;

export const STATUS_LABELS: Record<OrderStatus, string> = {
  searching: 'Поиск курьера',
  on_the_way: 'Курьер в пути',
  completed: 'Выполнен',
  cancelled: 'Отменён',
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  searching: 'bg-warning text-warning-foreground',
  on_the_way: 'bg-primary text-primary-foreground',
  completed: 'bg-success text-success-foreground',
  cancelled: 'bg-destructive text-destructive-foreground',
};

// Street to approximate coords in Samara
export const STREET_COORDS: Record<string, { lat: number; lng: number }> = {
  '5-я просека': { lat: 53.2200, lng: 50.1900 },
  '6-я просека': { lat: 53.2220, lng: 50.1950 },
  'Улица Советской Армии': { lat: 53.2100, lng: 50.1400 },
  'Улица Солнечная': { lat: 53.2050, lng: 50.1350 },
  'Улица Шверника': { lat: 53.2150, lng: 50.1500 },
  'Улица 22-го Партсъезда': { lat: 53.2180, lng: 50.1600 },
};
