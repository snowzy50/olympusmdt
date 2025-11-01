# Dashboard - Documentation Technique

## Vue d'ensemble
Le Dashboard est le module central d'OlympusMDT qui affiche en temps réel l'état des dispositifs médicaux et les métriques clés de l'établissement.

## Architecture

### Composants principaux

#### `app/page.tsx`
Point d'entrée du dashboard. Orchestre l'affichage des différents widgets et statistiques.

**Localisation :** `app/page.tsx`

#### `components/dashboard/ActiveUnits.tsx`
Affiche la liste des unités médicales actives avec leurs statuts en temps réel.

**Props :**
- Aucune prop externe (utilise des données mockées actuellement)

**Fonctionnalités :**
- Affichage du statut des unités (Actif/Inactif)
- Code couleur par unité
- Compteur de dispositifs par unité

#### `components/dashboard/QuickActions.tsx`
Panneau d'actions rapides pour les opérations courantes.

**Actions disponibles :**
- Nouveau Dispositif
- Planifier Stérilisation
- Générer Rapport
- Voir Historique

#### `components/dashboard/RecentActivity.tsx`
Affiche l'historique récent des opérations sur les dispositifs.

**Fonctionnalités :**
- Timeline des événements
- Filtrage par type d'activité
- Horodatage des opérations

#### `components/ui/StatCard.tsx`
Composant réutilisable pour afficher des statistiques sous forme de cartes.

**Props :**
```typescript
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
}
```

## Flux de données

```
app/page.tsx
  ├─> StatCard (x4) - Statistiques principales
  ├─> ActiveUnits - Liste des unités
  ├─> RecentActivity - Historique
  └─> QuickActions - Actions rapides
```

## Intégration future

### API endpoints à implémenter
- `GET /api/stats` - Récupération des statistiques
- `GET /api/units/active` - Liste des unités actives
- `GET /api/activity/recent` - Activité récente
- `POST /api/devices/new` - Création d'un nouveau dispositif

### État global
Prévoir l'intégration avec un gestionnaire d'état (Zustand, Redux) pour :
- Cache des statistiques
- Mise à jour en temps réel
- Synchronisation entre composants

## Styles et design

Le Dashboard utilise :
- Tailwind CSS pour le styling
- Grid layout responsive
- Palette de couleurs définie dans `DESIGN_GUIDE.md`
- Cards avec ombre et bordures arrondies

## Tests à implémenter

### Tests unitaires
- [ ] Rendu des StatCards avec différentes props
- [ ] Affichage correct des unités actives
- [ ] Format des dates dans RecentActivity

### Tests d'intégration
- [ ] Chargement des données depuis l'API
- [ ] Mise à jour en temps réel
- [ ] Navigation vers les actions rapides

## Performance

### Optimisations prévues
- Lazy loading des composants lourds
- Memoization des calculs de statistiques
- Pagination de l'activité récente
- WebSocket pour les mises à jour temps réel

## Accessibilité

- [x] Structure sémantique HTML
- [x] Contraste des couleurs conforme WCAG 2.1
- [ ] Navigation au clavier
- [ ] Support lecteurs d'écran (ARIA labels)
- [ ] Mode sombre

## Dépendances

```json
{
  "react": "^18.0.0",
  "next": "^14.0.0",
  "tailwindcss": "^3.0.0",
  "lucide-react": "^0.263.1"
}
```

## Notes de développement

- Les données actuelles sont mockées et doivent être remplacées par des appels API
- Prévoir un système de rafraîchissement automatique (polling ou WebSocket)
- Implémenter la gestion d'erreur et les états de chargement
- Ajouter des filtres sur les statistiques (période, unité, type de dispositif)

---

**Créé par :** Snowzy
**Dernière mise à jour :** 2025-11-01
