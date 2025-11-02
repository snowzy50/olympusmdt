/**
 * Carte interactive GTA V pour le système de dispatch
 * Créé par: Snowzy
 * Features: Carte GTA V réelle via iframe, markers personnalisés, création d'appels
 */

'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import type { DispatchCall } from '@/services/dispatchRealtimeService';

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

export function InteractiveGTAMap({
  calls,
  onMapClick,
  onMarkerClick,
  className = '',
}: InteractiveGTAMapProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Gérer le clic sur la carte
   * Puisque l'iframe ne permet pas d'accéder aux clics directement,
   * on overlay un bouton pour créer un appel
   */
  const handleCreateCallClick = useCallback(() => {
    // Générer des coordonnées aléatoires dans la zone de Los Santos
    const randomLat = -118 + Math.random() * 4; // Entre -118 et -114
    const randomLng = 20 + Math.random() * 8; // Entre 20 et 28
    onMapClick?.(randomLat, randomLng);
  }, [onMapClick]);

  return (
    <div ref={containerRef} className={`relative w-full h-full bg-gray-900 rounded-xl overflow-hidden ${className}`}>
      {/* Overlay pour le style et les infos */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-2xl pointer-events-auto">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-white font-semibold text-sm">Carte GTA V - San Andreas</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-300">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>Code 1 - Urgent</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span>Code 2 - Normal</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Code 3 - Faible</span>
            </div>
          </div>
        </div>

        {/* Compteur d'appels */}
        <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-2xl pointer-events-auto">
          <div className="text-white font-semibold text-sm mb-1">Appels actifs</div>
          <div className="text-2xl font-bold text-blue-400">{calls.length}</div>
        </div>

        {/* Bouton pour créer un appel */}
        <div className="absolute bottom-6 right-6 pointer-events-auto">
          <button
            onClick={handleCreateCallClick}
            className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-2xl transition-all hover:scale-105 font-semibold"
          >
            <span className="text-xl">📍</span>
            <span>Créer un appel</span>
          </button>
        </div>
      </div>

      {/* Markers pour les appels existants - Overlay sur l'iframe */}
      {calls.length > 0 && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {calls.map((call, index) => {
            // Position relative sur la carte (simulation)
            // Dans une vraie implémentation, il faudrait mapper les coordonnées GTA V à la position pixel
            const randomX = 20 + (index * 15) % 80;
            const randomY = 20 + (index * 20) % 70;

            return (
              <div
                key={call.id}
                onClick={() => onMarkerClick?.(call)}
                className="absolute pointer-events-auto cursor-pointer transition-transform hover:scale-110"
                style={{
                  left: `${randomX}%`,
                  top: `${randomY}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                title={call.title}
              >
                <div
                  className="relative w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-2xl border-2 border-white animate-pulse"
                  style={{
                    backgroundColor: priorityColors[call.priority],
                  }}
                >
                  {callIcons[call.call_type]}

                  {/* Badge priorité */}
                  <div
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white text-[8px] font-bold flex items-center justify-center text-white"
                    style={{
                      backgroundColor: priorityColors[call.priority],
                    }}
                  >
                    {call.priority === 'code1' ? '1' : call.priority === 'code2' ? '2' : '3'}
                  </div>
                </div>

                {/* Tooltip au survol */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap shadow-2xl border border-gray-700">
                    <div className="font-semibold">{call.title}</div>
                    <div className="text-gray-400">{call.call_type}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Iframe de la carte GTA V */}
      <iframe
        ref={iframeRef}
        src="https://gta-5-map.com?embed=dark"
        className="w-full h-full border-0"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
        title="GTA V Map"
        allow="fullscreen"
      />

      {/* Style pour les animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}
