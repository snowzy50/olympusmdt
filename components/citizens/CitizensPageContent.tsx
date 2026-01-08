'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import {
  UserCheck,
  Search,
  Filter,
  Plus,
  Eye,
  Edit3,
  Trash2,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Users,
  Loader2,
} from 'lucide-react';
import { useCitizens } from '@/hooks/useCitizens';
import type { Citizen } from '@/services/citizensRealtimeService';

interface CitizensPageContentProps {
  agencyId: string;
  agencyName: string;
}

export function CitizensPageContent({ agencyId, agencyName }: CitizensPageContentProps) {
  const {
    citizens,
    isLoading,
    error,
    createCitizen,
    updateCitizen,
    deleteCitizen
  } = useCitizens();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);

  const stats = {
    total: citizens.length,
    flagged: citizens.filter(c => c.status === 'flagged').length,
    wanted: citizens.filter(c => c.status === 'wanted').length,
    clean: citizens.filter(c => c.status === 'clean').length,
  };

  const filteredCitizens = citizens.filter(citizen => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      citizen.first_name.toLowerCase().includes(search) ||
      citizen.last_name.toLowerCase().includes(search) ||
      (citizen.license_number && citizen.license_number.toLowerCase().includes(search))
    );
  });

  const handleAddCitizen = async (newCitizen: Omit<Citizen, 'id'>) => {
    try {
      await createCitizen(newCitizen);
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to create citizen:', err);
      alert('Erreur lors de la création du citoyen');
    }
  };

  const handleEditCitizen = async (updatedCitizen: Citizen) => {
    try {
      const { id, ...updates } = updatedCitizen;
      await updateCitizen(id, updates);
      setShowEditModal(false);
      setSelectedCitizen(null);
    } catch (err) {
      console.error('Failed to update citizen:', err);
      alert('Erreur lors de la mise à jour du citoyen');
    }
  };

  const handleDeleteCitizen = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce citoyen ?')) {
      try {
        await deleteCitizen(id);
      } catch (err) {
        console.error('Failed to delete citizen:', err);
        alert('Erreur lors de la suppression du citoyen');
      }
    }
  };

  const getStatusBadge = (status: Citizen['status']) => {
    const badges = {
      clean: { label: 'Sans antécédents', color: 'bg-green-500', icon: CheckCircle },
      flagged: { label: 'Fiché', color: 'bg-red-500', icon: AlertCircle },
      wanted: { label: 'Recherché', color: 'bg-orange-500', icon: AlertTriangle },
    };
    const badge = badges[status];
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-400">Chargement de la base de données citoyens...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Erreur de connexion</h2>
        <p className="text-gray-400 max-w-md">
          Impossible de se connecter à la base de données Supabase. Veuillez vérifier vos variables d'environnement.
        </p>
        <p className="text-red-400 text-sm mt-4">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestion des Citoyens</h1>
          <p className="text-gray-400">Base de données citoyens de l'agence {agencyName} (Synchronisé)</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Ajouter un citoyen
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Citoyens</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Fichés</p>
              <p className="text-3xl font-bold text-white">{stats.flagged}</p>
            </div>
            <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Recherchés</p>
              <p className="text-3xl font-bold text-white">{stats.wanted}</p>
            </div>
            <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Sans antécédents</p>
              <p className="text-3xl font-bold text-white">{stats.clean}</p>
            </div>
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom, permis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Citoyen</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Permis</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Téléphone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Adresse</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredCitizens.length > 0 ? (
                filteredCitizens.map((citizen) => (
                  <tr key={citizen.id} className="hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white font-medium">
                        {citizen.first_name} {citizen.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{citizen.license_number || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{citizen.phone || '-'}</td>
                    <td className="px-6 py-4 text-gray-300">{citizen.address || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(citizen.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedCitizen(citizen);
                            setShowViewModal(true);
                          }}
                          className="p-2 hover:bg-gray-700 rounded-lg text-blue-400 hover:text-blue-300 transition-colors"
                          title="Voir"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCitizen(citizen);
                            setShowEditModal(true);
                          }}
                          className="p-2 hover:bg-gray-700 rounded-lg text-green-400 hover:text-green-300 transition-colors"
                          title="Modifier"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCitizen(citizen.id)}
                          className="p-2 hover:bg-gray-700 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <UserCheck className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">Aucun citoyen trouvé</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modales */}
      <AddCitizenModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddCitizen}
      />

      {selectedCitizen && (
        <>
          <ViewCitizenModal
            isOpen={showViewModal}
            onClose={() => {
              setShowViewModal(false);
              setSelectedCitizen(null);
            }}
            citizen={selectedCitizen}
          />

          <EditCitizenModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedCitizen(null);
            }}
            citizen={selectedCitizen}
            onEdit={handleEditCitizen}
          />
        </>
      )}
    </div>
  );
}

// Modal d'ajout
function AddCitizenModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (citizen: Omit<Citizen, 'id'>) => void;
}) {
  const [formData, setFormData] = useState<Omit<Citizen, 'id'>>({
    first_name: '',
    last_name: '',
    license_number: '',
    phone: '',
    address: '',
    status: 'clean',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({
      first_name: '',
      last_name: '',
      license_number: '',
      phone: '',
      address: '',
      status: 'clean',
      notes: '',
    });
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ajouter un citoyen">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Prénom *</label>
            <input
              type="text"
              required
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nom *</label>
            <input
              type="text"
              required
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Permis *</label>
            <input
              type="text"
              required
              value={formData.license_number}
              onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="DL-123456"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone *</label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="555-1234"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Adresse *</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Statut *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Citizen['status'] })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="clean">Sans antécédents</option>
              <option value="flagged">Fiché</option>
              <option value="wanted">Recherché</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Modal de visualisation
function ViewCitizenModal({
  isOpen,
  onClose,
  citizen,
}: {
  isOpen: boolean;
  onClose: () => void;
  citizen: Citizen;
}) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Détails du citoyen">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-400 text-sm mb-1">Prénom</p>
            <p className="text-white font-medium">{citizen.first_name}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-400 text-sm mb-1">Nom</p>
            <p className="text-white font-medium">{citizen.last_name}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-400 text-sm mb-1">Permis</p>
            <p className="text-white font-medium">{citizen.license_number || '-'}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-400 text-sm mb-1">Téléphone</p>
            <p className="text-white font-medium">{citizen.phone || '-'}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg col-span-2">
            <p className="text-gray-400 text-sm mb-1">Adresse</p>
            <p className="text-white font-medium">{citizen.address || '-'}</p>
          </div>
        </div>
        {citizen.notes && (
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-400 text-sm mb-2">Notes</p>
            <p className="text-white whitespace-pre-wrap">{citizen.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

// Modal d'édition
function EditCitizenModal({
  isOpen,
  onClose,
  citizen,
  onEdit,
}: {
  isOpen: boolean;
  onClose: () => void;
  citizen: Citizen;
  onEdit: (citizen: Citizen) => void;
}) {
  const [formData, setFormData] = useState<Citizen>(citizen);

  useEffect(() => {
    setFormData(citizen);
  }, [citizen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEdit(formData);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier le citoyen">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Prénom *</label>
            <input
              type="text"
              required
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nom *</label>
            <input
              type="text"
              required
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Permis *</label>
            <input
              type="text"
              required
              value={formData.license_number || ''}
              onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone *</label>
            <input
              type="text"
              required
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Adresse *</label>
            <input
              type="text"
              required
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Statut *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Citizen['status'] })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="clean">Sans antécédents</option>
              <option value="flagged">Fiché</option>
              <option value="wanted">Recherché</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
          <textarea
            rows={3}
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Enregistrer
          </button>
        </div>
      </form>
    </Modal>
  );
}
