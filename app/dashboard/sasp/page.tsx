/**
 * Page d'accueil SASP Dashboard
 * Créé par: Snowzy
 * Features: Vue d'ensemble avec statistiques en temps réel
 */

'use client';
export const dynamic = 'force-dynamic';

import { DashboardOverview } from '@/components/dashboard/DashboardOverview';

export default function SASPDashboardPage() {
  return (
    <DashboardOverview
      agencyId="sasp"
      agencyName="San Andreas State Police"
    />
  );
}
