import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { STATUS_LABELS, STATUS_COLORS } from '@/types';
import { ArrowLeft, MapPin, Clock, User, MessageCircle, X, Check, Truck, CalendarIcon } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, orders, updateOrderStatus } = useApp();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const order = orders.find(o => o.id === id);

  useEffect(() => {
    if (!order || !mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([order.lat, order.lng], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    const icon = L.divIcon({
      html: `<div style="background:hsl(160,60%,38%);width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      className: '',
    });

    L.marker([order.lat, order.lng], { icon }).addTo(map)
      .bindPopup(`${order.street}, д. ${order.house}`);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [order]);

  if (!order) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Заказ не найден</p>
        <button onClick={() => navigate('/')} className="mt-3 text-primary text-sm">На главную</button>
      </div>
    );
  }

  const isClient = user?.role === 'client' && order.clientId === user.id;
  const isCourier = user?.role === 'courier';

  return (
    <div className="space-y-4 animate-slide-up">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="w-4 h-4" /> Назад
      </button>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Заказ #{order.id}</h2>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div ref={mapRef} className="h-48 w-full" />
      </div>

      <div className="glass-card rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <p className="text-sm font-medium text-foreground">{order.street}, д. {order.house}, кв. {order.apartment}, п. {order.entrance}</p>
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Запланировано: {order.scheduledDate ? new Date(order.scheduledDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) : '—'} в {order.scheduledTime || '—'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Создан: {new Date(order.createdAt).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Клиент: {order.clientName}</p>
        </div>
        {order.courierName && (
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Курьер: {order.courierName}</p>
          </div>
        )}
        {order.comment && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">💬 {order.comment}</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {order.courierId && (
          <button
            onClick={() => navigate(`/chat/${order.id}`)}
            className="w-full py-3 rounded-2xl bg-secondary text-secondary-foreground text-sm font-medium flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" /> Написать в чат
          </button>
        )}


        {isCourier && order.status === 'searching' && (
          <button
            onClick={() => user && updateOrderStatus(order.id, 'on_the_way', user.id)}
            className="w-full py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-medium"
          >
            Взять в работу
          </button>
        )}

        {isCourier && order.courierId === user?.id && order.status === 'on_the_way' && (
          <button
            onClick={() => updateOrderStatus(order.id, 'completed')}
            className="w-full py-3 rounded-2xl bg-success text-success-foreground text-sm font-medium flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" /> Завершить заказ
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
