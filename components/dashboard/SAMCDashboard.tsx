/**
 * Dashboard SAMC - San Andreas Medical Center
 * Créé par: Snowzy
 * Features: Vue d'ensemble médicale avec statistiques en temps réel
 */

'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Users,
  FileText,
  Stethoscope,
  AlertTriangle,
  Clock,
  TrendingUp,
  Calendar,
  Radio,
  Zap,
  Heart,
  Clipboard,
  Pill,
  UserPlus,
  Plus,
} from 'lucide-react';
import { useSupabaseInterventions } from '@/hooks/useSupabaseInterventions';
import { useSupabaseMedicalRecords } from '@/hooks/useSupabaseMedicalRecords';
import { useSupabaseMedicalStaff } from '@/hooks/useSupabaseMedicalStaff';
import { useSupabasePrescriptions } from '@/hooks/useSupabasePrescriptions';
import { useSupabaseCertificates } from '@/hooks/useSupabaseCertificates';
import { useSupabaseIncidentReports } from '@/hooks/useSupabaseIncidentReports';
import { useEvents } from '@/hooks/useEvents';
import { useDispatchCalls } from '@/hooks/useDispatchCalls';
import { StatsCard } from './widgets/StatsCard';
import { useRouter } from 'next/navigation';

export function SAMCDashboard() {
  const router = useRouter();

  // Hooks pour les données médicales
  const { interventions, loading: loadingInterventions } = useSupabaseInterventions();
  const { records, isLoading: loadingRecords } = useSupabaseMedicalRecords();
  const { medicalStaff, loading: loadingStaff } = useSupabaseMedicalStaff();
  const { prescriptions, loading: loadingPrescriptions } = useSupabasePrescriptions();
  const { certificates, isLoading: loadingCertificates } = useSupabaseCertificates();
  const { incidentReports, loading: loadingIncidents } = useSupabaseIncidentReports();

  // Hooks pour événements et dispatch
  const { events, isConnected: eventsConnected } = useEvents();
  const { calls, isConnected: dispatchConnected } = useDispatchCalls({ agencyId: 'samc' });

  // Statistiques médicales
  const medicalStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      // Interventions
      activeInterventions: interventions.filter(i => i.status === 'in_progress').length,
      totalInterventions: interventions.length,
      todayInterventions: interventions.filter(i =>
        new Date(i.date) >= today
      ).length,

      // Dossiers médicaux
      activeCases: records.filter(r => r.status === 'ongoing').length,
      criticalCases: records.filter(r => r.priority === 'critical').length,
      totalRecords: records.length,

      // Personnel
      availableStaff: medicalStaff.filter(s => s.availability === 'available').length,
      onDutyStaff: medicalStaff.filter(s =>
        s.availability === 'available' || s.availability === 'on_call'
      ).length,
      totalStaff: medicalStaff.filter(s => s.status === 'active').length,

      // Prescriptions
      activePrescriptions: prescriptions.filter(p => p.status === 'active').length,
      todayPrescriptions: prescriptions.filter(p =>
        new Date(p.date) >= today
      ).length,

      // Certificats
      todayCertificates: certificates.filter(c =>
        new Date(c.date) >= today
      ).length,
      validCertificates: certificates.filter(c => c.status === 'valid').length,

      // Incidents
      activeIncidents: incidentReports.filter(i => i.status === 'investigating').length,
      criticalIncidents: incidentReports.filter(i =>
        i.severity === 'critical' || i.severity === 'severe'
      ).length,

      // Événements et Dispatch
      upcomingEvents: events.filter(e =>
        new Date(e.start_date) > new Date() && e.status !== 'cancelled'
      ).length,
      activeCalls: calls.filter(c =>
        c.status === 'dispatched' || c.status === 'en_route' || c.status === 'on_scene'
      ).length,
    };
  }, [interventions, records, medicalStaff, prescriptions, certificates, incidentReports, events, calls]);

  // Activités récentes
  const recentActivity = useMemo(() => {
    const activities = [];

    // Interventions récentes
    interventions.slice(0, 5).forEach(i => {
      activities.push({
        type: 'intervention',
        title: `Intervention ${i.intervention_number}`,
        subtitle: `${i.patient_name} - ${i.type}`,
        time: new Date(i.date),
        icon: Activity,
        color: 'red',
      });
    });

    // Dossiers récents
    records.slice(0, 3).forEach(r => {
      activities.push({
        type: 'record',
        title: `Dossier ${r.record_number}`,
        subtitle: `${r.patient_name} - ${r.diagnosis}`,
        time: new Date(r.date),
        icon: Clipboard,
        color: 'blue',
      });
    });

    // Trier par date
    return activities
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, 8);
  }, [interventions, records]);

  const isLoading = loadingInterventions || loadingRecords || loadingStaff ||
                     loadingPrescriptions || loadingCertificates || loadingIncidents;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agencies-samc-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold text-white">San Andreas Medical Center</h1>
          <p className="text-gray-400 text-lg">Tableau de bord - Vue d'ensemble médicale</p>
        </div>
      </motion.div>

      {/* Stats Grid - Medical Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          icon={Activity}
          label="Interventions actives"
          value={medicalStats.activeInterventions}
          subtitle={`${medicalStats.todayInterventions} aujourd'hui`}
          trend={medicalStats.activeInterventions > 0 ? 'up' : 'neutral'}
          color="red"
          delay={0}
          onClick={() => router.push('/dashboard/samc/interventions')}
        />
        <StatsCard
          icon={Clipboard}
          label="Dossiers en cours"
          value={medicalStats.activeCases}
          subtitle={`${medicalStats.criticalCases} critiques`}
          trend={medicalStats.criticalCases > 0 ? 'up' : 'neutral'}
          color="blue"
          delay={0.1}
          onClick={() => router.push('/dashboard/samc/medical-records')}
        />
        <StatsCard
          icon={Users}
          label="Personnel disponible"
          value={medicalStats.availableStaff}
          subtitle={`${medicalStats.totalStaff} actifs`}
          trend="neutral"
          color="green"
          delay={0.2}
          onClick={() => router.push('/dashboard/samc/medical-staff')}
        />
        <StatsCard
          icon={Pill}
          label="Prescriptions"
          value={medicalStats.activePrescriptions}
          subtitle={`${medicalStats.todayPrescriptions} aujourd'hui`}
          trend={medicalStats.todayPrescriptions > 0 ? 'up' : 'neutral'}
          color="purple"
          delay={0.3}
          onClick={() => router.push('/dashboard/samc/prescriptions')}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => router.push('/dashboard/samc/certificates')}
          className="glass-strong p-4 rounded-lg border border-white/10 hover:bg-white/5 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Certificats émis</p>
              <p className="text-2xl font-bold text-white">{medicalStats.todayCertificates}</p>
              <p className="text-xs text-gray-500">Aujourd'hui</p>
            </div>
            <FileText className="w-8 h-8 text-agencies-samc-500" />
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={() => router.push('/dashboard/samc/incident-reports')}
          className="glass-strong p-4 rounded-lg border border-white/10 hover:bg-white/5 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Incidents</p>
              <p className="text-2xl font-bold text-white">{medicalStats.activeIncidents}</p>
              <p className="text-xs text-error-500">{medicalStats.criticalIncidents} critiques</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-error-500" />
          </div>
        </motion.button>
      </div>

      {/* Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass-strong p-6 rounded-lg border border-white/10 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-agencies-samc-500" />
            Activité récente
          </h2>
          <span className="text-sm text-gray-400">{recentActivity.length} activités</span>
        </div>

        <div className="space-y-3">
          {recentActivity.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.05 }}
                className="flex items-center gap-4 p-3 bg-dark-200/50 rounded-lg hover:bg-dark-200 transition-colors"
              >
                <div className={`w-10 h-10 bg-${activity.color}-500/10 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 text-${activity.color}-500`} />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{activity.title}</p>
                  <p className="text-sm text-gray-400">{activity.subtitle}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {activity.time.toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activity.time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <button
          onClick={() => router.push('/dashboard/samc/interventions')}
          className="group relative overflow-hidden bg-gradient-to-br from-agencies-samc-500/10 to-agencies-samc-700/10 border border-agencies-samc-500/20 rounded-xl p-6 hover:from-agencies-samc-500/20 hover:to-agencies-samc-700/20 transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-agencies-samc-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-agencies-samc-400" />
            </div>
            <div className="text-left">
              <h3 className="text-white font-semibold">Nouvelle intervention</h3>
              <p className="text-sm text-gray-400">Créer une intervention médicale</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push('/dashboard/samc/medical-records')}
          className="group relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-700/10 border border-blue-500/20 rounded-xl p-6 hover:from-blue-500/20 hover:to-blue-700/20 transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clipboard className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-left">
              <h3 className="text-white font-semibold">Nouveau dossier médical</h3>
              <p className="text-sm text-gray-400">Ouvrir un dossier patient</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push('/dashboard/samc/prescriptions')}
          className="group relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-purple-700/10 border border-purple-500/20 rounded-xl p-6 hover:from-purple-500/20 hover:to-purple-700/20 transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Pill className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-left">
              <h3 className="text-white font-semibold">Nouvelle prescription</h3>
              <p className="text-sm text-gray-400">Émettre une ordonnance</p>
            </div>
          </div>
        </button>
      </motion.div>
    </div>
  );
}
