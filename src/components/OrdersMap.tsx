import React, { useEffect, useRef } from 'react';
import { Order } from '@/types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface OrdersMapProps {
  orders: Order[];
  onOrderClick?: (orderId: string) => void;
  height?: string;
}

const OrdersMap: React.FC<OrdersMapProps> = ({ orders, onOrderClick, height = 'h-56' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView([53.2150, 50.1600], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(map);
      mapInstanceRef.current = map;
      markersRef.current = L.layerGroup().addTo(map);
    }

    const markers = markersRef.current!;
    markers.clearLayers();

    orders.forEach(order => {
      const icon = L.divIcon({
        html: `<div style="background:hsl(160,60%,38%);width:20px;height:20px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        className: '',
      });

      const marker = L.marker([order.lat, order.lng], { icon }).addTo(markers);
      marker.bindPopup(`<b>${order.street}, д. ${order.house}</b><br/>кв. ${order.apartment}, п. ${order.entrance}`);
      if (onOrderClick) {
        marker.on('click', () => onOrderClick(order.id));
      }
    });

    if (orders.length > 0) {
      const bounds = L.latLngBounds(orders.map(o => [o.lat, o.lng]));
      mapInstanceRef.current!.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
    }

    return () => {};
  }, [orders, onOrderClick]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div ref={mapRef} className={`${height} w-full`} />
    </div>
  );
};

export default OrdersMap;
