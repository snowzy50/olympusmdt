'use client';

import MainLayout from '@/components/layout/MainLayout';
import StatCard from '@/components/ui/StatCard';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentActivity from '@/components/dashboard/RecentActivity';
import ActiveUnits from '@/components/dashboard/ActiveUnits';
import {
  FileText,
  Users,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Activity,
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="glass rounded-2xl p-8 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Bon retour, <span className="text-gradient-blue">Officier Dupont</span>
              </h1>
              <p className="text-dark-400">
                Voici un aperçu de l'activité du département aujourd'hui
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-accent-green/20 text-accent-green font-semibold flex items-center gap-2">
                <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></div>
                En service
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Rapports aujourd'hui"
            value="24"
            icon={FileText}
            trend={{ value: '12%', isPositive: true }}
            color="blue"
          />
          <StatCard
            title="Arrestations"
            value="8"
            icon={Users}
            trend={{ value: '3%', isPositive: false }}
            color="purple"
          />
          <StatCard
            title="Incidents actifs"
            value="5"
            icon={AlertTriangle}
            color="orange"
          />
          <StatCard
            title="Affaires résolues"
            value="156"
            icon={CheckCircle}
            trend={{ value: '8%', isPositive: true }}
            color="green"
          />
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity - Takes 2 columns */}
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>

          {/* Active Units - Takes 1 column */}
          <div className="lg:col-span-1">
            <ActiveUnits />
          </div>
        </div>

        {/* Performance Overview */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-accent-purple/20">
              <TrendingUp className="w-5 h-5 text-accent-purple" />
            </div>
            <h2 className="text-xl font-bold text-white">Aperçu des performances</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl glass-strong">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-dark-400">Taux de résolution</span>
                <Activity className="w-4 h-4 text-accent-green" />
              </div>
              <div className="text-2xl font-bold text-white mb-2">87%</div>
              <div className="w-full bg-dark-900/50 rounded-full h-2">
                <div className="bg-gradient-to-r from-accent-green to-accent-cyan h-2 rounded-full" style={{ width: '87%' }}></div>
              </div>
            </div>

            <div className="p-4 rounded-xl glass-strong">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-dark-400">Temps de réponse moyen</span>
                <Activity className="w-4 h-4 text-police-blue" />
              </div>
              <div className="text-2xl font-bold text-white mb-2">4.2 min</div>
              <div className="w-full bg-dark-900/50 rounded-full h-2">
                <div className="bg-gradient-to-r from-police-blue to-accent-cyan h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>

            <div className="p-4 rounded-xl glass-strong">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-dark-400">Satisfaction citoyenne</span>
                <Activity className="w-4 h-4 text-accent-purple" />
              </div>
              <div className="text-2xl font-bold text-white mb-2">94%</div>
              <div className="w-full bg-dark-900/50 rounded-full h-2">
                <div className="bg-gradient-to-r from-accent-purple to-police-blue h-2 rounded-full" style={{ width: '94%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
