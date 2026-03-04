import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

const ChatsList: React.FC = () => {
  const { user, chats, orders } = useApp();
  const navigate = useNavigate();

  const myChats = chats.filter(c => {
    const order = orders.find(o => o.id === c.orderId);
    if (!order || !user) return false;
    return order.clientId === user.id || order.courierId === user.id;
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground">Чаты</h2>

      {myChats.length === 0 && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <MessageCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Нет активных чатов</p>
        </div>
      )}

      <div className="space-y-2">
        {myChats.map(chat => {
          const order = orders.find(o => o.id === chat.orderId);
          if (!order) return null;
          const otherName = user?.id === order.clientId ? order.courierName : order.clientName;
          return (
            <button
              key={chat.orderId}
              onClick={() => navigate(`/chat/${chat.orderId}`)}
              className="w-full glass-card rounded-2xl p-4 text-left transition-transform active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{otherName || 'Чат'}</p>
                    <span className="text-[10px] text-muted-foreground">
                      Заказ #{order.id}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ChatsList;
