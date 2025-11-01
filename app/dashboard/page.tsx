'use client';

import { useState } from 'react';
import { DashboardCard, StatusIndicator, Badge, Card, Button } from '@/components/ui';
import {
  AlertCircle,
  Clock,
  Wrench,
  Calendar,
  TrendingUp,
  Users,
  FileText,
  Bell,
  Activity,
  Shield,
} from 'lucide-react';

type Notification = {
  id: number;
  type: string;
  message: string;
  time: string;
};

export default function DashboardPage() {
  const [notifications] = useState<Notification[]>([
    { id: 1, type: 'critical', message: 'Nouvelle plainte critique nécessite attention', time: '2 min' },
    { id: 2, type: 'warning', message: 'Convocation prévue dans 30 minutes', time: '15 min' },
    { id: 3, type: 'info', message: 'Rapport mensuel disponible', time: '1h' },
  ]);

  return (
    <>
      <header className="sticky top-0 z-40 glass-strong border-b border-gray-700/50 px-8 py-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                Dashboard
              </h1>
              <p className="text-sm text-gray-400">
                Bienvenue, Officier Smith - SASP #1234
              </p>
            </div>

            <div className="flex items-center gap-4">
              <StatusIndicator type="live" text="LIVE" />
              <StatusIndicator type="sync" text="Sync Monitor" />

              <div className="relative">
                <button className="relative p-3 glass rounded-xl hover:bg-white/10 transition-all duration-300">
                  <Bell className="w-5 h-5 text-gray-300" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    3
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="px-8 py-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              title="Plaintes Critiques"
              value="7"
              subtitle="Requiert action immédiate"
              icon={AlertCircle}
              variant="critical"
              trend={{ value: '+2 aujourd hui', positive: false }}
            />

            <DashboardCard
              title="Convocations Urgentes"
              value="12"
              subtitle="Prochaines 48h"
              icon={Clock}
              variant="warning"
              trend={{ value: '+5 cette semaine', positive: true }}
            />

            <DashboardCard
              title="Équipements"
              value="94%"
              subtitle="Disponibilité opérationnelle"
              icon={Wrench}
              variant="info"
              trend={{ value: '+3% ce mois', positive: true }}
            />

            <DashboardCard
              title="Événements"
              value="23"
              subtitle="Planifiés ce mois"
              icon={Calendar}
              variant="success"
              trend={{ value: '+8 vs mois dernier', positive: true }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass rounded-2xl shadow-xl p-6 hover:scale-[1.02] transition-all duration-500 group">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                  Cas actifs
                </h4>
                <FileText className="w-5 h-5 text-primary-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <p className="text-4xl font-bold text-white mb-2 group-hover:scale-105 transition-transform duration-300">
                27
              </p>
              <p className="text-xs text-success-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>+3 cette semaine</span>
              </p>
            </div>

            <div className="glass rounded-2xl shadow-xl p-6 hover:scale-[1.02] transition-all duration-500 group">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                  Cas résolus
                </h4>
                <Activity className="w-5 h-5 text-success-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <p className="text-4xl font-bold text-white mb-2 group-hover:scale-105 transition-transform duration-300">
                156
              </p>
              <p className="text-xs text-success-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>+12 ce mois</span>
              </p>
            </div>

            <div className="glass rounded-2xl shadow-xl p-6 hover:scale-[1.02] transition-all duration-500 group">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                  Officiers actifs
                </h4>
                <Users className="w-5 h-5 text-primary-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <p className="text-4xl font-bold text-white mb-2 group-hover:scale-105 transition-transform duration-300">
                42
              </p>
              <p className="text-xs text-primary-400">
                En service maintenant
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card variant="elevated">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  Cas Récents
                </h3>
                <Button variant="ghost" size="sm">
                  Voir tout
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 glass rounded-xl hover:bg-white/5 transition-all duration-300 cursor-pointer group">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-medium text-white">2024-001</p>
                      <Badge variant="error" outline>pending</Badge>
                    </div>
                    <p className="text-gray-400 text-sm">Vol de véhicule</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">5 min</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 glass rounded-xl hover:bg-white/5 transition-all duration-300 cursor-pointer group">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-medium text-white">2024-002</p>
                      <Badge variant="warning" outline>investigating</Badge>
                    </div>
                    <p className="text-gray-400 text-sm">Accident routier</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">23 min</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 glass rounded-xl hover:bg-white/5 transition-all duration-300 cursor-pointer group">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-medium text-white">2024-003</p>
                      <Badge variant="success" outline>resolved</Badge>
                    </div>
                    <p className="text-gray-400 text-sm">Excès de vitesse</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">1h</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card variant="elevated">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary-400" />
                  Notifications
                </h3>
                <Button variant="ghost" size="sm">
                  Tout marquer lu
                </Button>
              </div>

              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-xl border-l-4 transition-all duration-300 cursor-pointer hover:bg-white/5 ${
                      notification.type === 'critical' ? 'border-error-500 bg-error-500/5' :
                      notification.type === 'warning' ? 'border-warning-500 bg-warning-500/5' :
                      'border-primary-500 bg-primary-500/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm text-white mb-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          Il y a {notification.time}
                        </p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        notification.type === 'critical' ? 'bg-error-500' :
                        notification.type === 'warning' ? 'bg-warning-500' :
                        'bg-primary-500'
                      } animate-pulse`} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card variant="elevated">
            <h3 className="text-xl font-bold text-white mb-6">
              Actions Rapides
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button className="flex items-center gap-3 p-4 glass rounded-xl hover:bg-primary-500/10 hover:border-primary-500/50 border border-transparent transition-all duration-300 group">
                <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center group-hover:bg-primary-600 transition-all duration-300">
                  <FileText className="w-5 h-5 text-primary-400 group-hover:text-white" />
                </div>
                <span className="text-gray-300 group-hover:text-white font-medium">
                  Nouveau cas
                </span>
              </button>

              <button className="flex items-center gap-3 p-4 glass rounded-xl hover:bg-success-500/10 hover:border-success-500/50 border border-transparent transition-all duration-300 group">
                <div className="w-10 h-10 bg-success-600/20 rounded-lg flex items-center justify-center group-hover:bg-success-600 transition-all duration-300">
                  <Shield className="w-5 h-5 text-success-400 group-hover:text-white" />
                </div>
                <span className="text-gray-300 group-hover:text-white font-medium">
                  Patrouille
                </span>
              </button>

              <button className="flex items-center gap-3 p-4 glass rounded-xl hover:bg-warning-500/10 hover:border-warning-500/50 border border-transparent transition-all duration-300 group">
                <div className="w-10 h-10 bg-warning-600/20 rounded-lg flex items-center justify-center group-hover:bg-warning-600 transition-all duration-300">
                  <Clock className="w-5 h-5 text-warning-400 group-hover:text-white" />
                </div>
                <span className="text-gray-300 group-hover:text-white font-medium">
                  Convocation
                </span>
              </button>

              <button className="flex items-center gap-3 p-4 glass rounded-xl hover:bg-primary-500/10 hover:border-primary-500/50 border border-transparent transition-all duration-300 group">
                <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center group-hover:bg-primary-600 transition-all duration-300">
                  <Activity className="w-5 h-5 text-primary-400 group-hover:text-white" />
                </div>
                <span className="text-gray-300 group-hover:text-white font-medium">
                  Rapport
                </span>
              </button>
            </div>
          </Card>
        </div>
    </>
  );
}
