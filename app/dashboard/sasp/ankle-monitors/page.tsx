'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import {
  Search,
  Plus,
  Radio,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Activity,
  X,
  Trash2,
} from 'lucide-react';
import { useSupabaseAnkleMonitors } from '@/hooks/useSupabaseAnkleMonitors';
import type { AnkleMonitor, AnkleMonitorInsert } from '@/lib/supabase/client';

/**
 * Module de gestion des bracelets électroniques
 * Créé par Snowzy
 */

const statusLabels: Record<string, { label: string; color: string; icon: any }> = {
  active: { label: 'Actif', color: 'success', icon: CheckCircle },
  inactive: { label: 'Inactif', color: 'gray', icon: Radio },
  violation: { label: 'Violation', color: 'error', icon: AlertTriangle },
  low_battery: { label: 'Batterie faible', color: 'warning', icon: Activity },
};

export default function AnkleMonitorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingMonitor, setEditingMonitor] = useState<AnkleMonitor | null>(null);
  const [viewingMonitor, setViewingMonitor] = useState<AnkleMonitor | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AnkleMonitorInsert>>({
    citizen_name: '',
    citizen_id: '',
    device_id: '',
    status: 'active',
    assigned_officer: '',
    officer_id: '',
    last_location: '',
    battery_level: 100,
    violations: 0,
  });

  // Hook Supabase
  const { monitors, isLoading, error, addMonitor, updateMonitor, deleteMonitor } = useSupabaseAnkleMonitors();

  const filteredMonitors = monitors.filter((monitor) => {
    const matchesSearch =
      monitor.citizen_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      monitor.monitor_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      monitor.device_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || monitor.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getBatteryColor = (level: number) => {
    if (level >= 50) return 'text-success-500';
    if (level >= 20) return 'text-warning-500';
    return 'text-error-500';
  };

  // Handlers
  const handleCreate = () => {
    setEditingMonitor(null);
    setFormData({
      citizen_name: '',
      citizen_id: '',
      device_id: '',
      status: 'active',
      assigned_officer: '',
      officer_id: '',
      last_location: '',
      battery_level: 100,
      violations: 0,
      monitor_number: '',
      install_date: '',
    });
    setShowModal(true);
  };

  const handleView = (monitor: AnkleMonitor) => {
    setViewingMonitor(monitor);
  };

  const handleEdit = (monitor: AnkleMonitor) => {
    setEditingMonitor(monitor);
    setFormData(monitor);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      const success = await deleteMonitor(deletingId);
      if (success) {
        setShowDeleteConfirm(false);
        setDeletingId(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMonitor) {
      await updateMonitor(editingMonitor.id, formData);
    } else {
      const monitorData: AnkleMonitorInsert = {
        ...formData as AnkleMonitorInsert,
        monitor_number: `AM-${new Date().getFullYear()}-${String(monitors.length + 1).padStart(3, '0')}`,
        install_date: new Date().toISOString(),
      };
      await addMonitor(monitorData);
    }
    setShowModal(false);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Bracelets électroniques</h1>
          <p className="text-gray-400">
            Surveillance et gestion des bracelets de surveillance électronique
          </p>
        </div>
        <Button variant="primary" className="gap-2" onClick={handleCreate}>
          <Plus className="w-4 h-4" />
          Nouveau bracelet
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success-500/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-success-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Actifs</p>
              <p className="text-2xl font-bold text-white">
                {monitors.filter((m) => m.status === 'active').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-error-500/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-error-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Violations</p>
              <p className="text-2xl font-bold text-white">
                {monitors.filter((m) => m.status === 'violation').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warning-500/10 rounded-lg">
              <Activity className="w-6 h-6 text-warning-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Batterie faible</p>
              <p className="text-2xl font-bold text-white">
                {monitors.filter((m) => m.status === 'low_battery').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-500/10 rounded-lg">
              <Radio className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total</p>
              <p className="text-2xl font-bold text-white">{monitors.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un bracelet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
            <option value="violation">Violations</option>
            <option value="low_battery">Batterie faible</option>
          </select>
        </div>
      </Card>

      {/* Monitors List */}
      <div className="space-y-4">
        {filteredMonitors.map((monitor) => {
          const statusInfo = statusLabels[monitor.status];
          const StatusIcon = statusInfo.icon;

          return (
            <Card key={monitor.id} className="p-6 hover:bg-gray-800/30 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Icon */}
                  <div className={`p-3 bg-${statusInfo.color}-500/10 rounded-lg`}>
                    <Radio className={`w-6 h-6 text-${statusInfo.color}-500`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {monitor.citizen_name}
                        </h3>
                        <Badge variant={statusInfo.color as any} className="flex items-center gap-1">
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </Badge>
                        {monitor.violations > 0 && (
                          <Badge variant="error">
                            {monitor.violations} violation{monitor.violations > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{monitor.monitor_number}</span>
                        <span>•</span>
                        <span>Appareil: {monitor.device_id}</span>
                        <span>•</span>
                        <span>{monitor.citizen_id}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Agent responsable</p>
                        <p className="text-white font-medium">
                          {monitor.assigned_officer}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Date d'installation</p>
                        <p className="text-white font-medium">
                          {new Date(monitor.install_date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Dernière position</p>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-primary-500" />
                          <p className="text-white font-medium">
                            {monitor.last_location || 'Inconnue'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400">Batterie</p>
                        <p className={`font-bold ${getBatteryColor(monitor.battery_level)}`}>
                          {monitor.battery_level}%
                        </p>
                      </div>
                    </div>

                    {/* Battery bar */}
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-full rounded-full transition-all ${
                          monitor.battery_level >= 50
                            ? 'bg-success-500'
                            : monitor.battery_level >= 20
                            ? 'bg-warning-500'
                            : 'bg-error-500'
                        }`}
                        style={{ width: `${monitor.battery_level}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <Button variant="secondary" size="sm" className="gap-2">
                    <MapPin className="w-4 h-4" />
                    Localiser
                  </Button>
                  <button
                    onClick={() => handleView(monitor)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Voir les détails"
                  >
                    <Eye className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleEdit(monitor)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(monitor.id)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4 text-error-500" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}

        {filteredMonitors.length === 0 && (
          <Card className="p-12 text-center">
            <Radio className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Aucun bracelet trouvé</p>
          </Card>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 py-8 overflow-y-auto">
          <div className="bg-dark-200 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {editingMonitor ? 'Modifier le bracelet' : 'Nouveau bracelet'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Nom du citoyen *</label>
                  <input
                    type="text"
                    value={formData.citizen_name}
                    onChange={(e) => setFormData({ ...formData, citizen_name: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">ID Citoyen *</label>
                  <input
                    type="text"
                    value={formData.citizen_id}
                    onChange={(e) => setFormData({ ...formData, citizen_id: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">ID Appareil *</label>
                <input
                  type="text"
                  value={formData.device_id}
                  onChange={(e) => setFormData({ ...formData, device_id: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Agent responsable *</label>
                  <input
                    type="text"
                    value={formData.assigned_officer}
                    onChange={(e) => setFormData({ ...formData, assigned_officer: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Matricule *</label>
                  <input
                    type="text"
                    value={formData.officer_id}
                    onChange={(e) => setFormData({ ...formData, officer_id: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Statut *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as AnkleMonitor['status'] })}
                    className="w-full px-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                    <option value="violation">Violation</option>
                    <option value="low_battery">Batterie faible</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Niveau batterie (%) *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.battery_level}
                    onChange={(e) => setFormData({ ...formData, battery_level: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Dernière position</label>
                <input
                  type="text"
                  value={formData.last_location}
                  onChange={(e) => setFormData({ ...formData, last_location: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" variant="primary" className="flex-1">
                  {editingMonitor ? 'Mettre à jour' : 'Créer le bracelet'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="flex-1">
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewingMonitor && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 py-8 overflow-y-auto">
          <div className="bg-dark-200 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Détails du bracelet</h2>
              <button onClick={() => setViewingMonitor(null)} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold text-white">{viewingMonitor.citizen_name}</h3>
                <Badge variant={statusLabels[viewingMonitor.status].color as any}>
                  {statusLabels[viewingMonitor.status].label}
                </Badge>
                {viewingMonitor.violations > 0 && (
                  <Badge variant="error">{viewingMonitor.violations} violations</Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-400">Numéro bracelet</p>
                  <p className="text-lg font-medium text-white">{viewingMonitor.monitor_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">ID Appareil</p>
                  <p className="text-lg font-medium text-white">{viewingMonitor.device_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">ID Citoyen</p>
                  <p className="text-lg font-medium text-white">{viewingMonitor.citizen_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Date d'installation</p>
                  <p className="text-lg font-medium text-white">
                    {new Date(viewingMonitor.install_date).toLocaleString('fr-FR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Agent responsable</p>
                  <p className="text-lg font-medium text-white">
                    {viewingMonitor.assigned_officer} ({viewingMonitor.officer_id})
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Dernière position</p>
                  <p className="text-lg font-medium text-white">{viewingMonitor.last_location || 'Inconnue'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Niveau de batterie</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-full rounded-full ${
                        viewingMonitor.battery_level >= 50
                          ? 'bg-success-500'
                          : viewingMonitor.battery_level >= 20
                          ? 'bg-warning-500'
                          : 'bg-error-500'
                      }`}
                      style={{ width: `${viewingMonitor.battery_level}%` }}
                    />
                  </div>
                  <p className={`text-xl font-bold ${getBatteryColor(viewingMonitor.battery_level)}`}>
                    {viewingMonitor.battery_level}%
                  </p>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <Button
                  variant="primary"
                  onClick={() => {
                    setViewingMonitor(null);
                    handleEdit(viewingMonitor);
                  }}
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </Button>
                <Button variant="ghost" onClick={() => setViewingMonitor(null)}>
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
                Êtes-vous sûr de vouloir supprimer ce bracelet électronique ? Toutes les données seront définitivement perdues.
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
