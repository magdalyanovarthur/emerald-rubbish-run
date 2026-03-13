declare module 'react-map-gl' {
  import { ComponentType, ReactNode } from 'react';

  export interface ViewState {
    longitude: number;
    latitude: number;
    zoom: number;
    bearing?: number;
    pitch?: number;
  }

  export interface MapProps {
    initialViewState?: Partial<ViewState>;
    viewState?: Partial<ViewState>;
    style?: React.CSSProperties;
    mapStyle?: string;
    mapboxAccessToken?: string;
    onMove?: (evt: any) => void;
    onClick?: (evt: any) => void;
    children?: ReactNode;
    [key: string]: any;
  }

  export interface MarkerProps {
    longitude: number;
    latitude: number;
    anchor?: string;
    onClick?: (evt: any) => void;
    children?: ReactNode;
    [key: string]: any;
  }

  export interface PopupProps {
    longitude: number;
    latitude: number;
    anchor?: string;
    onClose?: () => void;
    closeOnClick?: boolean;
    children?: ReactNode;
    [key: string]: any;
  }

  export interface NavigationControlProps {
    position?: string;
    [key: string]: any;
  }

  const Map: ComponentType<MapProps>;
  export const Marker: ComponentType<MarkerProps>;
  export const Popup: ComponentType<PopupProps>;
  export const NavigationControl: ComponentType<NavigationControlProps>;
  export default Map;
}
