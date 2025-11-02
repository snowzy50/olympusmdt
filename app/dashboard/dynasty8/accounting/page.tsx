'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import {
  Search,
  Plus,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Eye,
  Download,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

/**
 * Module de comptabilité pour Dynasty8
 * Créé par Snowzy
 */

interface Transaction {
  id: string;
  transactionNumber: string;
  type: 'sale' | 'rent' | 'commission' | 'expense';
  category: string;
  amount: number;
  property?: string;
  agent: string;
  agentId: string;
  client?: string;
  date: string;
  description: string;
  status: 'pending' | 'completed' | 'cancelled';
}

const transactionTypeLabels: Record<string, { label: string; color: string; icon: any }> = {
  sale: { label: 'Vente', color: 'success', icon: TrendingUp },
  rent: { label: 'Loyer', color: 'info', icon: Calendar },
  commission: { label: 'Commission', color: 'warning', icon: DollarSign },
  expense: { label: 'Dépense', color: 'error', icon: TrendingDown },
};

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'warning' },
  completed: { label: 'Complété', color: 'success' },
  cancelled: { label: 'Annulé', color: 'error' },
};

export default function AccountingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('month');

  // Données de démonstration
  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      transactionNumber: 'TRX-2024-001',
      type: 'sale',
      category: 'Vente propriété',
      amount: 850000,
      property: 'PROP-2024-001 - 123 Vinewood Hills',
      agent: 'Sarah Johnson',
      agentId: 'DYN-1234',
      client: 'Michael Brown',
      date: '2024-11-02T14:30:00',
      description: 'Vente villa Vinewood Hills',
      status: 'completed',
    },
    {
      id: '2',
      transactionNumber: 'TRX-2024-002',
      type: 'commission',
      category: 'Commission vente',
      amount: 42500,
      property: 'PROP-2024-001 - 123 Vinewood Hills',
      agent: 'Sarah Johnson',
      agentId: 'DYN-1234',
      date: '2024-11-02T15:00:00',
      description: 'Commission 5% sur vente',
      status: 'completed',
    },
    {
      id: '3',
      transactionNumber: 'TRX-2024-003',
      type: 'rent',
      category: 'Loyer mensuel',
      amount: 1500,
      property: 'PROP-2024-002 - 456 Downtown Apt 12B',
      agent: 'John Smith',
      agentId: 'DYN-5678',
      client: 'Jane Doe',
      date: '2024-11-01T10:00:00',
      description: 'Loyer novembre 2024',
      status: 'completed',
    },
    {
      id: '4',
      transactionNumber: 'TRX-2024-004',
      type: 'expense',
      category: 'Réparation',
      amount: 3500,
      property: 'PROP-2024-002 - 456 Downtown Apt 12B',
      agent: 'John Smith',
      agentId: 'DYN-5678',
      date: '2024-10-28T09:00:00',
      description: 'Réparation plomberie appartement',
      status: 'completed',
    },
    {
      id: '5',
      transactionNumber: 'TRX-2024-005',
      type: 'rent',
      category: 'Loyer mensuel',
      amount: 2200,
      property: 'PROP-2024-015 - 789 Business Loft',
      agent: 'Emily Davis',
      agentId: 'DYN-9012',
      client: 'Tech Startup LLC',
      date: '2024-11-03T12:00:00',
      description: 'Loyer novembre 2024',
      status: 'pending',
    },
  ]);

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.client?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesType = selectedType === 'all' || transaction.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || transaction.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculs
  const revenue = transactions
    .filter((t) => ['sale', 'rent', 'commission'].includes(t.type) && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === 'expense' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const profit = revenue - expenses;
  const pending = transactions
    .filter((t) => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Comptabilité</h1>
          <p className="text-gray-400">
            Gestion des transactions, revenus et dépenses
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </Button>
          <Button variant="primary" className="gap-2">
            <Plus className="w-4 h-4" />
            Nouvelle transaction
          </Button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success-500/10 rounded-lg">
              <ArrowUpRight className="w-6 h-6 text-success-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Revenus</p>
              <p className="text-2xl font-bold text-success-500">
                ${revenue.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-error-500/10 rounded-lg">
              <ArrowDownRight className="w-6 h-6 text-error-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Dépenses</p>
              <p className="text-2xl font-bold text-error-500">
                ${expenses.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Profit net</p>
              <p className={`text-2xl font-bold ${profit >= 0 ? 'text-success-500' : 'text-error-500'}`}>
                ${profit.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warning-500/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-warning-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">En attente</p>
              <p className="text-2xl font-bold text-warning-500">
                ${pending.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Transaction Statistics by Type */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(transactionTypeLabels).map(([type, config]) => {
          const Icon = config.icon;
          const count = transactions.filter((t) => t.type === type && t.status === 'completed').length;
          const total = transactions
            .filter((t) => t.type === type && t.status === 'completed')
            .reduce((sum, t) => sum + t.amount, 0);

          return (
            <Card key={type} className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 bg-${config.color}-500/10 rounded-lg`}>
                  <Icon className={`w-6 h-6 text-${config.color}-500`} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">{config.label}s</p>
                  <p className="text-xl font-bold text-white">{count}</p>
                  <p className="text-sm text-gray-500">${total.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une transaction..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-success-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-success-500"
          >
            <option value="all">Tous les types</option>
            <option value="sale">Ventes</option>
            <option value="rent">Loyers</option>
            <option value="commission">Commissions</option>
            <option value="expense">Dépenses</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-success-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="completed">Complétés</option>
            <option value="pending">En attente</option>
            <option value="cancelled">Annulés</option>
          </select>

          {/* Date Range */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-success-500"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
        </div>
      </Card>

      {/* Transactions List */}
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
                  Montant
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Agent
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Date
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
              {filteredTransactions.map((transaction) => {
                const typeConfig = transactionTypeLabels[transaction.type];
                const TypeIcon = typeConfig.icon;
                const statusInfo = statusLabels[transaction.status];
                const isIncome = ['sale', 'rent', 'commission'].includes(transaction.type);

                return (
                  <tr
                    key={transaction.id}
                    className="border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-white font-medium">
                        {transaction.transactionNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <TypeIcon className={`w-4 h-4 text-${typeConfig.color}-500`} />
                        <span className="text-gray-300">{typeConfig.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white">{transaction.description}</p>
                        {transaction.property && (
                          <p className="text-sm text-gray-400">{transaction.property}</p>
                        )}
                        {transaction.client && (
                          <p className="text-sm text-gray-400">Client: {transaction.client}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-bold text-lg ${
                          isIncome ? 'text-success-500' : 'text-error-500'
                        }`}
                      >
                        {isIncome ? '+' : '-'}${transaction.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white">{transaction.agent}</p>
                        <p className="text-sm text-gray-400">{transaction.agentId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">
                        {new Date(transaction.date).toLocaleDateString('fr-FR')}
                      </span>
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
                          <Download className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredTransactions.length === 0 && (
            <div className="p-12 text-center">
              <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Aucune transaction trouvée</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
