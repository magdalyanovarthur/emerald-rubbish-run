import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, MapPin, LogOut, Save, Shield } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, updateProfile, logout } = useApp();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');

  const handleSave = () => {
    updateProfile({ name, phone, address });
    setEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabels = { client: 'Клиент', courier: 'Курьер', admin: 'Администратор' };

  return (
    <div className="space-y-4 animate-slide-up">
      <h2 className="text-lg font-bold text-foreground">Профиль</h2>

      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">{user?.name}</p>
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-primary" />
              <span className="text-xs text-primary font-medium">{roleLabels[user?.role || 'client']}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Имя</label>
            {editing ? (
              <input value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm outline-none focus:ring-2 focus:ring-ring" />
            ) : (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{user?.name}</span>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Телефон</label>
            {editing ? (
              <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm outline-none focus:ring-2 focus:ring-ring" />
            ) : (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{user?.phone}</span>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Email</label>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{user?.email}</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Адрес</label>
            {editing ? (
              <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Ваш адрес" className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-ring" />
            ) : (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{user?.address || 'Не указан'}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {editing ? (
            <button onClick={handleSave} className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Сохранить
            </button>
          ) : (
            <button onClick={() => setEditing(true)} className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium">
              Редактировать
            </button>
          )}
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="w-full py-3 rounded-2xl bg-destructive/10 text-destructive text-sm font-medium flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" /> Выйти из аккаунта
      </button>
    </div>
  );
};

export default ProfilePage;
