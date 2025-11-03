'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import {
  Search,
  Plus,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Edit,
  Download,
  X,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useSupabaseFines } from '@/hooks/useSupabaseFines';
import type { Fine, FineInsert } from '@/lib/supabase/client';

/**
 * Module de gestion des amendes
 * Créé par Snowzy
 */

const statusLabels: Record<string, { label: string; color: string; icon: any }> = {
  unpaid: { label: 'Non payée', color: 'warning', icon: Clock },
  paid: { label: 'Payée', color: 'success', icon: CheckCircle },
  overdue: { label: 'En retard', color: 'error', icon: XCircle },
  cancelled: { label: 'Annulée', color: 'gray', icon: XCircle },
};

export default function FinesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingFine, setEditingFine] = useState<Fine | null>(null);
  const [viewingFine, setViewingFine] = useState<Fine | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Fine>>({
    citizen_name: '',
    citizen_id: '',
    violation: '',
    amount: 0,
    issued_by: '',
    officer_id: '',
    status: 'unpaid',
  });

  const { fines, isLoading, error, addFine, updateFine, deleteFine } = useSupabaseFines();

  const filteredFines = fines.filter((fine) => {
    const matchesSearch =
      fine.citizen_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine.fine_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine.violation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || fine.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalUnpaid = fines
    .filter((f) => f.status === 'unpaid' || f.status === 'overdue')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalCollected = fines
    .filter((f) => f.status === 'paid')
    .reduce((sum, f) => sum + f.amount, 0);

  // Handlers
  const handleCreate = () => {
    setEditingFine(null);
    setFormData({
      citizen_name: '',
      citizen_id: '',
      violation: '',
      amount: 0,
      issued_by: '',
      officer_id: '',
      status: 'unpaid',
    });
    setShowModal(true);
  };

  const handleView = (fine: Fine) => {
    setViewingFine(fine);
  };

  const handleEdit = (fine: Fine) => {
    setEditingFine(fine);
    setFormData(fine);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      await deleteFine(deletingId);
      setShowDeleteConfirm(false);
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    if (editingFine) {
      await updateFine(editingFine.id, formData);
    } else {
      const fineData: FineInsert = {
        ...formData as FineInsert,
        fine_number: `FINE-${new Date().getFullYear()}-${String(fines.length + 1).padStart(3, '0')}`,
        date: now.toISOString(),
        due_date: dueDate.toISOString().split('T')[0],
      };
      await addFine(fineData);
    }
    setShowModal(false);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Amendes</h1>
          <p className="text-gray-400">
            Gestion et suivi des amendes et contraventions
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </Button>
          <Button variant="primary" className="gap-2" onClick={handleCreate}>
            <Plus className="w-4 h-4" />
            Nouvelle amende
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warning-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-warning-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Non payées</p>
              <p className="text-2xl font-bold text-white">
                {fines.filter((f) => f.status === 'unpaid').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success-500/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-success-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Payées</p>
              <p className="text-2xl font-bold text-white">
                {fines.filter((f) => f.status === 'paid').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-error-500/10 rounded-lg">
              <XCircle className="w-6 h-6 text-error-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">En retard</p>
              <p className="text-2xl font-bold text-white">
                {fines.filter((f) => f.status === 'overdue').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-500/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total collecté</p>
              <p className="text-2xl font-bold text-white">
                ${totalCollected.toLocaleString()}
              </p>
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
              placeholder="Rechercher une amende..."
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
            <option value="unpaid">Non payées</option>
            <option value="paid">Payées</option>
            <option value="overdue">En retard</option>
            <option value="cancelled">Annulées</option>
          </select>
        </div>
      </Card>

      {/* Fines List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Numéro
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Citoyen
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Infraction
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Montant
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Date émission
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Date limite
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
              {filteredFines.map((fine) => {
                const statusInfo = statusLabels[fine.status];
                const StatusIcon = statusInfo.icon;

                return (
                  <tr
                    key={fine.id}
                    className="border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-white font-medium">{fine.fine_number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{fine.citizen_name}</p>
                        <p className="text-sm text-gray-400">{fine.citizen_id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300 max-w-xs">{fine.violation}</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Par {fine.issued_by}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-warning-500 font-bold text-lg">
                        ${fine.amount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">
                        {new Date(fine.date).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">
                        {new Date(fine.due_date).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={statusInfo.color as any}
                        className="flex items-center gap-1 w-fit"
                      >
                        <StatusIcon className="w-4 h-4" />
                        {statusInfo.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(fine)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleEdit(fine)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(fine.id)}
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

          {filteredFines.length === 0 && (
            <div className="p-12 text-center">
              <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Aucune amende trouvée</p>
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
                {editingFine ? 'Modifier l\'amende' : 'Nouvelle amende'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Nom du citoyen *
                  </label>
                  <input
                    type="text"
                    value={formData.citizen_name}
                    onChange={(e) => setFormData({ ...formData, citizen_name: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    ID Citoyen *
                  </label>
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
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Infraction *
                </label>
                <textarea
                  value={formData.violation}
                  onChange={(e) => setFormData({ ...formData, violation: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 h-24 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Montant ($) *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Agent émetteur *
                  </label>
                  <input
                    type="text"
                    value={formData.issued_by}
                    onChange={(e) => setFormData({ ...formData, issued_by: e.target.value })}
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
                  Statut *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Fine['status'] })}
                  className="w-full px-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="unpaid">Non payée</option>
                  <option value="paid">Payée</option>
                  <option value="overdue">En retard</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" variant="primary" className="flex-1">
                  {editingFine ? 'Mettre à jour' : 'Créer l\'amende'}
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
      {viewingFine && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 py-8 overflow-y-auto">
          <div className="bg-dark-200 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Détails de l'amende</h2>
              <button
                onClick={() => setViewingFine(null)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold text-white">{viewingFine.citizen_name}</h3>
                <Badge variant={statusLabels[viewingFine.status].color as any} className="flex items-center gap-1">
                  {React.createElement(statusLabels[viewingFine.status].icon, { className: 'w-4 h-4' })}
                  {statusLabels[viewingFine.status].label}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-400">Numéro d'amende</p>
                  <p className="text-lg font-medium text-white">{viewingFine.fine_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">ID Citoyen</p>
                  <p className="text-lg font-medium text-white">{viewingFine.citizen_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Montant</p>
                  <p className="text-lg font-bold text-warning-500">${viewingFine.amount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Date d'émission</p>
                  <p className="text-lg font-medium text-white">
                    {new Date(viewingFine.date).toLocaleString('fr-FR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Date limite</p>
                  <p className="text-lg font-medium text-white">
                    {new Date(viewingFine.due_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                {viewingFine.payment_date && (
                  <div>
                    <p className="text-sm text-gray-400">Date de paiement</p>
                    <p className="text-lg font-medium text-success-500">
                      {new Date(viewingFine.payment_date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-sm text-gray-400 mb-2">Infraction</p>
                  <p className="text-white leading-relaxed">{viewingFine.violation}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Agent émetteur</p>
                  <p className="text-lg font-medium text-white">
                    {viewingFine.issued_by} ({viewingFine.officer_id})
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <Button
                  variant="primary"
                  onClick={() => {
                    setViewingFine(null);
                    handleEdit(viewingFine);
                  }}
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </Button>
                <Button variant="ghost" onClick={() => setViewingFine(null)}>
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
                Êtes-vous sûr de vouloir supprimer cette amende ? Toutes les données seront
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
