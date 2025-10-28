import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { House } from '../types/House';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapViewProps {
  houses: House[];
  selectedHouse: House | null;
  onHouseSelect: (house: House) => void;
}

export function MapView({ houses, selectedHouse, onHouseSelect }: MapViewProps) {
  // Center on Austin, TX by default
  const center: [number, number] = selectedHouse
    ? [selectedHouse.coordinates.lat, selectedHouse.coordinates.lng]
    : [30.2672, -97.7431];

  return (
    <div className="map-container">
      <MapContainer
        center={center}
        zoom={selectedHouse ? 15 : 12}
        style={{ height: '100%', width: '100%' }}
        key={selectedHouse?.id || 'default'}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {houses.map(house => (
          <Marker
            key={house.id}
            position={[house.coordinates.lat, house.coordinates.lng]}
            eventHandlers={{
              click: () => onHouseSelect(house),
            }}
          >
            <Popup>
              <div className="map-popup">
                <h3>{house.address}</h3>
                <p className="price">${house.price.toLocaleString()}</p>
                <p>{house.bedrooms} bed | {house.bathrooms} bath | {house.squareFootage.toLocaleString()} sqft</p>
                <p className={`status ${house.status}`}>{house.status.replace('_', ' ')}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
