'use client';

import React, { useState } from 'react';
import {
  Building,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Users,
  Shield,
  TrendingUp,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useDivisions } from '@/hooks/useDivisions';
import type { Division } from '@/services/divisionsRealtimeService';

interface DivisionsPageContentProps {
  agencyId: string;
  agencyName: string;
}

export function DivisionsPageContent({ agencyId: propAgencyId, agencyName }: DivisionsPageContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const {
    divisions,
    isLoading,
    error,
    createDivision,
    updateDivision,
    deleteDivision
  } = useDivisions(propAgencyId);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);

  const filteredDivisions = divisions.filter(division =>
    division.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    division.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    division.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: divisions.length,
    active: divisions.filter(d => d.status === 'active').length,
    totalMembers: divisions.reduce((sum, d) => sum + (d.members_count || 0), 0),
    avgPerformance: divisions.length > 0 ? Math.round((divisions.filter(d => d.status === 'active').length / divisions.length) * 100) : 0,
  };

  const handleAddDivision = async (newDivision: Omit<Division, 'id' | 'agency_id' | 'created_at' | 'updated_at'>) => {
    try {
      await createDivision({
        ...newDivision,
        agency_id: propAgencyId
      });
      setShowAddModal(false);
    } catch (err) {
      console.error('Error creating division:', err);
      alert('Erreur lors de la création de la division');
    }
  };

  const handleEditDivision = async (updatedDivision: Division) => {
    try {
      const { id, created_at, updated_at, ...updates } = updatedDivision;
      await updateDivision(id, updates);
      setShowEditModal(false);
      setSelectedDivision(null);
    } catch (err) {
      console.error('Error updating division:', err);
      alert('Erreur lors de la mise à jour de la division');
    }
  };

  const handleDeleteDivision = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette division ?')) {
      try {
        await deleteDivision(id);
        setShowViewModal(false);
        setSelectedDivision(null);
      } catch (err) {
        console.error('Error deleting division:', err);
        alert('Erreur lors de la suppression de la division');
      }
    }
  };

  const getStatusBadge = (status: Division['status']) => {
    const badges = {
      active: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle, label: 'Active' },
      inactive: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: XCircle, label: 'Inactive' },
      restructuring: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: TrendingUp, label: 'Restructuration' },
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

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-semibold text-white">Erreur de connexion</h2>
          <p className="text-gray-400">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Divisions</h1>
          <p className="text-gray-400">Structure organisationnelle - {agencyName}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Créer une division
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Divisions</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Divisions actives</p>
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
              <p className="text-gray-400 text-sm mb-1">Total Effectifs</p>
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
              <p className="text-gray-400 text-sm mb-1">Performance</p>
              <p className="text-3xl font-bold text-white">{stats.avgPerformance}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom de division, code, département..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500
                     focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4 text-gray-400 font-semibold">Nom de la division</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Code</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Responsable</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Effectifs</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Département</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Statut</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-2" />
                    <p className="text-gray-400">Chargement des divisions...</p>
                  </td>
                </tr>
              ) : filteredDivisions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                        <Building className="w-8 h-8 text-gray-600" />
                      </div>
                      <p className="text-gray-400">
                        {searchQuery ? 'Aucune division trouvée' : 'Aucune division créée'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDivisions.map((division) => (
                  <tr key={division.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                    <td className="p-4">
                      <span className="text-white font-medium">{division.name}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-white">{division.code}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-300">{division.chief_name}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-400">{division.members_count}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-300">{division.department}</span>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(division.status)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedDivision(division);
                            setShowViewModal(true);
                          }}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDivision(division);
                            setShowEditModal(true);
                          }}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteDivision(division.id)}
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
        <AddDivisionModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddDivision}
        />
      )}

      {showViewModal && selectedDivision && (
        <ViewDivisionModal
          division={selectedDivision}
          onClose={() => {
            setShowViewModal(false);
            setSelectedDivision(null);
          }}
          onEdit={() => {
            setShowViewModal(false);
            setShowEditModal(true);
          }}
          onDelete={() => handleDeleteDivision(selectedDivision.id)}
        />
      )}

      {showEditModal && selectedDivision && (
        <EditDivisionModal
          division={selectedDivision}
          onClose={() => {
            setShowEditModal(false);
            setSelectedDivision(null);
          }}
          onSave={handleEditDivision}
        />
      )}
    </div>
  );
}

function AddDivisionModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (d: Omit<Division, 'id' | 'agency_id' | 'created_at' | 'updated_at'>) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    chief_name: '',
    members_count: 0,
    department: '',
    status: 'active' as Division['status'],
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Créer une division" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nom de la division *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="Division des Investigations"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Code *</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="DIV-01"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Responsable *</label>
            <input
              type="text"
              required
              value={formData.chief_name}
              onChange={(e) => setFormData({ ...formData, chief_name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="Badge ou nom"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Effectifs *</label>
            <input
              type="number"
              required
              min="0"
              value={formData.members_count}
              onChange={(e) => setFormData({ ...formData, members_count: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Département *</label>
            <input
              type="text"
              required
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="Opérations, Administration..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Statut *</label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Division['status'] })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="active">Active</option>
              <option value="restructuring">Restructuration</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                     focus:outline-none focus:border-emerald-500 transition-colors resize-none"
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
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            Créer
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ViewDivisionModal({
  division,
  onClose,
  onEdit,
  onDelete,
}: {
  division: Division;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const getStatusBadge = (status: Division['status']) => {
    const badges = {
      active: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle, label: 'Active' },
      inactive: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: XCircle, label: 'Inactive' },
      restructuring: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: TrendingUp, label: 'Restructuration' },
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
    <Modal isOpen={true} onClose={onClose} title="Détails de la division" size="lg">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Nom de la division</label>
            <p className="text-white font-medium">{division.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Code</label>
            <p className="text-white font-medium">{division.code}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Responsable</label>
            <p className="text-white">{division.chief_name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Effectifs</label>
            <p className="text-white">{division.members_count}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Département</label>
            <p className="text-white">{division.department}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Statut</label>
            {getStatusBadge(division.status)}
          </div>
        </div>

        {division.notes && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
            <p className="text-gray-300">{division.notes}</p>
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

function EditDivisionModal({
  division,
  onClose,
  onSave,
}: {
  division: Division;
  onClose: () => void;
  onSave: (d: Division) => void;
}) {
  const [formData, setFormData] = useState(division);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Modifier la division" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nom de la division *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Code *</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Responsable *</label>
            <input
              type="text"
              required
              value={formData.chief_name}
              onChange={(e) => setFormData({ ...formData, chief_name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Effectifs *</label>
            <input
              type="number"
              required
              min="0"
              value={formData.members_count}
              onChange={(e) => setFormData({ ...formData, members_count: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Département *</label>
            <input
              type="text"
              required
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Statut *</label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Division['status'] })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="active">Active</option>
              <option value="restructuring">Restructuration</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                     focus:outline-none focus:border-emerald-500 transition-colors resize-none"
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
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </Modal>
  );
}
