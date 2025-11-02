/**
 * Page de gestion des organisations et territoires
 * Créé par: Snowzy
 * Features: Workflow simplifié - clic sur carte → modal création
 */

'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import dynamicImport from 'next/dynamic';
import { Menu } from 'lucide-react';
import { TerritoryCreationModal } from '@/components/organizations/TerritoryCreationModal';
import { TerritoryDetailsModal } from '@/components/organizations/TerritoryDetailsModal';
import { TerritoryEditModal } from '@/components/organizations/TerritoryEditModal';
import { OrganizationsSidebar } from '@/components/organizations/OrganizationsSidebar';
import { useOrganizations } from '@/hooks/useOrganizations';
import type { Coordinates, Territory } from '@/types/organizations';

// Import dynamique pour éviter les erreurs SSR avec Leaflet
const TerritoryMapEditor = dynamicImport(
  () => import('@/components/organizations/TerritoryMapEditorSimple').then(mod => ({ default: mod.TerritoryMapEditor })),
  { ssr: false }
);

export default function OrganizationsPage() {
  const {
    organizations,
    territories,
    pois,
    isLoading,
    isConnected,
    createOrganization,
    createTerritory,
    updateTerritory,
    deleteTerritory,
    addMember,
  } = useOrganizations();

  const [showModal, setShowModal] = useState(false);
  const [clickedCoordinates, setClickedCoordinates] = useState<Coordinates | null>(null);
  const [drawingPoints, setDrawingPoints] = useState<Coordinates[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedTerritory, setSelectedTerritory] = useState<any>(null);
  const [showTerritoryDetails, setShowTerritoryDetails] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [highlightedOrgId, setHighlightedOrgId] = useState<string | null>(null);
  const [focusedTerritory, setFocusedTerritory] = useState<Territory | null>(null);
  const [editingTerritory, setEditingTerritory] = useState<Territory | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Annuler le dernier point
  const handleUndoLastPoint = () => {
    if (drawingPoints.length > 1) {
      setDrawingPoints((prev) => prev.slice(0, -1));
    }
  };

  // Écouter Cmd+Z / Ctrl+Z pour annuler le dernier point
  useEffect(() => {
    // Vérifier que window existe (côté client uniquement)
    if (typeof window === 'undefined') return;

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

  // Clic sur un territoire pour voir les infos
  const handleTerritoryClick = (territory: any) => {
    console.log('[Organizations] Territoire cliqué:', territory);
    setSelectedTerritory(territory);
    setShowTerritoryDetails(true);
  };

  // Éditer un territoire
  const handleEditTerritory = (territory: Territory) => {
    setEditingTerritory(territory);
    setShowEditModal(true);
  };

  // Sauvegarder les modifications d'un territoire
  const handleSaveTerritory = async (territoryId: string, updates: Partial<Territory>) => {
    try {
      await updateTerritory(territoryId, updates);
      setShowEditModal(false);
      setEditingTerritory(null);
    } catch (error) {
      console.error('[Organizations] Erreur mise à jour territoire:', error);
      throw error;
    }
  };

  // Supprimer un territoire
  const handleDeleteTerritory = async (territoryId: string) => {
    try {
      await deleteTerritory(territoryId);
      setShowTerritoryDetails(false);
      setSelectedTerritory(null);
    } catch (error) {
      console.error('[Organizations] Erreur suppression territoire:', error);
      alert('Erreur lors de la suppression du territoire');
    }
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
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="Toggle sidebar"
            >
              <Menu className="w-5 h-5 text-gray-400" />
            </button>
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
            onTerritoryClick={handleTerritoryClick}
            drawingPoints={isDrawing ? drawingPoints : undefined}
            className="h-full"
            highlightedOrgId={highlightedOrgId}
            focusedTerritory={focusedTerritory}
          />
        )}
      </div>

      {/* Modal de création */}
      <TerritoryCreationModal
        isOpen={showModal}
        onClose={handleCloseModal}
        organizations={organizations}
        clickedCoordinates={clickedCoordinates}
        onCreateTerritory={async (data) => {
          await createTerritory(data);
        }}
        onCreateOrganization={createOrganization}
        onAddMember={async (data) => {
          await addMember(data);
        }}
        currentPoints={drawingPoints}
        onUndoLastPoint={handleUndoLastPoint}
      />

      {/* Modal de détails territoire */}
      <TerritoryDetailsModal
        isOpen={showTerritoryDetails}
        onClose={() => setShowTerritoryDetails(false)}
        territory={selectedTerritory}
        organization={
          selectedTerritory
            ? organizations.find((org) => org.id === selectedTerritory.organization_id) || null
            : null
        }
        onEdit={handleEditTerritory}
        onDelete={handleDeleteTerritory}
      />

      {/* Modal d'édition territoire */}
      <TerritoryEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingTerritory(null);
        }}
        territory={editingTerritory}
        organization={
          editingTerritory
            ? organizations.find((org) => org.id === editingTerritory.organization_id) || null
            : null
        }
        onSave={handleSaveTerritory}
      />

      {/* Sidebar des organisations */}
      <OrganizationsSidebar
        organizations={organizations}
        territories={territories}
        selectedOrgId={highlightedOrgId}
        onSelectOrganization={setHighlightedOrgId}
        onTerritoryFocus={setFocusedTerritory}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
    </div>
  );
}
