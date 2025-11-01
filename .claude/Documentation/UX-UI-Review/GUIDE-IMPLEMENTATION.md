# Guide d'Implémentation - Refonte Agency-Selection

**Date:** 2025-11-01
**Projet:** OlympusMDT v2.0

---

## Vue d'Ensemble

Ce guide détaille l'implémentation de la refonte de la page Agency-Selection et la création des dashboards spécifiques par agence.

---

## Fichiers Créés/Modifiés

### Fichiers Créés

```
/app/dashboard/sasp/page.tsx          # Dashboard SASP
/app/dashboard/samc/page.tsx          # Dashboard SAMC
/app/dashboard/safd/page.tsx          # Dashboard SAFD
/app/dashboard/dynasty8/page.tsx      # Dashboard Dynasty8
/app/dashboard/doj/page.tsx           # Dashboard DOJ

/components/dashboard/AgencyDashboard.tsx  # Composant réutilisable

/.claude/Documentation/UX-UI-Review/
  RAPPORT-COMPLET-UX-UI.md            # Rapport détaillé
  GUIDE-IMPLEMENTATION.md              # Ce fichier
  SYNTHESE-EXECUTIVE.md                # Synthèse (à créer)
```

### Fichiers Modifiés

```
/app/agency-selection/page.tsx        # Refonte complète
```

---

## Changements Principaux

### 1. Interface Agency Étendue

**Ajout du champ `dashboardPath`:**

```typescript
interface Agency {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: typeof Shield;
  color: string;
  gradient: string;
  dashboardPath: string;  // ✅ NOUVEAU
  stats: {
    active: number;
    pending: number;
  };
}
```

### 2. Données Agencies Mises à Jour

```typescript
const agencies: Agency[] = [
  {
    id: 'sasp',
    name: 'San Andreas State Police',
    shortName: 'SASP',
    description: 'Law Enforcement Division',
    icon: Shield,
    color: 'primary',
    gradient: 'from-primary-600 to-primary-800',
    dashboardPath: '/dashboard/sasp',  // ✅ ROUTE SPECIFIQUE
    stats: { active: 27, pending: 8 },
  },
  // ... autres agences avec leurs routes spécifiques
];
```

### 3. Handler de Navigation Corrigé

**AVANT:**
```typescript
const handleAccessDashboard = () => {
  if (selectedAgency) {
    router.push('/dashboard');  // ❌ Toujours le même dashboard
  }
};
```

**APRÈS:**
```typescript
const handleAccessDashboard = () => {
  if (selectedAgency) {
    const agency = agencies.find(a => a.id === selectedAgency);
    if (agency) {
      router.push(agency.dashboardPath);  // ✅ Dashboard spécifique
    }
  }
};
```

### 4. Améliorations d'Accessibilité

**Ajout de rôles ARIA:**
```tsx
<div
  role="button"
  tabIndex={0}
  aria-label={`Sélectionner l'agence ${agency.shortName}`}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedAgency(agency.id);
    }
  }}
>
```

**Focus indicators:**
```tsx
className="focus:outline-none focus:ring-4 focus:ring-primary-500 focus:ring-offset-4 focus:ring-offset-dark-300"
```

### 5. Espacement Amélioré

**Layout Grid:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
  {/* Gap responsive: 24px mobile → 32px desktop */}
</div>
```

**Padding Cards:**
```tsx
className="p-6 sm:p-8"  // 24px mobile → 32px desktop
```

**Stats Spacing:**
```tsx
<div className="flex items-center gap-6 pt-6 border-t border-gray-700/50">
  {/* Gap augmenté: 16px → 24px */}
</div>
```

### 6. Typography Responsive

```tsx
{/* Titre principal */}
<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
  OlympusMDT
</h1>

{/* Titres de cards */}
<h3 className="text-xl sm:text-2xl font-bold text-white">
  {agency.shortName}
</h3>
```

---

## Structure des Dashboards

### Composant AgencyDashboard

**Props Interface:**
```typescript
interface AgencyConfig {
  id: string;
  name: string;
  shortName: string;
  icon: LucideIcon;
  color: string;
  gradient: string;
  badgeNumber: string;
  stats: {
    critical: number;
    urgent: number;
    equipment: string;
    events: number;
    active: number;
    resolved: number;
    units: number;
  };
}

interface AgencyDashboardProps {
  agency: AgencyConfig;
}
```

**Utilisation:**
```typescript
// /app/dashboard/samc/page.tsx
'use client';

import AgencyDashboard from '@/components/dashboard/AgencyDashboard';
import { Activity } from 'lucide-react';

export default function SAMCDashboardPage() {
  const agency = {
    id: 'samc',
    name: 'San Andreas Medical Center',
    shortName: 'SAMC',
    icon: Activity,
    color: 'error',
    gradient: 'from-error-600 to-error-800',
    badgeNumber: '#MED-4567',
    stats: {
      critical: 5,
      urgent: 18,
      equipment: '97%',
      events: 31,
      active: 15,
      resolved: 203,
      units: 28,
    },
  };

  return <AgencyDashboard agency={agency} />;
}
```

---

## Tests Playwright

### Configuration

```bash
# Installation
npm install -D @playwright/test

# Configuration
npx playwright install
```

### Tests de Base

```typescript
// tests/agency-selection.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Agency Selection', () => {
  test('should display all agencies', async ({ page }) => {
    await page.goto('/agency-selection');

    const agencies = ['SASP', 'SAMC', 'SAFD', 'D8', 'DOJ'];
    for (const agency of agencies) {
      await expect(page.getByRole('heading', { name: agency })).toBeVisible();
    }
  });

  test('should navigate to SAMC dashboard', async ({ page }) => {
    await page.goto('/agency-selection');

    await page.getByRole('button', { name: /SAMC/ }).click();
    await page.getByRole('button', { name: /Accéder/ }).click();

    await expect(page).toHaveURL('/dashboard/samc');
    await expect(page.getByRole('heading', { name: 'SAMC Dashboard' })).toBeVisible();
  });

  test('should be keyboard accessible', async ({ page }) => {
    await page.goto('/agency-selection');

    // Tab vers premier bouton
    await page.keyboard.press('Tab');

    // Vérifie focus
    const focused = await page.evaluate(() =>
      document.activeElement?.getAttribute('aria-label')
    );
    expect(focused).toContain('Sélectionner l\'agence');

    // Sélection avec Enter
    await page.keyboard.press('Enter');

    // Vérifie sélection
    await expect(page.locator('[aria-label="Agence sélectionnée"]')).toBeVisible();
  });
});
```

---

## Déploiement

### Checklist Pre-Deployment

- [ ] Tous les tests Playwright passent
- [ ] Build Next.js réussi (`npm run build`)
- [ ] Pas d'erreurs TypeScript
- [ ] Lighthouse score > 90
- [ ] Tests accessibilité WCAG 2.1 AA
- [ ] Tests responsive sur tous devices

### Build Production

```bash
# Build
npm run build

# Test local du build
npm run start

# Déploiement (Vercel example)
vercel --prod
```

---

## Maintenance

### Ajouter une Nouvelle Agence

1. **Ajouter les données dans `agency-selection/page.tsx`:**
```typescript
{
  id: 'new-agency',
  name: 'New Agency Name',
  shortName: 'NA',
  description: 'Agency Description',
  icon: NewIcon,
  color: 'color-name',
  gradient: 'from-color-600 to-color-800',
  dashboardPath: '/dashboard/new-agency',
  stats: { active: 0, pending: 0 },
}
```

2. **Créer le dashboard:**
```bash
mkdir -p app/dashboard/new-agency
```

3. **Créer `page.tsx`:**
```typescript
'use client';

import AgencyDashboard from '@/components/dashboard/AgencyDashboard';
import { NewIcon } from 'lucide-react';

export default function NewAgencyDashboardPage() {
  const agency = {
    id: 'new-agency',
    name: 'New Agency Name',
    shortName: 'NA',
    icon: NewIcon,
    color: 'color-name',
    gradient: 'from-color-600 to-color-800',
    badgeNumber: '#NA-0001',
    stats: {
      critical: 0,
      urgent: 0,
      equipment: '100%',
      events: 0,
      active: 0,
      resolved: 0,
      units: 0,
    },
  };

  return <AgencyDashboard agency={agency} />;
}
```

4. **Ajouter la couleur dans Tailwind (si nécessaire):**
```typescript
// tailwind.config.ts
colors: {
  'color-name': {
    400: '#...',
    500: '#...',
    600: '#...',
    // ...
  }
}
```

5. **Tester:**
```bash
npm run dev
# Naviguer vers /agency-selection
# Sélectionner la nouvelle agence
# Vérifier le dashboard
```

---

## Troubleshooting

### Problème: Dashboard 404

**Cause:** Route non créée ou typo dans `dashboardPath`

**Solution:**
1. Vérifier que le dossier existe: `/app/dashboard/{agency-id}/`
2. Vérifier que `page.tsx` existe
3. Vérifier l'orthographe dans `dashboardPath`

### Problème: Styles ne s'appliquent pas

**Cause:** Classes Tailwind non compilées

**Solution:**
```bash
# Restart dev server
npm run dev

# Clear .next
rm -rf .next
npm run dev
```

### Problème: Navigation ne fonctionne pas

**Cause:** `handleAccessDashboard` non appelé correctement

**Solution:**
Vérifier que le bouton appelle bien la fonction:
```tsx
<button onClick={handleAccessDashboard}>
  Accéder au Dashboard
</button>
```

---

## Support

Pour toute question ou problème:
1. Consulter le rapport complet: `RAPPORT-COMPLET-UX-UI.md`
2. Vérifier les tests Playwright dans `.playwright-mcp/`
3. Consulter la documentation Next.js: https://nextjs.org/docs

---

**Document créé le:** 2025-11-01
**Version:** 1.0
**Créé par:** Snowzy
