import React, { useCallback } from 'react';
import { Order } from '@/types';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoibmV1cm9hcnRodXIiLCJhIjoiY21tb2pxem5kMGU4ZjJwcjByZ3d6aGpuciJ9.vP-hvC2mgk8k2ZUkBzx8LA';

interface OrdersMapProps {
  orders: Order[];
  onOrderClick?: (orderId: string) => void;
  height?: string;
}

const OrdersMap: React.FC<OrdersMapProps> = ({ orders, onOrderClick, height = 'h-56' }) => {
  const [popupInfo, setPopupInfo] = React.useState<Order | null>(null);

  const bounds = React.useMemo(() => {
    if (orders.length === 0) return null;
    const lngs = orders.map(o => o.lng);
    const lats = orders.map(o => o.lat);
    return [
      [Math.min(...lngs) - 0.005, Math.min(...lats) - 0.005],
      [Math.max(...lngs) + 0.005, Math.max(...lats) + 0.005],
    ] as [[number, number], [number, number]];
  }, [orders]);

  const initialViewState = React.useMemo(() => {
    if (bounds) {
      const centerLng = (bounds[0][0] + bounds[1][0]) / 2;
      const centerLat = (bounds[0][1] + bounds[1][1]) / 2;
      return { longitude: centerLng, latitude: centerLat, zoom: 13 };
    }
    return { longitude: 50.1600, latitude: 53.2150, zoom: 13 };
  }, [bounds]);

  const handleMarkerClick = useCallback((order: Order) => {
    setPopupInfo(order);
    if (onOrderClick) onOrderClick(order.id);
  }, [onOrderClick]);

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className={`${height} w-full`}>
        <Map
          initialViewState={initialViewState}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
        >
          <NavigationControl position="top-right" />
          {orders.map(order => (
            <Marker
              key={order.id}
              longitude={order.lng}
              latitude={order.lat}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                handleMarkerClick(order);
              }}
            >
              <div
                style={{
                  background: 'hsl(160,60%,38%)',
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: '2px solid white',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  cursor: 'pointer',
                }}
              />
            </Marker>
          ))}
          {popupInfo && (
            <Popup
              longitude={popupInfo.lng}
              latitude={popupInfo.lat}
              anchor="bottom"
              onClose={() => setPopupInfo(null)}
              closeOnClick={false}
            >
              <b>{popupInfo.street}, д. {popupInfo.house}</b>
              <br />кв. {popupInfo.apartment}, п. {popupInfo.entrance}
            </Popup>
          )}
        </Map>
      </div>
    </div>
  );
};

export default OrdersMap;
