'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  Trash2,
  X,
  Calendar,
  User,
  Loader2,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useWarrants } from '@/hooks/useWarrants';
import type { Warrant } from '@/services/warrantsRealtimeService';

interface WarrantsPageContentProps {
  agencyId: string;
  agencyName: string;
}

export function WarrantsPageContent({ agencyId, agencyName }: WarrantsPageContentProps) {
  const {
    warrants,
    isLoading,
    error,
    createWarrant,
    updateWarrant,
    deleteWarrant,
  } = useWarrants(agencyId);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWarrant, setSelectedWarrant] = useState<Warrant | null>(null);

  // Filtrer les mandats
  const filteredWarrants = warrants.filter(warrant =>
    (warrant.suspect_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (warrant.number?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (warrant.reason?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  // Calculer les statistiques
  const stats = {
    total: warrants.length,
    active: warrants.filter(w => w.status === 'active').length,
    executed: warrants.filter(w => w.status === 'executed').length,
    cancelled: warrants.filter(w => w.status === 'cancelled').length,
  };

  // Ajouter un mandat
  const handleAddWarrant = async (newWarrant: Omit<Warrant, 'id'>) => {
    try {
      await createWarrant(newWarrant);
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to create warrant:', err);
      alert('Erreur lors de la création du mandat');
    }
  };

  // Modifier un mandat
  const handleEditWarrant = async (updatedWarrant: Warrant) => {
    try {
      const { id, ...updates } = updatedWarrant;
      await updateWarrant(id, updates);
      setShowEditModal(false);
      setSelectedWarrant(null);
    } catch (err) {
      console.error('Failed to update warrant:', err);
      alert('Erreur lors de la mise à jour du mandat');
    }
  };

  // Supprimer un mandat
  const handleDeleteWarrant = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce mandat ?')) {
      try {
        await deleteWarrant(id);
        setShowViewModal(false);
        setSelectedWarrant(null);
      } catch (err) {
        console.error('Failed to delete warrant:', err);
        alert('Erreur lors de la suppression du mandat');
      }
    }
  };

  // Obtenir la couleur du badge selon le statut
  const getStatusBadge = (status: Warrant['status']) => {
    const badges = {
      active: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: AlertCircle, label: 'Actif' },
      executed: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle, label: 'Exécuté' },
      cancelled: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: XCircle, label: 'Annulé' },
      expired: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock, label: 'Expiré' },
    };
    const badge = badges[status] || badges.active;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium border ${badge.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {badge.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-400">Chargement de la base de données mandats...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Mandats d'Arrêt</h1>
          <p className="text-gray-400">Gestion des mandats d'arrêt de l'agence {agencyName} (Synchronisé)</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Émettre un mandat
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Mandats</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Actifs</p>
              <p className="text-3xl font-bold text-white">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Exécutés</p>
              <p className="text-3xl font-bold text-white">{stats.executed}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Annulés</p>
              <p className="text-3xl font-bold text-white">{stats.cancelled}</p>
            </div>
            <div className="w-12 h-12 bg-gray-500/20 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, numéro de mandat, motif..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500
                     focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>
      </div>

      {/* Table des mandats */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4 text-gray-400 font-semibold">N° Mandat</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Suspect</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Motif</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Émis le</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Statut</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWarrants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                        <FileText className="w-8 h-8 text-gray-600" />
                      </div>
                      <p className="text-gray-400">
                        {searchQuery ? 'Aucun mandat trouvé' : 'Aucun mandat d\'arrêt émis'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredWarrants.map((warrant) => (
                  <tr key={warrant.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                    <td className="p-4">
                      <span className="text-white font-medium">{warrant.number}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-white">{warrant.suspect_name}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-300">{warrant.reason}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-400">{new Date(warrant.issued_at).toLocaleDateString('fr-FR')}</span>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(warrant.status)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedWarrant(warrant);
                            setShowViewModal(true);
                          }}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedWarrant(warrant);
                            setShowEditModal(true);
                          }}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteWarrant(warrant.id)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'ajout */}
      {showAddModal && (
        <AddWarrantModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddWarrant}
        />
      )}

      {/* Modal de visualisation */}
      {showViewModal && selectedWarrant && (
        <ViewWarrantModal
          warrant={selectedWarrant}
          onClose={() => {
            setShowViewModal(false);
            setSelectedWarrant(null);
          }}
          onEdit={() => {
            setShowViewModal(false);
            setShowEditModal(true);
          }}
          onDelete={() => handleDeleteWarrant(selectedWarrant.id)}
        />
      )}

      {/* Modal de modification */}
      {showEditModal && selectedWarrant && (
        <EditWarrantModal
          warrant={selectedWarrant}
          onClose={() => {
            setShowEditModal(false);
            setSelectedWarrant(null);
          }}
          onSave={handleEditWarrant}
        />
      )}
    </div>
  );
}

// Modal d'ajout de mandat
function AddWarrantModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (warrant: Omit<Warrant, 'id' | 'created_at' | 'updated_at'>) => void;
}) {
  const [formData, setFormData] = useState({
    number: '',
    suspect_name: '',
    reason: '',
    issued_at: new Date().toISOString().split('T')[0],
    status: 'active' as Warrant['status'],
    issued_by_name: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Émettre un mandat d'arrêt" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Numéro de mandat *
            </label>
            <input
              type="text"
              required
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-red-500 transition-colors"
              placeholder="W-2024-001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nom du suspect *
            </label>
            <input
              type="text"
              required
              value={formData.suspect_name}
              onChange={(e) => setFormData({ ...formData, suspect_name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-red-500 transition-colors"
              placeholder="John Doe"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Motif du mandat *
          </label>
          <input
            type="text"
            required
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                     focus:outline-none focus:border-red-500 transition-colors"
            placeholder="Vol à main armée"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date d'émission *
            </label>
            <input
              type="date"
              required
              value={formData.issued_at}
              onChange={(e) => setFormData({ ...formData, issued_at: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Statut *
            </label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Warrant['status'] })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-red-500 transition-colors"
            >
              <option value="active">Actif</option>
              <option value="executed">Exécuté</option>
              <option value="cancelled">Annulé</option>
              <option value="expired">Expiré</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Émis par *
          </label>
          <input
            type="text"
            required
            value={formData.issued_by_name}
            onChange={(e) => setFormData({ ...formData, issued_by_name: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                     focus:outline-none focus:border-red-500 transition-colors"
            placeholder="Juge Martin"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Notes complémentaires
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                     focus:outline-none focus:border-red-500 transition-colors resize-none"
            placeholder="Informations supplémentaires..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Émettre le mandat
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Modal de visualisation de mandat
function ViewWarrantModal({
  warrant,
  onClose,
  onEdit,
  onDelete,
}: {
  warrant: Warrant;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const getStatusBadge = (status: Warrant['status']) => {
    const badges = {
      active: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: AlertCircle, label: 'Actif' },
      executed: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle, label: 'Exécuté' },
      cancelled: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: XCircle, label: 'Annulé' },
      expired: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock, label: 'Expiré' },
    };
    const badge = badges[status] || badges.active;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium border ${badge.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {badge.label}
      </span>
    );
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Détails du mandat" size="lg">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Numéro de mandat</label>
            <p className="text-white font-medium">{warrant.number}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Statut</label>
            {getStatusBadge(warrant.status)}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Suspect</label>
          <p className="text-white font-medium">{warrant.suspect_name}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Motif</label>
          <p className="text-white">{warrant.reason}</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Date d'émission</label>
            <p className="text-white">{new Date(warrant.issued_at).toLocaleDateString('fr-FR')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Émis par</label>
            <p className="text-white">{warrant.issued_by_name}</p>
          </div>
        </div>

        {warrant.notes && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
            <p className="text-gray-300">{warrant.notes}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Supprimer
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Modifier
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Modal de modification de mandat
function EditWarrantModal({
  warrant,
  onClose,
  onSave,
}: {
  warrant: Warrant;
  onClose: () => void;
  onSave: (warrant: Warrant) => void;
}) {
  const [formData, setFormData] = useState(warrant);

  useEffect(() => {
    setFormData(warrant);
  }, [warrant]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Modifier le mandat" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Numéro de mandat *
            </label>
            <input
              type="text"
              required
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nom du suspect *
            </label>
            <input
              type="text"
              required
              value={formData.suspect_name}
              onChange={(e) => setFormData({ ...formData, suspect_name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Motif du mandat *
          </label>
          <input
            type="text"
            required
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                     focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date d'émission *
            </label>
            <input
              type="date"
              required
              value={formData.issued_at?.split('T')[0] || ''}
              onChange={(e) => setFormData({ ...formData, issued_at: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Statut *
            </label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Warrant['status'] })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-red-500 transition-colors"
            >
              <option value="active">Actif</option>
              <option value="executed">Exécuté</option>
              <option value="cancelled">Annulé</option>
              <option value="expired">Expiré</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Émis par *
          </label>
          <input
            type="text"
            required
            value={formData.issued_by_name}
            onChange={(e) => setFormData({ ...formData, issued_by_name: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                     focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Notes complémentaires
          </label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                     focus:outline-none focus:border-red-500 transition-colors resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </Modal>
  );
}
