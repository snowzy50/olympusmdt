'use client';

import { LucideIcon } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color?: string;
}

export default function PlaceholderPage({
  title,
  description,
  icon: Icon,
  color = 'primary'
}: PlaceholderPageProps) {
  const colors: Record<string, { bg: string; text: string }> = {
    primary: { bg: 'bg-primary-600/20', text: 'text-primary-400' },
    orange: { bg: 'bg-orange-600/20', text: 'text-orange-400' },
    blue: { bg: 'bg-blue-600/20', text: 'text-blue-400' },
    green: { bg: 'bg-green-600/20', text: 'text-green-400' },
    purple: { bg: 'bg-purple-600/20', text: 'text-purple-400' },
    red: { bg: 'bg-red-600/20', text: 'text-red-400' },
    yellow: { bg: 'bg-yellow-600/20', text: 'text-yellow-400' },
  };

  const colorClasses = colors[color] || colors.primary;

  return (
    <div className="flex-1 overflow-y-auto bg-dark-200">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 ${colorClasses.bg} rounded-xl flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${colorClasses.text}`} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{title}</h1>
              <p className="text-gray-400">{description}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <div className={`w-24 h-24 ${colorClasses.bg} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
            <Icon className={`w-12 h-12 ${colorClasses.text}`} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Page en cours de développement
          </h2>
          <p className="text-gray-400 max-w-md mx-auto mb-6">
            Cette fonctionnalité sera bientôt disponible. L'interface et les fonctionnalités
            sont actuellement en cours de développement.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg text-gray-300">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <span className="text-sm">En construction</span>
          </div>
        </div>
      </div>
    </div>
  );
}
