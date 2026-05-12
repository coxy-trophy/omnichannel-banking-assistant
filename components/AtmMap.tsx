'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface AtmLocation {
  id: number;
  name: string;
  location: string;
  lat: number;
  lng: number;
  available: boolean;
  category: string;
}

interface AtmMapProps {
  atms: AtmLocation[];
  center: [number, number];
  onAtmSelect: (atm: AtmLocation) => void;
  selectedAtm: AtmLocation | null;
}

// Custom marker icons for Leaflet
const createMarkerIcon = (available: boolean) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 0 50%;
        transform: rotate(45deg);
        background-color: ${available ? '#22c55e' : '#ef4444'};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

// Component to change map view when selectedAtm changes
function MapUpdater({ selectedAtm }: { selectedAtm: AtmLocation | null }) {
  const map = useMap();
  useEffect(() => {
    if (selectedAtm) {
      map.flyTo([selectedAtm.lat, selectedAtm.lng], 14, { duration: 1.5 });
    }
  }, [selectedAtm, map]);
  return null;
}

export default function AtmMap({ atms, center, onAtmSelect, selectedAtm }: AtmMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={11}
      scrollWheelZoom={true}
      className="w-full h-full"
      style={{ minHeight: '500px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {atms.map((atm) => (
        <Marker
          key={atm.id}
          position={[atm.lat, atm.lng]}
          icon={createMarkerIcon(atm.available)}
          eventHandlers={{
            click: () => onAtmSelect(atm),
          }}
        >
          <Popup>
            <div className="p-2">
              <h4 className="font-bold text-primary text-sm mb-1">{atm.name}</h4>
              <p className="text-xs text-gray-600 mb-2">{atm.location}</p>
              <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                atm.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {atm.available ? 'Available' : 'Out of Service'}
              </span>
              {atm.available && (
                <Link href="/deposit" className="block mt-2">
                  <Button variant="outline" className="w-full text-xs py-1 h-auto">
                    Make Deposit
                  </Button>
                </Link>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
      <MapUpdater selectedAtm={selectedAtm} />
    </MapContainer>
  );
}
