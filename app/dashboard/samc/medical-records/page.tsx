'use client';

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
} from 'lucide-react';

/**
 * Module de gestion des dossiers médicaux et interventions
 * Créé par Snowzy
 */

interface MedicalRecord {
  id: string;
  recordNumber: string;
  patientName: string;
  patientId: string;
  type: 'emergency' | 'hospitalization' | 'consultation' | 'checkup';
  diagnosis: string;
  treatment: string;
  doctor: string;
  doctorId: string;
  date: string;
  location: string;
  status: 'ongoing' | 'completed' | 'follow_up_required';
  priority: 'low' | 'medium' | 'high' | 'critical';
  prescriptions?: string[];
  sickLeave?: {
    startDate: string;
    endDate: string;
    reason: string;
  };
}

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

  // Données de démonstration
  const [records] = useState<MedicalRecord[]>([
    {
      id: '1',
      recordNumber: 'MED-2024-001',
      patientName: 'John Smith',
      patientId: 'PAT-001',
      type: 'emergency',
      diagnosis: 'Fracture du bras gauche',
      treatment: 'Plâtre appliqué, antidouleurs prescrits',
      doctor: 'Dr. Martinez',
      doctorId: 'SAMC-1234',
      date: '2024-11-02T14:30:00',
      location: 'Urgences - SAMC Central',
      status: 'follow_up_required',
      priority: 'high',
      prescriptions: ['Ibuprofène 400mg - 3x/jour', 'Tramadol 50mg - si douleur'],
      sickLeave: {
        startDate: '2024-11-02',
        endDate: '2024-11-16',
        reason: 'Fracture bras gauche - immobilisation',
      },
    },
    {
      id: '2',
      recordNumber: 'MED-2024-002',
      patientName: 'Jane Doe',
      patientId: 'PAT-002',
      type: 'consultation',
      diagnosis: 'Grippe saisonnière',
      treatment: 'Repos, hydratation, antipyrétiques',
      doctor: 'Dr. Johnson',
      doctorId: 'SAMC-5678',
      date: '2024-11-01T10:15:00',
      location: 'Consultation - SAMC Central',
      status: 'completed',
      priority: 'low',
      prescriptions: ['Paracétamol 1000mg - 3x/jour pendant 5 jours'],
      sickLeave: {
        startDate: '2024-11-01',
        endDate: '2024-11-03',
        reason: 'Grippe - contagieux',
      },
    },
    {
      id: '3',
      recordNumber: 'MED-2024-003',
      patientName: 'Robert Wilson',
      patientId: 'PAT-003',
      type: 'hospitalization',
      diagnosis: 'Pneumonie sévère',
      treatment: 'Antibiotiques IV, oxygène, surveillance 24/7',
      doctor: 'Dr. Williams',
      doctorId: 'SAMC-9012',
      date: '2024-10-30T22:00:00',
      location: 'Service pneumologie - SAMC Central',
      status: 'ongoing',
      priority: 'critical',
      prescriptions: [
        'Amoxicilline 1g IV - 3x/jour',
        'Oxygène - selon besoin',
      ],
    },
  ]);

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.recordNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || record.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

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
          <Button variant="primary" className="gap-2">
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
                          {record.patientName}
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
                        <span>{record.recordNumber}</span>
                        <span>•</span>
                        <span>{record.patientId}</span>
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
                          {record.doctor} ({record.doctorId})
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
                  <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                    <Eye className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                    <Edit className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                    <Download className="w-4 h-4 text-gray-400" />
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
    </div>
  );
}
