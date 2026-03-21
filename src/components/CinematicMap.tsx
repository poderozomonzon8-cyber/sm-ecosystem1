import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { LatLngExpression } from 'leaflet';

// Fix for Vite icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

interface CinematicMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  className?: string;
  popupContent?: string;
}

export default function CinematicMap({ lat, lng, zoom = 13, className = '', popupContent = 'Aménagement Monzon HQ' }: CinematicMapProps) {
  const position: LatLngExpression = [lat, lng];
  const customIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <div className={`w-full h-[400px] rounded-2xl overflow-hidden shadow-2xl ${className}`}>
      <MapContainer 
        center={position} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        className="leaflet-container"
      >
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        />
        <Marker position={position} icon={customIcon}>
          <Popup>
            {popupContent}
            <br />
            <a href="https://maps.google.com/?q=45.5019,-73.5674" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              Directions
            </a>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

