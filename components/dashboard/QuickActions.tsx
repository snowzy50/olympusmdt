'use client';

import { FileText, UserPlus, Car, AlertTriangle, Clock, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const actions = [
  {
    name: 'Nouveau rapport',
    icon: FileText,
    color: 'from-police-blue to-police-blue-light',
    description: 'Créer un rapport',
  },
  {
    name: 'Ajouter citoyen',
    icon: UserPlus,
    color: 'from-accent-purple to-police-blue',
    description: 'Enregistrer un individu',
  },
  {
    name: 'Recherche véhicule',
    icon: Car,
    color: 'from-accent-cyan to-police-blue-light',
    description: 'Vérifier une plaque',
  },
  {
    name: 'Signaler incident',
    icon: AlertTriangle,
    color: 'from-accent-orange to-accent-red',
    description: 'Créer une alerte',
  },
  {
    name: 'Planning',
    icon: Clock,
    color: 'from-accent-green to-accent-cyan',
    description: 'Voir les horaires',
  },
  {
    name: 'Patrouille',
    icon: Shield,
    color: 'from-police-blue-light to-accent-purple',
    description: 'Démarrer patrouille',
  },
];

export default function QuickActions() {
  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-xl font-bold text-white mb-6">Actions rapides</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative p-4 rounded-xl glass-strong hover:glass transition-all duration-200 text-left overflow-hidden"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-200`}></div>

              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1">{action.name}</h3>
                <p className="text-xs text-dark-400 group-hover:text-dark-300">{action.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
