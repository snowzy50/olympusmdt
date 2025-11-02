'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import {
  Search,
  Plus,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Edit,
  Download,
} from 'lucide-react';

/**
 * Module de gestion des amendes
 * Créé par Snowzy
 */

interface Fine {
  id: string;
  fineNumber: string;
  citizenName: string;
  citizenId: string;
  violation: string;
  amount: number;
  issuedBy: string;
  officerId: string;
  date: string;
  dueDate: string;
  status: 'unpaid' | 'paid' | 'overdue' | 'cancelled';
  paymentDate?: string;
}

const statusLabels: Record<string, { label: string; color: string; icon: any }> = {
  unpaid: { label: 'Non payée', color: 'warning', icon: Clock },
  paid: { label: 'Payée', color: 'success', icon: CheckCircle },
  overdue: { label: 'En retard', color: 'error', icon: XCircle },
  cancelled: { label: 'Annulée', color: 'gray', icon: XCircle },
};

export default function FinesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Données de démonstration
  const [fines] = useState<Fine[]>([
    {
      id: '1',
      fineNumber: 'FINE-2024-001',
      citizenName: 'John Smith',
      citizenId: 'CIT-001',
      violation: 'Excès de vitesse (85 km/h en zone 50)',
      amount: 135,
      issuedBy: 'Agent Williams',
      officerId: 'SASP-9012',
      date: '2024-10-28T15:30:00',
      dueDate: '2024-11-28',
      status: 'unpaid',
    },
    {
      id: '2',
      fineNumber: 'FINE-2024-002',
      citizenName: 'Jane Doe',
      citizenId: 'CIT-002',
      violation: 'Stationnement interdit',
      amount: 35,
      issuedBy: 'Agent Smith',
      officerId: 'SASP-1234',
      date: '2024-10-25T10:20:00',
      dueDate: '2024-11-25',
      status: 'paid',
      paymentDate: '2024-10-30T14:15:00',
    },
    {
      id: '3',
      fineNumber: 'FINE-2024-003',
      citizenName: 'Robert Johnson',
      citizenId: 'CIT-003',
      violation: 'Franchissement ligne blanche',
      amount: 90,
      issuedBy: 'Sergent Johnson',
      officerId: 'SASP-5678',
      date: '2024-09-15T18:45:00',
      dueDate: '2024-10-15',
      status: 'overdue',
    },
  ]);

  const filteredFines = fines.filter((fine) => {
    const matchesSearch =
      fine.citizenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine.fineNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine.violation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || fine.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalUnpaid = fines
    .filter((f) => f.status === 'unpaid' || f.status === 'overdue')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalCollected = fines
    .filter((f) => f.status === 'paid')
    .reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Amendes</h1>
          <p className="text-gray-400">
            Gestion et suivi des amendes et contraventions
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </Button>
          <Button variant="primary" className="gap-2">
            <Plus className="w-4 h-4" />
            Nouvelle amende
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warning-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-warning-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Non payées</p>
              <p className="text-2xl font-bold text-white">
                {fines.filter((f) => f.status === 'unpaid').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success-500/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-success-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Payées</p>
              <p className="text-2xl font-bold text-white">
                {fines.filter((f) => f.status === 'paid').length}
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
              <p className="text-sm text-gray-400">En retard</p>
              <p className="text-2xl font-bold text-white">
                {fines.filter((f) => f.status === 'overdue').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-500/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total collecté</p>
              <p className="text-2xl font-bold text-white">
                ${totalCollected.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une amende..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="unpaid">Non payées</option>
            <option value="paid">Payées</option>
            <option value="overdue">En retard</option>
            <option value="cancelled">Annulées</option>
          </select>
        </div>
      </Card>

      {/* Fines List */}
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
                  Infraction
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Montant
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Date émission
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Date limite
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
              {filteredFines.map((fine) => {
                const statusInfo = statusLabels[fine.status];
                const StatusIcon = statusInfo.icon;

                return (
                  <tr
                    key={fine.id}
                    className="border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-white font-medium">{fine.fineNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{fine.citizenName}</p>
                        <p className="text-sm text-gray-400">{fine.citizenId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300 max-w-xs">{fine.violation}</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Par {fine.issuedBy}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-warning-500 font-bold text-lg">
                        ${fine.amount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">
                        {new Date(fine.date).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">
                        {new Date(fine.dueDate).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={statusInfo.color as any}
                        className="flex items-center gap-1 w-fit"
                      >
                        <StatusIcon className="w-4 h-4" />
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
                          <Download className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredFines.length === 0 && (
            <div className="p-12 text-center">
              <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Aucune amende trouvée</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
