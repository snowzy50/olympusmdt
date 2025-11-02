/**
 * Modal d'affichage des détails d'un territoire
 * Créé par: Snowzy
 * Features: Infos territoire, organisation, membres
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Users, Shield } from 'lucide-react';
import type { Territory, Organization } from '@/types/organizations';
import { organizationTypeLabels, organizationTypeIcons } from '@/types/organizations';

interface TerritoryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  territory: Territory | null;
  organization: Organization | null;
}

export function TerritoryDetailsModal({
  isOpen,
  onClose,
  territory,
  organization,
}: TerritoryDetailsModalProps) {
  if (!isOpen || !territory || !organization) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-2xl max-w-2xl w-full p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center text-2xl"
                style={{ backgroundColor: organization.color }}
              >
                {organizationTypeIcons[organization.type]}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{territory.name}</h2>
                <p className="text-sm text-gray-400">{organization.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Informations territoire */}
          <div className="space-y-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Territoire</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Nom:</span>
                  <p className="text-white font-medium">{territory.name}</p>
                </div>
                <div>
                  <span className="text-gray-400">Points:</span>
                  <p className="text-white font-medium">{territory.coordinates.length} points</p>
                </div>
                <div>
                  <span className="text-gray-400">Couleur:</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border border-gray-600"
                      style={{ backgroundColor: territory.color || organization.color }}
                    />
                    <span className="text-white font-mono text-xs">
                      {territory.color || organization.color}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Opacité:</span>
                  <p className="text-white font-medium">{Math.round(territory.opacity * 100)}%</p>
                </div>
              </div>
            </div>

            {/* Informations organisation */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Organisation</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Nom:</span>
                  <p className="text-white font-medium">{organization.name}</p>
                </div>
                <div>
                  <span className="text-gray-400">Type:</span>
                  <p className="text-white font-medium">
                    {organizationTypeLabels[organization.type]}
                  </p>
                </div>
                {organization.short_name && (
                  <div>
                    <span className="text-gray-400">Nom court:</span>
                    <p className="text-white font-medium">{organization.short_name}</p>
                  </div>
                )}
                <div>
                  <span className="text-gray-400">Statut:</span>
                  <p className="text-white font-medium">
                    {organization.is_active ? '✅ Actif' : '❌ Inactif'}
                  </p>
                </div>
              </div>
              {organization.description && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <span className="text-gray-400 text-sm">Description:</span>
                  <p className="text-white text-sm mt-1">{organization.description}</p>
                </div>
              )}
            </div>

            {/* Bouton d'action */}
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
            >
              Fermer
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
