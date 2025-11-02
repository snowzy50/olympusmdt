/**
 * Carte interactive GTA V pour le système de dispatch
 * Créé par: Snowzy
 * Features: Tuiles 4K, markers temps réel, création d'appels par clic
 */

'use client';

import React, { useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, ZoomControl } from 'react-leaflet';
import L, { Icon, LatLng, CRS } from 'leaflet';
import type { DispatchCall } from '@/services/dispatchRealtimeService';
import 'leaflet/dist/leaflet.css';

interface InteractiveGTAMapProps {
  calls: DispatchCall[];
  onMapClick?: (lat: number, lng: number) => void;
  onMarkerClick?: (call: DispatchCall) => void;
  className?: string;
}

// Configuration des icônes pour les différents types d'appels
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
  code1: '#ef4444', // Rouge - Urgence
  code2: '#f59e0b', // Orange - Normal
  code3: '#3b82f6', // Bleu - Non-urgent
};

// Composant pour gérer les clics sur la carte
function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export function InteractiveGTAMap({
  calls,
  onMapClick,
  onMarkerClick,
  className = '',
}: InteractiveGTAMapProps) {
  const mapRef = useRef<any>(null);

  // Centre de la carte GTA V (Los Santos)
  // Coordonnées pour CRS.Simple: centre de la carte en pixels
  const centerPosition: [number, number] = [128, 128];
  const defaultZoom = 2;

  return (
    <div className={`relative w-full h-full bg-gray-900 rounded-xl overflow-hidden ${className}`}>
      {/* Overlay pour le style dark */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-white font-semibold text-sm">Carte GTA V - San Andreas</span>
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
        <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-2xl">
          <div className="text-white font-semibold text-sm mb-1">Appels actifs</div>
          <div className="text-2xl font-bold text-blue-400">{calls.length}</div>
        </div>
      </div>

      {/* Carte Leaflet */}
      <MapContainer
        center={centerPosition}
        zoom={defaultZoom}
        minZoom={1}
        maxZoom={5}
        maxBounds={[[0, 0], [256, 256]]}
        zoomControl={false}
        className="w-full h-full"
        ref={mapRef}
        crs={L.CRS.Simple}
        style={{
          background: '#0a0e1a',
        }}
      >
        {/* Tuiles de la carte GTA V */}
        <TileLayer
          url="https://s.rsg.sc/sc/images/games/GTAV/map/game/{z}/{x}/{y}.png"
          attribution='&copy; Rockstar Games - GTA V'
          tileSize={256}
          maxNativeZoom={5}
          minNativeZoom={0}
          noWrap={true}
          bounds={[[0, 0], [256, 256]]}
        />

        {/* Contrôle de zoom */}
        <ZoomControl position="bottomright" />

        {/* Handler pour les clics sur la carte */}
        <MapClickHandler onMapClick={onMapClick} />

        {/* Markers pour les appels dispatch */}
        {calls.map((call) => {
          const position: [number, number] = [call.location.lat, call.location.lng];

          // Créer un HTML personnalisé pour le marker
          const markerHtml = `
            <div style="
              background: ${priorityColors[call.priority]};
              border: 3px solid white;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 20px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              cursor: pointer;
              animation: pulse 2s infinite;
            ">
              ${callIcons[call.call_type]}
            </div>
          `;

          const customIcon = new Icon({
            iconUrl: `data:image/svg+xml;base64,${btoa(`
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
                <circle cx="20" cy="20" r="18" fill="${priorityColors[call.priority]}" stroke="white" stroke-width="3"/>
                <text x="20" y="27" text-anchor="middle" font-size="20">${callIcons[call.call_type]}</text>
              </svg>
            `)}`,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40],
          });

          return (
            <Marker
              key={call.id}
              position={position}
              icon={customIcon}
              eventHandlers={{
                click: () => onMarkerClick?.(call),
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <div className="font-bold text-gray-900 mb-1">{call.title}</div>
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

      {/* Style pour l'animation pulse */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        /* Style pour la carte en mode dark */
        .leaflet-container {
          background: #1a1a2e !important;
        }

        .leaflet-popup-content-wrapper {
          background: white !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
        }

        .leaflet-popup-tip {
          background: white !important;
        }

        /* Personnalisation des contrôles */
        .leaflet-control-zoom {
          border: 2px solid rgba(55, 65, 81, 0.5) !important;
          border-radius: 8px !important;
          overflow: hidden !important;
        }

        .leaflet-control-zoom a {
          background: rgba(17, 24, 39, 0.8) !important;
          backdrop-filter: blur(8px) !important;
          color: white !important;
          border: none !important;
        }

        .leaflet-control-zoom a:hover {
          background: rgba(31, 41, 55, 0.9) !important;
        }
      `}</style>
    </div>
  );
}
