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
export type SubscriptionType = 'none' | 'every_other_day' | 'every_day';

export interface Subscription {
  type: SubscriptionType;
  startDate: string;
  endDate: string;
}

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
  paid: boolean;
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

export const STREET_HOUSES: Record<string, string[]> = {
  '5-я просека': [
    '89','89а','89б','93','95','95а','95б','97','97а','97б',
    '99','99а','99б','100к1','100к2','101','102','103',
    '104','104а','104б','106','107','108','109','110',
    '110а','110б','110в','110г','110д','110е','110к',
    '111','113','115','117','119','121','123','125',
    '129','132','133','135','137','139','141','142',
    '145','147','149','151','153','155','343',
  ],
  '6-я просека': [
    '125','127','129','135','140','141','143','145','147','149',
    '151','153','155','157','159','159а','159б','161','163','165','165б',
  ],
  'Улица Советской Армии': [
    '253','259','261','271','271а','275','277','281','283','285','291',
  ],
  'Улица Солнечная': [
    '1','2','3','4','5','6','7','8','9','9а','10','11','12','14','16','18','20','22','24б',
  ],
  'Улица Шверника': [
    '2','4','6','8','10','14','16','22','24',
  ],
  'Улица 22-го Партсъезда': [
    '188','192','194','196','198','221','223','225','227',
  ],
};
