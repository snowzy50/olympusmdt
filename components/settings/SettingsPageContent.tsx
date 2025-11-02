'use client';

import React, { useState } from 'react';
import {
  Settings,
  Save,
  Bell,
  Lock,
  Globe,
  Shield,
  Users,
  Database,
} from 'lucide-react';

interface SettingsPageContentProps {
  agencyId: string;
  agencyName: string;
}

export function SettingsPageContent({ agencyId, agencyName }: SettingsPageContentProps) {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'Général', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'permissions', label: 'Permissions', icon: Lock },
  ];

  return (
    <div className="p-8">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">
          Paramètres
        </h1>
        <p className="text-gray-400">
          Configuration de l'agence {agencyName}
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-2 mb-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-gray-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-8">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-4">
                Paramètres Généraux
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom de l'agence
                  </label>
                  <input
                    type="text"
                    value={agencyName}
                    disabled
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-400
                             cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Code de l'agence
                  </label>
                  <input
                    type="text"
                    value={agencyId.toUpperCase()}
                    disabled
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-400
                             cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fuseau horaire
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white
                             focus:outline-none focus:border-gray-500"
                  >
                    <option>Europe/Paris (GMT+1)</option>
                    <option>America/New_York (GMT-5)</option>
                    <option>Asia/Tokyo (GMT+9)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-4">
                Notifications
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-xl">
                  <div>
                    <p className="text-white font-medium">Nouveaux événements</p>
                    <p className="text-sm text-gray-400">Recevoir une notification pour chaque nouvel événement</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-500"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-xl">
                  <div>
                    <p className="text-white font-medium">Nouveaux agents</p>
                    <p className="text-sm text-gray-400">Notification lors de l'ajout d'un agent</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-4">
                Sécurité
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-gray-700 rounded-xl">
                  <p className="text-white font-medium mb-2">Authentification Discord</p>
                  <p className="text-sm text-gray-400">
                    L'authentification est gérée via Discord OAuth2
                  </p>
                </div>
                <div className="p-4 bg-gray-700 rounded-xl">
                  <p className="text-white font-medium mb-2">Isolation des données</p>
                  <p className="text-sm text-gray-400">
                    Les données de votre agence sont isolées des autres agences
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'permissions' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-4">
                Permissions
              </h2>
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <p className="text-sm text-yellow-300">
                  Les permissions sont gérées via les rôles Discord configurés dans le serveur
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bouton Enregistrer */}
        <div className="mt-8 flex justify-end">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
            <Save className="w-5 h-5" />
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  );
}
