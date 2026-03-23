import React, { useState } from 'react';
import { useServiceZones, ServiceZone } from '@/hooks/useServiceZones';
import { MapPin, Plus, Pencil, Trash2, Save, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ServiceZonesManager: React.FC = () => {
  const { zones, loading, addZone, updateZone, deleteZone } = useServiceZones(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formStreet, setFormStreet] = useState('');
  const [formHouses, setFormHouses] = useState('');
  const [formLat, setFormLat] = useState('53.21');
  const [formLng, setFormLng] = useState('50.15');

  const resetForm = () => {
    setFormStreet('');
    setFormHouses('');
    setFormLat('53.21');
    setFormLng('50.15');
    setShowForm(false);
    setEditingId(null);
  };

  const startEdit = (zone: ServiceZone) => {
    setEditingId(zone.id);
    setFormStreet(zone.street);
    setFormHouses(zone.houses.join(', '));
    setFormLat(String(zone.lat));
    setFormLng(String(zone.lng));
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formStreet.trim() || !formHouses.trim()) {
      toast({ title: 'Ошибка', description: 'Заполните улицу и дома', variant: 'destructive' });
      return;
    }
    const houses = formHouses.split(',').map(h => h.trim()).filter(Boolean);
    const lat = parseFloat(formLat) || 53.21;
    const lng = parseFloat(formLng) || 50.15;

    let ok: boolean;
    if (editingId) {
      ok = await updateZone(editingId, { street: formStreet.trim(), houses, lat, lng });
    } else {
      ok = await addZone(formStreet.trim(), houses, lat, lng);
    }

    if (ok) {
      toast({ title: editingId ? 'Обновлено' : 'Добавлено' });
      resetForm();
    } else {
      toast({ title: 'Ошибка', description: 'Не удалось сохранить', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (await deleteZone(id)) {
      toast({ title: 'Удалено' });
    }
  };

  const handleToggle = async (zone: ServiceZone) => {
    await updateZone(zone.id, { is_active: !zone.is_active });
  };

  if (loading) return <p className="text-sm text-muted-foreground text-center py-4">Загрузка зон...</p>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Зоны обслуживания ({zones.length})</h3>
        {!showForm && (
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium"
          >
            <Plus className="w-3 h-3" /> Добавить
          </button>
        )}
      </div>

      {showForm && (
        <div className="glass-card rounded-2xl p-4 space-y-3">
          <p className="text-xs font-semibold text-foreground">{editingId ? 'Редактирование' : 'Новая зона'}</p>
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Улица</label>
            <input
              value={formStreet}
              onChange={e => setFormStreet(e.target.value)}
              placeholder="Название улицы"
              className="w-full px-3 py-2.5 rounded-xl bg-secondary text-foreground text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Дома (через запятую)</label>
            <textarea
              value={formHouses}
              onChange={e => setFormHouses(e.target.value)}
              placeholder="1, 2, 3а, 4б..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-secondary text-foreground text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground mb-1 block">Широта</label>
              <input
                value={formLat}
                onChange={e => setFormLat(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-secondary text-foreground text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground mb-1 block">Долгота</label>
              <input
                value={formLng}
                onChange={e => setFormLng(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-secondary text-foreground text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center gap-1">
              <Save className="w-3 h-3" /> Сохранить
            </button>
            <button onClick={resetForm} className="px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-xs font-medium flex items-center justify-center gap-1">
              <X className="w-3 h-3" /> Отмена
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {zones.map(zone => (
          <div key={zone.id} className={`glass-card rounded-2xl p-4 ${!zone.is_active ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{zone.street}</p>
                  <p className="text-[11px] text-muted-foreground">{zone.houses.length} домов</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button onClick={() => handleToggle(zone)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors" title={zone.is_active ? 'Деактивировать' : 'Активировать'}>
                  {zone.is_active
                    ? <ToggleRight className="w-5 h-5 text-success" />
                    : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                </button>
                <button onClick={() => startEdit(zone)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button onClick={() => handleDelete(zone.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {zone.houses.join(', ')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceZonesManager;
