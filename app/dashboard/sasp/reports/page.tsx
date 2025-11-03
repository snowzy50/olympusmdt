export const dynamic = 'force-dynamic';

'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import {
  Search,
  Plus,
  FileText,
  Shield,
  Crosshair,
  UserCheck,
  Download,
  Eye,
  Edit,
  Filter,
  X,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

/**
 * Module de gestion des rapports opérationnels
 * Créé par Snowzy
 */

interface Report {
  id: string;
  type: 'operation' | 'shooting' | 'arrest';
  reportNumber: string;
  title: string;
  officer: string;
  officerId: string;
  date: string;
  location: string;
  status: 'draft' | 'submitted' | 'validated' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  summary: string;
}

const reportTypeLabels: Record<string, { label: string; icon: any; color: string }> = {
  operation: { label: 'Opération', icon: Shield, color: 'primary' },
  shooting: { label: 'Fusillade', icon: Crosshair, color: 'error' },
  arrest: { label: 'Arrestation', icon: UserCheck, color: 'success' },
};

const reportStatusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: 'Brouillon', color: 'gray' },
  submitted: { label: 'Soumis', color: 'warning' },
  validated: { label: 'Validé', color: 'success' },
  archived: { label: 'Archivé', color: 'info' },
};

const priorityLabels: Record<string, { label: string; color: string }> = {
  low: { label: 'Basse', color: 'gray' },
  medium: { label: 'Moyenne', color: 'info' },
  high: { label: 'Haute', color: 'warning' },
  urgent: { label: 'Urgente', color: 'error' },
};

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Report>>({
    type: 'operation',
    title: '',
    officer: '',
    officerId: '',
    location: '',
    status: 'draft',
    priority: 'medium',
    summary: '',
  });

  // Données de démonstration
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      type: 'operation',
      reportNumber: 'RPT-OP-2024-001',
      title: 'Contrôle routier - Grande avenue',
      officer: 'Agent Smith',
      officerId: 'SASP-1234',
      date: '2024-11-02T14:30:00',
      location: 'Grande Avenue, Los Santos',
      status: 'validated',
      priority: 'medium',
      summary: 'Contrôle routier de routine avec 15 véhicules contrôlés, 3 amendes distribuées.',
    },
    {
      id: '2',
      type: 'shooting',
      reportNumber: 'RPT-SHO-2024-005',
      title: 'Fusillade dans le quartier Grove Street',
      officer: 'Sergent Johnson',
      officerId: 'SASP-5678',
      date: '2024-11-02T22:15:00',
      location: 'Grove Street',
      status: 'submitted',
      priority: 'urgent',
      summary: 'Échange de tirs entre deux gangs rivaux. 2 blessés, 3 suspects arrêtés.',
    },
    {
      id: '3',
      type: 'arrest',
      reportNumber: 'RPT-ARR-2024-042',
      title: 'Arrestation pour trafic de stupéfiants',
      officer: 'Agent Williams',
      officerId: 'SASP-9012',
      date: '2024-11-01T18:45:00',
      location: 'Vinewood Boulevard',
      status: 'validated',
      priority: 'high',
      summary: 'Arrestation d\'un suspect en flagrant délit de vente de stupéfiants.',
    },
  ]);

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.officer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || report.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || report.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Handlers
  const handleCreate = () => {
    setEditingReport(null);
    setFormData({
      type: 'operation',
      title: '',
      officer: '',
      officerId: '',
      location: '',
      status: 'draft',
      priority: 'medium',
      summary: '',
    });
    setShowModal(true);
  };

  const handleView = (report: Report) => {
    setViewingReport(report);
  };

  const handleEdit = (report: Report) => {
    setEditingReport(report);
    setFormData(report);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deletingId) {
      setReports(reports.filter((r) => r.id !== deletingId));
      setShowDeleteConfirm(false);
      setDeletingId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReport) {
      setReports(
        reports.map((r) =>
          r.id === editingReport.id ? { ...r, ...formData } as Report : r
        )
      );
    } else {
      const typePrefix = formData.type === 'operation' ? 'OP' : formData.type === 'shooting' ? 'SHO' : 'ARR';
      const newReport: Report = {
        id: Date.now().toString(),
        reportNumber: `RPT-${typePrefix}-${new Date().getFullYear()}-${String(reports.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString(),
        ...formData as Report,
      };
      setReports([...reports, newReport]);
    }
    setShowModal(false);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Rapports opérationnels</h1>
          <p className="text-gray-400">
            Gestion des rapports d'opération, de fusillade et d'arrestation
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </Button>
          <Button variant="primary" className="gap-2" onClick={handleCreate}>
            <Plus className="w-4 h-4" />
            Nouveau rapport
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(reportTypeLabels).map(([type, config]) => {
          const Icon = config.icon;
          const count = reports.filter((r) => r.type === type).length;
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
            <div className="p-3 bg-info-500/10 rounded-lg">
              <FileText className="w-6 h-6 text-info-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total</p>
              <p className="text-2xl font-bold text-white">{reports.length}</p>
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
              placeholder="Rechercher un rapport..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Tous les types</option>
            <option value="operation">Opérations</option>
            <option value="shooting">Fusillades</option>
            <option value="arrest">Arrestations</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="submitted">Soumis</option>
            <option value="validated">Validé</option>
            <option value="archived">Archivé</option>
          </select>
        </div>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => {
          const typeConfig = reportTypeLabels[report.type];
          const statusInfo = reportStatusLabels[report.status];
          const priorityInfo = priorityLabels[report.priority];
          const TypeIcon = typeConfig.icon;

          return (
            <Card key={report.id} className="p-6 hover:bg-gray-800/30 transition-colors">
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
                          {report.title}
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
                      <p className="text-sm text-gray-400 mb-2">
                        {report.reportNumber}
                      </p>
                      <p className="text-gray-300 mb-3">{report.summary}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Agent</p>
                        <p className="text-white font-medium">
                          {report.officer} ({report.officerId})
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Date</p>
                        <p className="text-white font-medium">
                          {new Date(report.date).toLocaleString('fr-FR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Lieu</p>
                        <p className="text-white font-medium">{report.location}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleView(report)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Voir les détails"
                  >
                    <Eye className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleEdit(report)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(report.id)}
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

        {filteredReports.length === 0 && (
          <Card className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Aucun rapport trouvé</p>
          </Card>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-200 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {editingReport ? 'Modifier le rapport' : 'Nouveau rapport'}
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
                    Type de rapport *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Report['type'] })}
                    className="w-full px-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="operation">Opération</option>
                    <option value="shooting">Fusillade</option>
                    <option value="arrest">Arrestation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Priorité *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Report['priority'] })}
                    className="w-full px-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Titre du rapport *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Nom de l'agent *
                  </label>
                  <input
                    type="text"
                    value={formData.officer}
                    onChange={(e) => setFormData({ ...formData, officer: e.target.value })}
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
                    value={formData.officerId}
                    onChange={(e) => setFormData({ ...formData, officerId: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Lieu *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Statut *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Report['status'] })}
                  className="w-full px-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="draft">Brouillon</option>
                  <option value="submitted">Soumis</option>
                  <option value="validated">Validé</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Résumé *
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 h-32 resize-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" variant="primary" className="flex-1">
                  {editingReport ? 'Mettre à jour' : 'Créer le rapport'}
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
      {viewingReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-200 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Détails du rapport</h2>
              <button
                onClick={() => setViewingReport(null)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold text-white">{viewingReport.title}</h3>
                <Badge variant={reportTypeLabels[viewingReport.type].color as any}>
                  {reportTypeLabels[viewingReport.type].label}
                </Badge>
                <Badge variant={reportStatusLabels[viewingReport.status].color as any}>
                  {reportStatusLabels[viewingReport.status].label}
                </Badge>
                <Badge variant={priorityLabels[viewingReport.priority].color as any}>
                  {priorityLabels[viewingReport.priority].label}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-400">Numéro de rapport</p>
                  <p className="text-lg font-medium text-white">{viewingReport.reportNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Date</p>
                  <p className="text-lg font-medium text-white">
                    {new Date(viewingReport.date).toLocaleString('fr-FR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Agent</p>
                  <p className="text-lg font-medium text-white">
                    {viewingReport.officer} ({viewingReport.officerId})
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Lieu</p>
                  <p className="text-lg font-medium text-white">{viewingReport.location}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-2">Résumé</p>
                <p className="text-white leading-relaxed">{viewingReport.summary}</p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <Button
                  variant="primary"
                  onClick={() => {
                    setViewingReport(null);
                    handleEdit(viewingReport);
                  }}
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </Button>
                <Button variant="ghost" onClick={() => setViewingReport(null)}>
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
                Êtes-vous sûr de vouloir supprimer ce rapport ? Toutes les données seront
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
