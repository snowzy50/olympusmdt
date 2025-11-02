'use client';

import React, { useState } from 'react';
import {
  FolderOpen,
  Search,
  Filter,
  Plus,
  Eye,
  Edit3,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
} from 'lucide-react';

interface ActiveCasesPageContentProps {
  agencyId: string;
  agencyName: string;
}

export function ActiveCasesPageContent({ agencyId, agencyName }: ActiveCasesPageContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center">
            <FolderOpen className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Mes Dossiers en Cours
            </h1>
            <p className="text-gray-400 mt-1">
              Affaires et dossiers actifs - {agencyName}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouveau dossier
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-strong rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Dossiers actifs</p>
              <p className="text-3xl font-bold text-white">0</p>
            </div>
            <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </div>

        <div className="glass-strong rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">En investigation</p>
              <p className="text-3xl font-bold text-white">0</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="glass-strong rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Urgents</p>
              <p className="text-3xl font-bold text-white">0</p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>

        <div className="glass-strong rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Clôturés (7j)</p>
              <p className="text-3xl font-bold text-white">0</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par numéro de dossier, nom, type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-dark-200 border border-gray-700 rounded-xl text-white placeholder-gray-500
                     focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
        <button className="btn-secondary flex items-center gap-2 whitespace-nowrap">
          <Filter className="w-5 h-5" />
          Filtres
        </button>
      </div>

      {/* Table des dossiers */}
      <div className="glass-strong rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4 text-gray-400 font-semibold">N° Dossier</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Type</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Titre</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Impliqués</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Priorité</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Date ouverture</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Statut</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* État vide */}
              <tr>
                <td colSpan={8} className="text-center py-16">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                      <FolderOpen className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-gray-400">Aucun dossier actif</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="btn-secondary flex items-center gap-2 mt-2"
                    >
                      <Plus className="w-5 h-5" />
                      Créer votre premier dossier
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
