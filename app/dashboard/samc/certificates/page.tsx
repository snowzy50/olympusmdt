'use client';

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
} from 'lucide-react';

/**
 * Module de gestion des certificats médicaux
 * Créé par Snowzy
 */

interface Certificate {
  id: string;
  certificateNumber: string;
  type: 'medical' | 'death' | 'ppa' | 'incident';
  patientName: string;
  patientId: string;
  issuedBy: string;
  doctorId: string;
  date: string;
  status: 'valid' | 'revoked' | 'expired';
  description: string;
  validUntil?: string;
  sharedWith?: string[];
}

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

  // Données de démonstration
  const [certificates] = useState<Certificate[]>([
    {
      id: '1',
      certificateNumber: 'CERT-MED-2024-001',
      type: 'medical',
      patientName: 'John Smith',
      patientId: 'PAT-001',
      issuedBy: 'Dr. Martinez',
      doctorId: 'SAMC-1234',
      date: '2024-11-02T14:30:00',
      status: 'valid',
      description: 'Certificat médical attestant de la fracture du bras gauche',
      validUntil: '2024-12-02',
      sharedWith: ['SASP'],
    },
    {
      id: '2',
      certificateNumber: 'CERT-PPA-2024-015',
      type: 'ppa',
      patientName: 'Michael Brown',
      patientId: 'PAT-005',
      issuedBy: 'Dr. Johnson',
      doctorId: 'SAMC-5678',
      date: '2024-10-20T10:00:00',
      status: 'valid',
      description: 'Aptitude médicale confirmée pour le port d\'arme',
      validUntil: '2025-10-20',
      sharedWith: ['SASP', 'DOJ'],
    },
    {
      id: '3',
      certificateNumber: 'CERT-DEATH-2024-008',
      type: 'death',
      patientName: 'Robert Wilson',
      patientId: 'PAT-012',
      issuedBy: 'Dr. Williams',
      doctorId: 'SAMC-9012',
      date: '2024-10-28T22:45:00',
      status: 'valid',
      description: 'Décès par arrêt cardiaque suite à traumatisme sévère',
      sharedWith: ['SASP', 'DOJ'],
    },
    {
      id: '4',
      certificateNumber: 'CERT-INC-2024-003',
      type: 'incident',
      patientName: 'Jane Doe',
      patientId: 'PAT-002',
      issuedBy: 'Dr. Martinez',
      doctorId: 'SAMC-1234',
      date: '2024-11-01T18:30:00',
      status: 'valid',
      description: 'Incident médical: réaction allergique sévère au médicament X',
      sharedWith: ['SAMC'],
    },
  ]);

  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch =
      cert.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || cert.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || cert.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

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
          <Button variant="primary" className="gap-2">
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
                          {cert.patientName}
                        </h3>
                        <Badge variant={typeConfig.color as any}>
                          {typeConfig.label}
                        </Badge>
                        <Badge variant={statusInfo.color as any}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                        <span>{cert.certificateNumber}</span>
                        <span>•</span>
                        <span>{cert.patientId}</span>
                      </div>
                      <p className="text-gray-300 mb-3">{cert.description}</p>
                    </div>

                    {/* Shared With */}
                    {cert.sharedWith && cert.sharedWith.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-primary-500" />
                        <p className="text-sm text-gray-400">
                          Partagé avec:{' '}
                          <span className="text-white">
                            {cert.sharedWith.join(', ')}
                          </span>
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Émis par</p>
                        <p className="text-white font-medium">
                          {cert.issuedBy} ({cert.doctorId})
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Date d'émission</p>
                        <p className="text-white font-medium">
                          {new Date(cert.date).toLocaleString('fr-FR')}
                        </p>
                      </div>
                      {cert.validUntil && (
                        <div>
                          <p className="text-gray-400">Valide jusqu'au</p>
                          <p className="text-white font-medium">
                            {new Date(cert.validUntil).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      )}
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
    </div>
  );
}
