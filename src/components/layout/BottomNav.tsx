import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, MessageCircle, User, Plus, ShieldCheck } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useApp();

  if (!user) return null;

  const isClient = user.role === 'client';
  const isAdmin = user.role === 'admin';

  const tabs = [
    { path: '/', icon: Home, label: 'Главная' },
    { path: '/chats', icon: MessageCircle, label: 'Чаты' },
    ...(isAdmin ? [{ path: '/admin', icon: ShieldCheck, label: 'Админ' }] : []),
    { path: '/profile', icon: User, label: 'Профиль' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1">
        {tabs.map((tab, i) => {
          const isActive = location.pathname === tab.path;
          // Insert create button in the middle for clients
          const showCreateBtn = isClient && i === 1;
          return (
            <React.Fragment key={tab.path}>
              <button
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
              {showCreateBtn && (
                <button
                  onClick={() => navigate('/create-order')}
                  className="w-12 h-12 -mt-5 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 transition-transform active:scale-95"
                >
                  <Plus className="w-6 h-6" />
                </button>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
