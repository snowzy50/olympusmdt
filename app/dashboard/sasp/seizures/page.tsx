'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import {
  Search,
  Plus,
  Package,
  Syringe,
  Car,
  ShieldAlert,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';

/**
 * Module de gestion des saisies
 * Créé par Snowzy
 */

interface Seizure {
  id: string;
  seizureNumber: string;
  type: 'weapons' | 'drugs' | 'vehicle' | 'goods';
  description: string;
  quantity: number;
  unit: string;
  estimatedValue: number;
  seizedBy: string;
  officerId: string;
  location: string;
  date: string;
  status: 'stored' | 'evidence' | 'destroyed' | 'returned';
  caseNumber?: string;
}

const seizureTypeLabels: Record<string, { label: string; icon: any; color: string }> = {
  weapons: { label: 'Armes', icon: ShieldAlert, color: 'error' },
  drugs: { label: 'Stupéfiants', icon: Syringe, color: 'warning' },
  vehicle: { label: 'Véhicules', icon: Car, color: 'info' },
  goods: { label: 'Biens divers', icon: Package, color: 'success' },
};

const statusLabels: Record<string, { label: string; color: string }> = {
  stored: { label: 'Stocké', color: 'info' },
  evidence: { label: 'Pièce à conviction', color: 'warning' },
  destroyed: { label: 'Détruit', color: 'error' },
  returned: { label: 'Restitué', color: 'success' },
};

export default function SeizuresPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Données de démonstration
  const [seizures] = useState<Seizure[]>([
    {
      id: '1',
      seizureNumber: 'SEZ-2024-001',
      type: 'weapons',
      description: 'Pistolet 9mm avec chargeur',
      quantity: 1,
      unit: 'unité',
      estimatedValue: 800,
      seizedBy: 'Agent Smith',
      officerId: 'SASP-1234',
      location: 'Grove Street',
      date: '2024-11-02T18:30:00',
      status: 'evidence',
      caseNumber: 'CASE-2024-156',
    },
    {
      id: '2',
      seizureNumber: 'SEZ-2024-002',
      type: 'drugs',
      description: 'Cocaïne en sachet',
      quantity: 250,
      unit: 'grammes',
      estimatedValue: 15000,
      seizedBy: 'Sergent Johnson',
      officerId: 'SASP-5678',
      location: 'Vinewood Boulevard',
      date: '2024-11-01T22:45:00',
      status: 'stored',
      caseNumber: 'CASE-2024-157',
    },
    {
      id: '3',
      seizureNumber: 'SEZ-2024-003',
      type: 'vehicle',
      description: 'BMW M4 volée',
      quantity: 1,
      unit: 'véhicule',
      estimatedValue: 45000,
      seizedBy: 'Agent Williams',
      officerId: 'SASP-9012',
      location: 'Legion Square',
      date: '2024-11-01T14:20:00',
      status: 'evidence',
      caseNumber: 'CASE-2024-158',
    },
  ]);

  const filteredSeizures = seizures.filter((seizure) => {
    const matchesSearch =
      seizure.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seizure.seizureNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seizure.seizedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || seizure.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || seizure.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalValue = filteredSeizures.reduce((sum, s) => sum + s.estimatedValue, 0);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Saisies</h1>
          <p className="text-gray-400">
            Gestion des saisies : armes, stupéfiants, véhicules et biens divers
          </p>
        </div>
        <Button variant="primary" className="gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle saisie
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(seizureTypeLabels).map(([type, config]) => {
          const Icon = config.icon;
          const count = seizures.filter((s) => s.type === type).length;
          return (
            <Card key={type} className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 bg-${config.color}-500/10 rounded-lg`}>
                  <Icon className={`w-6 h-6 text-${config.color}-500`} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">{config.label}</p>
                  <p className="text-2xl font-bold text-white">{count}</p>
                </div>
              </div>
            </Card>
          );
        })}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-500/10 rounded-lg">
              <Package className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Valeur totale</p>
              <p className="text-2xl font-bold text-white">
                ${totalValue.toLocaleString()}
              </p>
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
              placeholder="Rechercher une saisie..."
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
            <option value="weapons">Armes</option>
            <option value="drugs">Stupéfiants</option>
            <option value="vehicle">Véhicules</option>
            <option value="goods">Biens divers</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="stored">Stocké</option>
            <option value="evidence">Pièce à conviction</option>
            <option value="destroyed">Détruit</option>
            <option value="returned">Restitué</option>
          </select>
        </div>
      </Card>

      {/* Seizures List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Numéro
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Quantité
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Valeur estimée
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Agent
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSeizures.map((seizure) => {
                const typeConfig = seizureTypeLabels[seizure.type];
                const TypeIcon = typeConfig.icon;
                const statusInfo = statusLabels[seizure.status];

                return (
                  <tr
                    key={seizure.id}
                    className="border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-primary-500" />
                        <span className="text-white font-medium">
                          {seizure.seizureNumber}
                        </span>
                      </div>
                      {seizure.caseNumber && (
                        <p className="text-xs text-gray-400 ml-6">{seizure.caseNumber}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <TypeIcon className={`w-4 h-4 text-${typeConfig.color}-500`} />
                        <span className="text-gray-300">{typeConfig.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white">{seizure.description}</p>
                      <p className="text-sm text-gray-400">{seizure.location}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-medium">
                        {seizure.quantity} {seizure.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-success-500 font-semibold">
                        ${seizure.estimatedValue.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white">{seizure.seizedBy}</p>
                        <p className="text-sm text-gray-400">{seizure.officerId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusInfo.color as any}>
                        {statusInfo.label}
                      </Badge>
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

          {filteredSeizures.length === 0 && (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Aucune saisie trouvée</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
