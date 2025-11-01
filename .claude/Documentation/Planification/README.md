# Planification - Documentation Technique

## Vue d'ensemble
Le module Planification gère l'organisation et le suivi des cycles de stérilisation, permettant une gestion optimale des ressources et du temps.

## Architecture

### Composants principaux

#### `app/planification/page.tsx`
Page principale du module de planification. Affiche le calendrier des cycles et les outils de planification.

**Localisation :** `app/planification/page.tsx`

**Structure :**
```tsx
export default function PlanificationPage() {
  return (
    <MainLayout>
      <ShiftCalendar />
      <ShiftList />
      <ShiftForm />
    </MainLayout>
  );
}
```

#### `components/planning/ShiftCard.tsx`
Composant de carte représentant un cycle de stérilisation planifié.

**Props :**
```typescript
interface ShiftCardProps {
  shift: {
    id: string;
    title: string;
    startTime: Date;
    endTime: Date;
    status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
    operator: string;
    devices: Device[];
    autoclave: string;
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onStart?: (id: string) => void;
}
```

**Fonctionnalités :**
- Affichage des détails du cycle
- Actions contextuelles (éditer, démarrer, annuler)
- Code couleur selon le statut
- Liste des dispositifs assignés
- Badge du statut

### Composants à implémenter

#### `ShiftCalendar`
Vue calendrier des cycles planifiés.

**Fonctionnalités prévues :**
- Vue jour/semaine/mois
- Drag & drop pour réorganiser
- Code couleur par autoclave
- Indicateurs de capacité

#### `ShiftList`
Liste des cycles avec filtres et tri.

**Fonctionnalités prévues :**
- Filtrage par statut, date, opérateur
- Tri multi-critères
- Export vers Excel/PDF
- Recherche textuelle

#### `ShiftForm`
Formulaire de création/édition de cycle.

**Champs :**
- Date et heure de début
- Durée estimée
- Autoclave assigné
- Opérateur responsable
- Type de cycle
- Dispositifs à stériliser
- Notes et observations

## Flux de données

```
app/planification/page.tsx
  ├─> ShiftCalendar
  │   └─> ShiftCard (multiple)
  ├─> ShiftList
  │   └─> ShiftCard (multiple)
  └─> ShiftForm
      ├─> DeviceSelector
      ├─> AutoclaveSelector
      └─> OperatorSelector
```

## Modèle de données

### Shift (Cycle de stérilisation)
```typescript
interface Shift {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  status: ShiftStatus;
  operator: Operator;
  devices: Device[];
  autoclave: Autoclave;
  cycleType: CycleType;
  temperature?: number;
  pressure?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

type ShiftStatus =
  | 'planned'      // Planifié, pas encore démarré
  | 'in_progress'  // En cours d'exécution
  | 'completed'    // Terminé avec succès
  | 'failed'       // Échec du cycle
  | 'cancelled';   // Annulé

type CycleType =
  | 'standard'     // Cycle standard 134°C
  | 'prion'        // Cycle spécial prion
  | 'textiles'     // Cycle textiles
  | 'flash';       // Cycle flash d'urgence
```

### Autoclave
```typescript
interface Autoclave {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  status: 'available' | 'in_use' | 'maintenance' | 'out_of_order';
  capacity: number; // en litres
  location: string;
  lastMaintenance: Date;
  nextMaintenance: Date;
}
```

### Operator
```typescript
interface Operator {
  id: string;
  name: string;
  email: string;
  role: 'technician' | 'supervisor' | 'manager';
  certifications: string[];
  availableHours: TimeSlot[];
}
```

## API Endpoints

### Cycles de stérilisation

#### `GET /api/shifts`
Liste tous les cycles avec filtres optionnels.

**Query params :**
- `startDate` : Date de début
- `endDate` : Date de fin
- `status` : Filtrer par statut
- `operator` : Filtrer par opérateur
- `autoclave` : Filtrer par autoclave

**Response :**
```json
{
  "shifts": [
    {
      "id": "shift_001",
      "title": "Cycle Standard - Bloc 1",
      "startTime": "2025-11-01T08:00:00Z",
      "endTime": "2025-11-01T09:30:00Z",
      "status": "planned",
      "operator": {...},
      "devices": [...],
      "autoclave": {...}
    }
  ],
  "total": 42
}
```

#### `POST /api/shifts`
Crée un nouveau cycle de stérilisation.

**Body :**
```json
{
  "title": "Cycle Standard - Bloc 1",
  "startTime": "2025-11-01T08:00:00Z",
  "duration": 90,
  "operatorId": "op_001",
  "autoclaveId": "ac_001",
  "cycleType": "standard",
  "deviceIds": ["dm_001", "dm_002"],
  "notes": "Vérifier la température"
}
```

#### `PATCH /api/shifts/:id`
Met à jour un cycle existant.

#### `DELETE /api/shifts/:id`
Annule un cycle (soft delete).

#### `POST /api/shifts/:id/start`
Démarre l'exécution d'un cycle.

#### `POST /api/shifts/:id/complete`
Marque un cycle comme terminé.

### Autoclaves

#### `GET /api/autoclaves`
Liste tous les autoclaves disponibles.

#### `GET /api/autoclaves/:id/availability`
Vérifie la disponibilité d'un autoclave sur une période.

### Opérateurs

#### `GET /api/operators`
Liste tous les opérateurs.

#### `GET /api/operators/:id/schedule`
Récupère le planning d'un opérateur.

## Logique métier

### Validation de planification

Avant de créer un cycle, vérifier :

1. **Disponibilité de l'autoclave**
   - Pas d'autre cycle en cours
   - Pas de maintenance planifiée
   - Statut = 'available'

2. **Disponibilité de l'opérateur**
   - Pas d'autre cycle assigné sur la même période
   - Opérateur certifié pour le type de cycle

3. **Capacité de l'autoclave**
   - Volume total des dispositifs ≤ capacité autoclave
   - Compatibilité des dispositifs avec le type de cycle

4. **Contraintes temporelles**
   - Heure de début ≥ heure actuelle
   - Durée cohérente avec le type de cycle
   - Pas de chevauchement avec autres cycles

### Algorithme de suggestion

Pour suggérer le meilleur créneau :

```typescript
function suggestOptimalSlot(
  devices: Device[],
  preferredDate: Date
): SlotSuggestion {
  const autoclaves = getAvailableAutoclaves();
  const operators = getAvailableOperators();

  // 1. Calculer le volume total requis
  const totalVolume = devices.reduce((sum, d) => sum + d.volume, 0);

  // 2. Filtrer autoclaves avec capacité suffisante
  const suitableAutoclaves = autoclaves.filter(
    a => a.capacity >= totalVolume && a.status === 'available'
  );

  // 3. Trouver les créneaux libres
  const slots = findAvailableSlots(
    suitableAutoclaves,
    operators,
    preferredDate
  );

  // 4. Scorer et trier
  return slots.sort((a, b) => calculateScore(b) - calculateScore(a))[0];
}
```

### États de transition

```
planned → in_progress → completed
   ↓           ↓            ↓
cancelled   failed      (archived)
```

**Règles :**
- `planned` → `in_progress` : seulement si heure de début ≤ maintenant
- `in_progress` → `completed` : seulement si tous les contrôles passent
- `in_progress` → `failed` : si anomalie détectée
- `planned` → `cancelled` : seulement si pas encore démarré

## Interface utilisateur

### Vue calendrier

**Modes d'affichage :**
- Jour : horaire 7h-19h, créneaux de 30 min
- Semaine : 7 colonnes, vue condensée
- Mois : aperçu global, indicateurs de charge

**Interactions :**
- Clic sur un cycle → ouvre le détail
- Double-clic sur espace vide → crée un cycle
- Drag & drop → déplace un cycle
- Resize → ajuste la durée

### Codes couleurs

```css
planned:      bg-blue-100 border-blue-500
in_progress:  bg-yellow-100 border-yellow-500
completed:    bg-green-100 border-green-500
failed:       bg-red-100 border-red-500
cancelled:    bg-gray-100 border-gray-500
```

## Performance

### Optimisations

1. **Cache des données**
   - Cache Redis pour les plannings
   - Invalidation lors des modifications
   - TTL : 5 minutes

2. **Pagination**
   - 50 cycles par page
   - Infinite scroll pour la liste
   - Virtual scrolling pour les grandes listes

3. **Requêtes optimisées**
   - Include des relations nécessaires
   - Index sur startTime, status, operatorId
   - Aggregate queries pour les statistiques

## Tests

### Tests unitaires

```typescript
describe('ShiftCard', () => {
  it('affiche les informations du cycle', () => {
    const shift = createMockShift();
    render(<ShiftCard shift={shift} />);
    expect(screen.getByText(shift.title)).toBeInTheDocument();
  });

  it('affiche le bon statut', () => {
    const shift = createMockShift({ status: 'in_progress' });
    render(<ShiftCard shift={shift} />);
    expect(screen.getByText(/en cours/i)).toBeInTheDocument();
  });
});
```

### Tests d'intégration

- Création complète d'un cycle
- Modification d'un cycle existant
- Annulation avec confirmation
- Validation des contraintes

## Sécurité

### Permissions

```typescript
const permissions = {
  'shift:view': ['technician', 'supervisor', 'manager'],
  'shift:create': ['supervisor', 'manager'],
  'shift:update': ['supervisor', 'manager'],
  'shift:delete': ['manager'],
  'shift:start': ['technician', 'supervisor', 'manager'],
};
```

### Audit trail

Chaque opération doit être loggée :
- Qui a fait l'action
- Quand
- Quelle action
- Anciennes et nouvelles valeurs

---

**Créé par :** Snowzy
**Dernière mise à jour :** 2025-11-01
