import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { STATUS_LABELS, STATUS_COLORS } from '@/types';
import { Package, Clock, MapPin, CreditCard, Crown, CalendarCheck, Repeat, Check, X, Loader2 } from 'lucide-react';
import OrdersMap from '@/components/OrdersMap';
import { usePayment } from '@/hooks/usePayment';

const ClientDashboard: React.FC = () => {
  const { user, orders, subscription, purchaseSubscription, payForOrder } = useApp();
  const navigate = useNavigate();
  const { createPayment, isProcessing } = usePayment();
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);
  const [subModal, setSubModal] = useState<'every_other_day' | 'every_day' | null>(null);

  const myOrders = orders.filter(o => o.clientId === user?.id);
  const active = myOrders.filter(o => (o.status === 'searching' || o.status === 'on_the_way'));
  const unpaid = myOrders.filter(o => !o.paid);
  const past = myOrders.filter(o => o.status === 'completed' || o.status === 'cancelled');

  const hasActiveSubscription = subscription && new Date(subscription.endDate) > new Date();

  const handlePay = (orderId: string) => {
    setPayingOrderId(orderId);
  };

  const confirmPayment = async () => {
    if (payingOrderId) {
      await createPayment({
        payment_type: 'order',
        amount: 99,
        order_id: payingOrderId,
      });
    }
  };

  const confirmSubscription = async () => {
    if (subModal) {
      const amount = subModal === 'every_other_day' ? 1300 : 2500;
      await createPayment({
        payment_type: 'subscription',
        amount,
        subscription_type: subModal,
      });
    }
  };

  const OrderCard = ({ order }: { order: typeof myOrders[0] }) => (
    <div className="w-full glass-card rounded-2xl p-4 text-left animate-slide-up">
      <button
        onClick={() => navigate(`/order/${order.id}`)}
        className="w-full text-left"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">#{order.id}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {!order.paid && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-warning text-warning-foreground">
                Не оплачен
              </span>
            )}
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
              {STATUS_LABELS[order.status]}
            </span>
          </div>
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
      {!order.paid && (
        <button
          onClick={() => handlePay(order.id)}
          className="w-full mt-3 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
        >
          <CreditCard className="w-4 h-4" /> Оплатить 99 ₽
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-1">Привет, {user?.name?.split(' ')[0]} 👋</h2>
        <p className="text-sm text-muted-foreground">Ваши заказы на вынос мусора</p>
      </div>

      {/* Subscription section */}
      {hasActiveSubscription ? (
        <div className="glass-card rounded-2xl p-4 border-2 border-primary">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Подписка активна</h3>
          </div>
          <p className="text-sm text-foreground mb-1">
            {subscription!.type === 'every_other_day' ? 'Вынос через день' : 'Вынос каждый день'}
          </p>
          <p className="text-xs text-muted-foreground">
            Действует до {new Date(subscription!.endDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Подписки</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSubModal('every_other_day')}
              className="glass-card rounded-2xl p-4 text-left transition-transform active:scale-[0.98] hover:border-primary"
            >
              <CalendarCheck className="w-6 h-6 text-primary mb-2" />
              <p className="text-sm font-bold text-foreground mb-0.5">Через день</p>
              <p className="text-xs text-muted-foreground mb-2">Вынос мусора через день, 30 дней</p>
              <p className="text-lg font-bold text-primary">1 300 ₽</p>
              <p className="text-[10px] text-muted-foreground">/месяц</p>
            </button>
            <button
              onClick={() => setSubModal('every_day')}
              className="glass-card rounded-2xl p-4 text-left transition-transform active:scale-[0.98] hover:border-primary relative overflow-hidden"
            >
              <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                ХИТ
              </div>
              <Repeat className="w-6 h-6 text-primary mb-2" />
              <p className="text-sm font-bold text-foreground mb-0.5">Каждый день</p>
              <p className="text-xs text-muted-foreground mb-2">Ежедневный вынос мусора, 30 дней</p>
              <p className="text-lg font-bold text-primary">2 500 ₽</p>
              <p className="text-[10px] text-muted-foreground">/месяц</p>
            </button>
          </div>
        </div>
      )}

      {myOrders.length > 0 && (
        <OrdersMap orders={myOrders.filter(o => o.paid)} onOrderClick={(id) => navigate(`/order/${id}`)} />
      )}

      {/* Unpaid orders */}
      {unpaid.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-warning" /> Ожидают оплаты ({unpaid.length})
          </h3>
          <div className="space-y-3">
            {unpaid.map(o => <OrderCard key={o.id} order={o} />)}
          </div>
        </section>
      )}

      {/* Active paid orders */}
      {active.filter(o => o.paid).length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">Активные ({active.filter(o => o.paid).length})</h3>
          <div className="space-y-3">
            {active.filter(o => o.paid).map(o => <OrderCard key={o.id} order={o} />)}
          </div>
        </section>
      )}

      {active.filter(o => o.paid).length === 0 && unpaid.length === 0 && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Нет активных заказов</p>
          {!hasActiveSubscription && (
            <button
              onClick={() => navigate('/create-order')}
              className="mt-3 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
            >
              Создать заказ — 99 ₽
            </button>
          )}
        </div>
      )}

      {/* Create order button for subscription users */}
      {hasActiveSubscription && (
        <button
          onClick={() => navigate('/create-order')}
          className="w-full py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2"
        >
          <Package className="w-4 h-4" /> Создать заказ (по подписке)
        </button>
      )}

      {past.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">Завершённые ({past.length})</h3>
          <div className="space-y-3">
            {past.map(o => <OrderCard key={o.id} order={o} />)}
          </div>
        </section>
      )}

      {/* Payment modal */}
      {payingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-xl animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Оплата заказа</h3>
              <button onClick={() => setPayingOrderId(null)} className="text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center mb-6">
              <CreditCard className="w-12 h-12 text-primary mx-auto mb-3" />
              <p className="text-2xl font-bold text-foreground mb-1">99 ₽</p>
              <p className="text-sm text-muted-foreground">Разовый вынос мусора</p>
            </div>
            <button
              onClick={confirmPayment}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            >
              <Check className="w-4 h-4" /> Подтвердить оплату
            </button>
            <p className="text-[10px] text-muted-foreground text-center mt-3">Демо-режим: оплата симулируется</p>
          </div>
        </div>
      )}

      {/* Subscription modal */}
      {subModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-xl animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Оформление подписки</h3>
              <button onClick={() => setSubModal(null)} className="text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center mb-6">
              <Crown className="w-12 h-12 text-primary mx-auto mb-3" />
              <p className="text-2xl font-bold text-foreground mb-1">
                {subModal === 'every_other_day' ? '1 300 ₽' : '2 500 ₽'}
              </p>
              <p className="text-sm text-muted-foreground">
                {subModal === 'every_other_day' ? 'Вынос через день — 30 дней' : 'Ежедневный вынос — 30 дней'}
              </p>
            </div>
            <button
              onClick={confirmSubscription}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            >
              <Check className="w-4 h-4" /> Подтвердить оплату
            </button>
            <p className="text-[10px] text-muted-foreground text-center mt-3">Демо-режим: оплата симулируется</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
