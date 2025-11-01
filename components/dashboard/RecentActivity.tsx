'use client';

import { FileText, UserCheck, Car, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const activities = [
  {
    id: 1,
    type: 'report',
    icon: FileText,
    title: 'Rapport d\'intervention créé',
    description: 'Contrôle routier - Vinewood Blvd',
    user: 'Off. Martin',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    color: 'text-police-blue',
  },
  {
    id: 2,
    type: 'arrest',
    icon: UserCheck,
    title: 'Arrestation enregistrée',
    description: 'John Doe - Vol de véhicule',
    user: 'Off. Dubois',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    color: 'text-accent-green',
  },
  {
    id: 3,
    type: 'vehicle',
    icon: Car,
    title: 'Véhicule signalé',
    description: 'Plaque: ABC-123 - Volé',
    user: 'Off. Dupont',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    color: 'text-accent-orange',
  },
  {
    id: 4,
    type: 'alert',
    icon: AlertCircle,
    title: 'Alerte émise',
    description: 'Code 3 - Poursuite en cours',
    user: 'Off. Bernard',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    color: 'text-accent-red',
  },
];

export default function RecentActivity() {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Activité récente</h2>
        <button className="text-sm text-police-blue hover:text-police-blue-light transition-colors">
          Voir tout
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-4 rounded-xl glass-strong hover:bg-white/5 transition-all duration-200 group cursor-pointer"
            >
              <div className={`p-2 rounded-lg bg-dark-900/50 ${activity.color}`}>
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-police-blue-light transition-colors">
                  {activity.title}
                </h3>
                <p className="text-xs text-dark-400 mb-2">{activity.description}</p>
                <div className="flex items-center gap-2 text-xs text-dark-500">
                  <span>{activity.user}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: fr })}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
