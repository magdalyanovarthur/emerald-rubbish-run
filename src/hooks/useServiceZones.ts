import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ServiceZone {
  id: string;
  street: string;
  houses: string[];
  lat: number;
  lng: number;
  is_active: boolean;
  created_at: string;
}

export function useServiceZones(onlyActive = true) {
  const [zones, setZones] = useState<ServiceZone[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchZones = useCallback(async () => {
    let query = supabase.from('service_zones').select('*').order('street');
    if (onlyActive) query = query.eq('is_active', true);
    const { data } = await query;
    if (data) {
      setZones(data.map(z => ({
        id: z.id,
        street: z.street,
        houses: z.houses as string[],
        lat: z.lat,
        lng: z.lng,
        is_active: z.is_active,
        created_at: z.created_at,
      })));
    }
    setLoading(false);
  }, [onlyActive]);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('service-zones-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_zones' }, () => {
        fetchZones();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchZones]);

  const addZone = async (street: string, houses: string[], lat: number, lng: number) => {
    const { error } = await supabase.from('service_zones').insert({ street, houses, lat, lng });
    return !error;
  };

  const updateZone = async (id: string, data: Partial<Pick<ServiceZone, 'street' | 'houses' | 'lat' | 'lng' | 'is_active'>>) => {
    const { error } = await supabase.from('service_zones').update(data).eq('id', id);
    return !error;
  };

  const deleteZone = async (id: string) => {
    const { error } = await supabase.from('service_zones').delete().eq('id', id);
    return !error;
  };

  return { zones, loading, addZone, updateZone, deleteZone, refetch: fetchZones };
}
