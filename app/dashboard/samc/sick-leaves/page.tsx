'use client';

// Page de gestion des Arrêts de travail pour SAMC
// Créé par Snowzy

import { useState, useMemo } from 'react';
import { useSupabaseSickLeaves } from '@/hooks/useSupabaseSickLeaves';
import type { SickLeave, SickLeaveInsert } from '@/lib/supabase/client';
import { Plus, Search, Edit2, Trash2, FileText, Eye, X, Calendar, Activity } from 'lucide-react';

type SickLeaveStatus = 'active' | 'expired' | 'extended';

const STATUS_OPTIONS: { value: SickLeaveStatus; label: string; color: string }[] = [
  { value: 'active', label: 'Actif', color: 'text-success-500 bg-success-500/10' },
  { value: 'expired', label: 'Expiré', color: 'text-gray-500 bg-gray-500/10' },
  { value: 'extended', label: 'Prolongé', color: 'text-warning-500 bg-warning-500/10' },
];

export default function SickLeavesPage() {
  const { sickLeaves, loading, error, addSickLeave, updateSickLeave, deleteSickLeave } = useSupabaseSickLeaves();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<SickLeaveStatus | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSickLeave, setSelectedSickLeave] = useState<SickLeave | null>(null);
  const [formData, setFormData] = useState<Partial<SickLeaveInsert>>({
    sick_leave_number: '',
    patient_name: '',
    patient_id: '',
    doctor: '',
    doctor_id: '',
    start_date: '',
    end_date: '',
    duration_days: 0,
    medical_reason: '',
    certificate_id: undefined,
    status: 'active',
    notes: '',
  });

  const filteredSickLeaves = useMemo(() => {
    return sickLeaves.filter((leave) => {
      const matchesSearch =
        leave.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.sick_leave_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.doctor.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' || leave.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [sickLeaves, searchTerm, filterStatus]);

  const stats = useMemo(() => {
    return {
      total: sickLeaves.length,
      active: sickLeaves.filter((l) => l.status === 'active').length,
      expired: sickLeaves.filter((l) => l.status === 'expired').length,
    };
  }, [sickLeaves]);

  const resetForm = () => {
    setFormData({
      sick_leave_number: '',
      patient_name: '',
      patient_id: '',
      doctor: '',
      doctor_id: '',
      start_date: '',
      end_date: '',
      duration_days: 0,
      medical_reason: '',
      certificate_id: undefined,
      status: 'active',
      notes: '',
    });
  };

  const calculateDuration = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = endDate.getTime() - startDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const duration = calculateDuration(formData.start_date!, formData.end_date!);
    const sickLeaveData: SickLeaveInsert = {
      ...formData as SickLeaveInsert,
      sick_leave_number: `AT-${new Date().getFullYear()}-${String(sickLeaves.length + 1).padStart(4, '0')}`,
      duration_days: duration,
    };

    const result = await addSickLeave(sickLeaveData);
    if (result) {
      setShowCreateModal(false);
      resetForm();
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSickLeave) return;

    const updates = {
      ...formData,
      duration_days: formData.start_date && formData.end_date
        ? calculateDuration(formData.start_date, formData.end_date)
        : formData.duration_days,
    };

    const result = await updateSickLeave(selectedSickLeave.id, updates);
    if (result) {
      setShowEditModal(false);
      setSelectedSickLeave(null);
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet arrêt de travail ?')) {
      await deleteSickLeave(id);
    }
  };

  const openEditModal = (sickLeave: SickLeave) => {
    setSelectedSickLeave(sickLeave);
    setFormData({
      sick_leave_number: sickLeave.sick_leave_number,
      patient_name: sickLeave.patient_name,
      patient_id: sickLeave.patient_id,
      doctor: sickLeave.doctor,
      doctor_id: sickLeave.doctor_id,
      start_date: sickLeave.start_date,
      end_date: sickLeave.end_date,
      duration_days: sickLeave.duration_days,
      medical_reason: sickLeave.medical_reason,
      certificate_id: sickLeave.certificate_id || undefined,
      status: sickLeave.status,
      notes: sickLeave.notes || '',
    });
    setShowEditModal(true);
  };

  const getStatusStyle = (status: SickLeaveStatus) => {
    return STATUS_OPTIONS.find((opt) => opt.value === status)?.color || 'text-gray-500 bg-gray-500/10';
  };

  const getStatusLabel = (status: SickLeaveStatus) => {
    return STATUS_OPTIONS.find((opt) => opt.value === status)?.label || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agencies-samc-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-error-500/10 border border-error-500 rounded-lg">
        <p className="text-error-500">Erreur: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-6">Arrêts de Travail</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="glass-strong p-6 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-agencies-samc-500" />
            </div>
          </div>

          <div className="glass-strong p-6 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Actifs</p>
                <p className="text-2xl font-bold text-success-500">{stats.active}</p>
              </div>
              <Activity className="w-8 h-8 text-success-500" />
            </div>
          </div>

          <div className="glass-strong p-6 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Expirés</p>
                <p className="text-2xl font-bold text-gray-500">{stats.expired}</p>
              </div>
              <Calendar className="w-8 h-8 text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-strong p-4 rounded-lg border border-white/10">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par patient, numéro, médecin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-agencies-samc-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as SickLeaveStatus | 'all')}
              className="px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
            >
              <option value="all">Tous les statuts</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-agencies-samc-500 hover:bg-agencies-samc-600 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nouvel arrêt
            </button>
          </div>
        </div>
      </div>

      <div className="glass-strong rounded-lg border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-200 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Numéro</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Patient</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Médecin</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Début</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Fin</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Durée</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Statut</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredSickLeaves.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                    Aucun arrêt de travail trouvé
                  </td>
                </tr>
              ) : (
                filteredSickLeaves.map((sickLeave) => (
                  <tr key={sickLeave.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-white font-medium">{sickLeave.sick_leave_number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-white font-medium">{sickLeave.patient_name}</div>
                        <div className="text-gray-400 text-sm">ID: {sickLeave.patient_id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-white">{sickLeave.doctor}</div>
                        <div className="text-gray-400 text-sm">ID: {sickLeave.doctor_id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-300">
                        {new Date(sickLeave.start_date).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-300">
                        {new Date(sickLeave.end_date).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-white">{sickLeave.duration_days} jours</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(sickLeave.status)}`}>
                        {getStatusLabel(sickLeave.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedSickLeave(sickLeave);
                            setShowViewModal(true);
                          }}
                          className="text-info-500 hover:text-info-400 transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openEditModal(sickLeave)}
                          className="text-warning-500 hover:text-warning-400 transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(sickLeave.id)}
                          className="text-error-500 hover:text-error-400 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
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

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-strong rounded-lg border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-200 px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Nouvel arrêt de travail</h2>
              <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nom du patient *</label>
                  <input
                    type="text"
                    required
                    value={formData.patient_name || ''}
                    onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">ID Patient *</label>
                  <input
                    type="text"
                    required
                    value={formData.patient_id || ''}
                    onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Médecin *</label>
                  <input
                    type="text"
                    required
                    value={formData.doctor || ''}
                    onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">ID Médecin *</label>
                  <input
                    type="text"
                    required
                    value={formData.doctor_id || ''}
                    onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date de début *</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date || ''}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date de fin *</label>
                  <input
                    type="date"
                    required
                    value={formData.end_date || ''}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Motif médical *</label>
                <textarea
                  required
                  value={formData.medical_reason || ''}
                  onChange={(e) => setFormData({ ...formData, medical_reason: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  placeholder="Motif de l'arrêt de travail..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="px-4 py-2 bg-dark-100 hover:bg-dark-200 text-white rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-agencies-samc-500 hover:bg-agencies-samc-600 text-white rounded-lg transition-colors"
                >
                  Créer l'arrêt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {showEditModal && selectedSickLeave && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-strong rounded-lg border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-200 px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Modifier l'arrêt de travail</h2>
              <button onClick={() => { setShowEditModal(false); setSelectedSickLeave(null); resetForm(); }} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date de fin *</label>
                  <input
                    type="date"
                    required
                    value={formData.end_date || ''}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Statut *</label>
                  <select
                    required
                    value={formData.status || 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as SickLeaveStatus })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Motif médical *</label>
                <textarea
                  required
                  value={formData.medical_reason || ''}
                  onChange={(e) => setFormData({ ...formData, medical_reason: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setSelectedSickLeave(null); resetForm(); }}
                  className="px-4 py-2 bg-dark-100 hover:bg-dark-200 text-white rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-agencies-samc-500 hover:bg-agencies-samc-600 text-white rounded-lg transition-colors"
                >
                  Mettre à jour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de visualisation */}
      {showViewModal && selectedSickLeave && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-strong rounded-lg border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-200 px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Détails de l'arrêt de travail</h2>
              <button onClick={() => { setShowViewModal(false); setSelectedSickLeave(null); }} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Numéro d'arrêt</p>
                  <p className="text-white font-medium">{selectedSickLeave.sick_leave_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Statut</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(selectedSickLeave.status)}`}>
                    {getStatusLabel(selectedSickLeave.status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Patient</p>
                  <p className="text-white">{selectedSickLeave.patient_name}</p>
                  <p className="text-gray-400 text-sm">ID: {selectedSickLeave.patient_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Médecin</p>
                  <p className="text-white">{selectedSickLeave.doctor}</p>
                  <p className="text-gray-400 text-sm">ID: {selectedSickLeave.doctor_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Date de début</p>
                  <p className="text-white">{new Date(selectedSickLeave.start_date).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Date de fin</p>
                  <p className="text-white">{new Date(selectedSickLeave.end_date).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-400 mb-1">Durée</p>
                  <p className="text-white font-medium text-lg">{selectedSickLeave.duration_days} jours</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-1">Motif médical</p>
                <p className="text-white whitespace-pre-wrap">{selectedSickLeave.medical_reason}</p>
              </div>

              {selectedSickLeave.notes && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Notes</p>
                  <p className="text-white whitespace-pre-wrap">{selectedSickLeave.notes}</p>
                </div>
              )}

              <div className="pt-4 border-t border-white/10 text-sm text-gray-400">
                <p>Créé le: {new Date(selectedSickLeave.created_at).toLocaleString('fr-FR')}</p>
                <p>Modifié le: {new Date(selectedSickLeave.updated_at).toLocaleString('fr-FR')}</p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-dark-200 px-6 py-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => { setShowViewModal(false); setSelectedSickLeave(null); }}
                className="px-4 py-2 bg-dark-100 hover:bg-dark-200 text-white rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
