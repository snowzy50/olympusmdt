'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import {
  Search,
  Plus,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';

/**
 * Module de gestion des permis de conduire
 * Créé par Snowzy
 */

interface License {
  id: string;
  citizenId: string;
  citizenName: string;
  licenseNumber: string;
  type: 'car' | 'motorcycle' | 'truck' | 'boat' | 'aircraft';
  status: 'valid' | 'suspended' | 'revoked' | 'expired';
  issueDate: string;
  expiryDate: string;
  points: number;
  restrictions?: string;
}

const licenseTypeLabels: Record<string, string> = {
  car: 'Voiture',
  motorcycle: 'Moto',
  truck: 'Poids lourd',
  boat: 'Bateau',
  aircraft: 'Avion',
};

const licenseStatusLabels: Record<string, { label: string; color: string }> = {
  valid: { label: 'Valide', color: 'success' },
  suspended: { label: 'Suspendu', color: 'warning' },
  revoked: { label: 'Révoqué', color: 'error' },
  expired: { label: 'Expiré', color: 'error' },
};

export default function LicensesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Données de démonstration
  const [licenses] = useState<License[]>([
    {
      id: '1',
      citizenId: 'CIT-001',
      citizenName: 'John Smith',
      licenseNumber: 'LIC-2024-001',
      type: 'car',
      status: 'valid',
      issueDate: '2024-01-15',
      expiryDate: '2029-01-15',
      points: 12,
      restrictions: 'Port de lunettes obligatoire',
    },
    {
      id: '2',
      citizenId: 'CIT-002',
      citizenName: 'Jane Doe',
      licenseNumber: 'LIC-2024-002',
      type: 'motorcycle',
      status: 'suspended',
      issueDate: '2023-06-20',
      expiryDate: '2028-06-20',
      points: 4,
    },
    {
      id: '3',
      citizenId: 'CIT-003',
      citizenName: 'Robert Johnson',
      licenseNumber: 'LIC-2023-156',
      type: 'truck',
      status: 'valid',
      issueDate: '2023-03-10',
      expiryDate: '2028-03-10',
      points: 12,
    },
  ]);

  const filteredLicenses = licenses.filter((license) => {
    const matchesSearch =
      license.citizenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || license.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || license.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="w-4 h-4" />;
      case 'suspended':
        return <AlertCircle className="w-4 h-4" />;
      case 'revoked':
      case 'expired':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Permis de conduire</h1>
          <p className="text-gray-400">
            Gestion des licences de conduite enregistrées
          </p>
        </div>
        <Button variant="primary" className="gap-2">
          <Plus className="w-4 h-4" />
          Nouveau permis
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou numéro..."
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
            <option value="car">Voiture</option>
            <option value="motorcycle">Moto</option>
            <option value="truck">Poids lourd</option>
            <option value="boat">Bateau</option>
            <option value="aircraft">Avion</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="valid">Valide</option>
            <option value="suspended">Suspendu</option>
            <option value="revoked">Révoqué</option>
            <option value="expired">Expiré</option>
          </select>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success-500/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-success-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Valides</p>
              <p className="text-2xl font-bold text-white">
                {licenses.filter((l) => l.status === 'valid').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warning-500/10 rounded-lg">
              <AlertCircle className="w-6 h-6 text-warning-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Suspendus</p>
              <p className="text-2xl font-bold text-white">
                {licenses.filter((l) => l.status === 'suspended').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-error-500/10 rounded-lg">
              <XCircle className="w-6 h-6 text-error-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Révoqués</p>
              <p className="text-2xl font-bold text-white">
                {licenses.filter((l) => l.status === 'revoked').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-500/10 rounded-lg">
              <FileText className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total</p>
              <p className="text-2xl font-bold text-white">{licenses.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Licenses List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Numéro
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Citoyen
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Points
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Expiration
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLicenses.map((license) => {
                const statusInfo = licenseStatusLabels[license.status];
                return (
                  <tr
                    key={license.id}
                    className="border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary-500" />
                        <span className="text-white font-medium">
                          {license.licenseNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{license.citizenName}</p>
                        <p className="text-sm text-gray-400">{license.citizenId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">
                        {licenseTypeLabels[license.type]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={statusInfo.color as any}
                        className="flex items-center gap-1 w-fit"
                      >
                        {getStatusIcon(license.status)}
                        {statusInfo.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-semibold ${
                          license.points <= 4
                            ? 'text-error-500'
                            : license.points <= 8
                            ? 'text-warning-500'
                            : 'text-success-500'
                        }`}
                      >
                        {license.points} / 12
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">
                        {new Date(license.expiryDate).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                          <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 text-error-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredLicenses.length === 0 && (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Aucun permis trouvé</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
