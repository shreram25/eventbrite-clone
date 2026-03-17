import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix default marker icons for webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface EventMapProps {
  latitude: number;
  longitude: number;
  title: string;
  location: string;
}

export default function EventMap({ latitude, longitude, title, location }: EventMapProps) {
  return (
    <div className="h-64 rounded-xl overflow-hidden border border-gray-200">
      <MapContainer center={[latitude, longitude]} zoom={14} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]}>
          <Popup>
            <strong>{title}</strong><br />{location}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
