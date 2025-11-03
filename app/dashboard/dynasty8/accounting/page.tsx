'use client';

export const dynamic = 'force-dynamic';

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
  X,
  Trash2,
  AlertTriangle,
  Edit,
} from 'lucide-react';
import { useSupabaseTransactions } from '@/hooks/useSupabaseTransactions';
import type { Transaction, TransactionInsert } from '@/lib/supabase/client';

/**
 * Module de comptabilité pour Dynasty8
 * Créé par Snowzy
 */

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

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<TransactionInsert>>({
    type: 'sale',
    category: '',
    amount: 0,
    agent: '',
    agent_id: '',
    description: '',
    status: 'pending',
    transaction_number: '',
    date: '',
  });

  // Hook Supabase
  const { transactions, isLoading, error, addTransaction, updateTransaction, deleteTransaction } = useSupabaseTransactions();

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.transaction_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  // Handlers
  const handleCreate = () => {
    setEditingTransaction(null);
    setFormData({
      type: 'sale',
      category: '',
      amount: 0,
      agent: '',
      agent_id: '',
      description: '',
      status: 'pending',
      transaction_number: '',
      date: '',
    });
    setShowModal(true);
  };

  const handleView = (transaction: Transaction) => {
    setViewingTransaction(transaction);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData(transaction);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      const success = await deleteTransaction(deletingId);
      if (success) {
        setShowDeleteConfirm(false);
        setDeletingId(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, formData);
    } else {
      const transactionData: TransactionInsert = {
        ...formData as TransactionInsert,
        transaction_number: `TRX-${new Date().getFullYear()}-${String(transactions.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString(),
      };
      await addTransaction(transactionData);
    }
    setShowModal(false);
  };

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
          <Button variant="primary" className="gap-2" onClick={handleCreate}>
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
                        {transaction.transaction_number}
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
                        <p className="text-sm text-gray-400">{transaction.agent_id}</p>
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
                        <button
                          onClick={() => handleView(transaction)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 text-error-500" />
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 py-8 overflow-y-auto">
          <Card className="w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingTransaction ? 'Modifier la transaction' : 'Nouvelle transaction'}
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
                    Type de transaction
                  </label>
                  <select
                    value={formData.type || 'sale'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-success-500"
                  >
                    <option value="sale">Vente</option>
                    <option value="rent">Loyer</option>
                    <option value="commission">Commission</option>
                    <option value="expense">Dépense</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Statut
                  </label>
                  <select
                    value={formData.status || 'pending'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-success-500"
                  >
                    <option value="pending">En attente</option>
                    <option value="completed">Complété</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Catégorie
                  </label>
                  <input
                    type="text"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-success-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Montant ($)
                  </label>
                  <input
                    type="number"
                    value={formData.amount || 0}
                    onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-success-500"
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
                  className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-success-500"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Agent responsable
                  </label>
                  <input
                    type="text"
                    value={formData.agent || ''}
                    onChange={(e) => setFormData({ ...formData, agent: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-success-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ID Agent (Dynasty8)
                  </label>
                  <input
                    type="text"
                    value={formData.agent_id || ''}
                    onChange={(e) => setFormData({ ...formData, agent_id: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-success-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Propriété associée (optionnel)
                  </label>
                  <input
                    type="text"
                    value={formData.property || ''}
                    onChange={(e) => setFormData({ ...formData, property: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-success-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Client (optionnel)
                  </label>
                  <input
                    type="text"
                    value={formData.client || ''}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-success-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" variant="primary" className="flex-1">
                  {editingTransaction ? 'Modifier' : 'Créer'}
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
      {viewingTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 py-8 overflow-y-auto">
          <Card className="w-full max-w-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Détails de la transaction</h2>
              <button
                onClick={() => setViewingTransaction(null)}
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
                    {viewingTransaction.transaction_number}
                  </h3>
                  <Badge variant={transactionTypeLabels[viewingTransaction.type].color as any}>
                    {transactionTypeLabels[viewingTransaction.type].label}
                  </Badge>
                  <Badge variant={statusLabels[viewingTransaction.status].color as any}>
                    {statusLabels[viewingTransaction.status].label}
                  </Badge>
                </div>
                <p className="text-gray-400">{viewingTransaction.category}</p>
              </div>

              {/* Amount */}
              <div className={`${['sale', 'rent', 'commission'].includes(viewingTransaction.type) ? 'bg-success-500/10 border-success-500/30' : 'bg-error-500/10 border-error-500/30'} border rounded-lg p-6`}>
                <p className="text-sm text-gray-400 mb-1">Montant</p>
                <p className={`font-bold text-4xl ${['sale', 'rent', 'commission'].includes(viewingTransaction.type) ? 'text-success-500' : 'text-error-500'}`}>
                  {['sale', 'rent', 'commission'].includes(viewingTransaction.type) ? '+' : '-'}${viewingTransaction.amount.toLocaleString()}
                </p>
              </div>

              {/* Description */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Description</p>
                <p className="text-white">{viewingTransaction.description}</p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Agent responsable</p>
                  <p className="text-white font-medium">
                    {viewingTransaction.agent} ({viewingTransaction.agent_id})
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Date</p>
                  <p className="text-white font-medium">
                    {new Date(viewingTransaction.date).toLocaleString('fr-FR')}
                  </p>
                </div>
                {viewingTransaction.property && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-400 mb-1">Propriété associée</p>
                    <p className="text-white font-medium">{viewingTransaction.property}</p>
                  </div>
                )}
                {viewingTransaction.client && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Client</p>
                    <p className="text-white font-medium">{viewingTransaction.client}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="primary"
                onClick={() => {
                  setViewingTransaction(null);
                  handleEdit(viewingTransaction);
                }}
                className="flex-1"
              >
                Modifier
              </Button>
              <Button
                variant="secondary"
                onClick={() => setViewingTransaction(null)}
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
              Êtes-vous sûr de vouloir supprimer cette transaction ? Toutes les informations
              associées seront définitivement perdues.
            </p>

            <div className="flex gap-3">
              <Button variant="destructive" onClick={confirmDelete} className="flex-1">
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
