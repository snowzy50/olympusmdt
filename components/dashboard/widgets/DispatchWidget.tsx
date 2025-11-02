/**
 * Widget Dispatch pour la page d'accueil
 * Créé par: Snowzy
 * Features: Liste scrollable, Realtime, design premium
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  MapPin,
  Clock,
  Users,
  ChevronRight,
  AlertTriangle,
  Activity,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { DispatchCall } from '@/services/dispatchRealtimeService';
import { formatTimeParis } from '@/lib/dateUtils';

interface DispatchWidgetProps {
  calls: DispatchCall[];
  total: number;
  agencyId: string;
  isConnected: boolean;
}

const callTypeLabels: Record<DispatchCall['call_type'], string> = {
  robbery: 'Vol à main armée',
  medical: 'Urgence médicale',
  traffic: 'Accident',
  assault: 'Agression',
  fire: 'Incendie',
  pursuit: 'Poursuite',
  suspicious: 'Activité suspecte',
  backup: 'Renfort',
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

const priorityConfig: Record<string, { label: string; color: string; borderColor: string }> = {
  code1: { label: 'Code 1', color: 'bg-red-500/20 text-red-300', borderColor: 'border-l-red-500' },
  code2: { label: 'Code 2', color: 'bg-orange-500/20 text-orange-300', borderColor: 'border-l-orange-500' },
  code3: { label: 'Code 3', color: 'bg-blue-500/20 text-blue-300', borderColor: 'border-l-blue-500' },
};

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'En attente', color: 'bg-yellow-500/20 text-yellow-300', icon: Clock },
  dispatched: { label: 'Assigné', color: 'bg-blue-500/20 text-blue-300', icon: Radio },
  en_route: { label: 'En route', color: 'bg-purple-500/20 text-purple-300', icon: MapPin },
  on_scene: { label: 'Sur place', color: 'bg-orange-500/20 text-orange-300', icon: AlertTriangle },
  resolved: { label: 'Résolu', color: 'bg-green-500/20 text-green-300', icon: CheckCircle2 },
  cancelled: { label: 'Annulé', color: 'bg-red-500/20 text-red-300', icon: XCircle },
};

export function DispatchWidget({ calls, total, agencyId, isConnected }: DispatchWidgetProps) {
  const router = useRouter();

  const handleViewAll = () => {
    router.push(`/dashboard/${agencyId}/dispatch`);
  };

  const handleCallClick = (callId: string) => {
    router.push(`/dashboard/${agencyId}/dispatch?call=${callId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="h-full flex flex-col bg-gradient-to-br from-gray-800/80 to-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700 bg-gray-900/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-700 rounded-lg flex items-center justify-center">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Dispatch Central</h3>
              <p className="text-xs text-gray-400">Appels actifs en cours</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs text-gray-400">{total} total</span>
          </div>
        </div>

        <button
          onClick={handleViewAll}
          className="w-full px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg text-orange-400 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200"
        >
          <Radio className="w-4 h-4" />
          Voir tous les appels
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Liste des appels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        <AnimatePresence mode="popLayout">
          {calls.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full text-center py-12"
            >
              <Activity className="w-16 h-16 text-gray-600 mb-4" />
              <p className="text-gray-400 text-sm">Aucun appel actif</p>
              <p className="text-gray-500 text-xs mt-1">Tous les appels sont résolus</p>
            </motion.div>
          ) : (
            calls.map((call) => {
              const statusInfo = statusConfig[call.status] || statusConfig.pending;
              const StatusIcon = statusInfo.icon;
              const priorityInfo = priorityConfig[call.priority] || priorityConfig.code3;

              return (
                <motion.div
                  key={call.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onClick={() => handleCallClick(call.id)}
                  className={`
                    group relative overflow-hidden
                    bg-gradient-to-br from-gray-800/90 to-gray-800/70 backdrop-blur-sm
                    rounded-lg border-l-4 ${priorityInfo?.borderColor || 'border-l-gray-500'}
                    border-t border-r border-b border-gray-700
                    p-3 cursor-pointer transition-all duration-200
                    hover:shadow-lg hover:shadow-orange-500/10 hover:-translate-y-1
                  `}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity">
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                    }} />
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-2xl flex-shrink-0">{callTypeIcons[call.call_type]}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">{call.title}</h4>
                          <p className="text-xs text-gray-400">{callTypeLabels[call.call_type]}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${priorityInfo?.color || 'bg-gray-500/20 text-gray-300'} flex items-center gap-1`}>
                          {priorityInfo?.label || 'Normal'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusInfo?.color || 'bg-gray-500/20 text-gray-300'} flex items-center gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo?.label || 'Inconnu'}
                        </span>
                      </div>
                    </div>

                    {/* Location */}
                    {call.location.address && (
                      <div className="flex items-center gap-1 mb-2 text-xs text-gray-300">
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
                  </div>

                  {/* Hover Arrow */}
                  <ChevronRight className="absolute top-1/2 right-3 -translate-y-1/2 w-5 h-5 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
