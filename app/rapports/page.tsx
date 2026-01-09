'use client';
export const dynamic = 'force-dynamic';

import { MainLayout } from '@/components/layout/MainLayout';
import ReportCard from '@/components/reports/ReportCard';
import { Search, Filter, Plus, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

const mockReports = [
  {
    id: '1',
    title: 'Contrôle routier - Excès de vitesse',
    type: 'Infraction routière',
    officer: 'Off. Dupont',
    date: new Date(Date.now() - 1000 * 60 * 30),
    location: 'Vinewood Blvd',
    status: 'pending' as const,
    priority: 'low' as const,
  },
  {
    id: '2',
    title: 'Arrestation - Vol de véhicule',
    type: 'Arrestation',
    officer: 'Off. Martin',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2),
    location: 'Legion Square',
    status: 'approved' as const,
    priority: 'high' as const,
  },
  {
    id: '3',
    title: 'Intervention - Trouble à l\'ordre public',
    type: 'Intervention',
    officer: 'Off. Dubois',
    date: new Date(Date.now() - 1000 * 60 * 60 * 5),
    location: 'Grove Street',
    status: 'draft' as const,
    priority: 'medium' as const,
  },
  {
    id: '4',
    title: 'Enquête - Cambriolage',
    type: 'Enquête',
    officer: 'Off. Bernard',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24),
    location: 'Rockford Hills',
    status: 'approved' as const,
    priority: 'high' as const,
  },
  {
    id: '5',
    title: 'Rapport d\'accident',
    type: 'Accident',
    officer: 'Off. Petit',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    location: 'Great Ocean Highway',
    status: 'rejected' as const,
    priority: 'medium' as const,
  },
];

export default function RapportsPage() {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const stats = [
    { label: 'Total', value: '156', icon: FileText, color: 'from-police-blue to-police-blue-light' },
    { label: 'En attente', value: '12', icon: Clock, color: 'from-accent-orange to-accent-red' },
    { label: 'Approuvés', value: '132', icon: CheckCircle, color: 'from-accent-green to-accent-cyan' },
    { label: 'Rejetés', value: '12', icon: XCircle, color: 'from-accent-red to-accent-orange' },
  ];

  const filters = [
    { id: 'all', label: 'Tous les rapports' },
    { id: 'draft', label: 'Brouillons' },
    { id: 'pending', label: 'En attente' },
    { id: 'approved', label: 'Approuvés' },
    { id: 'rejected', label: 'Rejetés' },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Rapports</h1>
            <p className="text-dark-400">Gérez et consultez tous les rapports du département</p>
          </div>
          <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-police-blue to-police-blue-light text-white font-semibold hover:shadow-lg hover:shadow-police-blue/50 transition-all duration-200 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nouveau rapport
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="glass rounded-xl p-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-dark-400">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Filters and Search */}
        <div className="glass rounded-xl p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                placeholder="Rechercher un rapport..."
                className="w-full pl-12 pr-4 py-3 bg-dark-900/50 border border-white/10 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-police-blue/50 focus:border-police-blue
                         transition-all duration-200 text-dark-100 placeholder:text-dark-500"
              />
            </div>

            {/* Filter Button */}
            <button className="px-6 py-3 rounded-xl glass-strong hover:glass transition-all duration-200 flex items-center gap-2 text-white font-semibold">
              <Filter className="w-5 h-5" />
              Filtres
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  activeFilter === filter.id
                    ? 'glass-strong text-police-blue-light'
                    : 'text-dark-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {mockReports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>

        {/* Load More */}
        <div className="flex justify-center">
          <button className="px-8 py-3 rounded-xl glass-strong hover:glass transition-all duration-200 text-white font-semibold">
            Charger plus de rapports
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
