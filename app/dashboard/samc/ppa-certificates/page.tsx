'use client';

// Page de gestion des Certificats PPA (Port d'Arme) pour SAMC
// Interconnexion avec SASP pour validation
// Créé par Snowzy

import { useState, useMemo } from 'react';
import { useSupabasePPACertificates } from '@/hooks/useSupabasePPACertificates';
import type { PPACertificate, PPACertificateInsert } from '@/lib/supabase/client';
import { Plus, Search, Edit2, Trash2, FileText, Eye, X, Shield, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

type PPAFitness = 'fit' | 'unfit' | 'fit_with_restrictions';
type PPAStatus = 'pending' | 'validated' | 'rejected' | 'expired';

const FITNESS_OPTIONS: { value: PPAFitness; label: string; color: string; icon: any }[] = [
  { value: 'fit', label: 'Apte', color: 'text-success-500 bg-success-500/10', icon: CheckCircle },
  { value: 'unfit', label: 'Inapte', color: 'text-error-500 bg-error-500/10', icon: XCircle },
  { value: 'fit_with_restrictions', label: 'Apte avec restrictions', color: 'text-warning-500 bg-warning-500/10', icon: AlertTriangle },
];

const STATUS_OPTIONS: { value: PPAStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'En attente', color: 'text-warning-500 bg-warning-500/10' },
  { value: 'validated', label: 'Validé', color: 'text-success-500 bg-success-500/10' },
  { value: 'rejected', label: 'Rejeté', color: 'text-error-500 bg-error-500/10' },
  { value: 'expired', label: 'Expiré', color: 'text-gray-500 bg-gray-500/10' },
];

export default function PPACertificatesPage() {
  const { ppaCertificates, loading, error, addPPACertificate, updatePPACertificate, deletePPACertificate } = useSupabasePPACertificates();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterFitness, setFilterFitness] = useState<PPAFitness | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<PPAStatus | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<PPACertificate | null>(null);
  const [formData, setFormData] = useState<Partial<PPACertificateInsert>>({
    certificate_number: '',
    citizen_name: '',
    citizen_id: '',
    doctor: '',
    doctor_id: '',
    fitness: 'fit',
    validity_months: 12,
    expiry_date: '',
    restrictions: '',
    medical_observations: '',
    status: 'pending',
    notes: '',
  });

  const filteredCertificates = useMemo(() => {
    return ppaCertificates.filter((cert) => {
      const matchesSearch =
        cert.citizen_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.certificate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.doctor.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFitness = filterFitness === 'all' || cert.fitness === filterFitness;
      const matchesStatus = filterStatus === 'all' || cert.status === filterStatus;

      return matchesSearch && matchesFitness && matchesStatus;
    });
  }, [ppaCertificates, searchTerm, filterFitness, filterStatus]);

  const stats = useMemo(() => {
    return {
      total: ppaCertificates.length,
      pending: ppaCertificates.filter((c) => c.status === 'pending').length,
      validated: ppaCertificates.filter((c) => c.status === 'validated').length,
      fit: ppaCertificates.filter((c) => c.fitness === 'fit').length,
    };
  }, [ppaCertificates]);

  const resetForm = () => {
    setFormData({
      certificate_number: '',
      citizen_name: '',
      citizen_id: '',
      doctor: '',
      doctor_id: '',
      fitness: 'fit',
      validity_months: 12,
      expiry_date: '',
      restrictions: '',
      medical_observations: '',
      status: 'pending',
      notes: '',
    });
  };

  const calculateExpiryDate = (validityMonths: number): string => {
    const date = new Date();
    date.setMonth(date.getMonth() + validityMonths);
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const certificateData: PPACertificateInsert = {
      ...formData as PPACertificateInsert,
      certificate_number: `PPA-${new Date().getFullYear()}-${String(ppaCertificates.length + 1).padStart(4, '0')}`,
      examination_date: new Date().toISOString(),
      expiry_date: calculateExpiryDate(formData.validity_months || 12),
    };

    const result = await addPPACertificate(certificateData);
    if (result) {
      setShowCreateModal(false);
      resetForm();
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCertificate) return;

    const result = await updatePPACertificate(selectedCertificate.id, formData);
    if (result) {
      setShowEditModal(false);
      setSelectedCertificate(null);
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce certificat PPA ?')) {
      await deletePPACertificate(id);
    }
  };

  const openEditModal = (certificate: PPACertificate) => {
    setSelectedCertificate(certificate);
    setFormData({
      certificate_number: certificate.certificate_number,
      citizen_name: certificate.citizen_name,
      citizen_id: certificate.citizen_id,
      doctor: certificate.doctor,
      doctor_id: certificate.doctor_id,
      fitness: certificate.fitness,
      validity_months: certificate.validity_months,
      expiry_date: certificate.expiry_date,
      restrictions: certificate.restrictions || '',
      medical_observations: certificate.medical_observations || '',
      status: certificate.status,
      notes: certificate.notes || '',
    });
    setShowEditModal(true);
  };

  const getFitnessStyle = (fitness: PPAFitness) => {
    return FITNESS_OPTIONS.find((opt) => opt.value === fitness)?.color || 'text-gray-500 bg-gray-500/10';
  };

  const getFitnessLabel = (fitness: PPAFitness) => {
    return FITNESS_OPTIONS.find((opt) => opt.value === fitness)?.label || fitness;
  };

  const getFitnessIcon = (fitness: PPAFitness) => {
    return FITNESS_OPTIONS.find((opt) => opt.value === fitness)?.icon || Shield;
  };

  const getStatusStyle = (status: PPAStatus) => {
    return STATUS_OPTIONS.find((opt) => opt.value === status)?.color || 'text-gray-500 bg-gray-500/10';
  };

  const getStatusLabel = (status: PPAStatus) => {
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
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-white">Certificats PPA (Port d'Arme)</h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-info-500/10 border border-info-500/30 rounded-lg">
            <Shield className="w-4 h-4 text-info-500" />
            <span className="text-info-500 text-sm font-medium">Interconnecté avec SASP</span>
          </div>
        </div>
        <p className="text-gray-400 mb-6">Certificats médicaux pour le port d'arme - Validation SASP requise</p>

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
                <p className="text-gray-400 text-sm">En attente</p>
                <p className="text-2xl font-bold text-warning-500">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-warning-500" />
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
                <p className="text-gray-400 text-sm">Aptes</p>
                <p className="text-2xl font-bold text-success-500">{stats.fit}</p>
              </div>
              <Shield className="w-8 h-8 text-success-500" />
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
              placeholder="Rechercher par citoyen, numéro, médecin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-agencies-samc-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterFitness}
              onChange={(e) => setFilterFitness(e.target.value as PPAFitness | 'all')}
              className="px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
            >
              <option value="all">Toutes les aptitudes</option>
              {FITNESS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as PPAStatus | 'all')}
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
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Citoyen</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Médecin</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Aptitude</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Expiration</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Statut</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">SASP</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredCertificates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                    Aucun certificat PPA trouvé
                  </td>
                </tr>
              ) : (
                filteredCertificates.map((certificate) => {
                  const FitnessIcon = getFitnessIcon(certificate.fitness);
                  const isExpiringSoon = new Date(certificate.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                  return (
                    <tr key={certificate.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-white font-medium">{certificate.certificate_number}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-white font-medium">{certificate.citizen_name}</div>
                          <div className="text-gray-400 text-sm">ID: {certificate.citizen_id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-white">{certificate.doctor}</div>
                          <div className="text-gray-400 text-sm">ID: {certificate.doctor_id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FitnessIcon className={`w-4 h-4 ${getFitnessStyle(certificate.fitness).split(' ')[0]}`} />
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFitnessStyle(certificate.fitness)}`}>
                            {getFitnessLabel(certificate.fitness)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={isExpiringSoon ? 'text-warning-500' : 'text-gray-300'}>
                          {new Date(certificate.expiry_date).toLocaleDateString('fr-FR')}
                          {isExpiringSoon && (
                            <span className="block text-xs">Expire bientôt</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(certificate.status)}`}>
                          {getStatusLabel(certificate.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {certificate.sasp_validated ? (
                          <div>
                            <div className="flex items-center gap-1 text-success-500 text-sm">
                              <CheckCircle className="w-4 h-4" />
                              <span>Validé</span>
                            </div>
                            {certificate.sasp_validator && (
                              <div className="text-gray-400 text-xs">Par: {certificate.sasp_validator}</div>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm">Non validé</div>
                        )}
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
                  );
                })
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
              <h2 className="text-xl font-bold text-white">Nouveau certificat PPA</h2>
              <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nom du citoyen *</label>
                  <input
                    type="text"
                    required
                    value={formData.citizen_name || ''}
                    onChange={(e) => setFormData({ ...formData, citizen_name: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">ID Citoyen *</label>
                  <input
                    type="text"
                    required
                    value={formData.citizen_id || ''}
                    onChange={(e) => setFormData({ ...formData, citizen_id: e.target.value })}
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">Aptitude *</label>
                  <select
                    required
                    value={formData.fitness || 'fit'}
                    onChange={(e) => setFormData({ ...formData, fitness: e.target.value as PPAFitness })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  >
                    {FITNESS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Validité (mois) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="60"
                    value={formData.validity_months || 12}
                    onChange={(e) => setFormData({ ...formData, validity_months: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Restrictions</label>
                <textarea
                  value={formData.restrictions || ''}
                  onChange={(e) => setFormData({ ...formData, restrictions: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  placeholder="Restrictions éventuelles..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Observations médicales</label>
                <textarea
                  value={formData.medical_observations || ''}
                  onChange={(e) => setFormData({ ...formData, medical_observations: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  placeholder="Observations médicales..."
                />
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
              <h2 className="text-xl font-bold text-white">Modifier le certificat PPA</h2>
              <button onClick={() => { setShowEditModal(false); setSelectedCertificate(null); resetForm(); }} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Aptitude *</label>
                  <select
                    required
                    value={formData.fitness || 'fit'}
                    onChange={(e) => setFormData({ ...formData, fitness: e.target.value as PPAFitness })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  >
                    {FITNESS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Statut *</label>
                  <select
                    required
                    value={formData.status || 'pending'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as PPAStatus })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Restrictions</label>
                <textarea
                  value={formData.restrictions || ''}
                  onChange={(e) => setFormData({ ...formData, restrictions: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Observations médicales</label>
                <textarea
                  value={formData.medical_observations || ''}
                  onChange={(e) => setFormData({ ...formData, medical_observations: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                />
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
              <h2 className="text-xl font-bold text-white">Détails du certificat PPA</h2>
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
                  <p className="text-sm text-gray-400 mb-1">Aptitude</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFitnessStyle(selectedCertificate.fitness)}`}>
                    {getFitnessLabel(selectedCertificate.fitness)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Citoyen</p>
                  <p className="text-white">{selectedCertificate.citizen_name}</p>
                  <p className="text-gray-400 text-sm">ID: {selectedCertificate.citizen_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Médecin</p>
                  <p className="text-white">{selectedCertificate.doctor}</p>
                  <p className="text-gray-400 text-sm">ID: {selectedCertificate.doctor_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Date d'examen</p>
                  <p className="text-white">{new Date(selectedCertificate.examination_date).toLocaleString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Date d'expiration</p>
                  <p className="text-white">{new Date(selectedCertificate.expiry_date).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Validité</p>
                  <p className="text-white">{selectedCertificate.validity_months} mois</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Statut</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(selectedCertificate.status)}`}>
                    {getStatusLabel(selectedCertificate.status)}
                  </span>
                </div>
              </div>

              {selectedCertificate.sasp_validated && (
                <div className="p-4 bg-success-500/10 border border-success-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-success-500" />
                    <p className="text-success-500 font-medium">Validé par SASP</p>
                  </div>
                  {selectedCertificate.sasp_validator && (
                    <p className="text-gray-300 text-sm">Validateur: {selectedCertificate.sasp_validator}</p>
                  )}
                  {selectedCertificate.sasp_validation_date && (
                    <p className="text-gray-400 text-sm">
                      Date: {new Date(selectedCertificate.sasp_validation_date).toLocaleString('fr-FR')}
                    </p>
                  )}
                </div>
              )}

              {selectedCertificate.restrictions && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Restrictions</p>
                  <p className="text-white whitespace-pre-wrap">{selectedCertificate.restrictions}</p>
                </div>
              )}

              {selectedCertificate.medical_observations && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Observations médicales</p>
                  <p className="text-white whitespace-pre-wrap">{selectedCertificate.medical_observations}</p>
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
