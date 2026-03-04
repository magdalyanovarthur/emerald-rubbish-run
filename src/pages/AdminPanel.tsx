import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { STATUS_LABELS, STATUS_COLORS } from '@/types';
import { useNavigate } from 'react-router-dom';
import { Package, X, BarChart3 } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const { orders, updateOrderStatus } = useApp();
  const navigate = useNavigate();

  const stats = {
    total: orders.length,
    searching: orders.filter(o => o.status === 'searching').length,
    on_the_way: orders.filter(o => o.status === 'on_the_way').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <div>
        <h2 className="text-lg font-bold text-foreground">Админ-панель</h2>
        <p className="text-sm text-muted-foreground">Управление заказами</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="glass-card rounded-2xl p-3 text-center">
          <BarChart3 className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{stats.total}</p>
          <p className="text-[10px] text-muted-foreground">Всего</p>
        </div>
        <div className="glass-card rounded-2xl p-3 text-center">
          <p className="text-xl font-bold text-warning">{stats.searching}</p>
          <p className="text-[10px] text-muted-foreground">Ищут курьера</p>
        </div>
        <div className="glass-card rounded-2xl p-3 text-center">
          <p className="text-xl font-bold text-primary">{stats.on_the_way}</p>
          <p className="text-[10px] text-muted-foreground">В пути</p>
        </div>
        <div className="glass-card rounded-2xl p-3 text-center">
          <p className="text-xl font-bold text-success">{stats.completed}</p>
          <p className="text-[10px] text-muted-foreground">Выполнено</p>
        </div>
      </div>

      <div className="space-y-2">
        {orders.map(order => (
          <div key={order.id} className="glass-card rounded-2xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="cursor-pointer" onClick={() => navigate(`/order/${order.id}`)}>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">#{order.id}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{order.clientName}</p>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
                {STATUS_LABELS[order.status]}
              </span>
            </div>
            <p className="text-xs text-foreground mb-2">{order.street}, д. {order.house}</p>
            {(order.status === 'searching' || order.status === 'on_the_way') && (
              <button
                onClick={() => updateOrderStatus(order.id, 'cancelled')}
                className="w-full py-2 rounded-xl bg-destructive/10 text-destructive text-xs font-medium flex items-center justify-center gap-1"
              >
                <X className="w-3 h-3" /> Отменить
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;
