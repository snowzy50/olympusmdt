'use client';

// Page de gestion des Interventions médicales pour SAMC
// Créé par Snowzy

import { useState, useMemo } from 'react';
import { useSupabaseInterventions } from '@/hooks/useSupabaseInterventions';
import type { Intervention, InterventionInsert } from '@/lib/supabase/client';
import {
  Plus,
  Search,
  Filter,
  X,
  FileText,
  Edit2,
  Trash2,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  Clock,
  Ambulance,
  Building2,
  UserPlus,
  Eye
} from 'lucide-react';

type InterventionType = 'emergency' | 'hospitalization' | 'visit' | 'consultation' | 'transport';
type InterventionStatus = 'in_progress' | 'completed' | 'cancelled';

const TYPE_OPTIONS: { value: InterventionType; label: string; icon: any }[] = [
  { value: 'emergency', label: 'Urgence', icon: AlertCircle },
  { value: 'hospitalization', label: 'Hospitalisation', icon: Building2 },
  { value: 'visit', label: 'Visite', icon: UserPlus },
  { value: 'consultation', label: 'Consultation', icon: Stethoscope },
  { value: 'transport', label: 'Transport', icon: Ambulance },
];

const STATUS_OPTIONS: { value: InterventionStatus; label: string; color: string }[] = [
  { value: 'in_progress', label: 'En cours', color: 'text-warning-500 bg-warning-500/10' },
  { value: 'completed', label: 'Terminée', color: 'text-success-500 bg-success-500/10' },
  { value: 'cancelled', label: 'Annulée', color: 'text-error-500 bg-error-500/10' },
];

export default function InterventionsPage() {
  const { interventions, loading, error, addIntervention, updateIntervention, deleteIntervention } = useSupabaseInterventions();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<InterventionType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<InterventionStatus | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);
  const [formData, setFormData] = useState<Partial<InterventionInsert>>({
    intervention_number: '',
    type: 'emergency',
    patient_name: '',
    patient_id: '',
    practitioner: '',
    practitioner_id: '',
    location: '',
    diagnosis: '',
    treatment: '',
    notes: '',
    status: 'in_progress',
  });

  // Filtrer les interventions
  const filteredInterventions = useMemo(() => {
    return interventions.filter((intervention) => {
      const matchesSearch =
        intervention.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intervention.intervention_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intervention.practitioner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intervention.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'all' || intervention.type === filterType;
      const matchesStatus = filterStatus === 'all' || intervention.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [interventions, searchTerm, filterType, filterStatus]);

  // Statistiques
  const stats = useMemo(() => {
    return {
      total: interventions.length,
      inProgress: interventions.filter((i) => i.status === 'in_progress').length,
      completed: interventions.filter((i) => i.status === 'completed').length,
      emergency: interventions.filter((i) => i.type === 'emergency').length,
    };
  }, [interventions]);

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      intervention_number: '',
      type: 'emergency',
      patient_name: '',
      patient_id: '',
      practitioner: '',
      practitioner_id: '',
      location: '',
      diagnosis: '',
      treatment: '',
      notes: '',
      status: 'in_progress',
    });
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const interventionData: InterventionInsert = {
      ...formData as InterventionInsert,
      intervention_number: `INT-${new Date().getFullYear()}-${String(interventions.length + 1).padStart(4, '0')}`,
      date: new Date().toISOString(),
    };

    const result = await addIntervention(interventionData);

    if (result) {
      setShowCreateModal(false);
      resetForm();
    }
  };

  // Mettre à jour une intervention
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedIntervention) return;

    const result = await updateIntervention(selectedIntervention.id, formData);

    if (result) {
      setShowEditModal(false);
      setSelectedIntervention(null);
      resetForm();
    }
  };

  // Supprimer une intervention
  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette intervention ?')) {
      await deleteIntervention(id);
    }
  };

  // Ouvrir la modal d'édition
  const openEditModal = (intervention: Intervention) => {
    setSelectedIntervention(intervention);
    setFormData({
      intervention_number: intervention.intervention_number,
      type: intervention.type,
      patient_name: intervention.patient_name,
      patient_id: intervention.patient_id,
      practitioner: intervention.practitioner,
      practitioner_id: intervention.practitioner_id,
      location: intervention.location,
      diagnosis: intervention.diagnosis || '',
      treatment: intervention.treatment || '',
      notes: intervention.notes || '',
      status: intervention.status,
    });
    setShowEditModal(true);
  };

  // Ouvrir la modal de visualisation
  const openViewModal = (intervention: Intervention) => {
    setSelectedIntervention(intervention);
    setShowViewModal(true);
  };

  // Obtenir l'icône du type
  const getTypeIcon = (type: InterventionType) => {
    const option = TYPE_OPTIONS.find((opt) => opt.value === type);
    return option ? option.icon : FileText;
  };

  // Obtenir le label du type
  const getTypeLabel = (type: InterventionType) => {
    const option = TYPE_OPTIONS.find((opt) => opt.value === type);
    return option?.label || type;
  };

  // Obtenir le style du statut
  const getStatusStyle = (status: InterventionStatus) => {
    const option = STATUS_OPTIONS.find((opt) => opt.value === status);
    return option?.color || 'text-gray-500 bg-gray-500/10';
  };

  // Obtenir le label du statut
  const getStatusLabel = (status: InterventionStatus) => {
    const option = STATUS_OPTIONS.find((opt) => opt.value === status);
    return option?.label || status;
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
      {/* En-tête et statistiques */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-6">Interventions Médicales</h1>

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
                <p className="text-gray-400 text-sm">En cours</p>
                <p className="text-2xl font-bold text-warning-500">{stats.inProgress}</p>
              </div>
              <Clock className="w-8 h-8 text-warning-500" />
            </div>
          </div>

          <div className="glass-strong p-6 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Terminées</p>
                <p className="text-2xl font-bold text-success-500">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success-500" />
            </div>
          </div>

          <div className="glass-strong p-6 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Urgences</p>
                <p className="text-2xl font-bold text-error-500">{stats.emergency}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-error-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Barre d'actions */}
      <div className="glass-strong p-4 rounded-lg border border-white/10">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par patient, numéro, praticien..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-agencies-samc-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as InterventionType | 'all')}
              className="px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
            >
              <option value="all">Tous les types</option>
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as InterventionStatus | 'all')}
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
              Nouvelle intervention
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des interventions */}
      <div className="glass-strong rounded-lg border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-200 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Numéro
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Praticien
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Lieu
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredInterventions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                    Aucune intervention trouvée
                  </td>
                </tr>
              ) : (
                filteredInterventions.map((intervention) => {
                  const TypeIcon = getTypeIcon(intervention.type);
                  return (
                    <tr key={intervention.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-white font-medium">{intervention.intervention_number}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="w-4 h-4 text-agencies-samc-500" />
                          <span className="text-gray-300">{getTypeLabel(intervention.type)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-white font-medium">{intervention.patient_name}</div>
                          <div className="text-gray-400 text-sm">ID: {intervention.patient_id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-white">{intervention.practitioner}</div>
                          <div className="text-gray-400 text-sm">ID: {intervention.practitioner_id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-300">{intervention.location}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-300">
                          {new Date(intervention.date).toLocaleString('fr-FR')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(intervention.status)}`}>
                          {getStatusLabel(intervention.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openViewModal(intervention)}
                            className="text-info-500 hover:text-info-400 transition-colors"
                            title="Voir les détails"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openEditModal(intervention)}
                            className="text-warning-500 hover:text-warning-400 transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(intervention.id)}
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
              <h2 className="text-xl font-bold text-white">Nouvelle intervention</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type d'intervention *
                  </label>
                  <select
                    required
                    value={formData.type || 'emergency'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as InterventionType })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  >
                    {TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Statut *
                  </label>
                  <select
                    required
                    value={formData.status || 'in_progress'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as InterventionStatus })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom du patient *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.patient_name || ''}
                    onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ID Patient *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.patient_id || ''}
                    onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                    placeholder="P-12345"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Praticien *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.practitioner || ''}
                    onChange={(e) => setFormData({ ...formData, practitioner: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                    placeholder="Dr. Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ID Praticien *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.practitioner_id || ''}
                    onChange={(e) => setFormData({ ...formData, practitioner_id: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                    placeholder="D-12345"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Lieu *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  placeholder="Hôpital Central, Salle 102"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Diagnostic
                </label>
                <textarea
                  value={formData.diagnosis || ''}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  placeholder="Diagnostic médical..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Traitement
                </label>
                <textarea
                  value={formData.treatment || ''}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  placeholder="Traitement administré..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  placeholder="Notes additionnelles..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-dark-100 hover:bg-dark-200 text-white rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-agencies-samc-500 hover:bg-agencies-samc-600 text-white rounded-lg transition-colors"
                >
                  Créer l'intervention
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {showEditModal && selectedIntervention && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-strong rounded-lg border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-200 px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Modifier l'intervention</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedIntervention(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type d'intervention *
                  </label>
                  <select
                    required
                    value={formData.type || 'emergency'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as InterventionType })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  >
                    {TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Statut *
                  </label>
                  <select
                    required
                    value={formData.status || 'in_progress'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as InterventionStatus })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom du patient *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.patient_name || ''}
                    onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ID Patient *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.patient_id || ''}
                    onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Praticien *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.practitioner || ''}
                    onChange={(e) => setFormData({ ...formData, practitioner: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ID Praticien *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.practitioner_id || ''}
                    onChange={(e) => setFormData({ ...formData, practitioner_id: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Lieu *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Diagnostic
                </label>
                <textarea
                  value={formData.diagnosis || ''}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Traitement
                </label>
                <textarea
                  value={formData.treatment || ''}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes
                </label>
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
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedIntervention(null);
                    resetForm();
                  }}
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
      {showViewModal && selectedIntervention && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-strong rounded-lg border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-200 px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Détails de l'intervention</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedIntervention(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Numéro d'intervention</p>
                  <p className="text-white font-medium">{selectedIntervention.intervention_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Type</p>
                  <p className="text-white">{getTypeLabel(selectedIntervention.type)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Patient</p>
                  <p className="text-white">{selectedIntervention.patient_name}</p>
                  <p className="text-gray-400 text-sm">ID: {selectedIntervention.patient_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Praticien</p>
                  <p className="text-white">{selectedIntervention.practitioner}</p>
                  <p className="text-gray-400 text-sm">ID: {selectedIntervention.practitioner_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Date</p>
                  <p className="text-white">{new Date(selectedIntervention.date).toLocaleString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Statut</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(selectedIntervention.status)}`}>
                    {getStatusLabel(selectedIntervention.status)}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-1">Lieu</p>
                <p className="text-white">{selectedIntervention.location}</p>
              </div>

              {selectedIntervention.diagnosis && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Diagnostic</p>
                  <p className="text-white whitespace-pre-wrap">{selectedIntervention.diagnosis}</p>
                </div>
              )}

              {selectedIntervention.treatment && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Traitement</p>
                  <p className="text-white whitespace-pre-wrap">{selectedIntervention.treatment}</p>
                </div>
              )}

              {selectedIntervention.notes && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Notes</p>
                  <p className="text-white whitespace-pre-wrap">{selectedIntervention.notes}</p>
                </div>
              )}

              <div className="pt-4 border-t border-white/10 text-sm text-gray-400">
                <p>Créé le: {new Date(selectedIntervention.created_at).toLocaleString('fr-FR')}</p>
                <p>Modifié le: {new Date(selectedIntervention.updated_at).toLocaleString('fr-FR')}</p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-dark-200 px-6 py-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedIntervention(null);
                }}
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
