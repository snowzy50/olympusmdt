'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import {
  Search,
  Plus,
  Package,
  Syringe,
  Car,
  ShieldAlert,
  Eye,
  Edit,
  Trash2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useSupabaseSeizures } from '@/hooks/useSupabaseSeizures';
import type { Seizure, SeizureInsert } from '@/lib/supabase/client';

/**
 * Module de gestion des saisies
 * Créé par Snowzy
 */

const seizureTypeLabels: Record<string, { label: string; icon: any; color: string }> = {
  weapons: { label: 'Armes', icon: ShieldAlert, color: 'error' },
  drugs: { label: 'Stupéfiants', icon: Syringe, color: 'warning' },
  vehicle: { label: 'Véhicules', icon: Car, color: 'info' },
  goods: { label: 'Biens divers', icon: Package, color: 'success' },
};

const statusLabels: Record<string, { label: string; color: string }> = {
  stored: { label: 'Stocké', color: 'info' },
  evidence: { label: 'Pièce à conviction', color: 'warning' },
  destroyed: { label: 'Détruit', color: 'error' },
  returned: { label: 'Restitué', color: 'success' },
};

export default function SeizuresPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingSeizure, setEditingSeizure] = useState<Seizure | null>(null);
  const [viewingSeizure, setViewingSeizure] = useState<Seizure | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Seizure>>({
    type: 'weapons',
    description: '',
    quantity: 1,
    unit: '',
    estimated_value: 0,
    seized_by: '',
    officer_id: '',
    location: '',
    status: 'stored',
    case_number: '',
  });

  const { seizures, isLoading, error, addSeizure, updateSeizure, deleteSeizure } = useSupabaseSeizures();

  const filteredSeizures = seizures.filter((seizure) => {
    const matchesSearch =
      seizure.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seizure.seizure_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seizure.seized_by.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || seizure.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || seizure.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalValue = filteredSeizures.reduce((sum, s) => sum + s.estimated_value, 0);

  // Handlers
  const handleCreate = () => {
    setEditingSeizure(null);
    setFormData({
      type: 'weapons',
      description: '',
      quantity: 1,
      unit: '',
      estimated_value: 0,
      seized_by: '',
      officer_id: '',
      location: '',
      status: 'stored',
      case_number: '',
    });
    setShowModal(true);
  };

  const handleView = (seizure: Seizure) => {
    setViewingSeizure(seizure);
  };

  const handleEdit = (seizure: Seizure) => {
    setEditingSeizure(seizure);
    setFormData(seizure);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      await deleteSeizure(deletingId);
      setShowDeleteConfirm(false);
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSeizure) {
      await updateSeizure(editingSeizure.id, formData);
    } else {
      const seizureData: SeizureInsert = {
        ...formData as SeizureInsert,
        seizure_number: `SEZ-${new Date().getFullYear()}-${String(seizures.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString(),
      };
      await addSeizure(seizureData);
    }
    setShowModal(false);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Saisies</h1>
          <p className="text-gray-400">
            Gestion des saisies : armes, stupéfiants, véhicules et biens divers
          </p>
        </div>
        <Button variant="primary" className="gap-2" onClick={handleCreate}>
          <Plus className="w-4 h-4" />
          Nouvelle saisie
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(seizureTypeLabels).map(([type, config]) => {
          const Icon = config.icon;
          const count = seizures.filter((s) => s.type === type).length;
          return (
            <Card key={type} className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 bg-${config.color}-500/10 rounded-lg`}>
                  <Icon className={`w-6 h-6 text-${config.color}-500`} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">{config.label}</p>
                  <p className="text-2xl font-bold text-white">{count}</p>
                </div>
              </div>
            </Card>
          );
        })}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-500/10 rounded-lg">
              <Package className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Valeur totale</p>
              <p className="text-2xl font-bold text-white">
                ${totalValue.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une saisie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Tous les types</option>
            <option value="weapons">Armes</option>
            <option value="drugs">Stupéfiants</option>
            <option value="vehicle">Véhicules</option>
            <option value="goods">Biens divers</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="stored">Stocké</option>
            <option value="evidence">Pièce à conviction</option>
            <option value="destroyed">Détruit</option>
            <option value="returned">Restitué</option>
          </select>
        </div>
      </Card>

      {/* Seizures List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Numéro
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Quantité
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Valeur estimée
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Agent
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSeizures.map((seizure) => {
                const typeConfig = seizureTypeLabels[seizure.type];
                const TypeIcon = typeConfig.icon;
                const statusInfo = statusLabels[seizure.status];

                return (
                  <tr
                    key={seizure.id}
                    className="border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-primary-500" />
                        <span className="text-white font-medium">
                          {seizure.seizure_number}
                        </span>
                      </div>
                      {seizure.case_number && (
                        <p className="text-xs text-gray-400 ml-6">{seizure.case_number}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <TypeIcon className={`w-4 h-4 text-${typeConfig.color}-500`} />
                        <span className="text-gray-300">{typeConfig.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white">{seizure.description}</p>
                      <p className="text-sm text-gray-400">{seizure.location}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-medium">
                        {seizure.quantity} {seizure.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-success-500 font-semibold">
                        ${seizure.estimated_value.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white">{seizure.seized_by}</p>
                        <p className="text-sm text-gray-400">{seizure.officer_id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusInfo.color as any}>
                        {statusInfo.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(seizure)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleEdit(seizure)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(seizure.id)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 text-error-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredSeizures.length === 0 && (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Aucune saisie trouvée</p>
            </div>
          )}
        </div>
      </Card>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 py-8 overflow-y-auto">
          <div className="bg-dark-200 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {editingSeizure ? 'Modifier la saisie' : 'Nouvelle saisie'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Type de saisie *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Seizure['type'] })}
                  className="w-full px-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="weapons">Armes</option>
                  <option value="drugs">Stupéfiants</option>
                  <option value="vehicle">Véhicules</option>
                  <option value="goods">Biens divers</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Description *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Quantité *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Unité *
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="Ex: unité, grammes, kg"
                    className="w-full px-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Valeur estimée ($) *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.estimated_value}
                  onChange={(e) => setFormData({ ...formData, estimated_value: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Agent saisissant *
                  </label>
                  <input
                    type="text"
                    value={formData.seized_by}
                    onChange={(e) => setFormData({ ...formData, seized_by: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Matricule *
                  </label>
                  <input
                    type="text"
                    value={formData.officer_id}
                    onChange={(e) => setFormData({ ...formData, officer_id: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Lieu de la saisie *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Statut *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Seizure['status'] })}
                    className="w-full px-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="stored">Stocké</option>
                    <option value="evidence">Pièce à conviction</option>
                    <option value="destroyed">Détruit</option>
                    <option value="returned">Restitué</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Numéro de dossier
                  </label>
                  <input
                    type="text"
                    value={formData.case_number}
                    onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                    placeholder="Optionnel"
                    className="w-full px-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" variant="primary" className="flex-1">
                  {editingSeizure ? 'Mettre à jour' : 'Créer la saisie'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewingSeizure && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 py-8 overflow-y-auto">
          <div className="bg-dark-200 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Détails de la saisie</h2>
              <button
                onClick={() => setViewingSeizure(null)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold text-white">{viewingSeizure.description}</h3>
                <Badge variant={seizureTypeLabels[viewingSeizure.type].color as any}>
                  {seizureTypeLabels[viewingSeizure.type].label}
                </Badge>
                <Badge variant={statusLabels[viewingSeizure.status].color as any}>
                  {statusLabels[viewingSeizure.status].label}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-400">Numéro de saisie</p>
                  <p className="text-lg font-medium text-white">{viewingSeizure.seizure_number}</p>
                </div>
                {viewingSeizure.case_number && (
                  <div>
                    <p className="text-sm text-gray-400">Numéro de dossier</p>
                    <p className="text-lg font-medium text-white">{viewingSeizure.case_number}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-400">Date de saisie</p>
                  <p className="text-lg font-medium text-white">
                    {new Date(viewingSeizure.date).toLocaleString('fr-FR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Lieu</p>
                  <p className="text-lg font-medium text-white">{viewingSeizure.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Quantité</p>
                  <p className="text-lg font-medium text-white">
                    {viewingSeizure.quantity} {viewingSeizure.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Valeur estimée</p>
                  <p className="text-lg font-medium text-success-500">
                    ${viewingSeizure.estimated_value.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Agent saisissant</p>
                  <p className="text-lg font-medium text-white">
                    {viewingSeizure.seized_by} ({viewingSeizure.officer_id})
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <Button
                  variant="primary"
                  onClick={() => {
                    setViewingSeizure(null);
                    handleEdit(viewingSeizure);
                  }}
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </Button>
                <Button variant="ghost" onClick={() => setViewingSeizure(null)}>
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 py-8 overflow-y-auto">
          <div className="bg-dark-200 rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-error-500/10 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-error-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Confirmer la suppression</h3>
                  <p className="text-sm text-gray-400">Cette action est irréversible</p>
                </div>
              </div>
              <p className="text-gray-300 mb-6">
                Êtes-vous sûr de vouloir supprimer cette saisie ? Toutes les données seront
                définitivement perdues.
              </p>
              <div className="flex gap-3">
                <Button variant="destructive" onClick={confirmDelete} className="flex-1">
                  Supprimer
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletingId(null);
                  }}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
