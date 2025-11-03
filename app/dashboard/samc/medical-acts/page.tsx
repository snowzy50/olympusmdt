'use client';

import React, { useState, useMemo } from 'react';
import { useSupabaseMedicalActs } from '@/hooks/useSupabaseMedicalActs';
import type { MedicalActInsert, MedicalActUpdate } from '@/lib/supabase/client';
import {
  Activity,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  X,
  CheckCircle,
  DollarSign,
  Calendar,
  User
} from 'lucide-react';

export default function MedicalActsPage() {
  const { medicalActs, loading, createMedicalAct, updateMedicalAct, deleteMedicalAct } = useSupabaseMedicalActs();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAct, setSelectedAct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actTypeFilter, setActTypeFilter] = useState<string>('all');

  const [formData, setFormData] = useState<Partial<MedicalActInsert>>({
    act_number: '',
    act_date: '',
    act_type: 'consultation',
    patient_name: '',
    patient_id: '',
    doctor: '',
    doctor_id: '',
    description: '',
    duration_minutes: undefined,
    billing_code: '',
    billing_amount: undefined,
    billing_paid: false,
    complications: '',
    notes: '',
  });

  // Statistiques
  const stats = useMemo(() => {
    const total = medicalActs.length;
    const consultations = medicalActs.filter(a => a.act_type === 'consultation').length;
    const surgeries = medicalActs.filter(a => a.act_type === 'surgery').length;
    const totalRevenue = medicalActs
      .filter(a => a.billing_paid)
      .reduce((sum, a) => sum + (a.billing_amount || 0), 0);

    return { total, consultations, surgeries, totalRevenue };
  }, [medicalActs]);

  // Filtrage et recherche
  const filteredActs = useMemo(() => {
    return medicalActs.filter(act => {
      const matchesSearch =
        act.act_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.doctor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = actTypeFilter === 'all' || act.act_type === actTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [medicalActs, searchTerm, actTypeFilter]);

  const resetForm = () => {
    setFormData({
      act_number: '',
      act_date: '',
      act_type: 'consultation',
      patient_name: '',
      patient_id: '',
      doctor: '',
      doctor_id: '',
      description: '',
      duration_minutes: undefined,
      billing_code: '',
      billing_amount: undefined,
      billing_paid: false,
      complications: '',
      notes: '',
    });
  };

  const handleCreate = () => {
    setShowCreateModal(true);
    resetForm();
  };

  const handleEdit = (act: any) => {
    setSelectedAct(act);
    setFormData({
      act_number: act.act_number || '',
      act_date: act.act_date || '',
      act_type: act.act_type || 'consultation',
      patient_name: act.patient_name || '',
      patient_id: act.patient_id || '',
      doctor: act.doctor || '',
      doctor_id: act.doctor_id || '',
      description: act.description || '',
      duration_minutes: act.duration_minutes || undefined,
      billing_code: act.billing_code || '',
      billing_amount: act.billing_amount || undefined,
      billing_paid: act.billing_paid || false,
      complications: act.complications || '',
      notes: act.notes || '',
    });
    setShowEditModal(true);
  };

  const handleView = (act: any) => {
    setSelectedAct(act);
    setShowViewModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet acte médical ?')) {
      await deleteMedicalAct(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const actData: MedicalActInsert = {
      ...formData as MedicalActInsert,
      act_number: formData.act_number || `ACT-${new Date().getFullYear()}-${String(medicalActs.length + 1).padStart(4, '0')}`,
    };

    await createMedicalAct(actData);
    setShowCreateModal(false);
    resetForm();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAct) return;

    const updateData: MedicalActUpdate = formData;
    await updateMedicalAct(selectedAct.id, updateData);
    setShowEditModal(false);
    setSelectedAct(null);
    resetForm();
  };

  const getActTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'text-info-500 bg-info-500/10 border-info-500/30';
      case 'surgery': return 'text-error-500 bg-error-500/10 border-error-500/30';
      case 'emergency': return 'text-warning-500 bg-warning-500/10 border-warning-500/30';
      case 'vaccination': return 'text-success-500 bg-success-500/10 border-success-500/30';
      case 'imaging': return 'text-agencies-samc-500 bg-agencies-samc-500/10 border-agencies-samc-500/30';
      case 'lab_test': return 'text-purple-500 bg-purple-500/10 border-purple-500/30';
      case 'other': return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getActTypeLabel = (type: string) => {
    switch (type) {
      case 'consultation': return 'Consultation';
      case 'surgery': return 'Chirurgie';
      case 'emergency': return 'Urgence';
      case 'vaccination': return 'Vaccination';
      case 'imaging': return 'Imagerie';
      case 'lab_test': return 'Analyse';
      case 'other': return 'Autre';
      default: return type;
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Actes médicaux</h1>
          <p className="text-gray-400">Gestion et facturation des actes médicaux</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-agencies-samc-500 hover:bg-agencies-samc-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouvel Acte
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-strong p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total des actes</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="p-3 bg-agencies-samc-500/10 rounded-lg">
              <Activity className="w-6 h-6 text-agencies-samc-500" />
            </div>
          </div>
        </div>

        <div className="glass-strong p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Consultations</p>
              <p className="text-3xl font-bold text-info-500">{stats.consultations}</p>
            </div>
            <div className="p-3 bg-info-500/10 rounded-lg">
              <User className="w-6 h-6 text-info-500" />
            </div>
          </div>
        </div>

        <div className="glass-strong p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Chirurgies</p>
              <p className="text-3xl font-bold text-error-500">{stats.surgeries}</p>
            </div>
            <div className="p-3 bg-error-500/10 rounded-lg">
              <Activity className="w-6 h-6 text-error-500" />
            </div>
          </div>
        </div>

        <div className="glass-strong p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Revenus facturés</p>
              <p className="text-3xl font-bold text-success-500">${stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-success-500/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-success-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="glass-strong p-4 rounded-xl border border-white/10 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par numéro, patient, médecin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-agencies-samc-500"
          />
        </div>

        <select
          value={actTypeFilter}
          onChange={(e) => setActTypeFilter(e.target.value)}
          className="px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
        >
          <option value="all">Tous les types</option>
          <option value="consultation">Consultation</option>
          <option value="surgery">Chirurgie</option>
          <option value="emergency">Urgence</option>
          <option value="vaccination">Vaccination</option>
          <option value="imaging">Imagerie</option>
          <option value="lab_test">Analyse</option>
          <option value="other">Autre</option>
        </select>
      </div>

      {/* Tableau des actes */}
      <div className="glass-strong rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Numéro</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Patient</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Médecin</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Durée</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Facturation</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                    Chargement...
                  </td>
                </tr>
              ) : filteredActs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                    Aucun acte trouvé
                  </td>
                </tr>
              ) : (
                filteredActs.map((act) => (
                  <tr key={act.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-white">{act.act_number}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {new Date(act.act_date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium ${getActTypeColor(act.act_type)}`}>
                        {getActTypeLabel(act.act_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      <div>
                        <div className="text-white">{act.patient_name}</div>
                        <div className="text-xs text-gray-500 font-mono">{act.patient_id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {act.doctor}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {act.duration_minutes ? `${act.duration_minutes} min` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {act.billing_amount ? (
                        <div>
                          <div className={`text-sm font-medium ${act.billing_paid ? 'text-success-500' : 'text-warning-500'}`}>
                            ${act.billing_amount.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {act.billing_paid ? 'Payé' : 'En attente'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(act)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-info-500"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(act)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-agencies-samc-500"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(act.id)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-error-500"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Modal Création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-200 rounded-xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-200 border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Nouvel Acte Médical</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Numéro d&apos;acte
                  </label>
                  <input
                    type="text"
                    value={formData.act_number}
                    onChange={(e) => setFormData({ ...formData, act_number: e.target.value })}
                    placeholder="Auto-généré si vide"
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date de l&apos;acte *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.act_date}
                    onChange={(e) => setFormData({ ...formData, act_date: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type d&apos;acte *
                  </label>
                  <select
                    required
                    value={formData.act_type}
                    onChange={(e) => setFormData({ ...formData, act_type: e.target.value as any })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  >
                    <option value="consultation">Consultation</option>
                    <option value="surgery">Chirurgie</option>
                    <option value="emergency">Urgence</option>
                    <option value="vaccination">Vaccination</option>
                    <option value="imaging">Imagerie</option>
                    <option value="lab_test">Analyse</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Durée (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.duration_minutes || ''}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Ex: 30"
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom du patient *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.patient_name}
                    onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                    placeholder="Prénom Nom"
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ID du patient *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.patient_id}
                    onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                    placeholder="Ex: P123456"
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Médecin responsable *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.doctor}
                    onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                    placeholder="Dr. Prénom Nom"
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ID du médecin
                  </label>
                  <input
                    type="text"
                    value={formData.doctor_id}
                    onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                    placeholder="Ex: M123456"
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Code de facturation
                  </label>
                  <input
                    type="text"
                    value={formData.billing_code}
                    onChange={(e) => setFormData({ ...formData, billing_code: e.target.value })}
                    placeholder="Ex: CONS-001"
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Montant facturé ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.billing_amount || ''}
                    onChange={(e) => setFormData({ ...formData, billing_amount: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="Ex: 150.00"
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="billing_paid"
                  checked={formData.billing_paid || false}
                  onChange={(e) => setFormData({ ...formData, billing_paid: e.target.checked })}
                  className="w-4 h-4 rounded border-white/10 bg-dark-100 text-agencies-samc-500"
                />
                <label htmlFor="billing_paid" className="text-sm text-gray-300">
                  Facturation payée
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description de l&apos;acte *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrivez l'acte médical effectué..."
                  rows={4}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-agencies-samc-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Complications éventuelles
                </label>
                <textarea
                  value={formData.complications}
                  onChange={(e) => setFormData({ ...formData, complications: e.target.value })}
                  placeholder="Complications survenues pendant ou après l'acte..."
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-agencies-samc-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes additionnelles
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Informations supplémentaires..."
                  rows={2}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-agencies-samc-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-dark-100 hover:bg-dark-300 text-white rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-agencies-samc-500 hover:bg-agencies-samc-600 text-white rounded-lg transition-colors"
                >
                  Créer l&apos;acte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Édition */}
      {showEditModal && selectedAct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-200 rounded-xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-200 border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Modifier l&apos;Acte Médical</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedAct(null);
                  resetForm();
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Numéro d&apos;acte
                  </label>
                  <input
                    type="text"
                    value={formData.act_number}
                    onChange={(e) => setFormData({ ...formData, act_number: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date de l&apos;acte
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.act_date}
                    onChange={(e) => setFormData({ ...formData, act_date: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type d&apos;acte
                  </label>
                  <select
                    value={formData.act_type}
                    onChange={(e) => setFormData({ ...formData, act_type: e.target.value as any })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  >
                    <option value="consultation">Consultation</option>
                    <option value="surgery">Chirurgie</option>
                    <option value="emergency">Urgence</option>
                    <option value="vaccination">Vaccination</option>
                    <option value="imaging">Imagerie</option>
                    <option value="lab_test">Analyse</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Durée (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.duration_minutes || ''}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom du patient
                  </label>
                  <input
                    type="text"
                    value={formData.patient_name}
                    onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ID du patient
                  </label>
                  <input
                    type="text"
                    value={formData.patient_id}
                    onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Médecin responsable
                  </label>
                  <input
                    type="text"
                    value={formData.doctor}
                    onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ID du médecin
                  </label>
                  <input
                    type="text"
                    value={formData.doctor_id}
                    onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Code de facturation
                  </label>
                  <input
                    type="text"
                    value={formData.billing_code}
                    onChange={(e) => setFormData({ ...formData, billing_code: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Montant facturé ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.billing_amount || ''}
                    onChange={(e) => setFormData({ ...formData, billing_amount: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="billing_paid_edit"
                  checked={formData.billing_paid || false}
                  onChange={(e) => setFormData({ ...formData, billing_paid: e.target.checked })}
                  className="w-4 h-4 rounded border-white/10 bg-dark-100 text-agencies-samc-500"
                />
                <label htmlFor="billing_paid_edit" className="text-sm text-gray-300">
                  Facturation payée
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description de l&apos;acte
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Complications éventuelles
                </label>
                <textarea
                  value={formData.complications}
                  onChange={(e) => setFormData({ ...formData, complications: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes additionnelles
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedAct(null);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-dark-100 hover:bg-dark-300 text-white rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-agencies-samc-500 hover:bg-agencies-samc-600 text-white rounded-lg transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Visualisation */}
      {showViewModal && selectedAct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-200 rounded-xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-200 border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Détails de l&apos;Acte Médical</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedAct(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Numéro d&apos;acte</p>
                  <p className="text-white font-mono">{selectedAct.act_number}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Date</p>
                  <p className="text-white">
                    {new Date(selectedAct.act_date).toLocaleString('fr-FR')}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Type</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium ${getActTypeColor(selectedAct.act_type)}`}>
                    {getActTypeLabel(selectedAct.act_type)}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Durée</p>
                  <p className="text-white">
                    {selectedAct.duration_minutes ? `${selectedAct.duration_minutes} minutes` : '-'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Patient</p>
                  <p className="text-white">{selectedAct.patient_name}</p>
                  <p className="text-gray-500 text-sm font-mono">{selectedAct.patient_id}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Médecin</p>
                  <p className="text-white">{selectedAct.doctor}</p>
                  {selectedAct.doctor_id && (
                    <p className="text-gray-500 text-sm font-mono">{selectedAct.doctor_id}</p>
                  )}
                </div>

                {selectedAct.billing_code && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Code de facturation</p>
                    <p className="text-white font-mono">{selectedAct.billing_code}</p>
                  </div>
                )}

                {selectedAct.billing_amount && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Montant</p>
                    <div>
                      <p className="text-white font-semibold">${selectedAct.billing_amount.toLocaleString()}</p>
                      <span className={`inline-flex items-center gap-1 mt-1 px-2 py-1 rounded-lg border text-xs font-medium ${selectedAct.billing_paid ? 'text-success-500 bg-success-500/10 border-success-500/30' : 'text-warning-500 bg-warning-500/10 border-warning-500/30'}`}>
                        {selectedAct.billing_paid ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            Payé
                          </>
                        ) : (
                          <>
                            <Calendar className="w-3 h-3" />
                            En attente
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Description</p>
                  <p className="text-white whitespace-pre-wrap">{selectedAct.description}</p>
                </div>

                {selectedAct.complications && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Complications</p>
                    <p className="text-white whitespace-pre-wrap">{selectedAct.complications}</p>
                  </div>
                )}

                {selectedAct.notes && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Notes</p>
                    <p className="text-white whitespace-pre-wrap">{selectedAct.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedAct(null);
                  }}
                  className="px-4 py-2 bg-dark-100 hover:bg-dark-300 text-white rounded-lg transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
