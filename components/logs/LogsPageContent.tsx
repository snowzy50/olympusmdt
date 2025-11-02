'use client';

import React, { useState } from 'react';
import {
  Database,
  Search,
  Filter,
  RefreshCw,
  Download,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface LogsPageContentProps {
  agencyId: string;
  agencyName: string;
}

export function LogsPageContent({ agencyId, agencyName }: LogsPageContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-cyan-500/20 rounded-xl flex items-center justify-center">
            <Database className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Logs Système
            </h1>
            <p className="text-gray-400 mt-1">
              Historique des activités - {agencyName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="btn-secondary flex items-center gap-2"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exporter
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-strong rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Total Logs</p>
              <p className="text-3xl font-bold text-white">0</p>
            </div>
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
        </div>

        <div className="glass-strong rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Info</p>
              <p className="text-3xl font-bold text-white">0</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Info className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="glass-strong rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Avertissements</p>
              <p className="text-3xl font-bold text-white">0</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="glass-strong rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Erreurs</p>
              <p className="text-3xl font-bold text-white">0</p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
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
            placeholder="Rechercher dans les logs..."
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

      {/* Table des logs */}
      <div className="glass-strong rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4 text-gray-400 font-semibold">Date & Heure</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Niveau</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Utilisateur</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Action</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Module</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Détails</th>
              </tr>
            </thead>
            <tbody>
              {/* État vide */}
              <tr>
                <td colSpan={6} className="text-center py-16">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                      <Database className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-gray-400">Aucun log trouvé</p>
                    <p className="text-sm text-gray-500">
                      Les activités du système apparaîtront ici
                    </p>
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
