# Architecture Technique - Gestion des Événements OlympusMDT

**Date**: 2025-11-01  
**Créé par**: Snowzy  
**Version**: 1.0

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Composants UI](#composants-ui)
3. [Gestion d'état](#gestion-détat)
4. [Base de données](#base-de-données)
5. [Routes API](#routes-api)
6. [Configuration Realtime](#configuration-realtime)
7. [Flux de données](#flux-de-données)
8. [Fichiers clés](#fichiers-clés)

---

## Vue d'ensemble

Le système de gestion des événements dans OlympusMDT est actuellement basé sur:
- **Frontend**: Calendrier interactif avec synchronisation locale
- **État**: Service singleton avec localStorage et pattern pub/sub
- **Backend**: Aucune intégration Supabase pour les événements (yet)
- **Persistance**: localStorage uniquement

### Architecture simplifiée

```
Pages Événements
    ↓
useRealtimeSync Hook
    ↓
RealtimeSyncService (Singleton)
    ├─ Cache (Memory)
    ├─ localStorage (mdt_events)
    └─ Pub/Sub Subscriptions
```

---

## Composants UI

### 1.1 Pages d'Événements

Toutes les pages d'événements ont la même structure:

**Pages par agence**:
- `/app/dashboard/sasp/events/page.tsx` - SASP (Police d'État)
- `/app/dashboard/samc/events/page.tsx` - SAMC (Services Médicaux)
- `/app/dashboard/safd/events/page.tsx` - SAFD (Pompiers)
- `/app/dashboard/dynasty8/events/page.tsx` - Dynasty 8 (Immobilier)
- `/app/dashboard/doj/events/page.tsx` - DOJ (Justice)
- `/app/dashboard/events/page.tsx` - Page générale (globale)

**Chemins absolus**:
- `/Users/snowzy/olympusmdt/app/dashboard/events/page.tsx`
- `/Users/snowzy/olympusmdt/app/dashboard/sasp/events/page.tsx`
- `/Users/snowzy/olympusmdt/app/dashboard/samc/events/page.tsx`
- `/Users/snowzy/olympusmdt/app/dashboard/safd/events/page.tsx`
- `/Users/snowzy/olympusmdt/app/dashboard/dynasty8/events/page.tsx`
- `/Users/snowzy/olympusmdt/app/dashboard/doj/events/page.tsx`

### 1.2 Structure d'une Page

Chaque page contient:

```tsx
// Composants internes (non réutilisables):
- EventForm (formulaire de création/édition)
- EventDetails (affichage détails et modification)
- Calendrier (vue mois avec grille 7x6)
- Liste des événements à venir (top 5)
- Système de filtres (recherche + catégorie)

// Composants réutilisables:
- Modal (/components/ui/Modal.tsx)
- Button (/components/ui/Button.tsx)
- Input (/components/ui/Input.tsx)
- Textarea (/components/ui/Textarea.tsx)
```

### 1.3 Composants UI Réutilisables

**Fichier**: `/Users/snowzy/olympusmdt/components/ui/`

```
Modal.tsx         - Modales pour créer/éditer
Button.tsx        - Boutons d'action
Input.tsx         - Champs de texte
Textarea.tsx      - Zones de texte multilignes
Card.tsx          - Cartes génériques
Badge.tsx         - Badges de catégorie
StatusIndicator.tsx - Indicateurs de statut
```

---

## Gestion d'état

### 2.1 Hook Principal: useRealtimeSync

**Fichier**: `/Users/snowzy/olympusmdt/hooks/useRealtimeSync.ts`

```typescript
export function useRealtimeSync<T = any>(type: DataType) {
  // type: 'events' | 'cases' | 'complaints' | 'summons' | 
  //       'equipment' | 'warrants' | 'agents' | 'citizens'
  
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // 1. Charger les données depuis le service
    const initialData = realtimeSync.getData(type);
    setData(initialData);
    setIsLoading(false);
    
    // 2. S'abonner aux changements
    const unsubscribe = realtimeSync.subscribe(type, (payload) => {
      setData(payload.data);
    });
    
    return unsubscribe;
  }, [type]);
  
  return {
    data,              // T[] - Les données
    isLoading,         // boolean
    addItem,           // (item: Partial<T>) => void
    updateItem,        // (id: string | number, updates: Partial<T>) => void
    deleteItem,        // (id: string | number) => void
  };
}
```

**Utilisation dans les pages**:

```tsx
const { data: events, addItem, updateItem, deleteItem } = 
  useRealtimeSync<CalendarEvent>('events');

// Créer un événement
addItem({
  title: "Formation Tir",
  category: "training",
  // ...
});

// Modifier un événement
updateItem(eventId, { title: "Formation Tir - Updated" });

// Supprimer un événement
deleteItem(eventId);
```

### 2.2 Service de Synchronisation

**Fichier**: `/Users/snowzy/olympusmdt/services/realtimeSync.ts`

C'est un **singleton** (instance unique) qui gère:

**Composants internes**:
- **Cache**: `Map<DataType, any[]>` - Données en mémoire
- **Subscriptions**: `Map<DataType, Set<Subscription>>` - Observateurs
- **Debounce Timers**: `Map<DataType, NodeJS.Timeout>` - Délai d'écriture

**Clés localStorage**:
- `mdt_events` - Les événements du calendrier
- `mdt_cases`, `mdt_complaints`, etc. - Autres types de données

**Méthodes clés**:

```typescript
// Récupérer les données
getData(type: DataType): any[]

// Opérations CRUD
addItem(type: DataType, item: any): void
updateItem(type: DataType, id: string | number, updates: any): void
deleteItem(type: DataType, id: string | number): void

// Subscriptions au pattern pub/sub
subscribe(type: DataType, callback): () => void  // Retourne unsubscribe

// Statistiques
stats(type: DataType): { total: number; recent: number }

// Utilitaires
invalidate(type: DataType): void  // Vider le cache et localStorage
clearAll(): void  // Nettoyer complètement
```

**Processus d'ajout d'événement**:

1. Appel de `addItem(type, item)`
2. Génération d'ID si absent: format `EVE-YYYY-NNN`
3. Ajout de `createdAt` et `updatedAt` (ISO 8601)
4. Insertion au début du cache
5. Sauvegarde en localStorage (avec debounce 100ms)
6. Notification de tous les subscribers
7. Rechargement des composants React

---

## Base de données

### 3.1 État Actuel

**IMPORTANT**: Il n'y a ACTUELLEMENT PAS de table `events` dans Supabase.

Les événements sont stockés uniquement en localStorage.

**Tables existantes**:
- `agents` - Agents par agence avec RLS
- `agent_history` - Historique des actions

**Fichier**: `/Users/snowzy/olympusmdt/lib/supabase/client.ts`

### 3.2 Configuration Supabase

```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,  // Limite des événements par seconde
    },
  },
});
```

### 3.3 Migration SQL Proposée (à créer)

La table `events` n'existe pas actuellement. Voici la structure proposée:

```sql
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identification
  agency_id TEXT NOT NULL,  -- sasp, samc, safd, dynasty8, doj
  title TEXT NOT NULL,
  description TEXT,
  
  -- Dates et heures
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_all_day BOOLEAN DEFAULT false,
  
  -- Catégorie et localisation
  category TEXT NOT NULL, -- patrol, training, meeting, operation, maintenance, court, personal, other
  location TEXT,
  
  -- Participant et créateur
  created_by TEXT NOT NULL,
  attendees TEXT[],
  
  -- Récurrence
  recurrence TEXT DEFAULT 'none', -- none, daily, weekly, monthly
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraint pour l'isolation par agence
  CONSTRAINT agency_id_length CHECK (agency_id IN ('sasp', 'samc', 'safd', 'dynasty8', 'doj'))
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_events_agency_id ON public.events(agency_id);
CREATE INDEX idx_events_category ON public.events(category);
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_events_created_by ON public.events(created_by);

-- RLS: Les utilisateurs voient les événements de leurs agences
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view events from their agencies"
  ON public.events
  FOR SELECT
  USING (
    agency_id = ANY(
      COALESCE(
        (auth.jwt() -> 'user_metadata' ->> 'agencies')::text[],
        '{}'::text[]
      )
    )
    OR (auth.jwt() -> 'user_metadata' ->> 'isAdmin')::boolean = true
  );
```

---

## Routes API

### 4.1 Routes Actuellement Définies

**Routes d'authentification**:
- `/Users/snowzy/olympusmdt/app/api/auth/[...nextauth]/route.ts` - NextAuth config
- `/Users/snowzy/olympusmdt/app/api/auth/roles/route.ts` - Gestion des rôles
- `/Users/snowzy/olympusmdt/app/api/debug/session/route.ts` - Debug

**État**: Aucune route API pour les événements actuellement.

### 4.2 Routes API Proposées

À créer pour l'intégration Supabase:

```typescript
// GET /api/events - Lister les événements
// POST /api/events - Créer un événement
// PUT /api/events/[id] - Modifier un événement
// DELETE /api/events/[id] - Supprimer un événement
// GET /api/events/[agency] - Événements par agence
```

---

## Configuration Realtime

### 5.1 Configuration Actuelle

**Supabase Realtime** (défini dans client.ts):
```typescript
realtime: {
  params: {
    eventsPerSecond: 10,
  },
},
```

**État**: Configué mais non utilisé pour les événements.

### 5.2 Synchronisation Client-Side (Actuelle)

La synchronisation est entièrement côté client:

1. **localStorage**: Persistance des données
   - Clé: `mdt_events`
   - Format: JSON array
   - Mise à jour: Debounce 100ms

2. **Storage Events**: Multi-tab sync
   ```typescript
   window.addEventListener('storage', (e) => {
     if (e.key === 'mdt_events') {
       // Mettre à jour le cache et notifier les subscribers
     }
   });
   ```

3. **Pub/Sub Pattern**: Subscriptions React
   ```typescript
   const unsubscribe = realtimeSync.subscribe('events', (payload) => {
     // payload.data contient les événements mis à jour
   });
   ```

### 5.3 Configuration Proposée avec Supabase Realtime

Pour activer la vraie synchronisation temps réel:

```typescript
// Dans le hook useRealtimeSync
useEffect(() => {
  const subscription = supabase
    .from('events')
    .on('*', payload => {
      setData(prev => updateFromPayload(prev, payload));
    })
    .subscribe();
  
  return () => subscription.unsubscribe();
}, []);
```

---

## Types TypeScript

### 6.1 Interface CalendarEvent

**Définie dans**: `/Users/snowzy/olympusmdt/app/dashboard/events/page.tsx`

```typescript
interface CalendarEvent {
  id: string;                    // EVE-YYYY-NNN
  title: string;                 // Ex: "Briefing Matinal"
  description?: string;          // Détails optionnels
  startDate: string;             // YYYY-MM-DD
  endDate: string;               // YYYY-MM-DD
  startTime: string;             // HH:MM
  endTime: string;               // HH:MM
  category: 'patrol'             // Catégorie de l'événement
            | 'training'
            | 'meeting'
            | 'operation'
            | 'maintenance'
            | 'court'
            | 'personal'
            | 'other';
  location?: string;             // Lieu de l'événement
  attendees?: string[];          // Participants
  createdBy: string;             // Auteur
  color?: string;                // Couleur personnalisée
  isAllDay?: boolean;            // Événement sur toute la journée
  recurrence?: 'none'            // Type de récurrence
                | 'daily'
                | 'weekly'
                | 'monthly';
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
}
```

### 6.2 Configuration des Catégories

```typescript
const CATEGORY_CONFIG = {
  patrol: { label: 'Patrouille', color: 'bg-blue-600', textColor: 'text-blue-100' },
  training: { label: 'Formation', color: 'bg-green-600', textColor: 'text-green-100' },
  meeting: { label: 'Réunion', color: 'bg-purple-600', textColor: 'text-purple-100' },
  operation: { label: 'Opération', color: 'bg-red-600', textColor: 'text-red-100' },
  maintenance: { label: 'Maintenance', color: 'bg-yellow-600', textColor: 'text-yellow-100' },
  court: { label: 'Tribunal', color: 'bg-indigo-600', textColor: 'text-indigo-100' },
  personal: { label: 'Personnel', color: 'bg-pink-600', textColor: 'text-pink-100' },
  other: { label: 'Autre', color: 'bg-gray-600', textColor: 'text-gray-100' },
};
```

---

## Flux de données

### 7.1 Création d'un événement

```
Utilisateur remplissant EventForm
        ↓
        Submit du formulaire
        ↓
addItem() appelé avec les données
        ↓
RealtimeSyncService.addItem('events', item)
        ├─ Génère l'ID (EVE-YYYY-NNN)
        ├─ Ajoute createdAt et updatedAt
        ├─ Insère au début du cache
        └─ Debounce saveToLocalStorage()
        ↓
notifySubscribers('events')
        ↓
Tous les composants React se rerendent
        ↓
Modal se ferme
Calendrier et liste sont mis à jour
```

### 7.2 Modification d'un événement

```
Clic sur "Modifier" dans EventDetails
        ↓
Passage en mode édition (EventForm)
        ↓
Submit du formulaire
        ↓
updateItem(id, updates) appelé
        ↓
RealtimeSyncService met à jour le cache
        ├─ Met à jour l'élément par ID
        └─ Ajoute updatedAt
        ↓
saveToLocalStorage() + notifySubscribers()
        ↓
Les composants se rerendent
```

### 7.3 Suppression d'un événement

```
Clic sur "Supprimer" dans EventDetails
        ↓
Confirmation (confirm dialog)
        ↓
deleteItem(id) appelé
        ↓
RealtimeSyncService filtre l'élément
        ↓
saveToLocalStorage() + notifySubscribers()
        ↓
Modal se ferme
Les listes sont mises à jour
```

### 7.4 Synchronisation multi-tab

```
Tab A : Modification d'un événement
        ↓
        localStorage.setItem('mdt_events', JSON.stringify(data))
        ↓
        Storage event sur Tab B
        ↓
RealtimeSyncService met à jour le cache
        ↓
notifySubscribers() sur Tab B
        ↓
Tab B voit les changements instantanément
```

---

## Fichiers clés

### 8.1 Structure des répertoires

```
olympusmdt/
├── app/
│   ├── dashboard/
│   │   ├── events/page.tsx
│   │   ├── sasp/
│   │   │   ├── events/page.tsx
│   │   │   ├── agents/page.tsx
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   ├── samc/events/page.tsx
│   │   ├── safd/events/page.tsx
│   │   ├── dynasty8/events/page.tsx
│   │   └── doj/events/page.tsx
│   └── api/auth/[...nextauth]/route.ts
│
├── components/
│   ├── ui/
│   │   ├── Modal.tsx
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   └── StatusIndicator.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── DashboardPage.tsx
│   └── dashboard/
│       ├── AgencyDashboard.tsx
│       ├── QuickActions.tsx
│       ├── RecentActivity.tsx
│       └── ActiveUnits.tsx
│
├── hooks/
│   ├── useRealtimeSync.ts (IMPORTANT)
│   └── useSupabaseAgents.ts
│
├── services/
│   └── realtimeSync.ts (IMPORTANT - Singleton)
│
├── lib/
│   ├── supabase/
│   │   └── client.ts
│   └── auth/
│       └── config.ts
│
├── types/
│   ├── agent.ts
│   └── next-auth.d.ts
│
├── config/
│   └── agencies.ts
│
├── .claude/Documentation/
│   ├── Events/ (NOUVEAU)
│   │   ├── ARCHITECTURE-TECHNIQUE.md
│   │   └── GUIDE-UTILISATION.md
│   └── README.md
│
└── supabase/
    └── migrations/
        ├── 00_reset_database.sql
        ├── 01_create_agents_table.sql
        └── full_reset_and_create.sql
```

### 8.2 Fichiers critiques (chemins absolus)

| Fichier | Rôle | Criticité |
|---------|------|-----------|
| `/Users/snowzy/olympusmdt/services/realtimeSync.ts` | Singleton de synchronisation | CRITIQUE |
| `/Users/snowzy/olympusmdt/hooks/useRealtimeSync.ts` | Hook React pour les événements | CRITIQUE |
| `/Users/snowzy/olympusmdt/app/dashboard/events/page.tsx` | Page générale des événements | IMPORTANT |
| `/Users/snowzy/olympusmdt/app/dashboard/sasp/events/page.tsx` | Page SASP | IMPORTANT |
| `/Users/snowzy/olympusmdt/app/dashboard/samc/events/page.tsx` | Page SAMC | IMPORTANT |
| `/Users/snowzy/olympusmdt/app/dashboard/safd/events/page.tsx` | Page SAFD | IMPORTANT |
| `/Users/snowzy/olympusmdt/app/dashboard/dynasty8/events/page.tsx` | Page Dynasty 8 | IMPORTANT |
| `/Users/snowzy/olympusmdt/app/dashboard/doj/events/page.tsx` | Page DOJ | IMPORTANT |
| `/Users/snowzy/olympusmdt/lib/supabase/client.ts` | Client Supabase | IMPORTANT |
| `/Users/snowzy/olympusmdt/config/agencies.ts` | Config des agences | IMPORTANT |
| `/Users/snowzy/olympusmdt/components/ui/Modal.tsx` | Modale générique | SUPPORT |

---

## Points clés à retenir

1. **Pas de Supabase**: Les événements sont en localStorage uniquement
2. **Singleton**: Un seul `RealtimeSyncService` pour toute l'app
3. **Pub/Sub**: Les changements notifient tous les subscribers
4. **localStorage**: Clé `mdt_events` stocke le JSON
5. **Multi-tab**: Storage events synchronisent entre onglets
6. **ID auto**: Format `EVE-YYYY-NNN` généré automatiquement
7. **Catégories**: 8 catégories avec couleurs en dur
8. **Pas d'isolation agence**: Les événements ne sont pas filtrés par agence dans le code
9. **Données de test**: Générées automatiquement au premier chargement
10. **Interface locale**: CalendarEvent définie dans les pages (pas centralisée)

---

## Prochaines étapes possibles

- [ ] Créer la table `events` dans Supabase
- [ ] Implémenter les routes API `/api/events/*`
- [ ] Intégrer Supabase Realtime
- [ ] Centraliser les types TypeScript
- [ ] Ajouter l'isolation par agence
- [ ] Implémenter les récurrences d'événements
- [ ] Ajouter les notifications
- [ ] Exporter les événements (iCal, PDF)

