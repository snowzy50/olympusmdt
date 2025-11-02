'use client';

import React, { useState, useEffect } from 'react';
import {
  Building,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Users,
  Shield,
  Radio,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

interface UnitsPageContentProps {
  agencyId: string;
  agencyName: string;
}

interface Unit {
  id: string;
  name: string;
  callsign: string;
  type: string;
  members: number;
  commander: string;
  status: 'active' | 'inactive' | 'on_patrol';
  notes?: string;
}

export function UnitsPageContent({ agencyId, agencyName }: UnitsPageContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [units, setUnits] = useState<Unit[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  useEffect(() => {
    const storageKey = `units_${agencyId}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setUnits(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading units:', error);
      }
    }
  }, [agencyId]);

  useEffect(() => {
    const storageKey = `units_${agencyId}`;
    localStorage.setItem(storageKey, JSON.stringify(units));
  }, [units, agencyId]);

  const filteredUnits = units.filter(unit =>
    unit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    unit.callsign.toLowerCase().includes(searchQuery.toLowerCase()) ||
    unit.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: units.length,
    active: units.filter(u => u.status === 'active').length,
    totalMembers: units.reduce((sum, u) => sum + u.members, 0),
    onPatrol: units.filter(u => u.status === 'on_patrol').length,
  };

  const handleAddUnit = (newUnit: Omit<Unit, 'id'>) => {
    const unit: Unit = {
      ...newUnit,
      id: Date.now().toString(),
    };
    setUnits([...units, unit]);
    setShowAddModal(false);
  };

  const handleEditUnit = (updatedUnit: Unit) => {
    setUnits(units.map(u => u.id === updatedUnit.id ? updatedUnit : u));
    setShowEditModal(false);
    setSelectedUnit(null);
  };

  const handleDeleteUnit = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette unité ?')) {
      setUnits(units.filter(u => u.id !== id));
      setShowViewModal(false);
      setSelectedUnit(null);
    }
  };

  const getStatusBadge = (status: Unit['status']) => {
    const badges = {
      active: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle, label: 'Active' },
      inactive: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: XCircle, label: 'Inactive' },
      on_patrol: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Radio, label: 'En patrouille' },
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Unités</h1>
          <p className="text-gray-400">Gestion des unités opérationnelles - {agencyName}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Créer une unité
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Unités</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Unités actives</p>
              <p className="text-3xl font-bold text-white">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Membres</p>
              <p className="text-3xl font-bold text-white">{stats.totalMembers}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">En patrouille</p>
              <p className="text-3xl font-bold text-white">{stats.onPatrol}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Radio className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom d'unité, indicatif..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500
                     focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4 text-gray-400 font-semibold">Nom de l'unité</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Indicatif</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Type</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Membres</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Commandant</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Statut</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                        <Building className="w-8 h-8 text-gray-600" />
                      </div>
                      <p className="text-gray-400">
                        {searchQuery ? 'Aucune unité trouvée' : 'Aucune unité créée'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUnits.map((unit) => (
                  <tr key={unit.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                    <td className="p-4">
                      <span className="text-white font-medium">{unit.name}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-white">{unit.callsign}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-300">{unit.type}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-400">{unit.members}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-300">{unit.commander}</span>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(unit.status)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedUnit(unit);
                            setShowViewModal(true);
                          }}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUnit(unit);
                            setShowEditModal(true);
                          }}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteUnit(unit.id)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
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

      {showAddModal && (
        <AddUnitModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddUnit}
        />
      )}

      {showViewModal && selectedUnit && (
        <ViewUnitModal
          unit={selectedUnit}
          onClose={() => {
            setShowViewModal(false);
            setSelectedUnit(null);
          }}
          onEdit={() => {
            setShowViewModal(false);
            setShowEditModal(true);
          }}
          onDelete={() => handleDeleteUnit(selectedUnit.id)}
        />
      )}

      {showEditModal && selectedUnit && (
        <EditUnitModal
          unit={selectedUnit}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUnit(null);
          }}
          onSave={handleEditUnit}
        />
      )}
    </div>
  );
}

function AddUnitModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (unit: Omit<Unit, 'id'>) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    callsign: '',
    type: '',
    members: 0,
    commander: '',
    status: 'active' as Unit['status'],
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Créer une unité" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nom de l'unité *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="Unité Alpha"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Indicatif *</label>
            <input
              type="text"
              required
              value={formData.callsign}
              onChange={(e) => setFormData({ ...formData, callsign: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="ALPHA-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Type *</label>
            <input
              type="text"
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="Patrouille, SWAT, K9..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nombre de membres *</label>
            <input
              type="number"
              required
              min="0"
              value={formData.members}
              onChange={(e) => setFormData({ ...formData, members: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Commandant *</label>
            <input
              type="text"
              required
              value={formData.commander}
              onChange={(e) => setFormData({ ...formData, commander: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="Badge ou nom"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Statut *</label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Unit['status'] })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="active">Active</option>
              <option value="on_patrol">En patrouille</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                     focus:outline-none focus:border-indigo-500 transition-colors resize-none"
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
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Créer
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ViewUnitModal({
  unit,
  onClose,
  onEdit,
  onDelete,
}: {
  unit: Unit;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const getStatusBadge = (status: Unit['status']) => {
    const badges = {
      active: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle, label: 'Active' },
      inactive: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: XCircle, label: 'Inactive' },
      on_patrol: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Radio, label: 'En patrouille' },
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
    <Modal isOpen={true} onClose={onClose} title="Détails de l'unité" size="lg">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Nom de l'unité</label>
            <p className="text-white font-medium">{unit.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Indicatif</label>
            <p className="text-white font-medium">{unit.callsign}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
            <p className="text-white">{unit.type}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Statut</label>
            {getStatusBadge(unit.status)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Membres</label>
            <p className="text-white">{unit.members}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Commandant</label>
            <p className="text-white">{unit.commander}</p>
          </div>
        </div>

        {unit.notes && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
            <p className="text-gray-300">{unit.notes}</p>
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

function EditUnitModal({
  unit,
  onClose,
  onSave,
}: {
  unit: Unit;
  onClose: () => void;
  onSave: (unit: Unit) => void;
}) {
  const [formData, setFormData] = useState(unit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Modifier l'unité" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nom de l'unité *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Indicatif *</label>
            <input
              type="text"
              required
              value={formData.callsign}
              onChange={(e) => setFormData({ ...formData, callsign: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Type *</label>
            <input
              type="text"
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nombre de membres *</label>
            <input
              type="number"
              required
              min="0"
              value={formData.members}
              onChange={(e) => setFormData({ ...formData, members: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Commandant *</label>
            <input
              type="text"
              required
              value={formData.commander}
              onChange={(e) => setFormData({ ...formData, commander: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Statut *</label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Unit['status'] })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="active">Active</option>
              <option value="on_patrol">En patrouille</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                     focus:outline-none focus:border-indigo-500 transition-colors resize-none"
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
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </Modal>
  );
}
