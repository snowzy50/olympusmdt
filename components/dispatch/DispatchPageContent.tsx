/**
 * Page Dispatch avec carte interactive GTA V
 * Créé par: Snowzy
 * Features: Carte 4K, Realtime, création d'appels, panel latéral
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import { useDispatchCalls } from '@/hooks/useDispatchCalls';
import { DispatchPanel } from './DispatchPanel';
import { DispatchCallModal } from './DispatchCallModal';
import type { DispatchCall } from '@/services/dispatchRealtimeService';
import { Wifi, WifiOff } from 'lucide-react';

// Import dynamique de la carte pour éviter les erreurs SSR avec Leaflet
const InteractiveGTAMap = dynamic(
  () => import('./InteractiveGTAMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-xl border border-gray-700">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Chargement de la carte...</p>
        </div>
      </div>
    )
  }
);

interface DispatchPageContentProps {
  agencyId: string;
  agencyName: string;
}

export function DispatchPageContent({ agencyId, agencyName }: DispatchPageContentProps) {
  const {
    calls,
    isLoading,
    error,
    isConnected,
    createCall,
    updateCall,
    deleteCall,
    getActiveCalls,
  } = useDispatchCalls({ agencyId });

  const [selectedCall, setSelectedCall] = useState<DispatchCall | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('view');
  const [clickedLocation, setClickedLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Filtrer les appels actifs pour la carte
  const activeCalls = useMemo(() => getActiveCalls(), [getActiveCalls]);

  /**
   * Gérer le clic sur la carte pour créer un nouvel appel
   */
  const handleMapClick = useCallback((lat: number, lng: number) => {
    console.log('[Dispatch] Clic carte:', { lat, lng });
    setClickedLocation({ lat, lng });
    setSelectedCall(null);
    setModalMode('create');
    setIsModalOpen(true);
  }, []);

  /**
   * Gérer le clic sur un marker d'appel
   */
  const handleMarkerClick = useCallback((call: DispatchCall) => {
    console.log('[Dispatch] Clic marker:', call);
    setSelectedCall(call);
    setClickedLocation(null);
    setModalMode('view');
    setIsModalOpen(true);
  }, []);

  /**
   * Gérer le clic sur un appel dans le panel
   */
  const handleCallClick = useCallback((call: DispatchCall) => {
    console.log('[Dispatch] Clic appel panel:', call);
    setSelectedCall(call);
    setClickedLocation(null);
    setModalMode('view');
    setIsModalOpen(true);
  }, []);

  /**
   * Ouvrir le modal de création
   */
  const handleCreateCall = useCallback(() => {
    setSelectedCall(null);
    setClickedLocation(null);
    setModalMode('create');
    setIsModalOpen(true);
  }, []);

  /**
   * Fermer le modal
   */
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedCall(null);
    setClickedLocation(null);
  }, []);

  /**
   * Sauvegarder un appel (création ou modification)
   */
  const handleSaveCall = useCallback(async (data: Partial<DispatchCall>) => {
    try {
      if (selectedCall) {
        // Modification
        await updateCall(selectedCall.id, data);
      } else {
        // Création
        await createCall(data as any);
      }
      handleCloseModal();
    } catch (error) {
      console.error('[Dispatch] Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de l\'appel');
    }
  }, [selectedCall, createCall, updateCall, handleCloseModal]);

  /**
   * Supprimer un appel
   */
  const handleDeleteCall = useCallback(async (call: DispatchCall) => {
    try {
      await deleteCall(call.id);
      handleCloseModal();
    } catch (error) {
      console.error('[Dispatch] Erreur suppression:', error);
      alert('Erreur lors de la suppression de l\'appel');
    }
  }, [deleteCall, handleCloseModal]);

  return (
    <div className="h-full flex flex-col bg-gray-950">
      {/* Header */}
      <div className="flex-shrink-0 p-3 border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dispatch Central - {agencyName}</h1>
            <p className="text-sm text-gray-400">Système de gestion des appels d'intervention</p>
          </div>

          {/* Badge de connexion Realtime */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg">
                <Wifi className="w-4 h-4 text-green-400 animate-pulse" />
                <span className="text-sm text-green-300 font-medium">Temps réel actif</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-lg">
                <WifiOff className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-300 font-medium">Hors ligne</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Layout principal: Panel (23%) + Carte (77%) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Panel gauche */}
        <div className="w-[23%] flex-shrink-0">
          <DispatchPanel
            calls={activeCalls}
            onCallClick={handleCallClick}
            onCreateCall={handleCreateCall}
            className="h-full"
          />
        </div>

        {/* Carte GTA V */}
        <div className="flex-1 p-2">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-xl border border-gray-700">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Chargement de la carte...</p>
              </div>
            </div>
          ) : error ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-xl border border-gray-700">
              <div className="text-center">
                <p className="text-red-400 mb-2">Erreur de chargement</p>
                <p className="text-sm text-gray-500">{error.message}</p>
              </div>
            </div>
          ) : (
            <InteractiveGTAMap
              calls={activeCalls}
              onMapClick={handleMapClick}
              onMarkerClick={handleMarkerClick}
              className="w-full h-full"
            />
          )}
        </div>
      </div>

      {/* Modal pour créer/éditer/voir un appel */}
      <AnimatePresence>
        {isModalOpen && (
          <DispatchCallModal
            call={selectedCall}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSaveCall}
            onDelete={handleDeleteCall}
            initialLocation={clickedLocation || undefined}
            mode={modalMode}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
