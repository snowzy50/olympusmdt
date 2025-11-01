# 📅 RefonteEvenement - Documentation Technique

> **Créé par:** Snowzy
> **Branche:** RefonteEvenement
> **Date:** 2025-11-01
> **Version:** 1.0.0

## 🎯 Vue d'ensemble

Refonte complète de la gestion des événements avec une architecture moderne basée sur **Supabase Realtime**, offrant une expérience utilisateur interactive et responsive sur web et mobile.

---

## 📚 Table des matières

1. [Architecture](#architecture)
2. [Composants](#composants)
3. [Services & Hooks](#services--hooks)
4. [Base de données](#base-de-données)
5. [Installation](#installation)
6. [Guide d'utilisation](#guide-dutilisation)
7. [Tests](#tests)

---

## 🏗️ Architecture

### Stack Technique

- **Frontend:** Next.js 14 (App Router) + React 18
- **UI:** TailwindCSS + Framer Motion
- **Backend:** Supabase (PostgreSQL + Realtime)
- **State Management:** React Hooks + Context
- **Types:** TypeScript strict

### Flux de données

```
┌─────────────────┐
│  Page Events    │ ← Composant principal
└────────┬────────┘
         │
         ├─→ useEvents() ← Hook personnalisé
         │       │
         │       ├─→ EventsRealtimeService ← Service Singleton
         │       │         │
         │       │         └─→ Supabase Client
         │       │
         │       └─→ State local (events, loading, error)
         │
         ├─→ InteractiveCalendar
         ├─→ EventCard
         ├─→ EventDetailsModal
         └─→ EventForm
```

---

## 🧩 Composants

### 1. InteractiveCalendar
**Fichier:** `/components/events/InteractiveCalendar.tsx`

Calendrier mensuel interactif avec :
- ✅ Navigation mois par mois
- ✅ Indicateurs visuels d'événements
- ✅ Filtrage par catégorie
- ✅ Animations fluides
- ✅ Responsive mobile

**Props:**
```typescript
{
  events: CalendarEvent[]
  onDateClick?: (date: Date) => void
  onEventClick?: (event: CalendarEvent) => void
  selectedDate?: Date
  className?: string
}
```

### 2. EventCard
**Fichier:** `/components/events/EventCard.tsx`

Carte d'événement avec design glassmorphism :
- 🎨 Badge catégorie coloré
- 📊 Statut et priorité
- 📍 Informations (date, lieu, participants)
- ⚡ Actions rapides (Voir, Modifier, Supprimer)
- 🎭 Animations hover

**Props:**
```typescript
{
  event: CalendarEvent
  onView?: (event: CalendarEvent) => void
  onEdit?: (event: CalendarEvent) => void
  onDelete?: (event: CalendarEvent) => void
  compact?: boolean
  showActions?: boolean
  className?: string
}
```

### 3. EventDetailsModal
**Fichier:** `/components/events/EventDetailsModal.tsx`

Modal responsive pour afficher tous les détails :
- 📋 Informations complètes
- 👥 Liste des participants
- 📎 Pièces jointes
- 🔔 Rappels
- ⚙️ Actions (Modifier, Supprimer, Partager)

### 4. EventForm
**Fichier:** `/components/events/EventForm.tsx`

Formulaire de création/édition complet :
- ✍️ Validation en temps réel
- 📅 Sélecteurs date/heure
- 👥 Gestion des participants
- 🔔 Configuration des rappels
- 💾 Sauvegarde optimiste

---

## 🔧 Services & Hooks

### EventsRealtimeService
**Fichier:** `/services/eventsRealtimeService.ts`

Service Singleton pour gérer la synchronisation Realtime :

```typescript
// Méthodes principales
connect(agencyId: string): Promise<void>
disconnect(): Promise<void>
subscribe(id: string, callbacks): () => void
getEvents(agencyId: string): Promise<CalendarEvent[]>
createEvent(event): Promise<CalendarEvent>
updateEvent(id, updates): Promise<CalendarEvent>
deleteEvent(id): Promise<void>
```

**Fonctionnalités:**
- 🔌 Connexion persistante Supabase Realtime
- 📡 Pub/Sub pour notifier les abonnés
- 🔄 Gestion automatique des reconnexions
- 🛡️ Gestion d'erreurs robuste

### useEvents Hook
**Fichier:** `/hooks/useEvents.ts`

Hook React pour utiliser facilement le service :

```typescript
const {
  events,              // Liste des événements
  isLoading,          // État chargement
  error,              // Erreur éventuelle
  isConnected,        // Statut connexion Realtime
  createEvent,        // Créer un événement
  updateEvent,        // Modifier un événement
  deleteEvent,        // Supprimer un événement
  loadEvents,         // Recharger manuellement
  filterByCategory,   // Filtrer par catégorie
  filterByStatus,     // Filtrer par statut
  getUpcomingEvents,  // Événements à venir
  getStats,           // Statistiques
} = useEvents()
```

---

## 💾 Base de données

### Table `events`

```sql
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'planned',
  agency_id TEXT NOT NULL,
  location TEXT,
  participants JSONB DEFAULT '[]',
  resources JSONB DEFAULT '[]',
  notes TEXT,
  attachments JSONB DEFAULT '[]',
  recurrence JSONB,
  color TEXT,
  reminder JSONB,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  all_day BOOLEAN DEFAULT false
)
```

### RLS (Row Level Security)

Politiques de sécurité implémentées :
- ✅ SELECT: Utilisateurs voient uniquement les événements de leur agence
- ✅ INSERT: Création limitée à leur agence
- ✅ UPDATE: Modification limitée à leur agence
- ✅ DELETE: Suppression limitée à leur agence
- ✅ Admins: Accès complet multi-agences

---

## 🚀 Installation

### 1. Exécuter les migrations SQL

```bash
# Dans Supabase Dashboard > SQL Editor
# Exécuter dans l'ordre :
1. /supabase/migrations/create_events_table.sql
2. /supabase/migrations/create_events_rls.sql
```

### 2. Vérifier les dépendances

```bash
npm install framer-motion lucide-react
```

### 3. Variables d'environnement

Vérifier `.env.local` :
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle
```

---

## 📖 Guide d'utilisation

### Pour les développeurs

#### 1. Utiliser le hook dans un composant

```typescript
'use client'

import { useEvents } from '@/hooks/useEvents'

export default function MyComponent() {
  const { events, createEvent, isLoading } = useEvents()

  const handleCreate = async () => {
    await createEvent({
      title: 'Nouveau briefing',
      start_date: new Date().toISOString(),
      end_date: new Date().toISOString(),
      category: 'réunion',
      priority: 'normal',
      status: 'planned',
    })
  }

  return <div>...</div>
}
```

#### 2. Écouter les changements en temps réel

Le hook `useEvents` se connecte automatiquement au Realtime. Les événements créés/modifiés/supprimés par d'autres utilisateurs apparaissent instantanément.

#### 3. Créer un événement récurrent

```typescript
await createEvent({
  title: 'Briefing hebdomadaire',
  // ... autres champs
  recurrence: {
    type: 'weekly',
    interval: 1,
    end_date: '2025-12-31'
  }
})
```

### Pour les utilisateurs finaux

Voir le guide complet : [GUIDE-UTILISATEUR.md](./GUIDE-UTILISATEUR.md)

---

## 🧪 Tests

### Tests à effectuer

#### Fonctionnels
- [ ] Créer un événement
- [ ] Modifier un événement
- [ ] Supprimer un événement
- [ ] Filtrer par catégorie
- [ ] Filtrer par statut
- [ ] Recherche textuelle
- [ ] Navigation calendrier

#### Realtime
- [ ] Ouvrir 2 navigateurs (utilisateurs différents de la même agence)
- [ ] Créer un événement dans le navigateur A
- [ ] Vérifier qu'il apparaît dans le navigateur B instantanément
- [ ] Modifier l'événement dans B
- [ ] Vérifier la mise à jour dans A
- [ ] Supprimer dans A
- [ ] Vérifier la suppression dans B

#### Performance
- [ ] Tester avec 100+ événements
- [ ] Vérifier la fluidité des animations
- [ ] Tester sur mobile

---

## 🐛 Problèmes connus

### ⚠️ À faire avant la production

1. **Authentification:** Remplacer `created_by: 'current-user'` par l'ID utilisateur réel du contexte d'auth
2. **Upload:** Implémenter l'upload de pièces jointes vers Supabase Storage
3. **Notifications:** Intégrer un système de notifications push pour les rappels
4. **Récurrence:** Implémenter la logique de création automatique d'événements récurrents
5. **Tests unitaires:** Ajouter des tests Jest/React Testing Library

---

## 📊 Métriques de performance

### Bundle Size
- InteractiveCalendar: ~8KB
- EventCard: ~5KB
- EventDetailsModal: ~7KB
- EventForm: ~9KB
- eventsRealtimeService: ~4KB
- **Total composants événements:** ~33KB

### Temps de chargement cibles
- Chargement initial: < 1s
- Création événement: < 500ms
- Synchronisation Realtime: < 100ms (latence réseau)

---

## 🤝 Contribution

### Conventions de code

- ✅ Utiliser TypeScript strict
- ✅ Commenter les fonctions complexes
- ✅ Utiliser des noms de variables descriptifs
- ✅ Suivre les conventions React/Next.js
- ✅ Tous les composants doivent être responsive

### Workflow Git

```bash
# Créer une feature
git checkout -b feature/nom-feature

# Committer
git add .
git commit -m "feat: description"

# Merger dans RefonteEvenement
git checkout RefonteEvenement
git merge feature/nom-feature
```

---

## 📞 Support

Pour toute question ou problème :
- **Créateur:** Snowzy
- **Branche:** RefonteEvenement
- **Issues:** Créer une issue GitHub

---

## 📝 Changelog

### Version 1.0.0 (2025-11-01)
- ✅ Architecture Realtime complète
- ✅ Interface utilisateur moderne et responsive
- ✅ Composants InteractiveCalendar, EventCard, EventDetailsModal, EventForm
- ✅ Service EventsRealtimeService avec pattern Singleton
- ✅ Hook useEvents pour faciliter l'utilisation
- ✅ Migrations SQL (table + RLS)
- ✅ Documentation technique complète

---

**🎉 La refonte est prête pour les tests !**
