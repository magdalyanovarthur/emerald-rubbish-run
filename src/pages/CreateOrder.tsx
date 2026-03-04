import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { STREETS, STREET_COORDS } from '@/types';
import { MapPin, Home, MessageSquare, Send } from 'lucide-react';

const CreateOrder: React.FC = () => {
  const { addOrder } = useApp();
  const navigate = useNavigate();
  const [street, setStreet] = useState('');
  const [house, setHouse] = useState('');
  const [apartment, setApartment] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!street || !house || !apartment) {
      setError('Заполните обязательные поля');
      return;
    }
    const coords = STREET_COORDS[street] || { lat: 53.2100, lng: 50.1500 };
    addOrder({
      street,
      house,
      apartment,
      comment,
      lat: coords.lat + (Math.random() - 0.5) * 0.005,
      lng: coords.lng + (Math.random() - 0.5) * 0.005,
    });
    navigate('/');
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <div>
        <h2 className="text-lg font-bold text-foreground">Новый заказ</h2>
        <p className="text-sm text-muted-foreground">Укажите адрес для выноса мусора</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="glass-card rounded-2xl p-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Улица *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select
                value={street}
                onChange={e => setStreet(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary text-foreground text-sm outline-none focus:ring-2 focus:ring-ring appearance-none"
              >
                <option value="">Выберите улицу</option>
                {STREETS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Дом *</label>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="12"
                  value={house}
                  onChange={e => setHouse(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Кв. / Подъезд *</label>
              <input
                type="text"
                placeholder="45, п.2"
                value={apartment}
                onChange={e => setApartment(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Комментарий</label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <textarea
                placeholder="Количество мешков, особые пожелания..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          </div>
        </div>

        {error && <p className="text-destructive text-xs text-center">{error}</p>}

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
        >
          <Send className="w-4 h-4" />
          Опубликовать заказ
        </button>
      </form>
    </div>
  );
};

export default CreateOrder;
