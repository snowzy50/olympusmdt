/**
 * Fil d'activité combiné pour la page d'accueil
 * Créé par: Snowzy
 * Features: Timeline combinée, Realtime, design premium
 */

'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Calendar,
  Radio,
  Clock,
  MapPin,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Event } from '@/services/eventsRealtimeService';
import type { DispatchCall } from '@/services/dispatchRealtimeService';
import { formatTimeParis } from '@/lib/dateUtils';

interface ActivityFeedProps {
  events: Event[];
  calls: DispatchCall[];
  agencyId: string;
}

type ActivityItem = {
  id: string;
  type: 'event' | 'call';
  icon: string;
  title: string;
  subtitle: string;
  time: string;
  timestamp: Date;
  color: string;
  location?: string;
};

const eventTypeIcons: Record<Event['event_type'], string> = {
  operation: '🎯',
  training: '📚',
  patrol: '🚔',
  meeting: '📋',
  ceremony: '🎖️',
  other: '📌',
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

export function ActivityFeed({ events, calls, agencyId }: ActivityFeedProps) {
  const router = useRouter();

  // Combiner et trier les activités
  const activities = useMemo(() => {
    const eventActivities: ActivityItem[] = events.map((event) => ({
      id: event.id,
      type: 'event' as const,
      icon: eventTypeIcons[event.event_type],
      title: event.title,
      subtitle: 'Événement planifié',
      time: formatTimeParis(event.date),
      timestamp: new Date(event.date),
      color: 'blue',
      location: event.location,
    }));

    const callActivities: ActivityItem[] = calls.map((call) => ({
      id: call.id,
      type: 'call' as const,
      icon: callTypeIcons[call.call_type],
      title: call.title,
      subtitle: `Appel ${call.priority.toUpperCase()}`,
      time: formatTimeParis(call.created_at),
      timestamp: new Date(call.created_at),
      color: call.priority === 'code1' ? 'red' : call.priority === 'code2' ? 'orange' : 'blue',
      location: call.location.address,
    }));

    return [...eventActivities, ...callActivities]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10); // Limiter aux 10 dernières activités
  }, [events, calls]);

  const handleActivityClick = (activity: ActivityItem) => {
    if (activity.type === 'event') {
      router.push(`/dashboard/${agencyId}/evenements?event=${activity.id}`);
    } else {
      router.push(`/dashboard/${agencyId}/dispatch?call=${activity.id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="h-full flex flex-col bg-gradient-to-br from-gray-800/80 to-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700 bg-gray-900/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Activité récente</h3>
            <p className="text-xs text-gray-400">Dernières actions</p>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-0.5">
              <Calendar className="w-3 h-3 text-blue-400" />
              <span className="text-[10px] text-blue-400 font-medium">Événements</span>
            </div>
            <div className="text-lg font-bold text-white">{events.length}</div>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-0.5">
              <Radio className="w-3 h-3 text-orange-400" />
              <span className="text-[10px] text-orange-400 font-medium">Appels</span>
            </div>
            <div className="text-lg font-bold text-white">{calls.length}</div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-transparent" />

          <AnimatePresence mode="popLayout">
            {activities.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full text-center py-12"
              >
                <Zap className="w-16 h-16 text-gray-600 mb-4" />
                <p className="text-gray-400 text-sm">Aucune activité récente</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleActivityClick(activity)}
                    className="relative pl-12 group cursor-pointer"
                  >
                    {/* Timeline Dot */}
                    <div className={`absolute left-3.5 top-1 w-5 h-5 rounded-full ${
                      activity.color === 'red' ? 'bg-red-500' :
                      activity.color === 'orange' ? 'bg-orange-500' :
                      'bg-blue-500'
                    } border-2 border-gray-900 flex items-center justify-center shadow-lg`}>
                      {activity.type === 'event' ? (
                        <Calendar className="w-2.5 h-2.5 text-white" />
                      ) : (
                        <Radio className="w-2.5 h-2.5 text-white" />
                      )}
                    </div>

                    {/* Content Card */}
                    <div className="bg-gradient-to-br from-gray-800/80 to-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-lg p-3 transition-all duration-200 group-hover:shadow-lg group-hover:shadow-purple-500/10 group-hover:-translate-y-0.5">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-xl flex-shrink-0">{activity.icon}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-white truncate">{activity.title}</h4>
                            <p className="text-xs text-gray-400">{activity.subtitle}</p>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-gray-400">
                          <Clock className="w-3 h-3" />
                          {activity.time}
                        </div>
                        {activity.location && (
                          <div className="flex items-center gap-1 text-green-400 truncate max-w-[60%]">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate text-[10px]">{activity.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Bottom fade */}
          {activities.length > 5 && (
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-800/80 to-transparent pointer-events-none" />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-3 border-t border-gray-700 bg-gray-900/50">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <TrendingUp className="w-3 h-3 text-green-400" />
          <span>Mise à jour en temps réel</span>
        </div>
      </div>
    </motion.div>
  );
}
