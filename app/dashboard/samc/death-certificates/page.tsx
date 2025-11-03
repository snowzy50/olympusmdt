'use client';

// Page de gestion des Certificats de Décès pour SAMC
// Créé par Snowzy

import { useState, useMemo } from 'react';
import { useSupabaseDeathCertificates } from '@/hooks/useSupabaseDeathCertificates';
import type { DeathCertificate, DeathCertificateInsert } from '@/lib/supabase/client';
import { Plus, Search, Edit2, Trash2, FileText, Eye, X, AlertCircle, CheckCircle, Archive } from 'lucide-react';

type DeathCertificateStatus = 'draft' | 'validated' | 'archived';

const STATUS_OPTIONS: { value: DeathCertificateStatus; label: string; color: string }[] = [
  { value: 'draft', label: 'Brouillon', color: 'text-warning-500 bg-warning-500/10' },
  { value: 'validated', label: 'Validé', color: 'text-success-500 bg-success-500/10' },
  { value: 'archived', label: 'Archivé', color: 'text-gray-500 bg-gray-500/10' },
];

export default function DeathCertificatesPage() {
  const { deathCertificates, loading, error, createDeathCertificate, updateDeathCertificate, deleteDeathCertificate } = useSupabaseDeathCertificates();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<DeathCertificateStatus | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<DeathCertificate | null>(null);
  const [formData, setFormData] = useState<Partial<DeathCertificateInsert>>({
    certificate_number: '',
    deceased_name: '',
    deceased_id: '',
    date_of_death: '',
    location_of_death: '',
    doctor: '',
    doctor_id: '',
    cause_of_death: '',
    circumstances: '',
    autopsy_required: false,
    status: 'draft',
    notes: '',
  });

  const filteredCertificates = useMemo(() => {
    return deathCertificates.filter((cert) => {
      const matchesSearch =
        cert.deceased_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.certificate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.doctor.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' || cert.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [deathCertificates, searchTerm, filterStatus]);

  const stats = useMemo(() => {
    return {
      total: deathCertificates.length,
      draft: deathCertificates.filter((c) => c.status === 'draft').length,
      validated: deathCertificates.filter((c) => c.status === 'validated').length,
      autopsy: deathCertificates.filter((c) => c.autopsy_required).length,
    };
  }, [deathCertificates]);

  const resetForm = () => {
    setFormData({
      certificate_number: '',
      deceased_name: '',
      deceased_id: '',
      date_of_death: '',
      location_of_death: '',
      doctor: '',
      doctor_id: '',
      cause_of_death: '',
      circumstances: '',
      autopsy_required: false,
      status: 'draft',
      notes: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const certificateData: DeathCertificateInsert = {
      ...formData as DeathCertificateInsert,
      certificate_number: `DC-${new Date().getFullYear()}-${String(deathCertificates.length + 1).padStart(4, '0')}`,
      date_of_death: formData.date_of_death || new Date().toISOString(),
    };

    const result = await createDeathCertificate(certificateData);
    if (result) {
      setShowCreateModal(false);
      resetForm();
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCertificate) return;

    const result = await updateDeathCertificate(selectedCertificate.id, formData);
    if (result) {
      setShowEditModal(false);
      setSelectedCertificate(null);
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce certificat de décès ?')) {
      await deleteDeathCertificate(id);
    }
  };

  const openEditModal = (certificate: DeathCertificate) => {
    setSelectedCertificate(certificate);
    setFormData({
      certificate_number: certificate.certificate_number,
      deceased_name: certificate.deceased_name,
      deceased_id: certificate.deceased_id,
      date_of_death: certificate.date_of_death.split('T')[0],
      location_of_death: certificate.location_of_death,
      doctor: certificate.doctor,
      doctor_id: certificate.doctor_id,
      cause_of_death: certificate.cause_of_death,
      circumstances: certificate.circumstances || '',
      autopsy_required: certificate.autopsy_required,
      status: certificate.status,
      notes: certificate.notes || '',
    });
    setShowEditModal(true);
  };

  const getStatusStyle = (status: DeathCertificateStatus) => {
    return STATUS_OPTIONS.find((opt) => opt.value === status)?.color || 'text-gray-500 bg-gray-500/10';
  };

  const getStatusLabel = (status: DeathCertificateStatus) => {
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
        <h1 className="text-3xl font-bold text-white mb-6">Certificats de Décès</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                <p className="text-gray-400 text-sm">Brouillons</p>
                <p className="text-2xl font-bold text-warning-500">{stats.draft}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-warning-500" />
            </div>
          </div>

          <div className="glass-strong p-6 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Validés</p>
                <p className="text-2xl font-bold text-success-500">{stats.validated}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success-500" />
            </div>
          </div>

          <div className="glass-strong p-6 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Autopsies</p>
                <p className="text-2xl font-bold text-error-500">{stats.autopsy}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-error-500" />
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
              placeholder="Rechercher par défunt, numéro, médecin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-agencies-samc-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as DeathCertificateStatus | 'all')}
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
              Nouveau certificat
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
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Défunt(e)</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Date décès</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Lieu</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Médecin</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Autopsie</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Statut</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredCertificates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                    Aucun certificat de décès trouvé
                  </td>
                </tr>
              ) : (
                filteredCertificates.map((certificate) => (
                  <tr key={certificate.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-white font-medium">{certificate.certificate_number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-white font-medium">{certificate.deceased_name}</div>
                        <div className="text-gray-400 text-sm">ID: {certificate.deceased_id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-300">
                        {new Date(certificate.date_of_death).toLocaleString('fr-FR')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">{certificate.location_of_death}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-white">{certificate.doctor}</div>
                        <div className="text-gray-400 text-sm">ID: {certificate.doctor_id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {certificate.autopsy_required ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-error-500 bg-error-500/10">
                          Requise
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Non</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(certificate.status)}`}>
                        {getStatusLabel(certificate.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedCertificate(certificate);
                            setShowViewModal(true);
                          }}
                          className="text-info-500 hover:text-info-400 transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openEditModal(certificate)}
                          className="text-warning-500 hover:text-warning-400 transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(certificate.id)}
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
              <h2 className="text-xl font-bold text-white">Nouveau certificat de décès</h2>
              <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nom du défunt(e) *</label>
                  <input
                    type="text"
                    required
                    value={formData.deceased_name || ''}
                    onChange={(e) => setFormData({ ...formData, deceased_name: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">ID Défunt(e) *</label>
                  <input
                    type="text"
                    required
                    value={formData.deceased_id || ''}
                    onChange={(e) => setFormData({ ...formData, deceased_id: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date et heure du décès *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.date_of_death || ''}
                    onChange={(e) => setFormData({ ...formData, date_of_death: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Lieu du décès *</label>
                  <input
                    type="text"
                    required
                    value={formData.location_of_death || ''}
                    onChange={(e) => setFormData({ ...formData, location_of_death: e.target.value })}
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Cause du décès *</label>
                <textarea
                  required
                  value={formData.cause_of_death || ''}
                  onChange={(e) => setFormData({ ...formData, cause_of_death: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Circonstances</label>
                <textarea
                  value={formData.circumstances || ''}
                  onChange={(e) => setFormData({ ...formData, circumstances: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autopsy_required"
                  checked={formData.autopsy_required || false}
                  onChange={(e) => setFormData({ ...formData, autopsy_required: e.target.checked })}
                  className="w-4 h-4 rounded border-white/10 bg-dark-100 text-agencies-samc-500"
                />
                <label htmlFor="autopsy_required" className="text-sm text-gray-300">
                  Autopsie requise
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
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
                  Créer le certificat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {showEditModal && selectedCertificate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-strong rounded-lg border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-200 px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Modifier le certificat</h2>
              <button onClick={() => { setShowEditModal(false); setSelectedCertificate(null); resetForm(); }} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Statut *</label>
                <select
                  required
                  value={formData.status || 'draft'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as DeathCertificateStatus })}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Cause du décès *</label>
                <textarea
                  required
                  value={formData.cause_of_death || ''}
                  onChange={(e) => setFormData({ ...formData, cause_of_death: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Circonstances</label>
                <textarea
                  value={formData.circumstances || ''}
                  onChange={(e) => setFormData({ ...formData, circumstances: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autopsy_required_edit"
                  checked={formData.autopsy_required || false}
                  onChange={(e) => setFormData({ ...formData, autopsy_required: e.target.checked })}
                  className="w-4 h-4 rounded border-white/10 bg-dark-100 text-agencies-samc-500"
                />
                <label htmlFor="autopsy_required_edit" className="text-sm text-gray-300">
                  Autopsie requise
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setSelectedCertificate(null); resetForm(); }}
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
      {showViewModal && selectedCertificate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-strong rounded-lg border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-200 px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Certificat de décès</h2>
              <button onClick={() => { setShowViewModal(false); setSelectedCertificate(null); }} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Numéro de certificat</p>
                  <p className="text-white font-medium">{selectedCertificate.certificate_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Statut</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(selectedCertificate.status)}`}>
                    {getStatusLabel(selectedCertificate.status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Défunt(e)</p>
                  <p className="text-white">{selectedCertificate.deceased_name}</p>
                  <p className="text-gray-400 text-sm">ID: {selectedCertificate.deceased_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Date et heure du décès</p>
                  <p className="text-white">{new Date(selectedCertificate.date_of_death).toLocaleString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Lieu du décès</p>
                  <p className="text-white">{selectedCertificate.location_of_death}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Médecin</p>
                  <p className="text-white">{selectedCertificate.doctor}</p>
                  <p className="text-gray-400 text-sm">ID: {selectedCertificate.doctor_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Autopsie requise</p>
                  {selectedCertificate.autopsy_required ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-error-500 bg-error-500/10">
                      Oui - Requise
                    </span>
                  ) : (
                    <span className="text-white">Non</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-1">Cause du décès</p>
                <p className="text-white whitespace-pre-wrap">{selectedCertificate.cause_of_death}</p>
              </div>

              {selectedCertificate.circumstances && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Circonstances</p>
                  <p className="text-white whitespace-pre-wrap">{selectedCertificate.circumstances}</p>
                </div>
              )}

              {selectedCertificate.notes && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Notes</p>
                  <p className="text-white whitespace-pre-wrap">{selectedCertificate.notes}</p>
                </div>
              )}

              <div className="pt-4 border-t border-white/10 text-sm text-gray-400">
                <p>Créé le: {new Date(selectedCertificate.created_at).toLocaleString('fr-FR')}</p>
                <p>Modifié le: {new Date(selectedCertificate.updated_at).toLocaleString('fr-FR')}</p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-dark-200 px-6 py-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => { setShowViewModal(false); setSelectedCertificate(null); }}
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
