'use client';

import React, { useState } from 'react';
import {
  Zap,
  Database,
  Clock,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  Activity,
} from 'lucide-react';

interface CacheDemoPageContentProps {
  agencyId: string;
  agencyName: string;
}

export function CacheDemoPageContent({ agencyId, agencyName }: CacheDemoPageContentProps) {
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
            <Zap className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Cache & Performance
            </h1>
            <p className="text-gray-400 mt-1">
              Démonstration des fonctionnalités de cache - {agencyName}
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Rafraîchir
        </button>
      </div>

      {/* Statistiques de performance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-strong rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Temps de réponse</p>
              <p className="text-3xl font-bold text-white">24ms</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-green-400">-12ms vs avant</span>
          </div>
        </div>

        <div className="glass-strong rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Taux de cache</p>
              <p className="text-3xl font-bold text-white">94%</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400">Excellent</span>
          </div>
        </div>

        <div className="glass-strong rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Requêtes/min</p>
              <p className="text-3xl font-bold text-white">1,247</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400">+8% vs hier</span>
          </div>
        </div>

        <div className="glass-strong rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Uptime</p>
              <p className="text-3xl font-bold text-white">99.9%</p>
            </div>
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400">Stable</span>
          </div>
        </div>
      </div>

      {/* Informations sur le cache */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-strong rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-400" />
            Configuration du Cache
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-dark-200 rounded-lg">
              <span className="text-gray-300">Stratégie</span>
              <span className="text-white font-medium">Supabase Realtime</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-dark-200 rounded-lg">
              <span className="text-gray-300">TTL par défaut</span>
              <span className="text-white font-medium">5 minutes</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-dark-200 rounded-lg">
              <span className="text-gray-300">Invalidation</span>
              <span className="text-white font-medium">Automatique</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-dark-200 rounded-lg">
              <span className="text-gray-300">Compression</span>
              <span className="text-green-400 font-medium flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Activée
              </span>
            </div>
          </div>
        </div>

        <div className="glass-strong rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-400" />
            Métriques en temps réel
          </h2>
          <div className="space-y-3">
            <div className="p-3 bg-dark-200 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Cache Hits</span>
                <span className="text-green-400 font-medium">2,834</span>
              </div>
              <div className="w-full bg-dark-300 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
              </div>
            </div>
            <div className="p-3 bg-dark-200 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Cache Misses</span>
                <span className="text-orange-400 font-medium">181</span>
              </div>
              <div className="w-full bg-dark-300 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '6%' }}></div>
              </div>
            </div>
            <div className="p-3 bg-dark-200 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Taille du cache</span>
                <span className="text-blue-400 font-medium">48.3 MB</span>
              </div>
              <div className="w-full bg-dark-300 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '48%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Note d'information */}
      <div className="glass-strong rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">
              À propos de cette page de démonstration
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Cette page présente les fonctionnalités de mise en cache et de performance du système OlympusMDT.
              Les métriques affichées sont des exemples de démonstration. Le système utilise Supabase Realtime
              pour garantir la synchronisation en temps réel des données tout en optimisant les performances
              grâce à des stratégies de cache intelligentes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
