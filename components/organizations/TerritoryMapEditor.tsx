/**
 * Éditeur de territoires sur carte GTA V
 * Créé par: Snowzy
 * Features: Dessin polygones libres, affichage territoires, POI
 */

'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MapContainer, ImageOverlay, Polygon, Marker, Popup, useMapEvents, Polyline } from 'react-leaflet';
import L, { LatLngBounds, DivIcon, Icon } from 'leaflet';
import { motion } from 'framer-motion';

// Fix Leaflet default icon issue
import 'leaflet/dist/leaflet.css';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
import {
  Play,
  Square,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  MapPin,
  Layers,
} from 'lucide-react';
import type { Territory, TerritoryPOI, Organization, Coordinates } from '@/types/organizations';
import { poiTypeIcons } from '@/types/organizations';

interface TerritoryMapEditorProps {
  territories: Territory[];
  pois: TerritoryPOI[];
  organizations: Organization[];
  onTerritoryCreate?: (territory: Omit<Territory, 'id' | 'created_at' | 'updated_at'>) => void;
  onPOICreate?: (poi: Omit<TerritoryPOI, 'id' | 'created_at' | 'updated_at'>) => void;
  onTerritoryClick?: (territory: Territory) => void;
  onPOIClick?: (poi: TerritoryPOI) => void;
  className?: string;
}

// Types de cartes disponibles
const mapTypes = {
  atlas: 'https://www.bragitoff.com/wp-content/uploads/2015/11/GTAV_ATLUS_8192x8192.png',
  satellite: 'https://www.bragitoff.com/wp-content/uploads/2015/11/GTAV-HD-MAP-satellite.jpg',
  road: 'https://www.bragitoff.com/wp-content/uploads/2015/11/GTAV-HD-MAP-roadmap.jpg',
};

type MapType = keyof typeof mapTypes;

// Composant pour gérer les clics sur la carte
function MapDrawHandler({
  isDrawing,
  onMapClick,
}: {
  isDrawing: boolean;
  onMapClick?: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (isDrawing && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export function TerritoryMapEditor({
  territories,
  pois,
  organizations,
  onTerritoryCreate,
  onPOICreate,
  onTerritoryClick,
  onPOIClick,
  className = '',
}: TerritoryMapEditorProps) {
  const [currentMapType, setCurrentMapType] = useState<MapType>('satellite');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Coordinates[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [showTerritories, setShowTerritories] = useState(true);
  const [showPOIs, setShowPOIs] = useState(true);
  const [territoryName, setTerritoryName] = useState('');

  // Dimensions de la carte GTA V
  const mapWidth = 8192;
  const mapHeight = 8192;

  // Bounds de la carte
  const bounds = new LatLngBounds([0, 0], [mapHeight, mapWidth]);

  // Centre de la carte
  const centerPosition: [number, number] = [mapHeight / 2, mapWidth / 2];

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

  // Démarrer le dessin
  const startDrawing = useCallback(() => {
    if (!selectedOrganization) {
      alert('Sélectionnez une organisation d\'abord');
      return;
    }
    setIsDrawing(true);
    setCurrentPoints([]);
  }, [selectedOrganization]);

  // Annuler le dessin
  const cancelDrawing = useCallback(() => {
    setIsDrawing(false);
    setCurrentPoints([]);
  }, []);

  // Terminer le dessin
  const finishDrawing = useCallback(() => {
    if (currentPoints.length < 3) {
      alert('Un territoire doit avoir au moins 3 points');
      return;
    }

    if (!territoryName.trim()) {
      alert('Donnez un nom au territoire');
      return;
    }

    if (!selectedOrganization) {
      alert('Sélectionnez une organisation');
      return;
    }

    // Créer le territoire
    const newTerritory: Omit<Territory, 'id' | 'created_at' | 'updated_at'> = {
      organization_id: selectedOrganization.id,
      name: territoryName,
      coordinates: currentPoints,
      color: selectedOrganization.color,
      opacity: 0.5,
    };

    onTerritoryCreate?.(newTerritory);

    // Reset
    setIsDrawing(false);
    setCurrentPoints([]);
    setTerritoryName('');
  }, [currentPoints, territoryName, selectedOrganization, onTerritoryCreate]);

  // Ajouter un point
  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      if (isDrawing) {
        const gtaCoords = pixelToGTA(lat, lng);
        setCurrentPoints((prev) => [...prev, gtaCoords]);
      }
    },
    [isDrawing, pixelToGTA]
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
      {/* Contrôles supérieurs */}
      <div className="absolute top-4 left-4 z-[1000] space-y-2 pointer-events-auto">
        {/* Sélection organisation */}
        <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-2xl">
          <label className="text-white font-semibold text-xs mb-2 block">Organisation</label>
          <select
            value={selectedOrganization?.id || ''}
            onChange={(e) => {
              const org = organizations.find((o) => o.id === e.target.value);
              setSelectedOrganization(org || null);
            }}
            className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs"
            disabled={isDrawing}
          >
            <option value="">Sélectionner...</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.short_name || org.name}
              </option>
            ))}
          </select>
        </div>

        {/* Contrôles de dessin */}
        <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-2xl">
          <div className="text-white font-semibold text-xs mb-2">Dessiner territoire</div>

          {!isDrawing ? (
            <button
              onClick={startDrawing}
              disabled={!selectedOrganization}
              className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs font-semibold rounded transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-3 h-3" />
              Commencer
            </button>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Nom du territoire..."
                value={territoryName}
                onChange={(e) => setTerritoryName(e.target.value)}
                className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs"
              />
              <div className="text-[10px] text-gray-400">
                {currentPoints.length} point(s) - Cliquez sur la carte
              </div>
              <div className="flex gap-1">
                <button
                  onClick={finishDrawing}
                  disabled={currentPoints.length < 3}
                  className="flex-1 px-2 py-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white text-xs rounded transition-colors flex items-center justify-center gap-1"
                >
                  <Save className="w-3 h-3" />
                  Terminer
                </button>
                <button
                  onClick={cancelDrawing}
                  className="flex-1 px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors flex items-center justify-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Annuler
                </button>
              </div>
              {currentPoints.length > 0 && (
                <button
                  onClick={() => setCurrentPoints((prev) => prev.slice(0, -1))}
                  className="w-full px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded transition-colors flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Supprimer dernier point
                </button>
              )}
            </div>
          )}
        </div>

        {/* Type de carte */}
        <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-2 shadow-2xl">
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentMapType('satellite')}
              className={`px-2 py-1 text-[10px] rounded transition-all ${
                currentMapType === 'satellite'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🛰️ Sat
            </button>
            <button
              onClick={() => setCurrentMapType('road')}
              className={`px-2 py-1 text-[10px] rounded transition-all ${
                currentMapType === 'road'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🗺️ Road
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

        {/* Toggle layers */}
        <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-2 shadow-2xl space-y-1">
          <button
            onClick={() => setShowTerritories(!showTerritories)}
            className="w-full px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors flex items-center gap-2"
          >
            {showTerritories ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            Territoires
          </button>
          <button
            onClick={() => setShowPOIs(!showPOIs)}
            className="w-full px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors flex items-center gap-2"
          >
            {showPOIs ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            POI
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="absolute top-4 right-4 z-[1000] bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-2xl pointer-events-auto">
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

      {/* Carte */}
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
          cursor: isDrawing ? 'crosshair' : 'default',
        }}
        zoomControl={true}
        attributionControl={false}
      >
        {/* Image de fond */}
        <ImageOverlay key={currentMapType} url={mapTypes[currentMapType]} bounds={bounds} opacity={1} />

        {/* Handler de dessin */}
        <MapDrawHandler isDrawing={isDrawing} onMapClick={handleMapClick} />

        {/* Territoires existants */}
        {showTerritories &&
          territories.map((territory) => {
            const positions = territory.coordinates.map((coord) => gtaToPixel(coord));
            const org = organizations.find((o) => o.id === territory.organization_id);
            const color = territory.color || org?.color || '#888888';

            return (
              <Polygon
                key={territory.id}
                positions={positions}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: territory.opacity,
                  weight: 2,
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

        {/* Polygone en cours de dessin */}
        {isDrawing && currentPoints.length > 0 && (
          <>
            {/* Preview du polygone rempli si >= 3 points */}
            {currentPoints.length >= 3 && (
              <Polygon
                positions={currentPoints.map((p) => gtaToPixel(p))}
                pathOptions={{
                  color: selectedOrganization?.color || '#0000FF',
                  fillColor: selectedOrganization?.color || '#0000FF',
                  fillOpacity: 0.3,
                  weight: 3,
                  dashArray: '10, 5',
                }}
              />
            )}

            {/* Points */}
            {currentPoints.map((point, index) => (
              <Marker key={index} position={gtaToPixel(point)} />
            ))}

            {/* Lignes entre les points (si < 3 points) */}
            {currentPoints.length > 1 && currentPoints.length < 3 && (
              <Polyline
                positions={currentPoints.map((p) => gtaToPixel(p))}
                pathOptions={{
                  color: selectedOrganization?.color || '#0000FF',
                  weight: 3,
                  dashArray: '10, 5',
                }}
              />
            )}
          </>
        )}

        {/* POIs */}
        {showPOIs &&
          pois.map((poi) => (
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
      </MapContainer>

      {/* Instructions si dessin actif */}
      {isDrawing && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-blue-500/90 backdrop-blur-sm border border-blue-400 rounded-lg px-4 py-2 shadow-2xl pointer-events-none">
          <div className="text-white text-sm font-semibold">
            Cliquez sur la carte pour placer des points • {currentPoints.length >= 3 ? 'Terminez pour fermer le polygone' : `${3 - currentPoints.length} point(s) minimum`}
          </div>
        </div>
      )}

      {/* Styles */}
      <style jsx global>{`
        .custom-poi-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}
