'use client';

import { Home } from 'lucide-react';

export default function Dynasty8DashboardPage() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
          <Home className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Dynasty 8 Dashboard</h1>
          <p className="text-gray-400">Real Estate Agency</p>
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg p-6">
        <p className="text-gray-300">Bienvenue sur le dashboard Dynasty 8. Les données immobilières sont isolées des autres agences.</p>
      </div>
    </div>
  );
}
