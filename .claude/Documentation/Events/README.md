# Documentation - Gestion des Événements OlympusMDT

Bienvenue dans la documentation complète du système de gestion des événements d'OlympusMDT.

## Fichiers de documentation

### 1. ARCHITECTURE-TECHNIQUE.md
Documentation détaillée de l'architecture technique du système d'événements.

**Contient**:
- Vue d'ensemble du système
- Composants UI (pages par agence, structure)
- Gestion d'état (hooks, services)
- Configuration Supabase et realtime
- Types TypeScript et interfaces
- Flux de données complets
- Fichiers clés et structure du projet

**Public**: Développeurs, architectes

**À lire si**: Vous devez comprendre le fonctionnement interne ou apporter des modifications

---

### 2. GUIDE-UTILISATION.md
Guide complet pour les utilisateurs du calendrier des événements.

**Contient**:
- Comment accéder au calendrier
- Créer, modifier, supprimer un événement
- Filtrer et rechercher
- Navigation du calendrier
- FAQ et limitations actuelles
- Conseils d'utilisation

**Public**: Utilisateurs finaux, administrateurs

**À lire si**: Vous utilisez le calendrier ou aidez d'autres utilisateurs

---

## Résumé rapide

### Qu'est-ce que le système d'événements?

Un **calendrier interactif** permettant de planifier et gérer des événements pour chaque agence (SASP, SAMC, SAFD, Dynasty8, DOJ).

### Où accéder?

```
https://[votre-domaine]/dashboard/[agence]/events

Exemples:
- https://[domaine]/dashboard/sasp/events
- https://[domaine]/dashboard/samc/events
- https://[domaine]/dashboard/events (global)
```

### Fonctionnalités principales

- **Calendrier mensuel** avec grille 7x6
- **Création/édition** d'événements via formulaire modal
- **8 catégories** d'événements (patrouille, formation, réunion, etc.)
- **Filtrage** par catégorie et recherche par mot-clé
- **Synchronisation locale** (localStorage + multi-tab)
- **Navigation intuitive** (mois précédent/suivant, "Aujourd'hui")

### Architecture

```
Frontend (Pages React)
    ↓
Hook useRealtimeSync
    ↓
Service RealtimeSyncService (Singleton)
    ├─ Cache en mémoire
    ├─ localStorage (mdt_events)
    └─ Pub/Sub pattern
```

### État actuel

- **Persistance**: localStorage uniquement (pas de Supabase actuellement)
- **Partage**: Pas de partage entre utilisateurs (local au navigateur)
- **Données**: 4 événements de test créés au premier accès
- **Synchronisation**: Multi-tab via storage events

### Prochaines étapes

- Créer table `events` dans Supabase
- Implémenter les routes API
- Intégrer Supabase Realtime
- Ajouter l'isolation par agence
- Implémenter les récurrences
- Ajouter les notifications

---

## Rechercher par sujet

### Je veux...

**Utiliser le calendrier**
→ Lire: [GUIDE-UTILISATION.md](GUIDE-UTILISATION.md)

**Comprendre le code**
→ Lire: [ARCHITECTURE-TECHNIQUE.md](ARCHITECTURE-TECHNIQUE.md)

**Créer/modifier un événement**
→ Lire: [GUIDE-UTILISATION.md#créer-un-événement](GUIDE-UTILISATION.md)

**Apporter des modifications au système**
→ Lire: [ARCHITECTURE-TECHNIQUE.md](#gestion-détat)

**Ajouter une nouvelle fonctionnalité**
→ Lire: [ARCHITECTURE-TECHNIQUE.md#prochaines-étapes](ARCHITECTURE-TECHNIQUE.md)

**Intégrer Supabase**
→ Lire: [ARCHITECTURE-TECHNIQUE.md#base-de-données](ARCHITECTURE-TECHNIQUE.md)

---

## Structure des fichiers

```
.claude/Documentation/Events/
├── README.md                          (ce fichier)
├── ARCHITECTURE-TECHNIQUE.md          (détails techniques)
└── GUIDE-UTILISATION.md              (guide utilisateur)
```

---

## Fichiers source clés

| Fichier | Rôle | Chemin |
|---------|------|--------|
| Pages événements | Interface utilisateur | `/app/dashboard/*/events/page.tsx` |
| Hook useRealtimeSync | Gestion d'état React | `/hooks/useRealtimeSync.ts` |
| Service Realtime | Singleton de synchronisation | `/services/realtimeSync.ts` |
| Configuration | Agences et routes | `/config/agencies.ts` |
| Client Supabase | Accès à la base de données | `/lib/supabase/client.ts` |
| UI Composants | Modales, formulaires | `/components/ui/` |

---

## Questions fréquentes

### Q: Où sont stockées les données des événements?
**R**: En localStorage du navigateur (`mdt_events`). Aucune synchronisation serveur actuellement.

### Q: Puis-je voir les événements d'autres utilisateurs?
**R**: Non, chaque navigateur a ses propres données locales.

### Q: Comment supprimer tous les événements?
**R**: Via les outils de développement du navigateur: `localStorage.removeItem('mdt_events')`

### Q: Quand les événements seront-ils synchronisés avec Supabase?
**R**: Pas de date fixée actuellement. Cela nécessite de créer la table, les routes API, et d'intégrer Realtime.

### Q: Puis-je créer des événements récurrents?
**R**: Non, le champ `recurrence` existe mais n'est pas fonctionnel.

---

## Signaler un problème

Si vous trouvez un bug ou avez une suggestion:

1. Consultez d'abord la [FAQ du guide d'utilisation](GUIDE-UTILISATION.md#faq)
2. Vérifiez la [section limitations](GUIDE-UTILISATION.md#limitations-actuelles)
3. Ouvrez une issue sur le repository du projet

---

## Contribution

Pour contribuer à la documentation ou au code:

1. Lisez la [documentation technique](ARCHITECTURE-TECHNIQUE.md)
2. Consultez les [points clés à retenir](ARCHITECTURE-TECHNIQUE.md#points-clés-à-retenir)
3. Respectez la structure et les conventions du projet

---

**Dernière mise à jour**: 2025-11-01  
**Auteur**: Snowzy  
**Version**: 1.0

