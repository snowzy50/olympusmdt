'use client';

import { Scale } from 'lucide-react';

export default function DOJDashboardPage() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center">
          <Scale className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">DOJ Dashboard</h1>
          <p className="text-gray-400">Department of Justice</p>
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg p-6">
        <p className="text-gray-300">Bienvenue sur le dashboard DOJ. Les données judiciaires sont isolées des autres agences.</p>
      </div>
    </div>
  );
}
