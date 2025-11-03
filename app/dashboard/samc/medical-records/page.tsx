'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import {
  Search,
  Plus,
  FileText,
  Activity,
  Stethoscope,
  Pill,
  Clock,
  Eye,
  Edit,
  Download,
  X,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useSupabaseMedicalRecords } from '@/hooks/useSupabaseMedicalRecords';
import type { MedicalRecord, MedicalRecordInsert } from '@/lib/supabase/client';

/**
 * Module de gestion des dossiers médicaux et interventions
 * Créé par Snowzy
 */

const recordTypeLabels: Record<string, { label: string; icon: any; color: string }> = {
  emergency: { label: 'Urgence', icon: Activity, color: 'error' },
  hospitalization: { label: 'Hospitalisation', icon: Stethoscope, color: 'warning' },
  consultation: { label: 'Consultation', icon: FileText, color: 'info' },
  checkup: { label: 'Visite', icon: Clock, color: 'success' },
};

const statusLabels: Record<string, { label: string; color: string }> = {
  ongoing: { label: 'En cours', color: 'warning' },
  completed: { label: 'Terminé', color: 'success' },
  follow_up_required: { label: 'Suivi requis', color: 'info' },
};

const priorityLabels: Record<string, { label: string; color: string }> = {
  low: { label: 'Basse', color: 'gray' },
  medium: { label: 'Moyenne', color: 'info' },
  high: { label: 'Haute', color: 'warning' },
  critical: { label: 'Critique', color: 'error' },
};

export default function MedicalRecordsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<MedicalRecord | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<MedicalRecordInsert>>({
    patient_name: '',
    patient_id: '',
    type: 'consultation',
    diagnosis: '',
    treatment: '',
    doctor: '',
    doctor_id: '',
    location: '',
    status: 'ongoing',
    priority: 'medium',
    record_number: '',
    date: '',
  });

  // Hook Supabase
  const { records, isLoading, error, addRecord, updateRecord, deleteRecord } = useSupabaseMedicalRecords();

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.record_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || record.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Handlers
  const handleCreate = () => {
    setEditingRecord(null);
    setFormData({
      patient_name: '',
      patient_id: '',
      type: 'consultation',
      diagnosis: '',
      treatment: '',
      doctor: '',
      doctor_id: '',
      location: '',
      status: 'ongoing',
      priority: 'medium',
      record_number: '',
      date: '',
    });
    setShowModal(true);
  };

  const handleView = (record: MedicalRecord) => {
    setViewingRecord(record);
  };

  const handleEdit = (record: MedicalRecord) => {
    setEditingRecord(record);
    setFormData(record);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      const success = await deleteRecord(deletingId);
      if (success) {
        setShowDeleteConfirm(false);
        setDeletingId(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRecord) {
      await updateRecord(editingRecord.id, formData);
    } else {
      const recordData: MedicalRecordInsert = {
        record_number: `MED-${new Date().getFullYear()}-${String(records.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString(),
        ...formData as MedicalRecordInsert,
      };
      await addRecord(recordData);
    }
    setShowModal(false);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dossiers médicaux</h1>
          <p className="text-gray-400">
            Gestion des interventions médicales, arrêts de travail et prescriptions
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </Button>
          <Button variant="primary" className="gap-2" onClick={handleCreate}>
            <Plus className="w-4 h-4" />
            Nouvelle intervention
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(recordTypeLabels).map(([type, config]) => {
          const Icon = config.icon;
          const count = records.filter((r) => r.type === type).length;
          return (
            <Card key={type} className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 bg-${config.color}-500/10 rounded-lg`}>
                  <Icon className={`w-6 h-6 text-${config.color}-500`} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">{config.label}s</p>
                  <p className="text-2xl font-bold text-white">{count}</p>
                </div>
              </div>
            </Card>
          );
        })}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-500/10 rounded-lg">
              <FileText className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total</p>
              <p className="text-2xl font-bold text-white">{records.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un dossier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-error-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-error-500"
          >
            <option value="all">Tous les types</option>
            <option value="emergency">Urgences</option>
            <option value="hospitalization">Hospitalisations</option>
            <option value="consultation">Consultations</option>
            <option value="checkup">Visites</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-error-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="ongoing">En cours</option>
            <option value="completed">Terminés</option>
            <option value="follow_up_required">Suivi requis</option>
          </select>
        </div>
      </Card>

      {/* Records List */}
      <div className="space-y-4">
        {filteredRecords.map((record) => {
          const typeConfig = recordTypeLabels[record.type];
          const statusInfo = statusLabels[record.status];
          const priorityInfo = priorityLabels[record.priority];
          const TypeIcon = typeConfig.icon;

          return (
            <Card key={record.id} className="p-6 hover:bg-gray-800/30 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Icon */}
                  <div className={`p-3 bg-${typeConfig.color}-500/10 rounded-lg`}>
                    <TypeIcon className={`w-6 h-6 text-${typeConfig.color}-500`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {record.patient_name}
                        </h3>
                        <Badge variant={typeConfig.color as any}>
                          {typeConfig.label}
                        </Badge>
                        <Badge variant={statusInfo.color as any}>
                          {statusInfo.label}
                        </Badge>
                        <Badge variant={priorityInfo.color as any}>
                          {priorityInfo.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                        <span>{record.record_number}</span>
                        <span>•</span>
                        <span>{record.patient_id}</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-gray-400">Diagnostic</p>
                          <p className="text-white font-medium">{record.diagnosis}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Traitement</p>
                          <p className="text-gray-300">{record.treatment}</p>
                        </div>
                      </div>
                    </div>

                    {/* Prescriptions */}
                    {record.prescriptions && record.prescriptions.length > 0 && (
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Pill className="w-4 h-4 text-error-500" />
                          <p className="text-sm font-semibold text-white">
                            Prescriptions
                          </p>
                        </div>
                        <ul className="space-y-1">
                          {record.prescriptions.map((prescription, idx) => (
                            <li key={idx} className="text-sm text-gray-300 ml-6">
                              • {prescription}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Sick Leave */}
                    {record.sickLeave && (
                      <div className="bg-warning-500/10 border border-warning-500/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-warning-500" />
                          <p className="text-sm font-semibold text-white">
                            Arrêt de travail
                          </p>
                        </div>
                        <p className="text-sm text-gray-300">
                          Du {new Date(record.sickLeave.startDate).toLocaleDateString('fr-FR')} au{' '}
                          {new Date(record.sickLeave.endDate).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Motif: {record.sickLeave.reason}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Médecin</p>
                        <p className="text-white font-medium">
                          {record.doctor} ({record.doctor_id})
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Date</p>
                        <p className="text-white font-medium">
                          {new Date(record.date).toLocaleString('fr-FR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Lieu</p>
                        <p className="text-white font-medium">{record.location}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleView(record)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Voir les détails"
                  >
                    <Eye className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleEdit(record)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(record.id)}
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

        {filteredRecords.length === 0 && (
          <Card className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Aucun dossier médical trouvé</p>
          </Card>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 py-8 overflow-y-auto">
          <Card className="w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingRecord ? 'Modifier le dossier' : 'Nouveau dossier médical'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom du patient
                  </label>
                  <input
                    type="text"
                    value={formData.patient_name || ''}
                    onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-error-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ID Patient
                  </label>
                  <input
                    type="text"
                    value={formData.patient_id || ''}
                    onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-error-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type d'intervention
                  </label>
                  <select
                    value={formData.type || 'consultation'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-error-500"
                  >
                    <option value="emergency">Urgence</option>
                    <option value="hospitalization">Hospitalisation</option>
                    <option value="consultation">Consultation</option>
                    <option value="checkup">Visite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Statut
                  </label>
                  <select
                    value={formData.status || 'ongoing'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-error-500"
                  >
                    <option value="ongoing">En cours</option>
                    <option value="completed">Terminé</option>
                    <option value="follow_up_required">Suivi requis</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priorité
                  </label>
                  <select
                    value={formData.priority || 'medium'}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-error-500"
                  >
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                    <option value="critical">Critique</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Diagnostic
                </label>
                <textarea
                  value={formData.diagnosis || ''}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-error-500"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Traitement
                </label>
                <textarea
                  value={formData.treatment || ''}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-error-500"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Médecin
                  </label>
                  <input
                    type="text"
                    value={formData.doctor || ''}
                    onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-error-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ID Médecin (SAMC)
                  </label>
                  <input
                    type="text"
                    value={formData.doctor_id || ''}
                    onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-error-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Lieu
                </label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-error-500"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" variant="primary" className="flex-1">
                  {editingRecord ? 'Modifier' : 'Créer'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* View Modal */}
      {viewingRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 py-8 overflow-y-auto">
          <Card className="w-full max-w-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Détails du dossier médical</h2>
              <button
                onClick={() => setViewingRecord(null)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Header with badges */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-2xl font-bold text-white">
                    {viewingRecord.patient_name}
                  </h3>
                  <Badge variant={recordTypeLabels[viewingRecord.type].color as any}>
                    {recordTypeLabels[viewingRecord.type].label}
                  </Badge>
                  <Badge variant={statusLabels[viewingRecord.status].color as any}>
                    {statusLabels[viewingRecord.status].label}
                  </Badge>
                  <Badge variant={priorityLabels[viewingRecord.priority].color as any}>
                    {priorityLabels[viewingRecord.priority].label}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>{viewingRecord.record_number}</span>
                  <span>•</span>
                  <span>{viewingRecord.patient_id}</span>
                </div>
              </div>

              {/* Main information */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Diagnostic</p>
                  <p className="text-white font-medium">{viewingRecord.diagnosis}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Traitement</p>
                  <p className="text-white font-medium">{viewingRecord.treatment}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Médecin</p>
                  <p className="text-white font-medium">
                    {viewingRecord.doctor} ({viewingRecord.doctor_id})
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Date</p>
                  <p className="text-white font-medium">
                    {new Date(viewingRecord.date).toLocaleString('fr-FR')}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-400 mb-1">Lieu</p>
                  <p className="text-white font-medium">{viewingRecord.location}</p>
                </div>
              </div>

              {/* Prescriptions */}
              {viewingRecord.prescriptions && viewingRecord.prescriptions.length > 0 && (
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Pill className="w-5 h-5 text-error-500" />
                    <p className="font-semibold text-white">Prescriptions</p>
                  </div>
                  <ul className="space-y-2">
                    {viewingRecord.prescriptions.map((prescription, idx) => (
                      <li key={idx} className="text-gray-300 ml-7">
                        • {prescription}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sick Leave */}
              {viewingRecord.sickLeave && (
                <div className="bg-warning-500/10 border border-warning-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-warning-500" />
                    <p className="font-semibold text-white">Arrêt de travail</p>
                  </div>
                  <p className="text-gray-300 mb-2">
                    Du {new Date(viewingRecord.sickLeave.startDate).toLocaleDateString('fr-FR')}{' '}
                    au {new Date(viewingRecord.sickLeave.endDate).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-sm text-gray-400">
                    Motif: {viewingRecord.sickLeave.reason}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="primary"
                onClick={() => {
                  setViewingRecord(null);
                  handleEdit(viewingRecord);
                }}
                className="flex-1"
              >
                Modifier
              </Button>
              <Button
                variant="secondary"
                onClick={() => setViewingRecord(null)}
                className="flex-1"
              >
                Fermer
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 py-8 overflow-y-auto">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-error-500/10 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-error-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Confirmer la suppression</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Cette action est irréversible
                </p>
              </div>
            </div>

            <p className="text-gray-300 mb-6">
              Êtes-vous sûr de vouloir supprimer ce dossier médical ? Toutes les informations
              associées seront définitivement perdues.
            </p>

            <div className="flex gap-3">
              <Button variant="danger" onClick={confirmDelete} className="flex-1">
                Supprimer
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingId(null);
                }}
                className="flex-1"
              >
                Annuler
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
