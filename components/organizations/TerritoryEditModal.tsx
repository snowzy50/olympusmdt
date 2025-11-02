/**
 * Modal d'édition d'un territoire
 * Créé par: Snowzy
 * Features: Modifier nom, couleur, opacité
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, MapPin } from 'lucide-react';
import type { Territory, Organization } from '@/types/organizations';

interface TerritoryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  territory: Territory | null;
  organization: Organization | null;
  onSave: (territoryId: string, updates: Partial<Territory>) => Promise<void>;
}

export function TerritoryEditModal({
  isOpen,
  onClose,
  territory,
  organization,
  onSave,
}: TerritoryEditModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [opacity, setOpacity] = useState(0.3);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (territory) {
      setName(territory.name);
      setColor(territory.color || organization?.color || '#3b82f6');
      setOpacity(territory.opacity);
    }
  }, [territory, organization]);

  if (!isOpen || !territory || !organization) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);

      const updates: Partial<Territory> = {
        name: name.trim(),
        color,
        opacity,
      };

      await onSave(territory.id, updates);
      onClose();
    } catch (error) {
      console.error('[TerritoryEditModal] Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du territoire');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10001] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-2xl max-w-lg w-full p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center"
                style={{ backgroundColor: organization.color }}
              >
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Modifier le territoire</h2>
                <p className="text-sm text-gray-400">{territory.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSaving}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nom du territoire */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nom du territoire
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Zone Nord"
                required
                disabled={isSaving}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
              />
            </div>

            {/* Couleur */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Couleur du territoire
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  disabled={isSaving}
                  className="w-16 h-12 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer disabled:opacity-50"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#3b82f6"
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* Opacité */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Opacité: {Math.round(opacity * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                disabled={isSaving}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Aperçu */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Aperçu de la couleur:</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-full h-12 rounded-lg border-2 border-white"
                  style={{ backgroundColor: color, opacity: opacity }}
                />
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving || !name.trim()}
                className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Sauvegarder
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
