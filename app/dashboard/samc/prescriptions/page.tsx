'use client';

// Page de gestion des Prescriptions médicales pour SAMC
// Créé par Snowzy

import { useState, useMemo } from 'react';
import { useSupabasePrescriptions } from '@/hooks/useSupabasePrescriptions';
import type { Prescription, PrescriptionInsert } from '@/lib/supabase/client';
import { Plus, Search, Edit2, Trash2, FileText, Eye, X, Pill, Activity } from 'lucide-react';

type PrescriptionStatus = 'active' | 'completed' | 'cancelled';

const STATUS_OPTIONS: { value: PrescriptionStatus; label: string; color: string }[] = [
  { value: 'active', label: 'Active', color: 'text-success-500 bg-success-500/10' },
  { value: 'completed', label: 'Terminée', color: 'text-gray-500 bg-gray-500/10' },
  { value: 'cancelled', label: 'Annulée', color: 'text-error-500 bg-error-500/10' },
];

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

export default function PrescriptionsPage() {
  const { prescriptions, loading, error, addPrescription, updatePrescription, deletePrescription } = useSupabasePrescriptions();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<PrescriptionStatus | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [medications, setMedications] = useState<Medication[]>([{ name: '', dosage: '', frequency: '' }]);
  const [formData, setFormData] = useState<Partial<PrescriptionInsert>>({
    prescription_number: '',
    patient_name: '',
    patient_id: '',
    doctor: '',
    doctor_id: '',
    medications: [],
    posology: '',
    treatment_duration: '',
    refills_allowed: 0,
    notes: '',
    status: 'active',
  });

  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((prescription) => {
      const matchesSearch =
        prescription.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.prescription_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.doctor.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' || prescription.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [prescriptions, searchTerm, filterStatus]);

  const stats = useMemo(() => {
    return {
      total: prescriptions.length,
      active: prescriptions.filter((p) => p.status === 'active').length,
      completed: prescriptions.filter((p) => p.status === 'completed').length,
    };
  }, [prescriptions]);

  const resetForm = () => {
    setFormData({
      prescription_number: '',
      patient_name: '',
      patient_id: '',
      doctor: '',
      doctor_id: '',
      medications: [],
      posology: '',
      treatment_duration: '',
      refills_allowed: 0,
      notes: '',
      status: 'active',
    });
    setMedications([{ name: '', dosage: '', frequency: '' }]);
  };

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '' }]);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const newMedications = [...medications];
    newMedications[index][field] = value;
    setMedications(newMedications);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prescriptionData: PrescriptionInsert = {
      ...formData as PrescriptionInsert,
      prescription_number: `RX-${new Date().getFullYear()}-${String(prescriptions.length + 1).padStart(4, '0')}`,
      medications: medications as any,
      date: new Date().toISOString(),
    };

    const result = await addPrescription(prescriptionData);
    if (result) {
      setShowCreateModal(false);
      resetForm();
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrescription) return;

    const updates = {
      ...formData,
      medications: medications as any,
    };

    const result = await updatePrescription(selectedPrescription.id, updates);
    if (result) {
      setShowEditModal(false);
      setSelectedPrescription(null);
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette prescription ?')) {
      await deletePrescription(id);
    }
  };

  const openEditModal = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setFormData({
      prescription_number: prescription.prescription_number,
      patient_name: prescription.patient_name,
      patient_id: prescription.patient_id,
      doctor: prescription.doctor,
      doctor_id: prescription.doctor_id,
      medications: prescription.medications,
      posology: prescription.posology,
      treatment_duration: prescription.treatment_duration,
      refills_allowed: prescription.refills_allowed,
      notes: prescription.notes || '',
      status: prescription.status,
    });
    setMedications(prescription.medications as Medication[]);
    setShowEditModal(true);
  };

  const getStatusStyle = (status: PrescriptionStatus) => {
    return STATUS_OPTIONS.find((opt) => opt.value === status)?.color || 'text-gray-500 bg-gray-500/10';
  };

  const getStatusLabel = (status: PrescriptionStatus) => {
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
        <h1 className="text-3xl font-bold text-white mb-6">Prescriptions Médicales</h1>

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
                <p className="text-gray-400 text-sm">Actives</p>
                <p className="text-2xl font-bold text-success-500">{stats.active}</p>
              </div>
              <Activity className="w-8 h-8 text-success-500" />
            </div>
          </div>

          <div className="glass-strong p-6 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Terminées</p>
                <p className="text-2xl font-bold text-gray-500">{stats.completed}</p>
              </div>
              <Pill className="w-8 h-8 text-gray-500" />
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
              onChange={(e) => setFilterStatus(e.target.value as PrescriptionStatus | 'all')}
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
              Nouvelle prescription
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
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Durée</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Statut</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredPrescriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    Aucune prescription trouvée
                  </td>
                </tr>
              ) : (
                filteredPrescriptions.map((prescription) => (
                  <tr key={prescription.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-white font-medium">{prescription.prescription_number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-white font-medium">{prescription.patient_name}</div>
                        <div className="text-gray-400 text-sm">ID: {prescription.patient_id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-white">{prescription.doctor}</div>
                        <div className="text-gray-400 text-sm">ID: {prescription.doctor_id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-300">
                        {new Date(prescription.date).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-300">{prescription.treatment_duration}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(prescription.status)}`}>
                        {getStatusLabel(prescription.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedPrescription(prescription);
                            setShowViewModal(true);
                          }}
                          className="text-info-500 hover:text-info-400 transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openEditModal(prescription)}
                          className="text-warning-500 hover:text-warning-400 transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(prescription.id)}
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
          <div className="glass-strong rounded-lg border border-white/10 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-200 px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Nouvelle prescription</h2>
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">Durée du traitement *</label>
                  <input
                    type="text"
                    required
                    value={formData.treatment_duration || ''}
                    onChange={(e) => setFormData({ ...formData, treatment_duration: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                    placeholder="Ex: 7 jours, 2 semaines"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Renouvellements autorisés</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.refills_allowed || 0}
                    onChange={(e) => setFormData({ ...formData, refills_allowed: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Posologie *</label>
                <textarea
                  required
                  value={formData.posology || ''}
                  onChange={(e) => setFormData({ ...formData, posology: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  placeholder="Instructions de prise des médicaments..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">Médicaments *</label>
                  <button
                    type="button"
                    onClick={addMedication}
                    className="text-agencies-samc-500 hover:text-agencies-samc-400 text-sm"
                  >
                    + Ajouter un médicament
                  </button>
                </div>
                {medications.map((med, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                    <input
                      type="text"
                      required
                      placeholder="Nom du médicament"
                      value={med.name}
                      onChange={(e) => updateMedication(index, 'name', e.target.value)}
                      className="px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Dosage"
                      value={med.dosage}
                      onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                      className="px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Fréquence"
                        value={med.frequency}
                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                        className="flex-1 px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                      />
                      {medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedication(index)}
                          className="px-3 py-2 bg-error-500/10 text-error-500 rounded-lg hover:bg-error-500/20"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
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
                  Créer la prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'édition - Similaire à la création */}
      {showEditModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-strong rounded-lg border border-white/10 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-200 px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Modifier la prescription</h2>
              <button onClick={() => { setShowEditModal(false); setSelectedPrescription(null); resetForm(); }} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Statut *</label>
                  <select
                    required
                    value={formData.status || 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as PrescriptionStatus })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Renouvellements autorisés</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.refills_allowed || 0}
                    onChange={(e) => setFormData({ ...formData, refills_allowed: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Posologie *</label>
                <textarea
                  required
                  value={formData.posology || ''}
                  onChange={(e) => setFormData({ ...formData, posology: e.target.value })}
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
                  onClick={() => { setShowEditModal(false); setSelectedPrescription(null); resetForm(); }}
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
      {showViewModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-strong rounded-lg border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-200 px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Détails de la prescription</h2>
              <button onClick={() => { setShowViewModal(false); setSelectedPrescription(null); }} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Numéro de prescription</p>
                  <p className="text-white font-medium">{selectedPrescription.prescription_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Statut</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(selectedPrescription.status)}`}>
                    {getStatusLabel(selectedPrescription.status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Patient</p>
                  <p className="text-white">{selectedPrescription.patient_name}</p>
                  <p className="text-gray-400 text-sm">ID: {selectedPrescription.patient_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Médecin</p>
                  <p className="text-white">{selectedPrescription.doctor}</p>
                  <p className="text-gray-400 text-sm">ID: {selectedPrescription.doctor_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Date</p>
                  <p className="text-white">{new Date(selectedPrescription.date).toLocaleString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Durée du traitement</p>
                  <p className="text-white">{selectedPrescription.treatment_duration}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Renouvellements</p>
                  <p className="text-white">{selectedPrescription.refills_allowed}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-2">Médicaments prescrits</p>
                <div className="space-y-2">
                  {(selectedPrescription.medications as Medication[]).map((med, index) => (
                    <div key={index} className="p-3 bg-dark-100 rounded-lg">
                      <p className="text-white font-medium">{med.name}</p>
                      <p className="text-gray-400 text-sm">Dosage: {med.dosage}</p>
                      <p className="text-gray-400 text-sm">Fréquence: {med.frequency}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-1">Posologie</p>
                <p className="text-white whitespace-pre-wrap">{selectedPrescription.posology}</p>
              </div>

              {selectedPrescription.notes && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Notes</p>
                  <p className="text-white whitespace-pre-wrap">{selectedPrescription.notes}</p>
                </div>
              )}

              <div className="pt-4 border-t border-white/10 text-sm text-gray-400">
                <p>Créé le: {new Date(selectedPrescription.created_at).toLocaleString('fr-FR')}</p>
                <p>Modifié le: {new Date(selectedPrescription.updated_at).toLocaleString('fr-FR')}</p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-dark-200 px-6 py-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => { setShowViewModal(false); setSelectedPrescription(null); }}
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
