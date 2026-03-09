import React, { useState, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { User, Phone, MapPin, LogOut, Save, Shield, Camera, Building, DoorOpen, Layers } from 'lucide-react';
import { STREETS, STREET_HOUSES } from '@/types';

const ProfilePage: React.FC = () => {
  const { user, updateProfile, logout } = useApp();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileStreet, setProfileStreet] = useState(user?.profileStreet || '');
  const [profileHouse, setProfileHouse] = useState(user?.profileHouse || '');
  const [profileEntrance, setProfileEntrance] = useState(user?.profileEntrance || '');
  const [profileFloor, setProfileFloor] = useState(user?.profileFloor || '');
  const [profileApartment, setProfileApartment] = useState(user?.profileApartment || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateProfile({
      name,
      phone,
      profileStreet,
      profileHouse,
      profileEntrance,
      profileFloor,
      profileApartment,
      avatarUrl: avatarPreview || undefined,
      address: profileStreet ? `${profileStreet}, д.${profileHouse}, подъезд ${profileEntrance}, эт.${profileFloor}, кв.${profileApartment}` : '',
    });
    setEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const availableHouses = profileStreet ? (STREET_HOUSES[profileStreet] || []) : [];

  const roleLabels = { client: 'Клиент', courier: 'Курьер', admin: 'Администратор' };

  return (
    <div className="space-y-4 animate-slide-up">
      <h2 className="text-lg font-bold text-foreground">Профиль</h2>

      <div className="glass-card rounded-2xl p-6">
        {/* Avatar + Name */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-primary" />
              )}
            </div>
            {editing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
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
          {/* Имя */}
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

          {/* Телефон */}
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

          {/* Адрес */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Адрес</label>
            {editing ? (
              <div className="space-y-2">
                <select
                  value={profileStreet}
                  onChange={e => { setProfileStreet(e.target.value); setProfileHouse(''); }}
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Выберите улицу</option>
                  {STREETS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-0.5 block">Дом</label>
                    <input
                      value={profileHouse}
                      onChange={e => setProfileHouse(e.target.value)}
                      placeholder="Номер дома"
                      className={`w-full px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-ring ${
                        profileHouse && !availableHouses.map(h => h.toLowerCase()).includes(profileHouse.trim().toLowerCase())
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-secondary text-foreground'
                      }`}
                    />
                    {profileHouse && !availableHouses.map(h => h.toLowerCase()).includes(profileHouse.trim().toLowerCase()) && (
                      <p className="text-[10px] text-destructive mt-0.5">Дом не в зоне обслуживания</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-0.5 block">Подъезд</label>
                    <input value={profileEntrance} onChange={e => setProfileEntrance(e.target.value)} placeholder="Подъезд" className="w-full px-3 py-2 rounded-xl bg-secondary text-foreground text-sm outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-0.5 block">Этаж</label>
                    <input value={profileFloor} onChange={e => setProfileFloor(e.target.value)} placeholder="Этаж" className="w-full px-3 py-2 rounded-xl bg-secondary text-foreground text-sm outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-0.5 block">Квартира</label>
                    <input value={profileApartment} onChange={e => setProfileApartment(e.target.value)} placeholder="Квартира" className="w-full px-3 py-2 rounded-xl bg-secondary text-foreground text-sm outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
              </div>
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
