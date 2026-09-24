"use client";

import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import L from 'leaflet';

// Fix for default marker icons in Next.js
const iconRetinaUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png';
const iconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png';
const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png';

export default function Map({ center = [-6.4500, 106.8500], zoom = 11 }) {
  useEffect(() => {
    (async function init() {
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: iconRetinaUrl,
        iconUrl: iconUrl,
        shadowUrl: shadowUrl,
      });
    })();
  }, []);

  // Dummy data for junctions in Bodebek
  const junctions = [
    { id: 1, pos: [-6.3712, 106.8253], name: 'Simpang UI Margonda (Depok)', status: 'red', dj: 1.12 },
    { id: 2, pos: [-6.3956, 106.8251], name: 'Simpang Juanda (Depok)', status: 'yellow', dj: 0.88 },
    { id: 4, pos: [-6.4800, 106.8400], name: 'Simpang Pemda Cibinong (Bogor)', status: 'red', dj: 1.05 },
    { id: 5, pos: [-6.5976, 106.7996], name: 'Simpang Tol BORR (Bogor)', status: 'green', dj: 0.70 },
    { id: 6, pos: [-6.2382, 106.9924], name: 'Simpang BCP (Bekasi)', status: 'red', dj: 1.15 },
    { id: 7, pos: [-6.2239, 107.0019], name: 'Simpang Pekayon (Bekasi)', status: 'yellow', dj: 0.90 },
  ];

  // Dummy routes (polylines) connecting major arterials
  const routes = [
    { positions: [[-6.3712, 106.8253], [-6.3956, 106.8251]], color: '#ef4444' }, 
    { positions: [[-6.3956, 106.8251], [-6.4800, 106.8400]], color: '#f59e0b' }, 
    { positions: [[-6.2382, 106.9924], [-6.2239, 107.0019]], color: '#ef4444' },
  ];

  const getColor = (status: string) => {
    if (status === 'red') return '#ef4444';
    if (status === 'yellow') return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden z-0 relative">
      <MapContainer 
        center={center as [number, number]} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {routes.map((route, idx) => (
          <Polyline key={idx} positions={route.positions as [number, number][]} color={route.color} weight={5} opacity={0.8} />
        ))}

        {junctions.map((j) => (
          <CircleMarker 
            key={j.id}
            center={j.pos as [number, number]} 
            radius={10}
            pathOptions={{ color: getColor(j.status), fillColor: getColor(j.status), fillOpacity: 0.7 }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-bold mb-1">{j.name}</p>
                <p>Derajat Kejenuhan: <strong>{j.dj}</strong></p>
                <p>Kondisi: {j.status === 'red' ? 'Macet (Kritis)' : j.status === 'yellow' ? 'Padat' : 'Lancar'}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
