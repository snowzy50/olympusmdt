/**
 * Modal de création de territoire avec organisation
 * Créé par: Snowzy
 * Features: Création/sélection organisation, dessin territoire
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Users, MapPin, Trash2, Undo2 } from 'lucide-react';
import type { Organization, OrganizationType, Territory, Coordinates, OrganizationMember } from '@/types/organizations';
import { organizationTypeLabels, organizationTypeIcons } from '@/types/organizations';

interface TerritoryCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizations: Organization[];
  clickedCoordinates: Coordinates | null;
  onCreateTerritory: (territory: Omit<Territory, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCreateOrganization: (org: Omit<Organization, 'id' | 'created_at' | 'updated_at'>) => Promise<Organization>;
  onAddMember: (member: Omit<OrganizationMember, 'id' | 'joined_at'>) => Promise<void>;
  onAddPoint?: (coords: Coordinates) => void;
  currentPoints?: Coordinates[];
  onUndoLastPoint?: () => void;
}

type Step = 'select-org' | 'create-org' | 'draw-territory';

export function TerritoryCreationModal({
  isOpen,
  onClose,
  organizations,
  clickedCoordinates,
  onCreateTerritory,
  onCreateOrganization,
  onAddMember,
  onAddPoint,
  currentPoints = [],
  onUndoLastPoint,
}: TerritoryCreationModalProps) {
  const [step, setStep] = useState<Step>('select-org');
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);

  // Form pour nouvelle organisation
  const [newOrgData, setNewOrgData] = useState({
    name: '',
    short_name: '',
    type: 'gang' as OrganizationType,
    color: '#FF0000',
    description: '',
    boss_name: '',
  });

  // Form pour territoire
  const [territoryName, setTerritoryName] = useState('');

  const handleSelectOrganization = (org: Organization) => {
    setSelectedOrg(org);
    setStep('draw-territory');
  };

  const handleCreateNewOrg = () => {
    setStep('create-org');
  };

  const handleSaveNewOrg = async () => {
    if (!newOrgData.name.trim()) {
      alert('Le nom est requis');
      return;
    }

    setIsCreatingOrg(true);
    try {
      const newOrg = await onCreateOrganization({
        name: newOrgData.name,
        short_name: newOrgData.short_name || undefined,
        type: newOrgData.type,
        color: newOrgData.color,
        description: newOrgData.description || undefined,
        is_active: true,
      });

      // Ajouter le chef si spécifié
      if (newOrgData.boss_name.trim()) {
        await onAddMember({
          organization_id: newOrg.id,
          user_name: newOrgData.boss_name,
          role: 'boss',
        });
      }

      setSelectedOrg(newOrg);
      setStep('draw-territory');
    } catch (error) {
      console.error('Erreur création organisation:', error);
      alert('Erreur lors de la création de l\'organisation');
    } finally {
      setIsCreatingOrg(false);
    }
  };

  const handleSaveTerritory = async () => {
    if (!selectedOrg) return;
    if (currentPoints.length < 3) {
      alert('Un territoire doit avoir au moins 3 points');
      return;
    }
    if (!territoryName.trim()) {
      alert('Donnez un nom au territoire');
      return;
    }

    try {
      await onCreateTerritory({
        organization_id: selectedOrg.id,
        name: territoryName,
        coordinates: currentPoints,
        color: selectedOrg.color,
        opacity: 0.5,
      });

      // Reset et fermer
      handleClose();
      alert('Territoire créé avec succès !');
    } catch (error: any) {
      console.error('Erreur création territoire:', error);
      alert(error.message || 'Erreur lors de la création du territoire');
    }
  };

  const handleClose = () => {
    setStep('select-org');
    setSelectedOrg(null);
    setNewOrgData({
      name: '',
      short_name: '',
      type: 'gang',
      color: '#FF0000',
      description: '',
      boss_name: '',
    });
    setTerritoryName('');
    onClose();
  };

  if (!isOpen) return null;

  // Si on est en mode dessin, afficher seulement la barre de contrôle en bas
  if (step === 'draw-territory' && selectedOrg) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[9999] bg-gradient-to-t from-gray-900 via-gray-900 to-gray-900/95 border-t border-gray-700 shadow-2xl p-6"
        >
          <div className="max-w-4xl mx-auto">
            {/* Header avec organisation */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full border-2 border-white"
                  style={{ backgroundColor: selectedOrg.color }}
                />
                <div>
                  <h3 className="text-white font-bold">{selectedOrg.name}</h3>
                  <p className="text-sm text-gray-300">{organizationTypeLabels[selectedOrg.type]}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-white">{currentPoints.length} point(s)</span>
              </div>
            </div>

            {/* Formulaire */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nom du territoire *</label>
                <input
                  type="text"
                  value={territoryName}
                  onChange={(e) => setTerritoryName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Downtown, Grove Street, ..."
                />
              </div>
              <div className="flex items-end gap-2">
                {onUndoLastPoint && currentPoints.length > 1 && (
                  <button
                    onClick={onUndoLastPoint}
                    className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-300 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    title="Annuler dernier point (Cmd+Z / Ctrl+Z)"
                  >
                    <Undo2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveTerritory}
                  disabled={currentPoints.length < 3 || !territoryName.trim()}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </button>
              </div>
            </div>

            {/* Instruction */}
            <div className="text-xs text-gray-400 text-center">
              Cliquez sur la carte pour ajouter des points (minimum 3 requis) • Cmd+Z / Ctrl+Z pour annuler dernier point
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Sinon, afficher le modal centré pour les autres étapes
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {step === 'select-org' && 'Sélectionner une organisation'}
              {step === 'create-org' && 'Créer une organisation'}
            </h2>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Étape 1 : Sélection organisation */}
          {step === 'select-org' && (
            <div className="space-y-4">
              <button
                onClick={handleCreateNewOrg}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Users className="w-5 h-5" />
                Créer une nouvelle organisation
              </button>

              <div className="text-sm text-gray-400 text-center">ou sélectionner une existante</div>

              <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => handleSelectOrganization(org)}
                    className="p-4 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-lg text-left transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{organizationTypeIcons[org.type]}</span>
                      <div className="flex-1">
                        <h3 className="text-white font-bold">{org.name}</h3>
                        <p className="text-sm text-gray-400">{organizationTypeLabels[org.type]}</p>
                      </div>
                      <div
                        className="w-8 h-8 rounded-full border-2 border-white"
                        style={{ backgroundColor: org.color }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Étape 2 : Création organisation */}
          {step === 'create-org' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nom *</label>
                <input
                  type="text"
                  value={newOrgData.name}
                  onChange={(e) => setNewOrgData({ ...newOrgData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Vatos de Los Santos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nom court</label>
                <input
                  type="text"
                  value={newOrgData.short_name}
                  onChange={(e) => setNewOrgData({ ...newOrgData, short_name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: VDL"
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Type *</label>
                <select
                  value={newOrgData.type}
                  onChange={(e) => setNewOrgData({ ...newOrgData, type: e.target.value as OrganizationType })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(organizationTypeLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Couleur *</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={newOrgData.color}
                    onChange={(e) => setNewOrgData({ ...newOrgData, color: e.target.value })}
                    className="w-16 h-10 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newOrgData.color}
                    onChange={(e) => setNewOrgData({ ...newOrgData, color: e.target.value })}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nom du chef</label>
                <input
                  type="text"
                  value={newOrgData.boss_name}
                  onChange={(e) => setNewOrgData({ ...newOrgData, boss_name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Big Smoke"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={newOrgData.description}
                  onChange={(e) => setNewOrgData({ ...newOrgData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep('select-org')}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Retour
                </button>
                <button
                  onClick={handleSaveNewOrg}
                  disabled={!newOrgData.name.trim() || isCreatingOrg}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                  {isCreatingOrg ? 'Création...' : 'Créer et dessiner'}
                </button>
              </div>
            </div>
          )}

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
