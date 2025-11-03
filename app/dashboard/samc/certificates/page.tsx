'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import {
  Search,
  Plus,
  FileText,
  ShieldCheck,
  FileX,
  AlertTriangle,
  Eye,
  Edit,
  Download,
  Share2,
  X,
  Trash2,
} from 'lucide-react';
import { useSupabaseCertificates } from '@/hooks/useSupabaseCertificates';
import type { Certificate, CertificateInsert } from '@/lib/supabase/client';

/**
 * Module de gestion des certificats médicaux
 * Créé par Snowzy
 */

const certificateTypeLabels: Record<string, { label: string; icon: any; color: string }> = {
  medical: { label: 'Certificat médical', icon: FileText, color: 'info' },
  death: { label: 'Certificat de décès', icon: FileX, color: 'error' },
  ppa: { label: 'Certificat PPA', icon: ShieldCheck, color: 'warning' },
  incident: { label: 'Rapport d\'incident', icon: AlertTriangle, color: 'error' },
};

const statusLabels: Record<string, { label: string; color: string }> = {
  valid: { label: 'Valide', color: 'success' },
  revoked: { label: 'Révoqué', color: 'error' },
  expired: { label: 'Expiré', color: 'gray' },
};

export default function CertificatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [viewingCertificate, setViewingCertificate] = useState<Certificate | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CertificateInsert>>({
    type: 'medical',
    patient_name: '',
    patient_id: '',
    issued_by: '',
    doctor_id: '',
    status: 'valid',
    description: '',
    certificate_number: '',
    date: '',
  });

  // Hook Supabase
  const { certificates, isLoading, error, addCertificate, updateCertificate, deleteCertificate } = useSupabaseCertificates();

  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch =
      cert.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certificate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || cert.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || cert.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Handlers
  const handleCreate = () => {
    setEditingCertificate(null);
    setFormData({
      type: 'medical',
      patient_name: '',
      patient_id: '',
      issued_by: '',
      doctor_id: '',
      status: 'valid',
      description: '',
      certificate_number: '',
      date: '',
    });
    setShowModal(true);
  };

  const handleView = (cert: Certificate) => {
    setViewingCertificate(cert);
  };

  const handleEdit = (cert: Certificate) => {
    setEditingCertificate(cert);
    setFormData(cert);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      const success = await deleteCertificate(deletingId);
      if (success) {
        setShowDeleteConfirm(false);
        setDeletingId(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCertificate) {
      await updateCertificate(editingCertificate.id, formData);
    } else {
      const typePrefix = formData.type === 'medical' ? 'MED' :
                         formData.type === 'death' ? 'DEATH' :
                         formData.type === 'ppa' ? 'PPA' : 'INC';
      const certData: CertificateInsert = {
        certificate_number: `CERT-${typePrefix}-${new Date().getFullYear()}-${String(certificates.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString(),
        ...formData as CertificateInsert,
      };
      await addCertificate(certData);
    }
    setShowModal(false);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Certificats médicaux</h1>
          <p className="text-gray-400">
            Gestion des certificats médicaux, de décès, PPA et rapports d'incident
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </Button>
          <Button variant="primary" className="gap-2" onClick={handleCreate}>
            <Plus className="w-4 h-4" />
            Nouveau certificat
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(certificateTypeLabels).map(([type, config]) => {
          const Icon = config.icon;
          const count = certificates.filter((c) => c.type === type).length;
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
              <p className="text-2xl font-bold text-white">{certificates.length}</p>
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
              placeholder="Rechercher un certificat..."
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
            <option value="medical">Certificats médicaux</option>
            <option value="death">Certificats de décès</option>
            <option value="ppa">Certificats PPA</option>
            <option value="incident">Rapports d'incident</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-error-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="valid">Valides</option>
            <option value="revoked">Révoqués</option>
            <option value="expired">Expirés</option>
          </select>
        </div>
      </Card>

      {/* Certificates List */}
      <div className="space-y-4">
        {filteredCertificates.map((cert) => {
          const typeConfig = certificateTypeLabels[cert.type];
          const statusInfo = statusLabels[cert.status];
          const TypeIcon = typeConfig.icon;

          return (
            <Card key={cert.id} className="p-6 hover:bg-gray-800/30 transition-colors">
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
                          {cert.patient_name}
                        </h3>
                        <Badge variant={typeConfig.color as any}>
                          {typeConfig.label}
                        </Badge>
                        <Badge variant={statusInfo.color as any}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                        <span>{cert.certificate_number}</span>
                        <span>•</span>
                        <span>{cert.patientId}</span>
                      </div>
                      <p className="text-gray-300 mb-3">{cert.description}</p>
                    </div>

                    {/* Shared With */}
                    {cert.shared_with && cert.shared_with.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-primary-500" />
                        <p className="text-sm text-gray-400">
                          Partagé avec:{' '}
                          <span className="text-white">
                            {cert.shared_with.join(', ')}
                          </span>
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Émis par</p>
                        <p className="text-white font-medium">
                          {cert.issued_by} ({cert.doctorId})
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Date d'émission</p>
                        <p className="text-white font-medium">
                          {new Date(cert.date).toLocaleString('fr-FR')}
                        </p>
                      </div>
                      {cert.valid_until && (
                        <div>
                          <p className="text-gray-400">Valide jusqu'au</p>
                          <p className="text-white font-medium">
                            {new Date(cert.valid_until).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleView(cert)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Voir les détails"
                  >
                    <Eye className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleEdit(cert)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(cert.id)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4 text-error-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                    <Share2 className="w-4 h-4 text-primary-500" />
                  </button>
                </div>
              </div>

              {/* Warning for expired/revoked */}
              {(cert.status === 'expired' || cert.status === 'revoked') && (
                <div className="mt-4 p-3 bg-error-500/10 border border-error-500/30 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-error-500" />
                  <p className="text-sm text-error-500">
                    {cert.status === 'expired'
                      ? 'Ce certificat a expiré et n\'est plus valide'
                      : 'Ce certificat a été révoqué'}
                  </p>
                </div>
              )}
            </Card>
          );
        })}

        {filteredCertificates.length === 0 && (
          <Card className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Aucun certificat trouvé</p>
          </Card>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 py-8 overflow-y-auto">
          <Card className="w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingCertificate ? 'Modifier le certificat' : 'Nouveau certificat'}
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
                    Type de certificat
                  </label>
                  <select
                    value={formData.type || 'medical'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-error-500"
                  >
                    <option value="medical">Certificat médical</option>
                    <option value="death">Certificat de décès</option>
                    <option value="ppa">Certificat PPA</option>
                    <option value="incident">Rapport d'incident</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Statut
                  </label>
                  <select
                    value={formData.status || 'valid'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-error-500"
                  >
                    <option value="valid">Valide</option>
                    <option value="revoked">Révoqué</option>
                    <option value="expired">Expiré</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom du patient
                  </label>
                  <input
                    type="text"
                    value={formData.patient_name || ''}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-error-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-error-500"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Émis par
                  </label>
                  <input
                    type="text"
                    value={formData.issued_by || ''}
                    onChange={(e) => setFormData({ ...formData, issuedBy: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-error-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Valide jusqu'au (optionnel)
                </label>
                <input
                  type="date"
                  value={formData.valid_until || ''}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-error-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" variant="primary" className="flex-1">
                  {editingCertificate ? 'Modifier' : 'Créer'}
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
      {viewingCertificate && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 py-8 overflow-y-auto">
          <Card className="w-full max-w-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Détails du certificat</h2>
              <button
                onClick={() => setViewingCertificate(null)}
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
                    {viewingCertificate.patientName}
                  </h3>
                  <Badge variant={certificateTypeLabels[viewingCertificate.type].color as any}>
                    {certificateTypeLabels[viewingCertificate.type].label}
                  </Badge>
                  <Badge variant={statusLabels[viewingCertificate.status].color as any}>
                    {statusLabels[viewingCertificate.status].label}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>{viewingCertificate.certificateNumber}</span>
                  <span>•</span>
                  <span>{viewingCertificate.patientId}</span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Description</p>
                <p className="text-white">{viewingCertificate.description}</p>
              </div>

              {/* Main information */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Émis par</p>
                  <p className="text-white font-medium">
                    {viewingCertificate.issuedBy} ({viewingCertificate.doctorId})
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Date d'émission</p>
                  <p className="text-white font-medium">
                    {new Date(viewingCertificate.date).toLocaleString('fr-FR')}
                  </p>
                </div>
                {viewingCertificate.validUntil && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Valide jusqu'au</p>
                    <p className="text-white font-medium">
                      {new Date(viewingCertificate.validUntil).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>

              {/* Shared With */}
              {viewingCertificate.sharedWith && viewingCertificate.sharedWith.length > 0 && (
                <div className="bg-primary-500/10 border border-primary-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Share2 className="w-5 h-5 text-primary-500" />
                    <p className="font-semibold text-white">Partagé avec</p>
                  </div>
                  <p className="text-gray-300">
                    {viewingCertificate.sharedWith.join(', ')}
                  </p>
                </div>
              )}

              {/* Warning for expired/revoked */}
              {(viewingCertificate.status === 'expired' || viewingCertificate.status === 'revoked') && (
                <div className="bg-error-500/10 border border-error-500/30 rounded-lg p-4 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-error-500" />
                  <p className="text-error-500">
                    {viewingCertificate.status === 'expired'
                      ? 'Ce certificat a expiré et n\'est plus valide'
                      : 'Ce certificat a été révoqué'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="primary"
                onClick={() => {
                  setViewingCertificate(null);
                  handleEdit(viewingCertificate);
                }}
                className="flex-1"
              >
                Modifier
              </Button>
              <Button
                variant="secondary"
                onClick={() => setViewingCertificate(null)}
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
              Êtes-vous sûr de vouloir supprimer ce certificat ? Toutes les informations
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
