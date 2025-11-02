/**
 * Page de gestion des organisations et territoires
 * Créé par: Snowzy
 * Features: CRUD organisations, dessin territoires, gestion POI
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Users, MapPin, Target } from 'lucide-react';
import { TerritoryMapEditor } from '@/components/organizations/TerritoryMapEditor';
import { useOrganizations } from '@/hooks/useOrganizations';
import {
  organizationTypeLabels,
  organizationTypeIcons,
  type Organization,
  type Territory,
  type TerritoryPOI,
  type OrganizationType,
} from '@/types/organizations';

export default function OrganizationsPage() {
  const {
    organizations,
    territories,
    pois,
    isLoading,
    isConnected,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    createTerritory,
    deleteTerritory,
    getOrganizationTerritories,
    getOrganizationPOIs,
  } = useOrganizations();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    short_name: '',
    type: 'gang' as OrganizationType,
    color: '#FF0000',
    description: '',
  });

  const handleCreateOrganization = async () => {
    try {
      await createOrganization({
        ...formData,
        is_active: true,
      });
      setShowCreateModal(false);
      setFormData({
        name: '',
        short_name: '',
        type: 'gang',
        color: '#FF0000',
        description: '',
      });
    } catch (error) {
      console.error('Erreur création organisation:', error);
      alert('Erreur lors de la création');
    }
  };

  const handleDeleteOrganization = async (id: string) => {
    if (!confirm('Supprimer cette organisation et tous ses territoires ?')) return;
    try {
      await deleteOrganization(id);
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleTerritoryCreate = async (territory: Omit<Territory, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createTerritory(territory);
      alert('Territoire créé avec succès !');
    } catch (error: any) {
      console.error('Erreur création territoire:', error);
      alert(error.message || 'Erreur lors de la création du territoire');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700 bg-gray-900/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Target className="w-6 h-6 text-red-500" />
              Organisations & Territoires
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Gestion des gangs, mafias, MC et leurs territoires
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}
              />
              <span className="text-xs text-gray-300">
                {isConnected ? 'Connecté' : 'Déconnecté'}
              </span>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouvelle organisation
            </button>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-700/20 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-blue-400 font-medium">Organisations</span>
            </div>
            <div className="text-2xl font-bold text-white">{organizations.length}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-700/20 border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-purple-400 font-medium">Territoires</span>
            </div>
            <div className="text-2xl font-bold text-white">{territories.length}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-700/20 border border-orange-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-orange-400 font-medium">Points d'intérêt</span>
            </div>
            <div className="text-2xl font-bold text-white">{pois.length}</div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Liste organisations (sidebar) */}
        <div className="w-80 flex-shrink-0 border-r border-gray-700 bg-gray-900/30 overflow-y-auto">
          <div className="p-4 space-y-2">
            {isLoading ? (
              <div className="text-center text-gray-400 py-8">Chargement...</div>
            ) : organizations.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Aucune organisation</p>
              </div>
            ) : (
              organizations.map((org) => {
                const orgTerritories = getOrganizationTerritories(org.id);
                const orgPOIs = getOrganizationPOIs(org.id);

                return (
                  <motion.div
                    key={org.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gradient-to-br from-gray-800/80 to-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-lg p-3 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-2xl">{organizationTypeIcons[org.type]}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-white truncate">{org.name}</h3>
                          <p className="text-xs text-gray-400">
                            {organizationTypeLabels[org.type]}
                          </p>
                        </div>
                      </div>
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white flex-shrink-0"
                        style={{ backgroundColor: org.color }}
                      />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 mb-2 text-xs">
                      <div className="flex items-center gap-1 text-purple-400">
                        <MapPin className="w-3 h-3" />
                        {orgTerritories.length} territoire(s)
                      </div>
                      <div className="flex items-center gap-1 text-orange-400">
                        <Target className="w-3 h-3" />
                        {orgPOIs.length} POI
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => setSelectedOrganization(org)}
                        className="flex-1 px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded text-blue-400 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteOrganization(org.id)}
                        className="flex-1 px-2 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-red-400 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Supprimer
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Carte */}
        <div className="flex-1 p-4">
          <TerritoryMapEditor
            territories={territories}
            pois={pois}
            organizations={organizations}
            onTerritoryCreate={handleTerritoryCreate}
            className="h-full"
          />
        </div>
      </div>

      {/* Modal création organisation */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-2xl max-w-md w-full p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4">Nouvelle organisation</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Nom</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Vatos de Los Santos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nom court (optionnel)
                  </label>
                  <input
                    type="text"
                    value={formData.short_name}
                    onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: VDL"
                    maxLength={10}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as OrganizationType })
                    }
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
                  <label className="block text-sm font-medium text-gray-300 mb-1">Couleur</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-16 h-10 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="#FF0000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Description (optionnel)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                    placeholder="Description de l'organisation..."
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateOrganization}
                  disabled={!formData.name.trim()}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Créer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
