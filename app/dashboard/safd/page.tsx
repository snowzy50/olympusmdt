/**
 * Page d'accueil SAFD Dashboard
 * Créé par: Snowzy
 * Features: Vue d'ensemble avec statistiques en temps réel
 */

'use client';

import { DashboardOverview } from '@/components/dashboard/DashboardOverview';

export default function SAFDDashboardPage() {
  return (
    <DashboardOverview
      agencyId="safd"
      agencyName="San Andreas Fire Department"
    />
  );
}
