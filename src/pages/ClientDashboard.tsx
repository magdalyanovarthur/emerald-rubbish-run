import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { STATUS_LABELS, STATUS_COLORS } from '@/types';
import { Package, Clock, MapPin } from 'lucide-react';
import OrdersMap from '@/components/OrdersMap';

const ClientDashboard: React.FC = () => {
  const { user, orders } = useApp();
  const navigate = useNavigate();

  const myOrders = orders.filter(o => o.clientId === user?.id);
  const active = myOrders.filter(o => o.status === 'searching' || o.status === 'on_the_way');
  const past = myOrders.filter(o => o.status === 'completed' || o.status === 'cancelled');

  const OrderCard = ({ order }: { order: typeof myOrders[0] }) => (
    <button
      onClick={() => navigate(`/order/${order.id}`)}
      className="w-full glass-card rounded-2xl p-4 text-left transition-transform active:scale-[0.98] animate-slide-up"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground">#{order.id}</span>
        </div>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
          {STATUS_LABELS[order.status]}
        </span>
      </div>
      <div className="flex items-center gap-1.5 mb-1">
        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">{order.street}, д. {order.house}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          {new Date(order.createdAt).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {order.comment && <p className="text-xs text-muted-foreground mt-2 line-clamp-1">💬 {order.comment}</p>}
    </button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-1">Привет, {user?.name?.split(' ')[0]} 👋</h2>
        <p className="text-sm text-muted-foreground">Ваши заказы на вынос мусора</p>
      </div>

      {myOrders.length > 0 && (
        <OrdersMap orders={myOrders} onOrderClick={(id) => navigate(`/order/${id}`)} />
      )}

      {active.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">Активные ({active.length})</h3>
          <div className="space-y-3">
            {active.map(o => <OrderCard key={o.id} order={o} />)}
          </div>
        </section>
      )}

      {active.length === 0 && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Нет активных заказов</p>
          <button
            onClick={() => navigate('/create-order')}
            className="mt-3 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
          >
            Создать заказ
          </button>
        </div>
      )}

      {past.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">Завершённые ({past.length})</h3>
          <div className="space-y-3">
            {past.map(o => <OrderCard key={o.id} order={o} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default ClientDashboard;
