/**
 * Page de gestion des organisations et territoires
 * Créé par: Snowzy
 * Features: Workflow simplifié - clic sur carte → modal création
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Target } from 'lucide-react';
import { TerritoryMapEditor } from '@/components/organizations/TerritoryMapEditorSimple';
import { TerritoryCreationModal } from '@/components/organizations/TerritoryCreationModal';
import { useOrganizations } from '@/hooks/useOrganizations';
import type { Coordinates } from '@/types/organizations';

export default function OrganizationsPage() {
  const {
    organizations,
    territories,
    pois,
    isLoading,
    isConnected,
    createOrganization,
    createTerritory,
    addMember,
  } = useOrganizations();

  const [showModal, setShowModal] = useState(false);
  const [clickedCoordinates, setClickedCoordinates] = useState<Coordinates | null>(null);
  const [drawingPoints, setDrawingPoints] = useState<Coordinates[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // Annuler le dernier point
  const handleUndoLastPoint = () => {
    if (drawingPoints.length > 1) {
      setDrawingPoints((prev) => prev.slice(0, -1));
    }
  };

  // Écouter Cmd+Z / Ctrl+Z pour annuler le dernier point
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Z (Mac) ou Ctrl+Z (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && isDrawing && drawingPoints.length > 1) {
        e.preventDefault();
        handleUndoLastPoint();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawing, drawingPoints.length]);

  // Au clic sur la carte
  const handleMapClick = (lat: number, lng: number) => {
    const coords = { lat, lng };

    // Si on est en mode dessin, ajouter le point à la liste
    if (isDrawing) {
      setDrawingPoints((prev) => [...prev, coords]);
    } else {
      // Sinon, c'est le premier clic qui ouvre le modal
      setClickedCoordinates(coords);
      setDrawingPoints([coords]);
      setShowModal(true);
      setIsDrawing(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setClickedCoordinates(null);
    setDrawingPoints([]);
    setIsDrawing(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      {/* Header minimal */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-gray-700 bg-gray-900/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">
              Carte des Territoires
            </h1>
            <p className="text-xs text-gray-400">
              Clic droit sur la carte pour créer un territoire
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Stats compacts */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-400 font-medium">Organisations</span>
                <span className="text-sm font-bold text-white">{organizations.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-purple-400 font-medium">Territoires</span>
                <span className="text-sm font-bold text-white">{territories.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-orange-400 font-medium">POI</span>
                <span className="text-sm font-bold text-white">{pois.length}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}
              />
              <span className="text-xs text-gray-300">
                {isConnected ? 'Connecté' : 'Déconnecté'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Carte plein écran */}
      <div className="flex-1 p-4">
        {isLoading ? (
          <div className="h-full flex items-center justify-center bg-gray-900/50 rounded-xl">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Chargement de la carte...</p>
            </div>
          </div>
        ) : (
          <TerritoryMapEditor
            territories={territories}
            pois={pois}
            organizations={organizations}
            onMapClick={handleMapClick}
            drawingPoints={isDrawing ? drawingPoints : undefined}
            className="h-full"
          />
        )}
      </div>

      {/* Modal de création */}
      <TerritoryCreationModal
        isOpen={showModal}
        onClose={handleCloseModal}
        organizations={organizations}
        clickedCoordinates={clickedCoordinates}
        onCreateTerritory={createTerritory}
        onCreateOrganization={createOrganization}
        onAddMember={addMember}
        currentPoints={drawingPoints}
        onUndoLastPoint={handleUndoLastPoint}
      />
    </div>
  );
}
