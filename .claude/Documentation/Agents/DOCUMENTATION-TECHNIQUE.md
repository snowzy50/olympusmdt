# Documentation Technique - Système de Gestion des Agents

## Architecture Générale

Le système de gestion des agents est une solution multi-tenant complète utilisant Supabase pour la persistance des données et la synchronisation en temps réel entre utilisateurs.

Créé par Snowzy

---

## Stack Technique

### Frontend
- **Next.js 14.2.33** - Framework React avec App Router
- **React 18** - Bibliothèque UI avec hooks modernes
- **TypeScript** - Typage statique fort
- **Tailwind CSS** - Styling utility-first
- **Lucide React** - Icônes SVG

### Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL 15** - Base de données relationnelle
- **Supabase Realtime** - WebSocket pour synchronisation temps réel
- **Row Level Security (RLS)** - Sécurité au niveau des lignes

---

## Architecture des Données

### Modèle Multi-Tenant

Chaque agence a ses propres données complètement isolées :

```
┌─────────────────────────────────────────────┐
│              Table: agents                   │
├─────────────────────────────────────────────┤
│ SASP Agents   (agency_id = 'sasp')          │
│ LSPD Agents   (agency_id = 'lspd')          │
│ BCSO Agents   (agency_id = 'bcso')          │
│ ...                                          │
└─────────────────────────────────────────────┘
         ↓ RLS Policies Automatiques ↓
┌─────────────────────────────────────────────┐
│    User A (agencies: ['sasp', 'doj'])       │
│    → Voit uniquement: SASP + DOJ            │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│    User B (agencies: ['lspd'])              │
│    → Voit uniquement: LSPD                  │
└─────────────────────────────────────────────┘
```

### Schéma de Base de Données

#### Table `agents`

```sql
CREATE TABLE public.agents (
  -- Identifiant
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenancy
  agency_id TEXT NOT NULL,

  -- Identification Discord
  discord_username TEXT NOT NULL,
  discord_user_id TEXT,
  discord_avatar TEXT,

  -- Information personnelle
  badge TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,

  -- Grade et affectation (ENUM types)
  grade agent_grade NOT NULL DEFAULT 'cadet',
  division agent_division NOT NULL DEFAULT 'patrol',
  certifications TEXT[] DEFAULT '{}',
  status agent_status NOT NULL DEFAULT 'off_duty',

  -- Hiérarchie
  supervisor_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,

  -- Contact
  phone TEXT,
  radio TEXT,

  -- Timestamps
  date_joined TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Statistiques
  total_hours INTEGER DEFAULT 0,
  interventions INTEGER DEFAULT 0,
  arrests INTEGER DEFAULT 0,
  reports_written INTEGER DEFAULT 0,

  -- Notes
  notes TEXT,

  -- Contraintes
  CONSTRAINT unique_badge_per_agency UNIQUE (agency_id, badge),
  CONSTRAINT unique_discord_per_agency UNIQUE (agency_id, discord_username)
);
```

#### Table `agent_history`

```sql
CREATE TABLE public.agent_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  performed_by UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);
```

### Types ENUM PostgreSQL

```sql
CREATE TYPE agent_grade AS ENUM (
  'cadet',      -- Ordre: 1
  'officer',    -- Ordre: 2
  'corporal',   -- Ordre: 3
  'sergeant',   -- Ordre: 4
  'lieutenant', -- Ordre: 5
  'captain',    -- Ordre: 6
  'commander',  -- Ordre: 7
  'chief'       -- Ordre: 8
);

CREATE TYPE agent_status AS ENUM (
  'active',
  'off_duty',
  'training',
  'leave'
);

CREATE TYPE agent_division AS ENUM (
  'patrol',
  'traffic',
  'k9',
  'swat',
  'detectives',
  'administration'
);
```

---

## Row Level Security (RLS)

### Politique SELECT

```sql
CREATE POLICY "Users can view agents from their agencies"
  ON public.agents
  FOR SELECT
  USING (
    agency_id = ANY(
      SELECT unnest(
        COALESCE(
          (auth.jwt() -> 'user_metadata' ->> 'agencies')::text[],
          '{}'::text[]
        )
      )
    )
    OR
    (auth.jwt() -> 'user_metadata' ->> 'isAdmin')::boolean = true
  );
```

**Explication** :
- Extrait le tableau `agencies` du JWT de l'utilisateur
- Vérifie que `agency_id` est dans ce tableau
- OU vérifie si l'utilisateur est admin
- Appliqué automatiquement sur TOUTES les requêtes SELECT

### Politique INSERT

```sql
CREATE POLICY "Users can insert agents in their agencies"
  ON public.agents
  FOR INSERT
  WITH CHECK (
    agency_id = ANY(
      SELECT unnest(
        COALESCE(
          (auth.jwt() -> 'user_metadata' ->> 'agencies')::text[],
          '{}'::text[]
        )
      )
    )
    OR
    (auth.jwt() -> 'user_metadata' ->> 'isAdmin')::boolean = true
  );
```

**Explication** :
- Vérifie que l'`agency_id` inséré est dans la liste des agences de l'utilisateur
- Empêche d'insérer des agents dans d'autres agences

### Politiques UPDATE et DELETE

Identiques à INSERT, garantissant que les utilisateurs ne peuvent modifier/supprimer QUE les agents de leurs agences.

---

## Architecture Frontend

### Structure des Fichiers

```
app/dashboard/
├── sasp/agents/page.tsx      # Page agents SASP
├── lspd/agents/page.tsx      # Page agents LSPD
├── bcso/agents/page.tsx      # Page agents BCSO
├── doj/agents/page.tsx       # Page agents DOJ
├── samc/agents/page.tsx      # Page agents SAMC
├── safd/agents/page.tsx      # Page agents SAFD
├── dynasty8/agents/page.tsx  # Page agents Dynasty8
└── ems/agents/page.tsx       # Page agents EMS

hooks/
└── useSupabaseAgents.ts      # Hook React pour Supabase Realtime

lib/supabase/
└── client.ts                 # Client Supabase + types DB

types/
├── agent.ts                  # Types TypeScript locaux
└── agent-adapter.ts          # Conversion local ↔ Supabase
```

### Hook `useSupabaseAgents`

Le hook central pour gérer les agents avec Realtime.

**Localisation** : `/hooks/useSupabaseAgents.ts`

#### Interface

```typescript
interface UseSupabaseAgentsReturn {
  agents: Agent[];              // Liste des agents
  isLoading: boolean;           // État de chargement
  error: Error | null;          // Erreur éventuelle
  addAgent: (agent) => Promise<Agent | null>;
  updateAgent: (id, updates) => Promise<Agent | null>;
  deleteAgent: (id) => Promise<boolean>;
  refetch: () => Promise<void>; // Recharger manuellement
}
```

#### Utilisation

```typescript
export default function AgentsPage() {
  const {
    agents: supabaseAgents,
    isLoading,
    addAgent,
    updateAgent,
    deleteAgent
  } = useSupabaseAgents('sasp');

  // Convertir les agents Supabase en agents locaux
  const agents = useMemo(
    () => supabaseAgents.map(supabaseToLocal),
    [supabaseAgents]
  );

  // ...
}
```

#### Fonctionnement Interne

##### 1. Chargement Initial

```typescript
const fetchAgents = useCallback(async () => {
  const { data } = await supabase
    .from('agents')
    .select('*')
    .eq('agency_id', agencyId)
    .order('date_joined', { ascending: false });

  setAgents(data || []);
}, [agencyId]);
```

##### 2. Subscription Realtime

```typescript
useEffect(() => {
  const channel = supabase
    .channel(`agents:${agencyId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'agents',
      filter: `agency_id=eq.${agencyId}`,
    }, (payload) => {
      // Ajouter le nouvel agent au début
      setAgents((current) => [payload.new, ...current]);
    })
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'agents',
      filter: `agency_id=eq.${agencyId}`,
    }, (payload) => {
      // Remplacer l'agent modifié
      setAgents((current) =>
        current.map((agent) =>
          agent.id === payload.new.id ? payload.new : agent
        )
      );
    })
    .on('postgres_changes', {
      event: 'DELETE',
      schema: 'public',
      table: 'agents',
      filter: `agency_id=eq.${agencyId}`,
    }, (payload) => {
      // Supprimer l'agent
      setAgents((current) =>
        current.filter((agent) => agent.id !== payload.old.id)
      );
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [agencyId]);
```

**Points Clés** :
- Un canal unique par agence : `agents:sasp`, `agents:lspd`, etc.
- Filtre au niveau du canal pour ne recevoir QUE les événements de l'agence
- Mise à jour automatique du state React lors des changements

##### 3. Méthodes CRUD

**Ajout d'un Agent**

```typescript
const addAgent = useCallback(async (agentData) => {
  const { data } = await supabase
    .from('agents')
    .insert({
      ...agentData,
      agency_id: agencyId,
    })
    .select()
    .single();

  return data;
}, [agencyId]);
```

**Mise à jour**

```typescript
const updateAgent = useCallback(async (id, updates) => {
  const { data } = await supabase
    .from('agents')
    .update(updates)
    .eq('id', id)
    .eq('agency_id', agencyId) // Sécurité supplémentaire
    .select()
    .single();

  return data;
}, [agencyId]);
```

**Suppression**

```typescript
const deleteAgent = useCallback(async (id) => {
  const { error } = await supabase
    .from('agents')
    .delete()
    .eq('id', id)
    .eq('agency_id', agencyId); // Sécurité supplémentaire

  return !error;
}, [agencyId]);
```

---

## Adaptateurs de Types

**Localisation** : `/types/agent-adapter.ts`

### Problème Résolu

Supabase utilise `snake_case` (ex: `first_name`) tandis que TypeScript utilise `camelCase` (ex: `firstName`).

### Solution : Fonctions de Conversion

#### Supabase → Local

```typescript
export function supabaseToLocal(agent: SupabaseAgent): LocalAgent {
  return {
    id: agent.id,
    discordUsername: agent.discord_username,
    discordAvatar: agent.discord_avatar || undefined,
    badge: agent.badge,
    firstName: agent.first_name,
    lastName: agent.last_name,
    grade: agent.grade,
    division: agent.division,
    certifications: agent.certifications as AgentCertification[],
    status: agent.status,
    dateJoined: new Date(agent.date_joined),
    supervisor: agent.supervisor_id || undefined,
    phone: agent.phone || undefined,
    radio: agent.radio || undefined,
    stats: {
      totalHours: agent.total_hours,
      interventions: agent.interventions,
      arrests: agent.arrests,
      reportsWritten: agent.reports_written,
    },
    history: [],
    notes: agent.notes || undefined,
  };
}
```

#### Local → Supabase

```typescript
export function localToSupabase(agent: Partial<LocalAgent>, agencyId: string) {
  return {
    agency_id: agencyId,
    discord_username: agent.discordUsername || '',
    discord_avatar: agent.discordAvatar || null,
    badge: agent.badge || '',
    first_name: agent.firstName || '',
    last_name: agent.lastName || '',
    grade: agent.grade || 'cadet',
    division: agent.division || 'patrol',
    certifications: agent.certifications || [],
    status: agent.status || 'off_duty',
    date_joined: agent.dateJoined ? agent.dateJoined.toISOString() : new Date().toISOString(),
    supervisor_id: agent.supervisor || null,
    phone: agent.phone || null,
    radio: agent.radio || null,
    total_hours: agent.stats?.totalHours || 0,
    interventions: agent.stats?.interventions || 0,
    arrests: agent.stats?.arrests || 0,
    reports_written: agent.stats?.reportsWritten || 0,
    notes: agent.notes || null,
  };
}
```

---

## Optimisation des Performances

### Index de Base de Données

```sql
CREATE INDEX idx_agents_agency_id ON public.agents(agency_id);
CREATE INDEX idx_agents_status ON public.agents(status);
CREATE INDEX idx_agents_grade ON public.agents(grade);
CREATE INDEX idx_agents_division ON public.agents(division);
CREATE INDEX idx_agents_date_joined ON public.agents(date_joined DESC);
CREATE INDEX idx_agents_discord_user_id ON public.agents(discord_user_id);
```

**Impact** :
- `idx_agents_agency_id` : Accélère les filtres RLS (critique)
- `idx_agents_status` : Accélère le calcul des stats
- `idx_agents_grade` : Accélère les filtres par grade
- `idx_agents_division` : Accélère les filtres par division
- `idx_agents_date_joined` : Accélère le tri par ancienneté

### Triggers PostgreSQL

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Impact** :
- Met à jour automatiquement `updated_at` sur chaque modification
- Pas besoin de gérer manuellement dans le code

### Optimisation React

#### useMemo pour Filtrage

```typescript
const filteredAgents = useMemo(() => {
  return agents.filter(agent => {
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const matchesSearch =
        agent.firstName.toLowerCase().includes(search) ||
        agent.lastName.toLowerCase().includes(search) ||
        agent.badge.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }
    if (filters.grade !== 'all' && agent.grade !== filters.grade) return false;
    if (filters.status !== 'all' && agent.status !== filters.status) return false;
    if (filters.division !== 'all' && agent.division !== filters.division) return false;
    return true;
  });
}, [agents, filters]);
```

**Impact** :
- Le filtrage ne se recalcule QUE quand `agents` ou `filters` changent
- Évite les recalculs inutiles à chaque render

#### useMemo pour Stats

```typescript
const stats = useMemo(() => ({
  total: agents.length,
  active: agents.filter(a => a.status === 'active').length,
  offDuty: agents.filter(a => a.status === 'off_duty').length,
  training: agents.filter(a => a.status === 'training').length,
}), [agents]);
```

**Impact** :
- Les statistiques ne se recalculent QUE quand `agents` change
- Évite 3 parcours du tableau à chaque render

---

## Sécurité

### 1. Row Level Security (RLS)

**Avantages** :
- Sécurité au niveau de la base de données (impossible de contourner)
- Pas de code de filtrage côté client à maintenir
- Fonctionne même en cas d'accès direct à l'API Supabase

**Limitations** :
- Requiert un JWT valide avec `user_metadata.agencies`
- Performance légèrement réduite (filtre sur chaque requête)

### 2. Contraintes d'Unicité

```sql
CONSTRAINT unique_badge_per_agency UNIQUE (agency_id, badge)
```

**Impact** :
- Un badge ne peut exister qu'une seule fois par agence
- SASP peut avoir un badge #247 ET LSPD peut avoir un badge #247
- Empêche les duplicatas accidentels

### 3. Foreign Keys avec CASCADE

```sql
agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE
```

**Impact** :
- Suppression d'un agent = suppression automatique de son historique
- Garantit l'intégrité référentielle
- Pas d'historique orphelin

---

## Flux de Données Complet

### Scénario : Ajout d'un Nouvel Agent

```
┌─────────────────────────────────────────────────────────┐
│ 1. USER clicks "Ajouter un Agent"                       │
│    → Modal s'ouvre                                       │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 2. USER remplit le formulaire et clique "Créer"         │
│    → handleAddAgent() appelé avec données du formulaire │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Conversion Local → Supabase                          │
│    const supabaseData = localToSupabase(data, 'sasp')   │
│    → snake_case, types compatibles DB                   │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 4. INSERT via Supabase Client                           │
│    await supabase.from('agents').insert(supabaseData)   │
│    → RLS vérifie: agency_id ∈ user.agencies             │
│    → Contrainte: badge unique par agence                │
│    → INSERT réussit                                      │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 5. PostgreSQL déclenche Realtime                        │
│    → Broadcast INSERT event sur canal 'agents:sasp'     │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 6. Tous les clients SASP reçoivent l'événement          │
│    .on('postgres_changes', { event: 'INSERT' })         │
│    → payload.new contient le nouvel agent               │
│    → setAgents([payload.new, ...current])               │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 7. React re-render avec nouvel agent                    │
│    → Conversion Supabase → Local                        │
│    → Apparaît instantanément dans la liste              │
│    → Stats recalculées automatiquement                  │
└─────────────────────────────────────────────────────────┘
```

**Timing** :
- Étapes 1-4 : ~100-300ms
- Étapes 5-7 : ~50-200ms
- **Total : ~150-500ms** de bout en bout

---

## Monitoring et Debugging

### Logs Supabase

Dans la console du navigateur :

```typescript
// Insert
console.log('Agent inserted:', payload.new);

// Update
console.log('Agent updated:', payload.new);

// Delete
console.log('Agent deleted:', payload.old);
```

### Vérifier les Connexions Realtime

Dans le Dashboard Supabase :
1. **Logs** > **Realtime**
2. Voir les connexions actives
3. Voir les messages broadcast

### SQL Debugging

```sql
-- Voir tous les agents
SELECT * FROM agents ORDER BY created_at DESC;

-- Voir les policies actives
SELECT * FROM pg_policies WHERE tablename = 'agents';

-- Voir les index
SELECT * FROM pg_indexes WHERE tablename = 'agents';

-- Vérifier les connexions Realtime
SELECT * FROM pg_stat_activity
WHERE application_name LIKE '%realtime%';
```

---

## Améliorations Futures

### 1. Historique Automatique

Créer un trigger qui enregistre automatiquement les changements :

```sql
CREATE TRIGGER track_agent_changes
  AFTER INSERT OR UPDATE OR DELETE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION log_agent_history();
```

### 2. Recherche Full-Text

Ajouter un index GIN pour recherche avancée :

```sql
CREATE INDEX idx_agents_fulltext ON agents
USING GIN (to_tsvector('english',
  first_name || ' ' || last_name || ' ' || badge
));
```

### 3. Pagination

Pour les grandes agences (>1000 agents) :

```typescript
const { data, count } = await supabase
  .from('agents')
  .select('*', { count: 'exact' })
  .eq('agency_id', agencyId)
  .range(0, 49); // Page 1: agents 0-49
```

### 4. Cache Redis

Pour réduire les requêtes DB :

```typescript
// Pseudo-code
const cachedAgents = await redis.get(`agents:${agencyId}`);
if (cachedAgents) return cachedAgents;

const agents = await fetchFromDB();
await redis.set(`agents:${agencyId}`, agents, 'EX', 60); // 60s TTL
```

---

Créé par Snowzy - OlympusMDT
