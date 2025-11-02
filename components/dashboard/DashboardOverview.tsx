/**
 * Vue d'ensemble du dashboard - Page d'accueil
 * Créé par: Snowzy
 * Features: Widgets Realtime, Statistiques, Design premium
 */

'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Radio,
  Users,
  TrendingUp,
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Zap,
  Shield,
} from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useDispatchCalls } from '@/hooks/useDispatchCalls';
import { EventsWidget } from './widgets/EventsWidget';
import { DispatchWidget } from './widgets/DispatchWidget';
import { StatsCard } from './widgets/StatsCard';
import { ActivityFeed } from './widgets/ActivityFeed';

interface DashboardOverviewProps {
  agencyId: string;
  agencyName: string;
}

const AGENCY_COLORS = {
  sasp: { primary: 'blue', gradient: 'from-blue-500 to-blue-700' },
  samc: { primary: 'red', gradient: 'from-red-500 to-red-700' },
  safd: { primary: 'orange', gradient: 'from-orange-500 to-orange-700' },
  dynasty8: { primary: 'purple', gradient: 'from-purple-500 to-purple-700' },
  doj: { primary: 'yellow', gradient: 'from-yellow-500 to-yellow-700' },
};

export function DashboardOverview({ agencyId, agencyName }: DashboardOverviewProps) {
  const { events, isConnected: eventsConnected, getStats: getEventStats } = useEvents();
  const { calls, isConnected: dispatchConnected, getStats: getDispatchStats, getActiveCalls } = useDispatchCalls({ agencyId });

  const colors = AGENCY_COLORS[agencyId as keyof typeof AGENCY_COLORS] || AGENCY_COLORS.sasp;
  const eventStats = getEventStats();
  const dispatchStats = getDispatchStats();
  const activeCalls = getActiveCalls();

  // Événements à venir (prochaines 24h)
  const upcomingEvents = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return events
      .filter((e) => {
        const eventDate = new Date(e.start_date);
        return eventDate >= new Date() && eventDate <= tomorrow && e.status !== 'cancelled';
      })
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
      .slice(0, 5);
  }, [events]);

  // Appels actifs
  const recentCalls = useMemo(() => {
    return activeCalls
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [activeCalls]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-2">
          <div className={`w-16 h-16 bg-gradient-to-br ${colors.gradient} rounded-2xl flex items-center justify-center shadow-2xl`}>
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Tableau de bord</h1>
            <p className="text-gray-400 text-lg">{agencyName} - Vue d'ensemble</p>
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg">
            <div className={`w-2 h-2 rounded-full ${eventsConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs text-gray-300">Événements</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg">
            <div className={`w-2 h-2 rounded-full ${dispatchConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs text-gray-300">Dispatch</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span className="text-xs text-gray-300">Temps réel actif</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          icon={Calendar}
          label="Événements"
          value={eventStats.total}
          subtitle={`${eventStats.upcoming} à venir`}
          trend={eventStats.upcoming > 0 ? 'up' : 'neutral'}
          color="blue"
          delay={0}
        />
        <StatsCard
          icon={Radio}
          label="Appels actifs"
          value={dispatchStats.active}
          subtitle={`${dispatchStats.pending} en attente`}
          trend={dispatchStats.active > 0 ? 'up' : 'neutral'}
          color="orange"
          delay={0.1}
        />
        <StatsCard
          icon={AlertTriangle}
          label="Code 1"
          value={dispatchStats.byPriority.code1}
          subtitle="Haute priorité"
          trend={dispatchStats.byPriority.code1 > 0 ? 'up' : 'neutral'}
          color="red"
          delay={0.2}
        />
        <StatsCard
          icon={Activity}
          label="Activité 24h"
          value={events.length + calls.length}
          subtitle="Total d'activités"
          trend="up"
          color="green"
          delay={0.3}
        />
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Events Widget - 2 columns */}
        <div className="lg:col-span-2">
          <EventsWidget
            events={upcomingEvents}
            total={events.length}
            agencyId={agencyId}
            isConnected={eventsConnected}
          />
        </div>

        {/* Activity Feed - 1 column */}
        <div className="lg:col-span-1">
          <ActivityFeed
            events={upcomingEvents}
            calls={recentCalls}
            agencyId={agencyId}
          />
        </div>
      </div>

      {/* Dispatch Widget - Full width */}
      <div className="mb-8">
        <DispatchWidget
          calls={recentCalls}
          total={calls.length}
          agencyId={agencyId}
          isConnected={dispatchConnected}
        />
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <button className="group relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-700/10 border border-blue-500/20 rounded-xl p-6 hover:from-blue-500/20 hover:to-blue-700/20 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-left">
              <h3 className="text-white font-semibold">Créer un événement</h3>
              <p className="text-sm text-gray-400">Planifier une intervention</p>
            </div>
          </div>
        </button>

        <button className="group relative overflow-hidden bg-gradient-to-br from-orange-500/10 to-orange-700/10 border border-orange-500/20 rounded-xl p-6 hover:from-orange-500/20 hover:to-orange-700/20 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Radio className="w-6 h-6 text-orange-400" />
            </div>
            <div className="text-left">
              <h3 className="text-white font-semibold">Nouvel appel</h3>
              <p className="text-sm text-gray-400">Créer un dispatch</p>
            </div>
          </div>
        </button>

        <button className="group relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-purple-700/10 border border-purple-500/20 rounded-xl p-6 hover:from-purple-500/20 hover:to-purple-700/20 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-left">
              <h3 className="text-white font-semibold">Gérer agents</h3>
              <p className="text-sm text-gray-400">Équipes & unités</p>
            </div>
          </div>
        </button>
      </motion.div>
    </div>
  );
}
