/**
 * Panel de dispatch avec liste des appels et unités
 * Créé par: Snowzy
 * Features: Filtrage, tri, statuts temps réel
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  Clock,
  MapPin,
  Users,
  Filter,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Radio,
} from 'lucide-react';
import type { DispatchCall } from '@/services/dispatchRealtimeService';
import { formatDateParis, formatTimeParis } from '@/lib/dateUtils';

interface DispatchPanelProps {
  calls: DispatchCall[];
  onCallClick?: (call: DispatchCall) => void;
  onCreateCall?: () => void;
  className?: string;
}

const callTypeLabels: Record<DispatchCall['call_type'], string> = {
  robbery: 'Vol à main armée',
  medical: 'Urgence médicale',
  traffic: 'Accident de la route',
  assault: 'Agression',
  fire: 'Incendie',
  pursuit: 'Poursuite',
  suspicious: 'Activité suspecte',
  backup: 'Demande de renfort',
  other: 'Autre',
};

const callTypeIcons: Record<DispatchCall['call_type'], string> = {
  robbery: '🏦',
  medical: '🚑',
  traffic: '🚗',
  assault: '👊',
  fire: '🔥',
  pursuit: '🚔',
  suspicious: '🔍',
  backup: '👮',
  other: '📍',
};

const priorityConfig = {
  code1: { label: 'Code 1 - Urgence', color: 'bg-red-500', textColor: 'text-red-400', borderColor: 'border-l-red-500' },
  code2: { label: 'Code 2 - Normal', color: 'bg-orange-500', textColor: 'text-orange-400', borderColor: 'border-l-orange-500' },
  code3: { label: 'Code 3 - Non-urgent', color: 'bg-blue-500', textColor: 'text-blue-400', borderColor: 'border-l-blue-500' },
};

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-yellow-500/20 text-yellow-300', icon: Clock },
  dispatched: { label: 'Assigné', color: 'bg-blue-500/20 text-blue-300', icon: Radio },
  en_route: { label: 'En route', color: 'bg-purple-500/20 text-purple-300', icon: MapPin },
  on_scene: { label: 'Sur place', color: 'bg-orange-500/20 text-orange-300', icon: AlertCircle },
  resolved: { label: 'Résolu', color: 'bg-green-500/20 text-green-300', icon: CheckCircle2 },
  cancelled: { label: 'Annulé', color: 'bg-red-500/20 text-red-300', icon: XCircle },
};

export function DispatchPanel({
  calls,
  onCallClick,
  onCreateCall,
  className = '',
}: DispatchPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<DispatchCall['priority'] | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<DispatchCall['status'] | 'all'>('all');

  // Filtrer et trier les appels
  const filteredCalls = useMemo(() => {
    return calls
      .filter((call) => {
        const matchesSearch =
          call.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          call.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          call.location.address?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesPriority = filterPriority === 'all' || call.priority === filterPriority;
        const matchesStatus = filterStatus === 'all' || call.status === filterStatus;

        return matchesSearch && matchesPriority && matchesStatus;
      })
      .sort((a, b) => {
        // Tri par priorité (code1 > code2 > code3) puis par date
        const priorityOrder = { code1: 0, code2: 1, code3: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [calls, searchTerm, filterPriority, filterStatus]);

  // Statistiques
  const stats = useMemo(() => {
    return {
      total: calls.length,
      pending: calls.filter((c) => c.status === 'pending').length,
      active: calls.filter((c) => ['dispatched', 'en_route', 'on_scene'].includes(c.status)).length,
      code1: calls.filter((c) => c.priority === 'code1').length,
    };
  }, [calls]);

  return (
    <div className={`flex flex-col h-full bg-gray-900/50 backdrop-blur-sm border-r border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-blue-400" />
            Dispatch Central
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCreateCall}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouvel appel
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="bg-gray-800/50 rounded-lg p-2">
            <div className="text-xs text-gray-400">Total</div>
            <div className="text-lg font-bold text-white">{stats.total}</div>
          </div>
          <div className="bg-yellow-500/10 rounded-lg p-2">
            <div className="text-xs text-yellow-400">En attente</div>
            <div className="text-lg font-bold text-yellow-300">{stats.pending}</div>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-2">
            <div className="text-xs text-blue-400">Actifs</div>
            <div className="text-lg font-bold text-blue-300">{stats.active}</div>
          </div>
          <div className="bg-red-500/10 rounded-lg p-2">
            <div className="text-xs text-red-400">Code 1</div>
            <div className="text-lg font-bold text-red-300">{stats.code1}</div>
          </div>
        </div>

        {/* Recherche */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un appel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filtres */}
        <div className="flex gap-2">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as any)}
            className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-600 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toutes priorités</option>
            <option value="code1">Code 1</option>
            <option value="code2">Code 2</option>
            <option value="code3">Code 3</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-600 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous statuts</option>
            <option value="pending">En attente</option>
            <option value="dispatched">Assigné</option>
            <option value="en_route">En route</option>
            <option value="on_scene">Sur place</option>
            <option value="resolved">Résolu</option>
          </select>
        </div>
      </div>

      {/* Liste des appels */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        <AnimatePresence mode="popLayout">
          {filteredCalls.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-gray-400 py-8"
            >
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aucun appel trouvé</p>
            </motion.div>
          ) : (
            filteredCalls.map((call) => {
              const StatusIcon = statusConfig[call.status].icon;
              const priorityInfo = priorityConfig[call.priority];

              return (
                <motion.div
                  key={call.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onClick={() => onCallClick?.(call)}
                  className={`
                    bg-gradient-to-br from-gray-800/80 to-gray-800/60 backdrop-blur-sm
                    rounded-lg border-l-4 ${priorityInfo.borderColor}
                    border-t border-r border-b border-gray-700
                    p-3 cursor-pointer transition-all duration-200
                    hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1
                  `}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xl">{callTypeIcons[call.call_type]}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-white truncate">{call.title}</h3>
                        <p className="text-xs text-gray-400">{callTypeLabels[call.call_type]}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusConfig[call.status].color} flex items-center gap-1`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig[call.status].label}
                    </span>
                  </div>

                  {/* Location */}
                  {call.location.address && (
                    <div className="flex items-center gap-1.5 mb-2 text-xs text-gray-300">
                      <MapPin className="w-3 h-3 text-green-400 flex-shrink-0" />
                      <span className="truncate">{call.location.address}</span>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-gray-400">
                      <Clock className="w-3 h-3" />
                      {formatTimeParis(call.created_at)}
                    </div>
                    {call.assigned_units && call.assigned_units.length > 0 && (
                      <div className="flex items-center gap-1 text-blue-400">
                        <Users className="w-3 h-3" />
                        {call.assigned_units.length} unité(s)
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
