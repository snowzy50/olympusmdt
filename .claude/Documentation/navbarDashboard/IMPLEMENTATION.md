# Implémentation Dashboard - Branche navbarDashboard

**Date:** 2025-01-20
**Créé par:** Snowzy
**Version:** 0.18.6

---

## 📋 Résumé des Implémentations

### ✅ Complété

1. **Navigation (Sidebar) Complète**
   - Structure à 3 sections : Navigation Principale, Patrouille, Dossiers
   - 12 liens de navigation vers toutes les pages du dashboard
   - Mode collapsed/expanded fonctionnel
   - Footer avec indicateur temps réel et version
   - Bouton déconnexion
   - Badges de notification sur les items pertinents

2. **Service RealtimeSync**
   - Singleton pattern pour gestion globale
   - Cache en mémoire + localStorage
   - Pub/Sub pour réactivité
   - Synchronisation multi-tab via storage events
   - Debouncing automatique (100ms)
   - Support de 7 types de données : cases, complaints, summons, equipment, warrants, agents, citizens
   - Génération automatique d'ID unique par type
   - Méthodes CRUD complètes
   - Méthodes debug et stats

3. **Hooks React Personnalisés**
   - `useRealtimeSync<T>` : Hook principal pour synchroniser un type de données
   - `useGlobalSync` : Hook pour statistiques globales multi-types
   - `useRealtimeSubscription` : Hook pour s'abonner aux changements

---

## 📁 Fichiers Créés/Modifiés

### Fichiers Créés

1. **services/realtimeSync.ts**
   - Service de synchronisation temps réel
   - ~230 lignes
   - Types TypeScript complets
   - Documentation JSDoc

2. **hooks/useRealtimeSync.ts**
   - Hooks React pour utiliser realtimeSync
   - ~100 lignes
   - 3 hooks exportés

3. **.claude/Documentation/navbarDashboard/IMPLEMENTATION.md** (ce fichier)

### Fichiers Modifiés

1. **components/layout/Sidebar.tsx**
   - Navigation complète selon spécifications
   - 3 sections : Navigation Principale, Patrouille, Dossiers
   - 15 items de navigation
   - Footer avec déconnexion et indicateurs

---

## 🏗️ Architecture Technique

### Service RealtimeSync

```typescript
class RealtimeSyncService {
  // Singleton
  private static instance: RealtimeSyncService;

  // Cache en mémoire
  private cache: CacheData = {};

  // Gestion des abonnements
  private subscriptions: Map<DataType, Set<Subscription>>;

  // Debouncing pour éviter les écritures trop fréquentes
  private debounceTimers: Map<DataType, NodeJS.Timeout>;

  // Méthodes publiques
  getData(type): any[]
  addItem(type, item): void
  updateItem(type, id, updates): void
  deleteItem(type, id): void
  subscribe(type, callback): () => void
  invalidate(type): void
  clearAll(): void
  stats(type): { total, recent }
  debug(): void
}
```

### Hooks React

```typescript
// Hook principal - renvoie data + méthodes CRUD
const { data, isLoading, addItem, updateItem, deleteItem } = useRealtimeSync('complaints');

// Hook statistiques globales
const { total, new, modified, recent, lastSync } = useGlobalSync();

// Hook subscription simple
useRealtimeSubscription('cases', (data) => console.log(data));
```

---

## 🎨 Navigation Structure

```
┌─────────────────────────────────────┐
│  HEADER                             │
│  - Logo SASP - Olympus RP          │
│  - Mobile Data Terminal             │
│  - Bouton collapse                  │
├─────────────────────────────────────┤
│  NAVIGATION PRINCIPALE              │
│  🏠 Accueil                         │
│  📅 Événements                      │
├─────────────────────────────────────┤
│  PATROUILLE                         │
│  📻 Dispatch                        │
│  📁 Mes dossiers en cours (badge:3) │
├─────────────────────────────────────┤
│  DOSSIERS                           │
│  👥 Agents                          │
│  👤 Citoyens                        │
│  🎯 Mandats d'arrêt                 │
│  🚗 Véhicules de service            │
│  💼 Équipements                     │
│  ⚠️ Plaintes (badge:7)              │
│  ⚖️ Convocations (badge:12)         │
│  🏢 Unités                          │
│  🏢 Divisions                       │
│  ⚙️ Paramètres                      │
│  📊 Logs                            │
│  🔄 Cache Demo                      │
├─────────────────────────────────────┤
│  FOOTER                             │
│  🚪 Déconnexion                     │
│  🟢 Temps réel                      │
│  📌 v 0.18.6                        │
└─────────────────────────────────────┘
```

---

## 🚀 Utilisation du Service RealtimeSync

### Exemple : Page Plaintes

```tsx
'use client';

import { useState } from 'react';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

interface Complaint {
  id: string;
  title: string;
  status: string;
  // ... autres champs
}

export default function ComplaintsPage() {
  const { data: complaints, addItem, updateItem } = useRealtimeSync<Complaint>('complaints');

  const handleCreateComplaint = (newComplaint: Partial<Complaint>) => {
    addItem({
      title: newComplaint.title,
      status: 'pending',
      // ... autres champs
    });
  };

  const handleUpdateStatus = (id: string, newStatus: string) => {
    updateItem(id, { status: newStatus });
  };

  return (
    <div>
      {complaints.map(complaint => (
        <div key={complaint.id}>
          {complaint.title} - {complaint.status}
        </div>
      ))}
    </div>
  );
}
```

---

## 📊 Données Gérées par RealtimeSync

### Types de données supportés

1. **cases** - Dossiers actifs
   - ID format: `CAS-YYYY-XXX`
   - Champs: title, type, priority, status, files, tasks

2. **complaints** - Plaintes
   - ID format: `CPL-YYYY-XXX`
   - Champs: title, category, priority, status, complainant, accused

3. **summons** - Convocations
   - ID format: `SUM-YYYY-XXX`
   - Champs: type, recipient, courtDate, judge, status

4. **equipment** - Équipements
   - ID format: `EQ-XXX`
   - Champs: name, category, status, condition, assignedTo

5. **warrants** - Mandats d'arrêt
   - ID format: `WAR-YYYY-XXX`
   - Champs: suspect, charges, status, issuedBy

6. **agents** - Personnel
   - ID format: `AGT-XXX`
   - Champs: name, badge, rank, unit, status

7. **citizens** - Citoyens
   - ID format: `CIT-XXXXXX`
   - Champs: firstName, lastName, dob, criminalHistory

---

## 🔧 Fonctionnalités Avancées

### Synchronisation Multi-Tab

Le service utilise l'événement `storage` du navigateur pour synchroniser automatiquement les données entre tous les onglets ouverts de l'application.

```javascript
// Déclenchement automatique lors de modifications dans un autre onglet
window.addEventListener('storage', (e) => {
  if (e.key.startsWith('mdt_')) {
    // Mise à jour automatique du cache local
    // Notification des abonnés
  }
});
```

### Debouncing Intelligent

Les écritures dans localStorage sont debounced (100ms) pour éviter:
- Trop d'écritures disque
- Problèmes de performance
- Quota localStorage dépassé

### Génération d'ID Unique

```typescript
generateId('complaints') => 'CPL-2025-001'
generateId('cases')      => 'CAS-2025-042'
generateId('equipment')  => 'EQ-015'
```

Format adapté selon le type de données.

### Debug Console

Le service est exposé dans `window.mdtSync` pour debugging:

```javascript
// Dans la console du navigateur
window.mdtSync.debug()     // Affiche toutes les infos
window.mdtSync.getData('complaints')  // Récupère les données
window.mdtSync.stats('cases')  // Statistiques
window.mdtSync.clearAll()  // Nettoie tout
```

---

## 📝 TODO - Pages à Implémenter

### Pages Prioritaires

1. **Plaintes (Complaints)** - `/dashboard/complaints`
   - Formulaire création plainte
   - Liste avec filtres (statut, priorité, catégorie)
   - Modal détails avec actions (assigner, transférer, archiver)
   - Impression et export CSV
   - 6 cards statistiques

2. **Équipements (Equipment)** - `/dashboard/equipment`
   - Inventaires différenciés par agence (SASP, SAMC, SAFD, Dynasty 8, DOJ)
   - Système de réservation
   - Suivi de condition (0-100%)
   - Maintenance préventive
   - Niveaux d'accès pour armes

3. **Convocations (Summons)** - `/dashboard/summons`
   - Création convocation juridique
   - Types: comparution, témoin, jury, déposition
   - Suivi statut signification
   - Export PDF officiel
   - Simulation temps réel externe

4. **Mes Dossiers (Active Cases)** - `/dashboard/active-cases`
   - Upload fichiers multi-formats (images, PDF, vidéos, audio, Office)
   - Visualiseur professionnel intégré
   - Système de tâches avec checkboxes
   - Calcul progression automatique
   - Gestion témoins et suspects

### Pages Secondaires

5. **Événements** - `/dashboard/events`
6. **Dispatch** - `/dashboard/dispatch`
7. **Agents** - `/dashboard/agents`
8. **Citoyens** - `/dashboard/citizens`
9. **Mandats** - `/dashboard/warrants`
10. **Véhicules** - `/dashboard/vehicles`
11. **Unités/Divisions** - `/dashboard/units`, `/dashboard/divisions`
12. **Paramètres** - `/dashboard/settings`
13. **Logs** - `/dashboard/logs`
14. **Cache Demo** - `/dashboard/cache-demo`

---

## 🎯 Template pour Créer une Nouvelle Page

```tsx
'use client';

import { useState, useMemo } from 'react';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { Search, Plus } from 'lucide-react';

interface MyDataType {
  id: string;
  // ... vos champs
}

export default function MyPage() {
  const { data, isLoading, addItem, updateItem, deleteItem } = useRealtimeSync<MyDataType>('myType');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Filtrage
  const filtered = useMemo(() => {
    return data.filter(item =>
      item.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  // Statistiques
  const stats = useMemo(() => ({
    total: data.length,
    // ... autres stats
  }), [data]);

  return (
    <div className="flex-1 overflow-y-auto bg-dark-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Ma Page</h1>
            <p className="text-gray-400">Description de ma page</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
          >
            <Plus className="w-5 h-5" />
            Nouveau
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {/* Vos cards de stats */}
        </div>

        {/* Filtres */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>
        </div>

        {/* Liste/Table */}
        <div className="space-y-4">
          {filtered.map(item => (
            <div key={item.id} className="bg-gray-800 p-4 rounded-lg">
              {/* Votre contenu */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## 🧪 Tests avec Playwright

### Commandes Utiles

```bash
# Démarrer le serveur
npm run dev

# Ouvrir Playwright UI
npx playwright test --ui

# Test spécifique
npx playwright test dashboard.spec.ts
```

### Exemple Test Navigation

```typescript
import { test, expect } from '@playwright/test';

test('navigation sidebar', async ({ page }) => {
  await page.goto('http://localhost:3001/dashboard');

  // Vérifier que la sidebar est visible
  await expect(page.locator('text=SASP - Olympus RP')).toBeVisible();

  // Cliquer sur Plaintes
  await page.click('text=Plaintes');

  // Vérifier la navigation
  await expect(page).toHaveURL('/dashboard/complaints');
});
```

---

## 🔗 Ressources et Références

### Documentation Technique

- [Guide complet des fonctionnalités](./GUIDE-COMPLET.md)
- [Service RealtimeSync](../../services/realtimeSync.ts)
- [Hooks React](../../hooks/useRealtimeSync.ts)
- [Sidebar](../../components/layout/Sidebar.tsx)

### Libraries Utilisées

- **Next.js 14** - Framework React
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icônes
- **localStorage** - Persistence

### Patterns Utilisés

- **Singleton** - RealtimeSync service
- **Pub/Sub** - Système de subscriptions
- **Debouncing** - Optimisation performances
- **Custom Hooks** - Réutilisabilité React

---

## ⚠️ Notes Importantes

### Limitations Actuelles

1. **Pas de backend**
   - Toutes les données sont côté client
   - Vulnérable à manipulation
   - Perdu au clear du navigateur (localStorage)
   - Migration vers Supabase recommandée

2. **localStorage Quota**
   - Limite ~5-10 MB
   - Pas de gestion d'overflow
   - Risque d'erreur si trop de données

3. **Pas de pagination**
   - Toutes les données chargées d'un coup
   - Performance dégradée si >1000 items

4. **Synchronisation temps réel**
   - Uniquement multi-tab local
   - Pas de sync entre utilisateurs différents
   - Nécessite WebSockets pour vrai temps réel multi-utilisateurs

### Améliorations Futures

- [ ] Migration vers Supabase avec RLS
- [ ] WebSockets pour sync multi-utilisateurs
- [ ] Pagination des listes
- [ ] Upload fichiers vers Supabase Storage
- [ ] Authentification Discord OAuth2 complète
- [ ] Permissions basées sur rôles
- [ ] Logs d'audit
- [ ] Export Excel/PDF avancé
- [ ] Notifications push
- [ ] Mode hors-ligne avec sync

---

**Fin du document** - Créé par Snowzy le 2025-01-20
