'use client';

import React, { useState, useEffect } from 'react';
import {
  Radio,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  Users,
  Phone,
  AlertTriangle,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

interface DispatchPageContentProps {
  agencyId: string;
  agencyName: string;
}

interface DispatchCall {
  id: string;
  callNumber: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  location: string;
  assignedUnits: string;
  time: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'cancelled';
  description?: string;
  notes?: string;
}

export function DispatchPageContent({ agencyId, agencyName }: DispatchPageContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [calls, setCalls] = useState<DispatchCall[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCall, setSelectedCall] = useState<DispatchCall | null>(null);

  useEffect(() => {
    const storageKey = `dispatch_${agencyId}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setCalls(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading dispatch calls:', error);
      }
    }
  }, [agencyId]);

  useEffect(() => {
    const storageKey = `dispatch_${agencyId}`;
    localStorage.setItem(storageKey, JSON.stringify(calls));
  }, [calls, agencyId]);

  const filteredCalls = calls.filter(call =>
    call.callNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    call.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    call.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    active: calls.filter(c => c.status === 'in_progress').length,
    pending: calls.filter(c => c.status === 'pending').length,
    inProgress: calls.filter(c => c.status === 'in_progress').length,
    resolved: calls.filter(c => c.status === 'resolved').length,
  };

  const handleAddCall = (newCall: Omit<DispatchCall, 'id'>) => {
    const call: DispatchCall = {
      ...newCall,
      id: Date.now().toString(),
    };
    setCalls([...calls, call]);
    setShowAddModal(false);
  };

  const handleEditCall = (updatedCall: DispatchCall) => {
    setCalls(calls.map(c => c.id === updatedCall.id ? updatedCall : c));
    setShowEditModal(false);
    setSelectedCall(null);
  };

  const handleDeleteCall = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet appel ?')) {
      setCalls(calls.filter(c => c.id !== id));
      setShowViewModal(false);
      setSelectedCall(null);
    }
  };

  const getPriorityBadge = (priority: DispatchCall['priority']) => {
    const badges = {
      low: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: AlertCircle, label: 'Faible' },
      medium: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: AlertCircle, label: 'Moyenne' },
      high: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: AlertTriangle, label: 'Haute' },
      critical: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: AlertTriangle, label: 'Critique' },
    };
    const badge = badges[priority];
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium border ${badge.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {badge.label}
      </span>
    );
  };

  const getStatusBadge = (status: DispatchCall['status']) => {
    const badges = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock, label: 'En attente' },
      in_progress: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Users, label: 'En cours' },
      resolved: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle, label: 'Résolu' },
      cancelled: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: AlertCircle, label: 'Annulé' },
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
          <h1 className="text-3xl font-bold text-white">Dispatch</h1>
          <p className="text-gray-400">Centre de répartition des appels - {agencyName}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouvel appel
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Appels actifs</p>
              <p className="text-3xl font-bold text-white">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Phone className="w-6 h-6 text-orange-400" />
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
              <p className="text-gray-400 text-sm mb-1">En cours</p>
              <p className="text-3xl font-bold text-white">{stats.inProgress}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Résolus</p>
              <p className="text-3xl font-bold text-white">{stats.resolved}</p>
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
            placeholder="Rechercher par numéro d'appel, localisation, type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500
                     focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4 text-gray-400 font-semibold">N° Appel</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Priorité</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Type</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Localisation</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Unités assignées</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Heure</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Statut</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCalls.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                        <Radio className="w-8 h-8 text-gray-600" />
                      </div>
                      <p className="text-gray-400">
                        {searchQuery ? 'Aucun appel trouvé' : 'Aucun appel actif'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCalls.map((call) => (
                  <tr key={call.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                    <td className="p-4">
                      <span className="text-white font-medium">{call.callNumber}</span>
                    </td>
                    <td className="p-4">
                      {getPriorityBadge(call.priority)}
                    </td>
                    <td className="p-4">
                      <span className="text-gray-300">{call.type}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">{call.location}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-400">{call.assignedUnits || 'Non assigné'}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-400">{call.time}</span>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(call.status)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedCall(call);
                            setShowViewModal(true);
                          }}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCall(call);
                            setShowEditModal(true);
                          }}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteCall(call.id)}
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
        <AddCallModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddCall}
        />
      )}

      {showViewModal && selectedCall && (
        <ViewCallModal
          call={selectedCall}
          onClose={() => {
            setShowViewModal(false);
            setSelectedCall(null);
          }}
          onEdit={() => {
            setShowViewModal(false);
            setShowEditModal(true);
          }}
          onDelete={() => handleDeleteCall(selectedCall.id)}
        />
      )}

      {showEditModal && selectedCall && (
        <EditCallModal
          call={selectedCall}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCall(null);
          }}
          onSave={handleEditCall}
        />
      )}
    </div>
  );
}

function AddCallModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (call: Omit<DispatchCall, 'id'>) => void;
}) {
  const [formData, setFormData] = useState({
    callNumber: '',
    priority: 'medium' as DispatchCall['priority'],
    type: '',
    location: '',
    assignedUnits: '',
    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    status: 'pending' as DispatchCall['status'],
    description: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Créer un nouvel appel" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">N° Appel *</label>
            <input
              type="text"
              required
              value={formData.callNumber}
              onChange={(e) => setFormData({ ...formData, callNumber: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="CALL-2024-001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Priorité *</label>
            <select
              required
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as DispatchCall['priority'] })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-orange-500 transition-colors"
            >
              <option value="low">Faible</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
              <option value="critical">Critique</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Type d'appel *</label>
            <input
              type="text"
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="Accident, Vol, Assistance..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Localisation *</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="123 Main Street"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Unités assignées</label>
            <input
              type="text"
              value={formData.assignedUnits}
              onChange={(e) => setFormData({ ...formData, assignedUnits: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="UNIT-01, UNIT-02"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Statut *</label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as DispatchCall['status'] })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-orange-500 transition-colors"
            >
              <option value="pending">En attente</option>
              <option value="in_progress">En cours</option>
              <option value="resolved">Résolu</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                     focus:outline-none focus:border-orange-500 transition-colors resize-none"
            placeholder="Description détaillée de l'appel..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                     focus:outline-none focus:border-orange-500 transition-colors resize-none"
            placeholder="Notes additionnelles..."
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
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
          >
            Créer
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ViewCallModal({
  call,
  onClose,
  onEdit,
  onDelete,
}: {
  call: DispatchCall;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const getPriorityBadge = (priority: DispatchCall['priority']) => {
    const badges = {
      low: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: AlertCircle, label: 'Faible' },
      medium: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: AlertCircle, label: 'Moyenne' },
      high: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: AlertTriangle, label: 'Haute' },
      critical: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: AlertTriangle, label: 'Critique' },
    };
    const badge = badges[priority];
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium border ${badge.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {badge.label}
      </span>
    );
  };

  const getStatusBadge = (status: DispatchCall['status']) => {
    const badges = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock, label: 'En attente' },
      in_progress: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Users, label: 'En cours' },
      resolved: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle, label: 'Résolu' },
      cancelled: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: AlertCircle, label: 'Annulé' },
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
    <Modal isOpen={true} onClose={onClose} title="Détails de l'appel" size="lg">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">N° Appel</label>
            <p className="text-white font-medium">{call.callNumber}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Priorité</label>
            {getPriorityBadge(call.priority)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
            <p className="text-white">{call.type}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Heure</label>
            <p className="text-white">{call.time}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Localisation</label>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <p className="text-white">{call.location}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Unités assignées</label>
            <p className="text-white">{call.assignedUnits || 'Non assigné'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Statut</label>
            {getStatusBadge(call.status)}
          </div>
        </div>

        {call.description && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
            <p className="text-gray-300">{call.description}</p>
          </div>
        )}

        {call.notes && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
            <p className="text-gray-300">{call.notes}</p>
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

function EditCallModal({
  call,
  onClose,
  onSave,
}: {
  call: DispatchCall;
  onClose: () => void;
  onSave: (call: DispatchCall) => void;
}) {
  const [formData, setFormData] = useState(call);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Modifier l'appel" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">N° Appel *</label>
            <input
              type="text"
              required
              value={formData.callNumber}
              onChange={(e) => setFormData({ ...formData, callNumber: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Priorité *</label>
            <select
              required
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as DispatchCall['priority'] })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-orange-500 transition-colors"
            >
              <option value="low">Faible</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
              <option value="critical">Critique</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Type d'appel *</label>
            <input
              type="text"
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Localisation *</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Unités assignées</label>
            <input
              type="text"
              value={formData.assignedUnits}
              onChange={(e) => setFormData({ ...formData, assignedUnits: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Statut *</label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as DispatchCall['status'] })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                       focus:outline-none focus:border-orange-500 transition-colors"
            >
              <option value="pending">En attente</option>
              <option value="in_progress">En cours</option>
              <option value="resolved">Résolu</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                     focus:outline-none focus:border-orange-500 transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                     focus:outline-none focus:border-orange-500 transition-colors resize-none"
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
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </Modal>
  );
}
