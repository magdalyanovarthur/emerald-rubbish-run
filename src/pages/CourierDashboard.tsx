import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { STATUS_LABELS, STATUS_COLORS } from '@/types';
import { Package, MapPin, Clock, Check } from 'lucide-react';
import OrdersMap from '@/components/OrdersMap';

const CourierDashboard: React.FC = () => {
  const { user, orders, updateOrderStatus } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'available' | 'my'>('available');

  const available = orders.filter(o => o.status === 'searching');
  const myOrders = orders.filter(o => o.courierId === user?.id);

  const handleTake = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    updateOrderStatus(orderId, 'on_the_way', user.id);
  };

  const handleComplete = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateOrderStatus(orderId, 'completed');
  };

  const list = tab === 'available' ? available : myOrders;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-1">Курьер: {user?.name} 🚀</h2>
        <p className="text-sm text-muted-foreground">Заказы на вынос мусора</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab('available')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === 'available' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
        >
          Доступные ({available.length})
        </button>
        <button
          onClick={() => setTab('my')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === 'my' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
        >
          Мои заказы ({myOrders.length})
        </button>
      </div>

      {list.length > 0 && (
        <OrdersMap orders={list} onOrderClick={(id) => navigate(`/order/${id}`)} />
      )}

      {list.length === 0 && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">{tab === 'available' ? 'Нет доступных заказов' : 'Вы ещё не взяли заказы'}</p>
        </div>
      )}

      <div className="space-y-3">
        {list.map(order => (
          <div
            key={order.id}
            onClick={() => navigate(`/order/${order.id}`)}
            className="glass-card rounded-2xl p-4 cursor-pointer transition-transform active:scale-[0.98] animate-slide-up"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-foreground">{order.clientName}</p>
                <p className="text-xs text-muted-foreground">#{order.id}</p>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
                {STATUS_LABELS[order.status]}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-sm text-foreground">{order.street}, д. {order.house}, кв. {order.apartment}</p>
            </div>
            <div className="flex items-center gap-1.5 mb-2">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                {new Date(order.createdAt).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {order.comment && <p className="text-xs text-muted-foreground mb-2">💬 {order.comment}</p>}
            
            {tab === 'available' && order.status === 'searching' && (
              <button
                onClick={(e) => handleTake(order.id, e)}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium transition-transform active:scale-[0.98]"
              >
                Взять в работу
              </button>
            )}
            {tab === 'my' && order.status === 'on_the_way' && (
              <button
                onClick={(e) => handleComplete(order.id, e)}
                className="w-full py-2.5 rounded-xl bg-success text-success-foreground text-sm font-medium flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
              >
                <Check className="w-4 h-4" /> Завершить
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourierDashboard;
