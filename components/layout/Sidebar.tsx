'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { getAgencyById } from '@/config/agencies';
import Image from 'next/image';
import {
  Home,
  Calendar,
  Radio,
  FolderOpen,
  Users,
  UserCheck,
  Target,
  Car,
  Briefcase,
  AlertTriangle,
  Scale,
  Building,
  Settings,
  Database,
  LogOut,
  Bell,
  ChevronLeft,
  ChevronRight,
  Shield,
  LucideIcon,
} from 'lucide-react';

interface NavItem {
  name: string;
  icon: LucideIcon;
  href: string;
  badge?: string | null;
  requiresPlan?: 'free' | 'starter' | 'pro' | 'enterprise'; // Plan minimum requis
  disabled?: boolean; // Temporairement désactivé
}

interface NavSection {
  title: string;
  items: NavItem[];
}

// Type pour le plan de l'agence
type AgencyPlan = 'free' | 'starter' | 'pro' | 'enterprise';

// Hiérarchie des plans
const PLAN_HIERARCHY: Record<AgencyPlan, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  enterprise: 3,
};

// Vérifier si l'utilisateur a accès à une fonctionnalité
const hasAccessToFeature = (userPlan: AgencyPlan, requiredPlan?: AgencyPlan): boolean => {
  if (!requiredPlan) return true;
  return PLAN_HIERARCHY[userPlan] >= PLAN_HIERARCHY[requiredPlan];
};

// Navigation principale
const mainNavItems: NavItem[] = [
  { name: 'Accueil', icon: Home, href: '/dashboard', badge: null, requiresPlan: 'free' },
  { name: 'Événements', icon: Calendar, href: '/dashboard/events', badge: null, requiresPlan: 'starter' },
];

// Section Patrouille
const patrolSection: NavItem[] = [
  { name: 'Dispatch', icon: Radio, href: '/dashboard/dispatch', badge: null, requiresPlan: 'starter' },
  { name: 'Mes dossiers en cours', icon: FolderOpen, href: '/dashboard/active-cases', badge: '3', requiresPlan: 'free' },
];

// Section Dossiers
const dossierSection: NavItem[] = [
  { name: 'Agents', icon: Users, href: '/dashboard/agents', badge: null, requiresPlan: 'free' },
  { name: 'Citoyens', icon: UserCheck, href: '/dashboard/citizens', badge: null, requiresPlan: 'starter' },
  { name: 'Mandats d\'arrêt', icon: Target, href: '/dashboard/warrants', badge: null, requiresPlan: 'starter' },
  { name: 'Véhicules de service', icon: Car, href: '/dashboard/vehicles', badge: null, requiresPlan: 'pro' },
  { name: 'Équipements', icon: Briefcase, href: '/dashboard/equipment', badge: null, requiresPlan: 'pro' },
  { name: 'Plaintes', icon: AlertTriangle, href: '/dashboard/complaints', badge: '7', requiresPlan: 'starter' },
  { name: 'Convocations', icon: Scale, href: '/dashboard/summons', badge: '12', requiresPlan: 'starter' },
  { name: 'Unités', icon: Building, href: '/dashboard/units', badge: null, requiresPlan: 'pro' },
  { name: 'Divisions', icon: Building, href: '/dashboard/divisions', badge: null, requiresPlan: 'enterprise' },
  { name: 'Paramètres', icon: Settings, href: '/dashboard/settings', badge: null, requiresPlan: 'free' },
  { name: 'Logs', icon: Database, href: '/dashboard/logs', badge: null, requiresPlan: 'pro' },
  { name: 'Cache Demo', icon: Database, href: '/dashboard/cache-demo', badge: null, requiresPlan: 'free' },
];

// Section Administration (vide pour le moment)
const adminSection: NavItem[] = [];

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  // Extraire l'agence depuis l'URL (/dashboard/{agency}/...)
  const pathSegments = pathname.split('/').filter(Boolean);
  const currentAgency = pathSegments[1] || 'sasp'; // dashboard est à [0], agency à [1]

  // Récupérer la configuration de l'agence
  const agencyConfig = getAgencyById(currentAgency);

  // TODO: Récupérer le plan de l'agence depuis la session/context
  // Pour l'instant, on utilise 'starter' par défaut
  const [currentPlan] = useState<AgencyPlan>('starter');

  // Fonction pour rendre un item de navigation
  const renderNavItem = (item: NavItem) => {
    // Construire l'URL avec le préfixe de l'agence
    const agencyHref = `/dashboard/${currentAgency}${item.href.replace('/dashboard', '')}`;
    const isActive = pathname === agencyHref;
    const Icon = item.icon;
    const hasAccess = hasAccessToFeature(currentPlan, item.requiresPlan);
    const isDisabled = item.disabled || !hasAccess;

    // Déterminer le badge de plan si nécessaire
    const getPlanBadge = () => {
      if (hasAccess || !item.requiresPlan) return null;

      const planLabels: Record<AgencyPlan, string> = {
        free: 'Free',
        starter: 'Starter',
        pro: 'Pro',
        enterprise: 'Enterprise',
      };

      return planLabels[item.requiresPlan];
    };

    const planBadge = getPlanBadge();

    return (
      <li key={item.href}>
        <Link
          href={isDisabled ? '#' : agencyHref}
          onClick={(e) => {
            if (isDisabled) {
              e.preventDefault();
              alert(`Cette fonctionnalité nécessite le plan ${item.requiresPlan?.toUpperCase()}. Veuillez mettre à niveau votre abonnement.`);
            }
          }}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors duration-200
            ${isCollapsed ? 'justify-center' : ''}
            ${
              isActive && !isDisabled
                ? 'bg-primary-600 text-white'
                : isDisabled
                ? 'text-gray-600 cursor-not-allowed opacity-50'
                : 'text-gray-400 hover:bg-dark-100 hover:text-gray-100'
            }
          `}
          title={isCollapsed ? item.name : undefined}
        >
          <Icon className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && (
            <>
              <span className="flex-1">{item.name}</span>
              {planBadge && (
                <span className="px-2 py-0.5 text-xs font-bold bg-yellow-600 text-white rounded-full">
                  {planBadge}
                </span>
              )}
              {!planBadge && item.badge && (
                <span className="px-2 py-0.5 text-xs font-bold bg-error-600 text-white rounded-full">
                  {item.badge}
                </span>
              )}
            </>
          )}
        </Link>
      </li>
    );
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-dark-300 border-r border-gray-700 flex flex-col transition-all duration-300 z-50 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
            {agencyConfig ? (
              <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-dark-100">
                <Image
                  src={agencyConfig.logo}
                  alt={`Logo ${agencyConfig.shortName}`}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <button className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors">
                <Shield className="w-6 h-6 text-white" />
              </button>
            )}
            {!isCollapsed && (
              <div>
                <h1 className="text-sm font-bold text-gray-100">
                  {agencyConfig?.shortName || 'SASP'} - Olympus RP
                </h1>
                <p className="text-xs text-gray-400">Mobile Data Terminal</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-2 text-gray-400 hover:text-gray-100 hover:bg-gray-700 rounded-md transition-colors"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        {/* Navigation Principale */}
        {!isCollapsed && (
          <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Navigation Principale
          </p>
        )}
        <ul className="space-y-1 mb-6">
          {mainNavItems.map(renderNavItem)}
        </ul>

        {/* Section Patrouille */}
        {!isCollapsed && (
          <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Patrouille
          </p>
        )}
        <ul className="space-y-1 mb-6">
          {patrolSection.map(renderNavItem)}
        </ul>

        {/* Section Dossiers */}
        {!isCollapsed && (
          <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Dossiers
          </p>
        )}
        <ul className="space-y-1">
          {dossierSection.map(renderNavItem)}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-700">
        {/* Déconnexion */}
        <button
          onClick={async () => {
            await signOut({ callbackUrl: '/login' });
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-red-600/10 hover:text-red-400 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? 'Déconnexion' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="flex-1 text-left">Déconnexion</span>}
        </button>

        {/* Indicateur temps réel et version */}
        <div className="p-4">
          {isCollapsed ? (
            <>
              <div className="flex justify-center mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Temps réel actif" />
              </div>
              <button
                onClick={() => setIsCollapsed(false)}
                className="w-full p-3 text-gray-400 hover:text-gray-100 hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Expand sidebar"
              >
                <ChevronRight className="w-5 h-5 mx-auto" />
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-400">Temps réel</span>
                </div>
                <span className="text-xs text-gray-500 font-mono">v 0.18.8</span>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Plan actuel:</span>
                  <span className={`text-xs font-bold uppercase ${
                    currentPlan === 'enterprise' ? 'text-purple-400' :
                    currentPlan === 'pro' ? 'text-blue-400' :
                    currentPlan === 'starter' ? 'text-green-400' :
                    'text-gray-400'
                  }`}>
                    {currentPlan}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
