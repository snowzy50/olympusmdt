'use client';

import React, { useState } from 'react';
import {
  FileText,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useComplaints } from '@/hooks/useComplaints';
import type { Complaint } from '@/services/complaintsRealtimeService';

interface ComplaintsPageContentProps {
  agencyId: string;
  agencyName: string;
}

export function ComplaintsPageContent({ agencyId: propAgencyId, agencyName }: ComplaintsPageContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const {
    complaints,
    isLoading,
    error,
    createComplaint,
    updateComplaint,
    deleteComplaint
  } = useComplaints(propAgencyId);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const filteredComplaints = complaints.filter(c =>
    c.complainant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    processed: complaints.filter(c => c.status === 'processed').length,
    investigating: complaints.filter(c => c.status === 'investigating').length,
  };

  const handleAddComplaint = async (newComplaint: Omit<Complaint, 'id' | 'agency_id' | 'created_at' | 'updated_at'>) => {
    try {
      await createComplaint({
        ...newComplaint,
        agency_id: propAgencyId
      });
      setShowAddModal(false);
    } catch (err) {
      console.error('Error creating complaint:', err);
      alert('Erreur lors de la création de la plainte');
    }
  };

  const handleEditComplaint = async (updatedComplaint: Complaint) => {
    try {
      const { id, created_at, updated_at, ...updates } = updatedComplaint;
      await updateComplaint(id, updates);
      setShowEditModal(false);
      setSelectedComplaint(null);
    } catch (err) {
      console.error('Error updating complaint:', err);
      alert('Erreur lors de la mise à jour de la plainte');
    }
  };

  const handleDeleteComplaint = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette plainte ?')) {
      try {
        await deleteComplaint(id);
        setShowViewModal(false);
        setSelectedComplaint(null);
      } catch (err) {
        console.error('Error deleting complaint:', err);
        alert('Erreur lors de la suppression de la plainte');
      }
    }
  };

  const getStatusBadge = (status: Complaint['status']) => {
    const badges = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock, label: 'En attente' },
      processed: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle, label: 'Traitée' },
      investigating: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Search, label: 'Enquête' },
      rejected: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle, label: 'Rejetée' },
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
          <h1 className="text-3xl font-bold text-white">Plaintes</h1>
          <p className="text-gray-400">Gestion des rapports et plaintes citoyennes - {agencyName}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouvelle plainte
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Plaintes</p>
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
              <p className="text-gray-400 text-sm mb-1">En attente</p>
              <p className="text-3xl font-bold text-white">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">En enquête</p>
              <p className="text-3xl font-bold text-white">{stats.investigating}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Search className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Traitées</p>
              <p className="text-3xl font-bold text-white">{stats.processed}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par numéro, plaignant, type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500
                     focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4 text-gray-400 font-semibold">N° Plainte</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Plaignant</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Type</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Date</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Statut</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                    <p className="text-gray-400">Chargement des plaintes...</p>
                  </td>
                </tr>
              ) : filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                        <FileText className="w-8 h-8 text-gray-600" />
                      </div>
                      <p className="text-gray-400">
                        {searchQuery ? 'Aucune plainte trouvée' : 'Aucune plainte enregistrée'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((complaint) => (
                  <tr key={complaint.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                    <td className="p-4">
                      <span className="text-white font-medium">{complaint.number}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-white">{complaint.complainant_name}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-300">{complaint.type}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-400">{new Date(complaint.filed_at).toLocaleDateString('fr-FR')}</span>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(complaint.status)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setShowViewModal(true);
                          }}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setShowEditModal(true);
                          }}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteComplaint(complaint.id)}
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

      {showAddModal && (
        <AddComplaintModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddComplaint}
        />
      )}

      {showViewModal && selectedComplaint && (
        <ViewComplaintModal
          complaint={selectedComplaint}
          onClose={() => {
            setShowViewModal(false);
            setSelectedComplaint(null);
          }}
          onEdit={() => {
            setShowViewModal(false);
            setShowEditModal(true);
          }}
          onDelete={() => handleDeleteComplaint(selectedComplaint.id)}
        />
      )}

      {showEditModal && selectedComplaint && (
        <EditComplaintModal
          complaint={selectedComplaint}
          onClose={() => {
            setShowEditModal(false);
            setSelectedComplaint(null);
          }}
          onSave={handleEditComplaint}
        />
      )}
    </div>
  );
}

function AddComplaintModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (c: Omit<Complaint, 'id' | 'agency_id' | 'created_at' | 'updated_at'>) => void;
}) {
  const [formData, setFormData] = useState({
    number: '',
    complainant_name: '',
    type: '',
    description: '',
    filed_at: new Date().toISOString().split('T')[0],
    status: 'pending' as Complaint['status'],
    assigned_to: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Nouvelle plainte" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Numéro de plainte *</label>
            <input
              type="text"
              required
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="C-2024-001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nom du plaignant *</label>
            <input
              type="text"
              required
              value={formData.complainant_name}
              onChange={(e) => setFormData({ ...formData, complainant_name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Nom complet"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Type de plainte *</label>
            <input
              type="text"
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Vol, Agression, Harcèlement..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Date du dépôt *</label>
            <input
              type="date"
              required
              value={formData.filed_at}
              onChange={(e) => setFormData({ ...formData, filed_at: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description des faits *</label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={5}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                     focus:outline-none focus:border-blue-500 transition-colors resize-none"
            placeholder="Détails de l'incident..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Statut *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Complaint['status'] })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="pending">En attente</option>
              <option value="investigating">En enquête</option>
              <option value="processed">Traitée</option>
              <option value="rejected">Rejetée</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Assigné à</label>
            <input
              type="text"
              value={formData.assigned_to}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Badge ou nom de l'agent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Notes internes</label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                     focus:outline-none focus:border-blue-500 transition-colors resize-none"
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
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Créer la plainte
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ViewComplaintModal({
  complaint,
  onClose,
  onEdit,
  onDelete,
}: {
  complaint: Complaint;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const getStatusBadge = (status: Complaint['status']) => {
    const badges = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock, label: 'En attente' },
      processed: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle, label: 'Traitée' },
      investigating: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Search, label: 'En enquête' },
      rejected: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle, label: 'Rejetée' },
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
    <Modal isOpen={true} onClose={onClose} title="Détails de la plainte" size="lg">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Numéro de plainte</label>
            <p className="text-white font-medium">{complaint.number}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Statut</label>
            {getStatusBadge(complaint.status)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Plaignant</label>
            <p className="text-white font-medium">{complaint.complainant_name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
            <p className="text-white">{complaint.type}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Description des faits</label>
          <p className="text-gray-300 whitespace-pre-wrap bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            {complaint.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Date de dépôt</label>
            <p className="text-white">{new Date(complaint.filed_at).toLocaleDateString('fr-FR')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Assigné à</label>
            <p className="text-white">{complaint.assigned_to || 'Non assigné'}</p>
          </div>
        </div>

        {complaint.notes && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Notes internes</label>
            <p className="text-gray-400 italic">{complaint.notes}</p>
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

function EditComplaintModal({
  complaint,
  onClose,
  onSave,
}: {
  complaint: Complaint;
  onClose: () => void;
  onSave: (c: Complaint) => void;
}) {
  const [formData, setFormData] = useState(complaint);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Modifier la plainte" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Numéro de plainte *</label>
            <input
              type="text"
              required
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nom du plaignant *</label>
            <input
              type="text"
              required
              value={formData.complainant_name}
              onChange={(e) => setFormData({ ...formData, complainant_name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Type de plainte *</label>
            <input
              type="text"
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Date du dépôt *</label>
            <input
              type="date"
              required
              value={formData.filed_at}
              onChange={(e) => setFormData({ ...formData, filed_at: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description des faits *</label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={5}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                     focus:outline-none focus:border-blue-500 transition-colors resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Statut *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Complaint['status'] })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="pending">En attente</option>
              <option value="investigating">En enquête</option>
              <option value="processed">Traitée</option>
              <option value="rejected">Rejetée</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Assigné à</label>
            <input
              type="text"
              value={formData.assigned_to || ''}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
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
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </Modal>
  );
}
