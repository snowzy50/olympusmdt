'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Package,
  XCircle,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

interface EquipmentPageContentProps {
  agencyId: string;
  agencyName: string;
}

interface Equipment {
  id: string;
  name: string;
  type: string;
  serialNumber: string;
  status: 'available' | 'in_use' | 'out_of_service' | 'maintenance';
  assignedTo?: string;
  acquisitionDate: string;
  notes?: string;
}

export function EquipmentPageContent({ agencyId, agencyName }: EquipmentPageContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  // Charger les équipements depuis localStorage
  useEffect(() => {
    const storageKey = `equipment_${agencyId}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setEquipment(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading equipment:', error);
      }
    }
  }, [agencyId]);

  // Sauvegarder les équipements dans localStorage
  useEffect(() => {
    const storageKey = `equipment_${agencyId}`;
    localStorage.setItem(storageKey, JSON.stringify(equipment));
  }, [equipment, agencyId]);

  // Filtrer les équipements
  const filteredEquipment = equipment.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculer les statistiques
  const stats = {
    total: equipment.length,
    available: equipment.filter(e => e.status === 'available').length,
    inUse: equipment.filter(e => e.status === 'in_use').length,
    outOfService: equipment.filter(e => e.status === 'out_of_service').length,
  };

  // Ajouter un équipement
  const handleAddEquipment = (newEquipment: Omit<Equipment, 'id'>) => {
    const item: Equipment = {
      ...newEquipment,
      id: Date.now().toString(),
    };
    setEquipment([...equipment, item]);
    setShowAddModal(false);
  };

  // Modifier un équipement
  const handleEditEquipment = (updatedEquipment: Equipment) => {
    setEquipment(equipment.map(e => e.id === updatedEquipment.id ? updatedEquipment : e));
    setShowEditModal(false);
    setSelectedEquipment(null);
  };

  // Supprimer un équipement
  const handleDeleteEquipment = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet équipement ?')) {
      setEquipment(equipment.filter(e => e.id !== id));
      setShowViewModal(false);
      setSelectedEquipment(null);
    }
  };

  // Obtenir la couleur du badge selon le statut
  const getStatusBadge = (status: Equipment['status']) => {
    const badges = {
      available: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle, label: 'Disponible' },
      in_use: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Clock, label: 'En utilisation' },
      out_of_service: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle, label: 'Hors service' },
      maintenance: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: AlertCircle, label: 'Maintenance' },
    };
    const badge = badges[status];
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium border ${badge.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {badge.label}
      </span>
    );
  };

  return (
    <div className="p-8">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Équipements</h1>
            <p className="text-gray-400">Gestion du matériel et équipements - {agencyName}</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Ajouter un équipement
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Équipements</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Disponibles</p>
              <p className="text-3xl font-bold text-white">{stats.available}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">En utilisation</p>
              <p className="text-3xl font-bold text-white">{stats.inUse}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Hors service</p>
              <p className="text-3xl font-bold text-white">{stats.outOfService}</p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
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
            placeholder="Rechercher par nom, type, numéro de série..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500
                     focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Table des équipements */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4 text-gray-400 font-semibold">Nom</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Type</th>
                <th className="text-left p-4 text-gray-400 font-semibold">N° Série</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Statut</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Assigné à</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEquipment.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                        <Briefcase className="w-8 h-8 text-gray-600" />
                      </div>
                      <p className="text-gray-400">
                        {searchQuery ? 'Aucun équipement trouvé' : 'Aucun équipement enregistré'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEquipment.map((item) => (
                  <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                    <td className="p-4">
                      <span className="text-white font-medium">{item.name}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-300">{item.type}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-400">{item.serialNumber}</span>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="p-4">
                      <span className="text-gray-300">{item.assignedTo || '-'}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedEquipment(item);
                            setShowViewModal(true);
                          }}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEquipment(item);
                            setShowEditModal(true);
                          }}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteEquipment(item.id)}
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
        <AddEquipmentModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddEquipment}
        />
      )}

      {/* Modal de visualisation */}
      {showViewModal && selectedEquipment && (
        <ViewEquipmentModal
          equipment={selectedEquipment}
          onClose={() => {
            setShowViewModal(false);
            setSelectedEquipment(null);
          }}
          onEdit={() => {
            setShowViewModal(false);
            setShowEditModal(true);
          }}
          onDelete={() => handleDeleteEquipment(selectedEquipment.id)}
        />
      )}

      {/* Modal de modification */}
      {showEditModal && selectedEquipment && (
        <EditEquipmentModal
          equipment={selectedEquipment}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEquipment(null);
          }}
          onSave={handleEditEquipment}
        />
      )}
    </div>
  );
}

// Modal d'ajout d'équipement
function AddEquipmentModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (equipment: Omit<Equipment, 'id'>) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    serialNumber: '',
    status: 'available' as Equipment['status'],
    assignedTo: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Ajouter un équipement" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nom de l'équipement *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="Gilet pare-balles"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type *
            </label>
            <input
              type="text"
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="Protection"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Numéro de série *
            </label>
            <input
              type="text"
              required
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="SN-2024-001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date d'acquisition *
            </label>
            <input
              type="date"
              required
              value={formData.acquisitionDate}
              onChange={(e) => setFormData({ ...formData, acquisitionDate: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Statut *
            </label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Equipment['status'] })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="available">Disponible</option>
              <option value="in_use">En utilisation</option>
              <option value="maintenance">En maintenance</option>
              <option value="out_of_service">Hors service</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Assigné à
            </label>
            <input
              type="text"
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="Badge ou nom de l'agent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                     focus:outline-none focus:border-purple-500 transition-colors resize-none"
            placeholder="Informations complémentaires..."
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
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Ajouter
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Modal de visualisation d'équipement
function ViewEquipmentModal({
  equipment,
  onClose,
  onEdit,
  onDelete,
}: {
  equipment: Equipment;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const getStatusBadge = (status: Equipment['status']) => {
    const badges = {
      available: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle, label: 'Disponible' },
      in_use: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Clock, label: 'En utilisation' },
      out_of_service: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle, label: 'Hors service' },
      maintenance: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: AlertCircle, label: 'Maintenance' },
    };
    const badge = badges[status];
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium border ${badge.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {badge.label}
      </span>
    );
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Détails de l'équipement" size="lg">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Nom</label>
            <p className="text-white font-medium">{equipment.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
            <p className="text-white">{equipment.type}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Numéro de série</label>
            <p className="text-white font-mono">{equipment.serialNumber}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Statut</label>
            {getStatusBadge(equipment.status)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Date d'acquisition</label>
            <p className="text-white">{new Date(equipment.acquisitionDate).toLocaleDateString('fr-FR')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Assigné à</label>
            <p className="text-white">{equipment.assignedTo || '-'}</p>
          </div>
        </div>

        {equipment.notes && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
            <p className="text-gray-300">{equipment.notes}</p>
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

// Modal de modification d'équipement
function EditEquipmentModal({
  equipment,
  onClose,
  onSave,
}: {
  equipment: Equipment;
  onClose: () => void;
  onSave: (equipment: Equipment) => void;
}) {
  const [formData, setFormData] = useState(equipment);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Modifier l'équipement" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nom de l'équipement *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type *
            </label>
            <input
              type="text"
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Numéro de série *
            </label>
            <input
              type="text"
              required
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date d'acquisition *
            </label>
            <input
              type="date"
              required
              value={formData.acquisitionDate}
              onChange={(e) => setFormData({ ...formData, acquisitionDate: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Statut *
            </label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Equipment['status'] })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="available">Disponible</option>
              <option value="in_use">En utilisation</option>
              <option value="maintenance">En maintenance</option>
              <option value="out_of_service">Hors service</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Assigné à
            </label>
            <input
              type="text"
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                     focus:outline-none focus:border-purple-500 transition-colors resize-none"
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
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </Modal>
  );
}
