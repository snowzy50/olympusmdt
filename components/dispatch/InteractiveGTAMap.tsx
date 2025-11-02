/**
 * Carte interactive GTA V pour le système de dispatch
 * Créé par: Snowzy
 * Features: Clic direct sur carte, markers dynamiques, zoom/pan fluide
 * Inspiré de: gtaweb.eu/gtao-map
 */

'use client';

import React, { useRef, useCallback, useState } from 'react';
import { MapContainer, ImageOverlay, Marker, Popup, useMapEvents } from 'react-leaflet';
import L, { LatLngBounds, LatLng, DivIcon } from 'leaflet';
import type { DispatchCall } from '@/services/dispatchRealtimeService';
import 'leaflet/dist/leaflet.css';

interface InteractiveGTAMapProps {
  calls: DispatchCall[];
  onMapClick?: (lat: number, lng: number) => void;
  onMarkerClick?: (call: DispatchCall) => void;
  className?: string;
}

const callIcons = {
  robbery: '🏦',
  medical: '🚑',
  traffic: '🚗',
  assault: '👊',
  fire: '🔥',
  pursuit: '🚔',
  suspicious: '🔍',
  backup: '👮',
  other: '📍',
};

const priorityColors = {
  code1: '#ef4444',
  code2: '#f59e0b',
  code3: '#3b82f6',
};

// Composant pour gérer les clics sur la carte
function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        console.log('[Map] Clic détecté:', e.latlng);
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

// Types de cartes disponibles
const mapTypes = {
  atlas: 'https://www.bragitoff.com/wp-content/uploads/2015/11/GTAV_ATLUS_8192x8192.png',
  satellite: 'https://www.bragitoff.com/wp-content/uploads/2015/11/GTAV-HD-MAP-satellite.jpg',
  road: 'https://www.bragitoff.com/wp-content/uploads/2015/11/GTAV-HD-MAP-roadmap.jpg',
};

type MapType = keyof typeof mapTypes;

function InteractiveGTAMapComponent({
  calls,
  onMapClick,
  onMarkerClick,
  className = '',
}: InteractiveGTAMapProps) {
  const mapRef = useRef<any>(null);
  const [currentMapType, setCurrentMapType] = useState<MapType>('satellite');

  // Dimensions de la carte GTA V (en pixels)
  // La carte fait 8192x8192 pixels pour ces images HD
  const mapWidth = 8192;
  const mapHeight = 8192;

  // Bounds de la carte en coordonnées Leaflet
  const bounds = new LatLngBounds(
    [0, 0],
    [mapHeight, mapWidth]
  );

  // Centre de la carte (Los Santos centre)
  const centerPosition: [number, number] = [mapHeight / 2, mapWidth / 2];

  // Créer des icônes personnalisées pour les markers
  const createMarkerIcon = (call: DispatchCall) => {
    const color = priorityColors[call.priority];
    const icon = callIcons[call.call_type];
    const codeNumber = call.priority === 'code1' ? '1' : call.priority === 'code2' ? '2' : '3';

    return new DivIcon({
      className: 'custom-dispatch-marker',
      html: `
        <div style="
          position: relative;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 44px;
            height: 44px;
            background: ${color};
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            cursor: pointer;
            animation: pulse 2s infinite;
          ">
            ${icon}
          </div>
          <div style="
            position: absolute;
            top: -4px;
            right: -4px;
            width: 20px;
            height: 20px;
            background: ${color};
            border: 2px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: bold;
            color: white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          ">
            ${codeNumber}
          </div>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 48],
      popupAnchor: [0, -48],
    });
  };

  // Convertir les coordonnées de l'appel en position sur la carte
  const getMarkerPosition = (call: DispatchCall): [number, number] => {
    // Convertir les coordonnées lat/lng en position pixel sur la carte
    // Les coordonnées GTA V sont généralement entre -4000 et 4000 pour X et Y
    // On les mappe sur notre grille 0-8192
    const x = ((call.location.lng + 4096) / 8192) * mapWidth;
    const y = ((call.location.lat + 4096) / 8192) * mapHeight;

    // Inverser Y car Leaflet utilise top-down
    return [mapHeight - y, x];
  };

  // Convertir la position de clic en coordonnées GTA V
  const pixelToGTACoords = (lat: number, lng: number): { lat: number; lng: number } => {
    // Inverser la conversion
    const y = mapHeight - lat;
    const gtaLat = (y / mapHeight) * 8192 - 4096;
    const gtaLng = (lng / mapWidth) * 8192 - 4096;

    return { lat: gtaLat, lng: gtaLng };
  };

  const handleMapClick = useCallback((lat: number, lng: number) => {
    const gtaCoords = pixelToGTACoords(lat, lng);
    console.log('[Map] Coordonnées GTA V:', gtaCoords);
    onMapClick?.(gtaCoords.lat, gtaCoords.lng);
  }, [onMapClick]);

  return (
    <div className={`relative w-full h-full bg-gray-900 rounded-xl overflow-hidden ${className}`}>
      {/* Overlay pour les infos */}
      <div className="absolute inset-0 z-[1000] pointer-events-none">
        <div className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-2xl pointer-events-auto">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-white font-semibold text-sm">Carte Interactive GTA V</span>
          </div>
          <div className="text-[10px] text-gray-400 mb-2">Cliquez sur la carte pour créer un appel</div>

          {/* Sélecteur de type de carte */}
          <div className="flex gap-1.5 mb-2">
            <button
              onClick={() => setCurrentMapType('satellite')}
              className={`px-2 py-1 text-[10px] rounded transition-all ${
                currentMapType === 'satellite'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🛰️ Satellite
            </button>
            <button
              onClick={() => setCurrentMapType('road')}
              className={`px-2 py-1 text-[10px] rounded transition-all ${
                currentMapType === 'road'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🗺️ Routes
            </button>
            <button
              onClick={() => setCurrentMapType('atlas')}
              className={`px-2 py-1 text-[10px] rounded transition-all ${
                currentMapType === 'atlas'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              📖 Atlas
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-300">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>Code 1</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span>Code 2</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Code 3</span>
            </div>
          </div>
        </div>

        {/* Compteur d'appels */}
        <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-2xl pointer-events-auto">
          <div className="text-white font-semibold text-sm mb-1">Appels actifs</div>
          <div className="text-2xl font-bold text-blue-400">{calls.length}</div>
        </div>
      </div>

      {/* Carte Leaflet avec image GTA V */}
      <MapContainer
        center={centerPosition}
        zoom={1}
        minZoom={0}
        maxZoom={4}
        maxBounds={bounds}
        maxBoundsViscosity={1.0}
        crs={L.CRS.Simple}
        className="w-full h-full"
        style={{
          background: '#0a0e1a',
          cursor: 'crosshair',
        }}
        zoomControl={true}
        attributionControl={false}
      >
        {/* Image de la carte GTA V - changement dynamique selon le type */}
        <ImageOverlay
          key={currentMapType}
          url={mapTypes[currentMapType]}
          bounds={bounds}
          opacity={1}
        />

        {/* Handler pour les clics */}
        <MapClickHandler onMapClick={handleMapClick} />

        {/* Markers pour les appels */}
        {calls.map((call) => {
          const position = getMarkerPosition(call);

          return (
            <Marker
              key={call.id}
              position={position}
              icon={createMarkerIcon(call)}
              eventHandlers={{
                click: () => {
                  console.log('[Marker] Clic sur appel:', call);
                  onMarkerClick?.(call);
                },
              }}
            >
              <Popup>
                <div className="min-w-[200px] p-2">
                  <div className="font-bold text-gray-900 mb-1 text-sm">{call.title}</div>
                  <div className="text-xs text-gray-600 mb-2">
                    {call.call_type.toUpperCase()} - {call.priority.toUpperCase()}
                  </div>
                  {call.location.address && (
                    <div className="text-xs text-gray-500 mb-1">
                      📍 {call.location.address}
                    </div>
                  )}
                  <div className="text-xs text-gray-400">
                    {new Date(call.created_at).toLocaleTimeString('fr-FR')}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Styles pour animations */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
        }

        .leaflet-container {
          background: #0a0e1a !important;
        }

        .leaflet-popup-content-wrapper {
          background: white !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
        }

        .leaflet-popup-tip {
          background: white !important;
        }

        .leaflet-control-zoom {
          border: 2px solid rgba(55, 65, 81, 0.5) !important;
          border-radius: 8px !important;
          overflow: hidden !important;
        }

        .leaflet-control-zoom a {
          background: rgba(17, 24, 39, 0.9) !important;
          backdrop-filter: blur(8px) !important;
          color: white !important;
          border: none !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 20px !important;
        }

        .leaflet-control-zoom a:hover {
          background: rgba(31, 41, 55, 1) !important;
        }

        .custom-dispatch-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}

// Export nommé
export { InteractiveGTAMapComponent as InteractiveGTAMap };

// Export par défaut pour l'import dynamique
export default InteractiveGTAMapComponent;
