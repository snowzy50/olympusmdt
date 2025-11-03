'use client';

import React, { useState, useMemo } from 'react';
import { useSupabaseIncidentReports } from '@/hooks/useSupabaseIncidentReports';
import type { IncidentReportInsert, IncidentReportUpdate } from '@/lib/supabase/client';
import {
  AlertTriangle,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  X,
  CheckCircle,
  Clock,
  Activity,
  Shield
} from 'lucide-react';

export default function IncidentReportsPage() {
  const { incidentReports, loading, createIncidentReport, updateIncidentReport, deleteIncidentReport } = useSupabaseIncidentReports();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const [formData, setFormData] = useState<Partial<IncidentReportInsert>>({
    report_number: '',
    incident_date: '',
    incident_location: '',
    incident_type: 'medical_error',
    severity: 'moderate',
    description: '',
    staff_involved: '',
    witnesses: '',
    immediate_actions: '',
    corrective_actions: '',
    status: 'investigating',
    reporter: '',
    reporter_id: '',
    notes: '',
  });

  // Statistiques
  const stats = useMemo(() => {
    const total = incidentReports.length;
    const investigating = incidentReports.filter(r => r.status === 'investigating').length;
    const critical = incidentReports.filter(r => r.severity === 'critical').length;
    const closed = incidentReports.filter(r => r.status === 'closed').length;

    return { total, investigating, critical, closed };
  }, [incidentReports]);

  // Filtrage et recherche
  const filteredReports = useMemo(() => {
    return incidentReports.filter(report => {
      const matchesSearch =
        report.report_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.incident_location?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      const matchesSeverity = severityFilter === 'all' || report.severity === severityFilter;

      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [incidentReports, searchTerm, statusFilter, severityFilter]);

  const resetForm = () => {
    setFormData({
      report_number: '',
      incident_date: '',
      incident_location: '',
      incident_type: 'medical_error',
      severity: 'moderate',
      description: '',
      staff_involved: '',
      witnesses: '',
      immediate_actions: '',
      corrective_actions: '',
      status: 'investigating',
      reporter: '',
      reporter_id: '',
      notes: '',
    });
  };

  const handleCreate = () => {
    setShowCreateModal(true);
    resetForm();
  };

  const handleEdit = (report: any) => {
    setSelectedReport(report);
    setFormData({
      report_number: report.report_number || '',
      incident_date: report.incident_date || '',
      incident_location: report.incident_location || '',
      incident_type: report.incident_type || 'medical_error',
      severity: report.severity || 'moderate',
      description: report.description || '',
      staff_involved: report.staff_involved || '',
      witnesses: report.witnesses || '',
      immediate_actions: report.immediate_actions || '',
      corrective_actions: report.corrective_actions || '',
      status: report.status || 'investigating',
      reporter: report.reporter || '',
      reporter_id: report.reporter_id || '',
      notes: report.notes || '',
    });
    setShowEditModal(true);
  };

  const handleView = (report: any) => {
    setSelectedReport(report);
    setShowViewModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
      await deleteIncidentReport(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const reportData: IncidentReportInsert = {
      ...formData as IncidentReportInsert,
      report_number: formData.report_number || `RI-${new Date().getFullYear()}-${String(incidentReports.length + 1).padStart(4, '0')}`,
    };

    await createIncidentReport(reportData);
    setShowCreateModal(false);
    resetForm();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReport) return;

    const updateData: IncidentReportUpdate = formData;
    await updateIncidentReport(selectedReport.id, updateData);
    setShowEditModal(false);
    setSelectedReport(null);
    resetForm();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-error-500 bg-error-500/10 border-error-500/30';
      case 'severe': return 'text-warning-500 bg-warning-500/10 border-warning-500/30';
      case 'moderate': return 'text-info-500 bg-info-500/10 border-info-500/30';
      case 'minor': return 'text-success-500 bg-success-500/10 border-success-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Critique';
      case 'severe': return 'Sévère';
      case 'moderate': return 'Modéré';
      case 'minor': return 'Mineur';
      default: return severity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'investigating': return 'text-warning-500 bg-warning-500/10 border-warning-500/30';
      case 'pending_review': return 'text-info-500 bg-info-500/10 border-info-500/30';
      case 'closed': return 'text-success-500 bg-success-500/10 border-success-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'investigating': return 'En investigation';
      case 'pending_review': return 'En révision';
      case 'closed': return 'Clôturé';
      default: return status;
    }
  };

  const getIncidentTypeLabel = (type: string) => {
    switch (type) {
      case 'medical_error': return 'Erreur médicale';
      case 'accident': return 'Accident';
      case 'equipment_failure': return 'Défaillance équipement';
      case 'other': return 'Autre';
      default: return type;
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Rapports d&apos;incident médical</h1>
          <p className="text-gray-400">Gestion et suivi des incidents médicaux</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-agencies-samc-500 hover:bg-agencies-samc-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouveau Rapport
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-strong p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total des rapports</p>
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
              <p className="text-gray-400 text-sm mb-1">En investigation</p>
              <p className="text-3xl font-bold text-warning-500">{stats.investigating}</p>
            </div>
            <div className="p-3 bg-warning-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-warning-500" />
            </div>
          </div>
        </div>

        <div className="glass-strong p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Incidents critiques</p>
              <p className="text-3xl font-bold text-error-500">{stats.critical}</p>
            </div>
            <div className="p-3 bg-error-500/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-error-500" />
            </div>
          </div>
        </div>

        <div className="glass-strong p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Clôturés</p>
              <p className="text-3xl font-bold text-success-500">{stats.closed}</p>
            </div>
            <div className="p-3 bg-success-500/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-success-500" />
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
            placeholder="Rechercher par numéro, description, lieu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-agencies-samc-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
        >
          <option value="all">Tous les statuts</option>
          <option value="investigating">En investigation</option>
          <option value="pending_review">En révision</option>
          <option value="closed">Clôturé</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
        >
          <option value="all">Toutes les sévérités</option>
          <option value="minor">Mineur</option>
          <option value="moderate">Modéré</option>
          <option value="severe">Sévère</option>
          <option value="critical">Critique</option>
        </select>
      </div>

      {/* Tableau des rapports */}
      <div className="glass-strong rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Numéro</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Sévérité</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Lieu</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Statut</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Déclarant</th>
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
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                    Aucun rapport trouvé
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-white">{report.report_number}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {new Date(report.incident_date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {getIncidentTypeLabel(report.incident_type)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium ${getSeverityColor(report.severity)}`}>
                        {report.severity === 'critical' && <AlertTriangle className="w-3 h-3" />}
                        {getSeverityLabel(report.severity)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {report.incident_location}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium ${getStatusColor(report.status)}`}>
                        {getStatusLabel(report.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {report.reporter}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(report)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-info-500"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(report)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-agencies-samc-500"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(report.id)}
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
              <h2 className="text-xl font-bold text-white">Nouveau Rapport d&apos;Incident</h2>
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
                    Numéro de rapport
                  </label>
                  <input
                    type="text"
                    value={formData.report_number}
                    onChange={(e) => setFormData({ ...formData, report_number: e.target.value })}
                    placeholder="Auto-généré si vide"
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date de l&apos;incident *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.incident_date}
                    onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type d&apos;incident *
                  </label>
                  <select
                    required
                    value={formData.incident_type}
                    onChange={(e) => setFormData({ ...formData, incident_type: e.target.value as any })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  >
                    <option value="medical_error">Erreur médicale</option>
                    <option value="accident">Accident</option>
                    <option value="equipment_failure">Défaillance équipement</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sévérité *
                  </label>
                  <select
                    required
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  >
                    <option value="minor">Mineur</option>
                    <option value="moderate">Modéré</option>
                    <option value="severe">Sévère</option>
                    <option value="critical">Critique</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Lieu de l&apos;incident *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.incident_location}
                    onChange={(e) => setFormData({ ...formData, incident_location: e.target.value })}
                    placeholder="Ex: Urgences - Salle 3"
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Statut *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  >
                    <option value="investigating">En investigation</option>
                    <option value="pending_review">En révision</option>
                    <option value="closed">Clôturé</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Déclarant *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.reporter}
                    onChange={(e) => setFormData({ ...formData, reporter: e.target.value })}
                    placeholder="Nom du déclarant"
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ID du déclarant
                  </label>
                  <input
                    type="text"
                    value={formData.reporter_id}
                    onChange={(e) => setFormData({ ...formData, reporter_id: e.target.value })}
                    placeholder="Ex: M123456"
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description de l&apos;incident *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrivez en détail l'incident survenu..."
                  rows={4}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-agencies-samc-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Personnel impliqué
                </label>
                <textarea
                  value={formData.staff_involved}
                  onChange={(e) => setFormData({ ...formData, staff_involved: e.target.value })}
                  placeholder="Liste du personnel impliqué..."
                  rows={2}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-agencies-samc-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Témoins
                </label>
                <textarea
                  value={formData.witnesses}
                  onChange={(e) => setFormData({ ...formData, witnesses: e.target.value })}
                  placeholder="Liste des témoins..."
                  rows={2}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-agencies-samc-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Actions immédiates prises
                </label>
                <textarea
                  value={formData.immediate_actions}
                  onChange={(e) => setFormData({ ...formData, immediate_actions: e.target.value })}
                  placeholder="Actions prises immédiatement après l'incident..."
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-agencies-samc-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Actions correctives
                </label>
                <textarea
                  value={formData.corrective_actions}
                  onChange={(e) => setFormData({ ...formData, corrective_actions: e.target.value })}
                  placeholder="Actions correctives mises en place pour éviter la récurrence..."
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
                  Créer le rapport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Édition */}
      {showEditModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-200 rounded-xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-200 border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Modifier le Rapport</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedReport(null);
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
                    Numéro de rapport
                  </label>
                  <input
                    type="text"
                    value={formData.report_number}
                    onChange={(e) => setFormData({ ...formData, report_number: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date de l&apos;incident
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.incident_date}
                    onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type d&apos;incident
                  </label>
                  <select
                    value={formData.incident_type}
                    onChange={(e) => setFormData({ ...formData, incident_type: e.target.value as any })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  >
                    <option value="medical_error">Erreur médicale</option>
                    <option value="accident">Accident</option>
                    <option value="equipment_failure">Défaillance équipement</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sévérité
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  >
                    <option value="minor">Mineur</option>
                    <option value="moderate">Modéré</option>
                    <option value="severe">Sévère</option>
                    <option value="critical">Critique</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Lieu de l&apos;incident
                  </label>
                  <input
                    type="text"
                    value={formData.incident_location}
                    onChange={(e) => setFormData({ ...formData, incident_location: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Statut
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  >
                    <option value="investigating">En investigation</option>
                    <option value="pending_review">En révision</option>
                    <option value="closed">Clôturé</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Déclarant
                  </label>
                  <input
                    type="text"
                    value={formData.reporter}
                    onChange={(e) => setFormData({ ...formData, reporter: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ID du déclarant
                  </label>
                  <input
                    type="text"
                    value={formData.reporter_id}
                    onChange={(e) => setFormData({ ...formData, reporter_id: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description de l&apos;incident
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
                  Personnel impliqué
                </label>
                <textarea
                  value={formData.staff_involved}
                  onChange={(e) => setFormData({ ...formData, staff_involved: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Témoins
                </label>
                <textarea
                  value={formData.witnesses}
                  onChange={(e) => setFormData({ ...formData, witnesses: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Actions immédiates prises
                </label>
                <textarea
                  value={formData.immediate_actions}
                  onChange={(e) => setFormData({ ...formData, immediate_actions: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-agencies-samc-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Actions correctives
                </label>
                <textarea
                  value={formData.corrective_actions}
                  onChange={(e) => setFormData({ ...formData, corrective_actions: e.target.value })}
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
                    setSelectedReport(null);
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
      {showViewModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-200 rounded-xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-200 border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Détails du Rapport</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedReport(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Numéro de rapport</p>
                  <p className="text-white font-mono">{selectedReport.report_number}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Date de l&apos;incident</p>
                  <p className="text-white">
                    {new Date(selectedReport.incident_date).toLocaleString('fr-FR')}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Type</p>
                  <p className="text-white">{getIncidentTypeLabel(selectedReport.incident_type)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Sévérité</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium ${getSeverityColor(selectedReport.severity)}`}>
                    {selectedReport.severity === 'critical' && <AlertTriangle className="w-3 h-3" />}
                    {getSeverityLabel(selectedReport.severity)}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Lieu</p>
                  <p className="text-white">{selectedReport.incident_location}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Statut</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium ${getStatusColor(selectedReport.status)}`}>
                    {getStatusLabel(selectedReport.status)}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Déclarant</p>
                  <p className="text-white">{selectedReport.reporter}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">ID du déclarant</p>
                  <p className="text-white font-mono">{selectedReport.reporter_id || '-'}</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Description de l&apos;incident</p>
                  <p className="text-white whitespace-pre-wrap">{selectedReport.description}</p>
                </div>

                {selectedReport.staff_involved && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Personnel impliqué</p>
                    <p className="text-white whitespace-pre-wrap">{selectedReport.staff_involved}</p>
                  </div>
                )}

                {selectedReport.witnesses && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Témoins</p>
                    <p className="text-white whitespace-pre-wrap">{selectedReport.witnesses}</p>
                  </div>
                )}

                {selectedReport.immediate_actions && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Actions immédiates prises</p>
                    <p className="text-white whitespace-pre-wrap">{selectedReport.immediate_actions}</p>
                  </div>
                )}

                {selectedReport.corrective_actions && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Actions correctives</p>
                    <p className="text-white whitespace-pre-wrap">{selectedReport.corrective_actions}</p>
                  </div>
                )}

                {selectedReport.notes && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Notes additionnelles</p>
                    <p className="text-white whitespace-pre-wrap">{selectedReport.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedReport(null);
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
