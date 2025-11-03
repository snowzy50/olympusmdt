/**
 * Page d'accueil SAMC Dashboard
 * Créé par: Snowzy
 * Features: Vue d'ensemble avec statistiques médicales en temps réel
 */

'use client';
export const dynamic = 'force-dynamic';

import { SAMCDashboard } from '@/components/dashboard/SAMCDashboard';

export default function SAMCDashboardPage() {
  return <SAMCDashboard />;
}
