/**
 * Carte simplifiée pour affichage territoires
 * Créé par: Snowzy
 * Features: Affichage territoires et POI, clic pour créer
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { MapContainer, ImageOverlay, Polygon, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L, { LatLngBounds, DivIcon } from 'leaflet';
import type { Territory, TerritoryPOI, Organization, Coordinates } from '@/types/organizations';
import { poiTypeIcons } from '@/types/organizations';

// Fix Leaflet default icon issue
import 'leaflet/dist/leaflet.css';
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

interface TerritoryMapEditorProps {
  territories: Territory[];
  pois: TerritoryPOI[];
  organizations: Organization[];
  onMapClick?: (lat: number, lng: number) => void;
  onTerritoryClick?: (territory: Territory) => void;
  onPOIClick?: (poi: TerritoryPOI) => void;
  drawingPoints?: Coordinates[];
  className?: string;
  highlightedOrgId?: string | null;
}

// Types de cartes disponibles
const mapTypes = {
  atlas: 'https://www.bragitoff.com/wp-content/uploads/2015/11/GTAV_ATLUS_8192x8192.png',
  satellite: 'https://www.bragitoff.com/wp-content/uploads/2015/11/GTAV-HD-MAP-satellite.jpg',
  road: 'https://www.bragitoff.com/wp-content/uploads/2015/11/GTAV-HD-MAP-roadmap.jpg',
};

type MapType = keyof typeof mapTypes;

// Précharger les images au démarrage
if (typeof window !== 'undefined') {
  Object.values(mapTypes).forEach((url) => {
    const img = new Image();
    img.src = url;
  });
}

// Composant pour gérer les clics droits sur la carte
function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    contextmenu(e) {
      e.originalEvent.preventDefault(); // Empêcher le menu contextuel du navigateur
      if (onMapClick) {
        console.log('[Map] Clic droit détecté:', e.latlng);
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

// Composant pour sauvegarder et restaurer la position de la carte
function MapViewPreserver() {
  const map = useMap();

  useEffect(() => {
    // Restaurer la position depuis localStorage au montage
    const savedView = localStorage.getItem('gta-map-view');
    if (savedView) {
      try {
        const { lat, lng, zoom } = JSON.parse(savedView);
        console.log('[Map] Restauration position depuis localStorage:', { lat, lng, zoom });
        map.setView([lat, lng], zoom, { animate: false });
      } catch (error) {
        console.error('[Map] Erreur restauration position:', error);
      }
    }

    // Sauvegarder la position à chaque mouvement
    const handleMoveEnd = () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      const viewData = {
        lat: center.lat,
        lng: center.lng,
        zoom: zoom,
      };
      localStorage.setItem('gta-map-view', JSON.stringify(viewData));
      console.log('[Map] Position sauvegardée dans localStorage:', viewData);
    };

    map.on('moveend', handleMoveEnd);
    map.on('zoomend', handleMoveEnd);

    return () => {
      map.off('moveend', handleMoveEnd);
      map.off('zoomend', handleMoveEnd);
    };
  }, [map]);

  return null;
}

export function TerritoryMapEditor({
  territories,
  pois,
  organizations,
  onMapClick,
  onTerritoryClick,
  onPOIClick,
  drawingPoints,
  className = '',
  highlightedOrgId = null,
}: TerritoryMapEditorProps) {
  const [currentMapType, setCurrentMapType] = useState<MapType>('satellite');

  // Dimensions de la carte GTA V
  const mapWidth = 8192;
  const mapHeight = 8192;

  // Bounds de la carte (mémoïsées)
  const bounds = useMemo(() => new LatLngBounds([0, 0], [mapHeight, mapWidth]), [mapHeight, mapWidth]);

  // Centre de la carte (mémoïsé)
  const centerPosition: [number, number] = useMemo(() => [mapHeight / 2, mapWidth / 2], [mapHeight, mapWidth]);

  // Convertir les coordonnées GTA V en position pixel
  const gtaToPixel = useCallback(
    (coord: Coordinates): [number, number] => {
      const x = ((coord.lng + 4096) / 8192) * mapWidth;
      const y = ((coord.lat + 4096) / 8192) * mapHeight;
      return [mapHeight - y, x];
    },
    [mapWidth, mapHeight]
  );

  // Convertir position pixel en coordonnées GTA V
  const pixelToGTA = useCallback(
    (lat: number, lng: number): Coordinates => {
      const y = mapHeight - lat;
      const gtaLat = (y / mapHeight) * 8192 - 4096;
      const gtaLng = (lng / mapWidth) * 8192 - 4096;
      return { lat: gtaLat, lng: gtaLng };
    },
    [mapWidth, mapHeight]
  );

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      const gtaCoords = pixelToGTA(lat, lng);
      console.log('[Map] Coordonnées GTA V:', gtaCoords);
      onMapClick?.(gtaCoords.lat, gtaCoords.lng);
    },
    [onMapClick, pixelToGTA]
  );

  // Créer l'icône pour les POI
  const createPOIIcon = (poi: TerritoryPOI) => {
    const org = organizations.find((o) => o.id === poi.organization_id);
    const color = org?.color || '#888888';

    return new DivIcon({
      className: 'custom-poi-marker',
      html: `
        <div style="
          position: relative;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 32px;
            height: 32px;
            background: ${color};
            border: 2px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            cursor: pointer;
          ">
            ${poi.icon || poiTypeIcons[poi.type]}
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  };

  return (
    <div
      className={`relative w-full h-full rounded-xl overflow-hidden ${className}`}
      style={{ backgroundColor: '#153d6b' }}
    >
      {/* Overlay pour infos */}
      <div className="absolute inset-0 z-[1000] pointer-events-none">
        <div className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-2xl pointer-events-auto">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-white font-semibold text-sm">Carte Interactive GTA V</span>
          </div>
          <div className="text-[10px] text-gray-400 mb-2">Clic droit sur la carte pour créer un territoire</div>

          {/* Sélecteur de type de carte */}
          <div className="flex gap-1.5">
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
        </div>

        {/* Stats */}
        <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-2xl pointer-events-auto">
          <div className="text-white font-semibold text-sm mb-2">Carte Territoires</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-400">Organisations:</span>
              <span className="text-white font-bold">{organizations.length}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-400">Territoires:</span>
              <span className="text-white font-bold">{territories.length}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-400">POI:</span>
              <span className="text-white font-bold">{pois.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Carte Leaflet */}
      <MapContainer
        center={centerPosition}
        zoom={-2.5}
        minZoom={-4}
        maxZoom={4}
        maxBounds={bounds}
        maxBoundsViscosity={1.0}
        crs={L.CRS.Simple}
        className="w-full h-full"
        style={{
          background: '#153d6b',
          cursor: 'crosshair',
        }}
        zoomControl={true}
        attributionControl={false}
        preferCanvas={true}
        zoomAnimation={true}
        fadeAnimation={true}
        markerZoomAnimation={true}
      >
        {/* Image de fond */}
        <ImageOverlay
          key={currentMapType}
          url={mapTypes[currentMapType]}
          bounds={bounds}
          opacity={1}
          className="leaflet-image-layer-smooth"
        />

        {/* Préserver la position de la carte */}
        <MapViewPreserver />

        {/* Handler de clic */}
        <MapClickHandler onMapClick={handleMapClick} />

        {/* Territoires existants */}
        {territories.map((territory) => {
          const positions = territory.coordinates.map((coord) => gtaToPixel(coord));
          const org = organizations.find((o) => o.id === territory.organization_id);
          const color = territory.color || org?.color || '#888888';

          // Déterminer si ce territoire est highlight ou hidden
          const isHighlighted = highlightedOrgId ? territory.organization_id === highlightedOrgId : false;
          const isHidden = highlightedOrgId && territory.organization_id !== highlightedOrgId;

          // Si le territoire est hidden, ne pas le rendre
          if (isHidden) return null;

          // Ajuster l'opacité et le poids en fonction du highlight
          const fillOpacity = isHighlighted ? Math.min(territory.opacity * 1.5, 1) : territory.opacity;
          const weight = isHighlighted ? 4 : 2;

          return (
            <Polygon
              key={territory.id}
              positions={positions}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: fillOpacity,
                weight: weight,
                className: isHighlighted ? 'territory-highlighted' : '',
              }}
              eventHandlers={{
                click: () => onTerritoryClick?.(territory),
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-bold">{territory.name}</div>
                  <div className="text-xs text-gray-600">{org?.name}</div>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* POIs */}
        {pois.map((poi) => (
          <Marker key={poi.id} position={gtaToPixel(poi.coordinates)} icon={createPOIIcon(poi)}>
            <Popup>
              <div className="text-sm">
                <div className="font-bold">{poi.name}</div>
                <div className="text-xs text-gray-600">{poi.type}</div>
                {poi.description && <div className="text-xs mt-1">{poi.description}</div>}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Preview du territoire en cours de dessin */}
        {drawingPoints && drawingPoints.length >= 3 && (
          <Polygon
            positions={drawingPoints.map((coord) => gtaToPixel(coord))}
            pathOptions={{
              color: '#0EA5E9',
              fillColor: '#0EA5E9',
              fillOpacity: 0.3,
              weight: 3,
              dashArray: '10, 5',
            }}
          />
        )}

        {/* Markers pour les points de dessin */}
        {drawingPoints && drawingPoints.map((point, index) => (
          <Marker
            key={`drawing-point-${index}`}
            position={gtaToPixel(point)}
            icon={L.divIcon({
              className: 'custom-drawing-marker',
              html: `<div style="
                width: 12px;
                height: 12px;
                background: #0EA5E9;
                border: 2px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 8px rgba(0,0,0,0.4);
              "></div>`,
              iconSize: [12, 12],
              iconAnchor: [6, 6],
            })}
          />
        ))}
      </MapContainer>

      {/* Styles */}
      <style jsx global>{`
        .custom-poi-marker {
          background: transparent !important;
          border: none !important;
        }
        .custom-drawing-marker {
          background: transparent !important;
          border: none !important;
        }

        /* Optimisations de performance */
        .leaflet-image-layer-smooth {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          will-change: transform;
        }

        .leaflet-zoom-animated {
          will-change: transform;
        }

        .leaflet-tile,
        .leaflet-image-layer {
          -webkit-transform: translate3d(0, 0, 0);
          transform: translate3d(0, 0, 0);
        }

        /* Smooth transitions */
        .leaflet-zoom-anim .leaflet-zoom-animated {
          transition: transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        /* Optimiser le rendu des polygones */
        .leaflet-interactive {
          will-change: transform;
        }

        /* Animation pour territoires highlighted */
        .territory-highlighted {
          animation: territory-pulse 1.5s ease-in-out infinite;
          filter: drop-shadow(0 0 10px currentColor);
        }

        @keyframes territory-pulse {
          0%, 100% {
            opacity: 1;
            stroke-width: 4;
          }
          50% {
            opacity: 0.8;
            stroke-width: 6;
          }
        }
      `}</style>
    </div>
  );
}
