'use client';

import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Send,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

interface SummonsPageContentProps {
  agencyId: string;
  agencyName: string;
}

interface Summons {
  id: string;
  summonsNumber: string;
  summonedPerson: string;
  reason: string;
  dateTime: string;
  location: string;
  status: 'pending' | 'honored' | 'not_honored' | 'cancelled';
  issuedBy: string;
  notes?: string;
}

export function SummonsPageContent({ agencyId, agencyName }: SummonsPageContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [summons, setSummons] = useState<Summons[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSummons, setSelectedSummons] = useState<Summons | null>(null);

  useEffect(() => {
    const storageKey = `summons_${agencyId}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setSummons(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading summons:', error);
      }
    }
  }, [agencyId]);

  useEffect(() => {
    const storageKey = `summons_${agencyId}`;
    localStorage.setItem(storageKey, JSON.stringify(summons));
  }, [summons, agencyId]);

  const filteredSummons = summons.filter(s =>
    s.summonedPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.summonsNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: summons.length,
    pending: summons.filter(s => s.status === 'pending').length,
    honored: summons.filter(s => s.status === 'honored').length,
    notHonored: summons.filter(s => s.status === 'not_honored').length,
  };

  const handleAddSummons = (newSummons: Omit<Summons, 'id'>) => {
    const summonsItem: Summons = {
      ...newSummons,
      id: Date.now().toString(),
    };
    setSummons([...summons, summonsItem]);
    setShowAddModal(false);
  };

  const handleEditSummons = (updatedSummons: Summons) => {
    setSummons(summons.map(s => s.id === updatedSummons.id ? updatedSummons : s));
    setShowEditModal(false);
    setSelectedSummons(null);
  };

  const handleDeleteSummons = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette convocation ?')) {
      setSummons(summons.filter(s => s.id !== id));
      setShowViewModal(false);
      setSelectedSummons(null);
    }
  };

  const getStatusBadge = (status: Summons['status']) => {
    const badges = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock, label: 'À venir' },
      honored: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle, label: 'Honorée' },
      not_honored: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle, label: 'Non honorée' },
      cancelled: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: XCircle, label: 'Annulée' },
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
          <h1 className="text-3xl font-bold text-white">Convocations</h1>
          <p className="text-gray-400">Gestion des convocations judiciaires - {agencyName}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Créer une convocation
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Convocations</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <FileCheck className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">À venir</p>
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
              <p className="text-gray-400 text-sm mb-1">Honorées</p>
              <p className="text-3xl font-bold text-white">{stats.honored}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Non honorées</p>
              <p className="text-3xl font-bold text-white">{stats.notHonored}</p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par numéro, convoqué, motif..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500
                     focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4 text-gray-400 font-semibold">N° Convocation</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Convoqué</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Motif</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Date/Heure</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Statut</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSummons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                        <FileCheck className="w-8 h-8 text-gray-600" />
                      </div>
                      <p className="text-gray-400">
                        {searchQuery ? 'Aucune convocation trouvée' : 'Aucune convocation créée'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSummons.map((summon) => (
                  <tr key={summon.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                    <td className="p-4">
                      <span className="text-white font-medium">{summon.summonsNumber}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-white">{summon.summonedPerson}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-300">{summon.reason}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-400">{new Date(summon.dateTime).toLocaleString('fr-FR')}</span>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(summon.status)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedSummons(summon);
                            setShowViewModal(true);
                          }}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSummons(summon);
                            setShowEditModal(true);
                          }}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteSummons(summon.id)}
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
        <AddSummonsModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddSummons}
        />
      )}

      {showViewModal && selectedSummons && (
        <ViewSummonsModal
          summons={selectedSummons}
          onClose={() => {
            setShowViewModal(false);
            setSelectedSummons(null);
          }}
          onEdit={() => {
            setShowViewModal(false);
            setShowEditModal(true);
          }}
          onDelete={() => handleDeleteSummons(selectedSummons.id)}
        />
      )}

      {showEditModal && selectedSummons && (
        <EditSummonsModal
          summons={selectedSummons}
          onClose={() => {
            setShowEditModal(false);
            setSelectedSummons(null);
          }}
          onSave={handleEditSummons}
        />
      )}
    </div>
  );
}

function AddSummonsModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (summons: Omit<Summons, 'id'>) => void;
}) {
  const [formData, setFormData] = useState({
    summonsNumber: '',
    summonedPerson: '',
    reason: '',
    dateTime: '',
    location: '',
    status: 'pending' as Summons['status'],
    issuedBy: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Créer une convocation" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Numéro *</label>
            <input
              type="text"
              required
              value={formData.summonsNumber}
              onChange={(e) => setFormData({ ...formData, summonsNumber: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="S-2024-001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Convoqué *</label>
            <input
              type="text"
              required
              value={formData.summonedPerson}
              onChange={(e) => setFormData({ ...formData, summonedPerson: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="Nom complet"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Motif *</label>
          <input
            type="text"
            required
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                     focus:outline-none focus:border-purple-500 transition-colors"
            placeholder="Témoignage, Audition..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Date et heure *</label>
            <input
              type="datetime-local"
              required
              value={formData.dateTime}
              onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Lieu *</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="Tribunal, Commissariat..."
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Statut *</label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Summons['status'] })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="pending">À venir</option>
              <option value="honored">Honorée</option>
              <option value="not_honored">Non honorée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Émis par *</label>
            <input
              type="text"
              required
              value={formData.issuedBy}
              onChange={(e) => setFormData({ ...formData, issuedBy: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="Badge ou nom"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
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
            Créer
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ViewSummonsModal({
  summons,
  onClose,
  onEdit,
  onDelete,
}: {
  summons: Summons;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const getStatusBadge = (status: Summons['status']) => {
    const badges = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock, label: 'À venir' },
      honored: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle, label: 'Honorée' },
      not_honored: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle, label: 'Non honorée' },
      cancelled: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: XCircle, label: 'Annulée' },
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
    <Modal isOpen={true} onClose={onClose} title="Détails de la convocation" size="lg">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Numéro</label>
            <p className="text-white font-medium">{summons.summonsNumber}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Statut</label>
            {getStatusBadge(summons.status)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Convoqué</label>
            <p className="text-white font-medium">{summons.summonedPerson}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Motif</label>
            <p className="text-white">{summons.reason}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Date et heure</label>
            <p className="text-white">{new Date(summons.dateTime).toLocaleString('fr-FR')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Lieu</label>
            <p className="text-white">{summons.location}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Émis par</label>
          <p className="text-white">{summons.issuedBy}</p>
        </div>

        {summons.notes && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
            <p className="text-gray-300">{summons.notes}</p>
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

function EditSummonsModal({
  summons,
  onClose,
  onSave,
}: {
  summons: Summons;
  onClose: () => void;
  onSave: (summons: Summons) => void;
}) {
  const [formData, setFormData] = useState(summons);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Modifier la convocation" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Numéro *</label>
            <input
              type="text"
              required
              value={formData.summonsNumber}
              onChange={(e) => setFormData({ ...formData, summonsNumber: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Convoqué *</label>
            <input
              type="text"
              required
              value={formData.summonedPerson}
              onChange={(e) => setFormData({ ...formData, summonedPerson: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Motif *</label>
          <input
            type="text"
            required
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                     focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Date et heure *</label>
            <input
              type="datetime-local"
              required
              value={formData.dateTime}
              onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Lieu *</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Statut *</label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Summons['status'] })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="pending">À venir</option>
              <option value="honored">Honorée</option>
              <option value="not_honored">Non honorée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Émis par *</label>
            <input
              type="text"
              required
              value={formData.issuedBy}
              onChange={(e) => setFormData({ ...formData, issuedBy: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
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
