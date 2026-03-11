import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { STREETS, STREET_COORDS, STREET_HOUSES } from '@/types';
import { MapPin, Home, DoorOpen, MessageSquare, Send, CalendarIcon, Clock, Building } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';

const TIMES = Array.from({ length: 6 }, (_, i) => {
  const startHour = 9 + i * 2;
  const endHour = startHour + 2;
  return `${startHour.toString().padStart(2, '0')}:00 – ${endHour.toString().padStart(2, '0')}:00`;
});

const CreateOrder: React.FC = () => {
  const { addOrder, subscription, user } = useApp();
  const navigate = useNavigate();
  const [street, setStreet] = useState('');
  const [house, setHouse] = useState('');
  const [apartment, setApartment] = useState('');
  const [entrance, setEntrance] = useState('');
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  // Автозаполнение адреса из профиля
  useEffect(() => {
    if (!user) return;
    const loadProfileAddress = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('profile_street, profile_house, profile_entrance, profile_apartment')
        .eq('user_id', user.id)
        .single();
      if (data) {
        if (data.profile_street && (STREETS as readonly string[]).includes(data.profile_street)) {
          setStreet(data.profile_street as typeof STREETS[number]);
          if (data.profile_house) setHouse(data.profile_house);
        }
        if (data.profile_apartment) setApartment(data.profile_apartment);
        if (data.profile_entrance) setEntrance(data.profile_entrance);
      }
    };
    loadProfileAddress();
  }, [user]);

  const availableHouses = street ? (STREET_HOUSES[street] || []) : [];
  const isHouseValid = house.trim() !== '' && availableHouses.map(h => h.toLowerCase()).includes(house.trim().toLowerCase());

  const handleStreetChange = (value: string) => {
    setStreet(value);
    setHouse('');
  };

  const hasActiveSubscription = subscription && new Date(subscription.endDate) > new Date();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!street || !isHouseValid || !apartment || !entrance || !scheduledDate || !scheduledTime) {
      setError('Заполните обязательные поля');
      return;
    }
    const coords = STREET_COORDS[street] || { lat: 53.2100, lng: 50.1500 };
    await addOrder({
      street,
      house,
      apartment,
      entrance,
      scheduledDate: scheduledDate.toISOString(),
      scheduledTime,
      comment,
      lat: coords.lat + (Math.random() - 0.5) * 0.005,
      lng: coords.lng + (Math.random() - 0.5) * 0.005,
      paid: !!hasActiveSubscription,
    });
    navigate('/');
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <div>
        <h2 className="text-lg font-bold text-foreground">Новый заказ</h2>
        <p className="text-sm text-muted-foreground">Укажите адрес и время для выноса мусора</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="glass-card rounded-2xl p-4 space-y-3">
          {/* Street */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Улица *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select
                value={street}
                onChange={e => handleStreetChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary text-foreground text-sm outline-none focus:ring-2 focus:ring-ring appearance-none"
              >
                <option value="">Выберите улицу</option>
                {STREETS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* House */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Дом *</label>
            <div className="relative">
              <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={street ? 'Введите номер дома' : 'Сначала выберите улицу'}
                value={house}
                onChange={e => setHouse(e.target.value)}
                disabled={!street}
                className={cn(
                  "w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50",
                  house && !isHouseValid
                    ? "bg-muted text-muted-foreground"
                    : "bg-secondary text-foreground"
                )}
              />
            </div>
            {house && !isHouseValid && (
              <p className="text-xs text-destructive mt-1">Этот дом не входит в зону обслуживания</p>
            )}
          </div>

          {/* Apartment & Entrance */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Квартира *</label>
              <div className="relative">
                <DoorOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="45"
                  value={apartment}
                  onChange={e => setApartment(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Подъезд *</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="2"
                  value={entrance}
                  onChange={e => setEntrance(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Дата *</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-3 rounded-xl bg-secondary text-sm outline-none focus:ring-2 focus:ring-ring text-left",
                      !scheduledDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                    {scheduledDate ? format(scheduledDate, 'd MMM', { locale: ru }) : 'Выберите'}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Время *</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select
                  value={scheduledTime}
                  onChange={e => setScheduledTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary text-foreground text-sm outline-none focus:ring-2 focus:ring-ring appearance-none"
                >
                  <option value="">Выберите</option>
                  {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Comment */}
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
