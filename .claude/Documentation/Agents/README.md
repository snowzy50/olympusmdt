# Système de Gestion des Agents - OlympusMDT

## 🎯 Vue d'Ensemble

Système complet de gestion des agents de police multi-agences avec synchronisation temps réel via Supabase.

**Créé par Snowzy**
**Branche** : `Agents`
**Date** : 2025-11-01

---

## ✨ Fonctionnalités Principales

### 📊 Dashboard Interactif
- **4 cartes de statistiques** en temps réel
  - Total des agents
  - Agents en service
  - Agents hors service
  - Agents en formation

### 🔍 Système de Filtres Avancés
- Recherche textuelle (nom, prénom, badge)
- Filtre par grade (8 niveaux)
- Filtre par statut (4 statuts)
- Filtre par division (6 divisions)
- Réinitialisation rapide

### 📋 Tableau Complet
- Avatar Discord + Badge
- Nom complet
- Grade avec badge coloré
- Division
- Certifications (tags)
- Statut avec indicateur
- Ancienneté calculée
- Actions rapides

### ➕ Gestion CRUD
- **Ajout** : Modal avec formulaire complet
- **Modification** : À venir
- **Suppression** : À venir
- **Profil détaillé** : Modal avec toutes les infos

### ⚡ Synchronisation Temps Réel
- Multi-onglets : Changements visibles instantanément
- Multi-utilisateurs : Collaboration en temps réel
- WebSocket : Via Supabase Realtime
- Latence : ~150-500ms bout en bout

### 🔒 Sécurité Multi-Tenant
- Isolation complète par agence
- Row Level Security (RLS) automatique
- Impossible de voir/modifier d'autres agences
- Mode Admin pour accès global

---

## 🏗️ Architecture

### Stack Technique

```
┌─────────────────────────────────────────────┐
│              Frontend (Next.js)              │
│  ┌─────────────────────────────────────┐    │
│  │  8 Pages Agents (une par agence)    │    │
│  │  - SASP, LSPD, BCSO, DOJ, etc.      │    │
│  └─────────────────────────────────────┘    │
│                    ↓↑                        │
│  ┌─────────────────────────────────────┐    │
│  │   useSupabaseAgents Hook            │    │
│  │   - CRUD operations                 │    │
│  │   - Realtime subscriptions          │    │
│  └─────────────────────────────────────┘    │
│                    ↓↑                        │
│  ┌─────────────────────────────────────┐    │
│  │   Supabase Client                   │    │
│  │   - Auth                            │    │
│  │   - Database                        │    │
│  │   - Realtime                        │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
                     ↓↑
┌─────────────────────────────────────────────┐
│           Backend (Supabase)                 │
│  ┌─────────────────────────────────────┐    │
│  │   PostgreSQL 15                     │    │
│  │   - Table: agents                   │    │
│  │   - Table: agent_history            │    │
│  │   - RLS Policies (6)                │    │
│  │   - Index (8)                       │    │
│  │   - Triggers (1)                    │    │
│  └─────────────────────────────────────┘    │
│                    ↓↑                        │
│  ┌─────────────────────────────────────┐    │
│  │   Realtime Server                   │    │
│  │   - WebSocket connections           │    │
│  │   - Broadcast INSERT/UPDATE/DELETE  │    │
│  │   - Per-agency channels             │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

### Multi-Tenant Design

```
┌──────────────────────────────────────────────────┐
│                  Table: agents                    │
├──────────────────────────────────────────────────┤
│  agency_id = 'sasp'    │  John Smith   │ #247    │
│  agency_id = 'sasp'    │  Mike Johnson │ #189    │
│  agency_id = 'lspd'    │  Alex Brown   │ #512    │
│  agency_id = 'lspd'    │  Sarah Lee    │ #334    │
│  agency_id = 'bcso'    │  Tom Davis    │ #056    │
└──────────────────────────────────────────────────┘
                      ↓
          RLS Policy Filtering (automatic)
                      ↓
┌──────────────────────────────────────────────────┐
│   User A (agencies: ['sasp'])                     │
│   Voit uniquement:                                │
│   - John Smith (#247)                             │
│   - Mike Johnson (#189)                           │
└──────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────┐
│   User B (agencies: ['lspd', 'bcso'])             │
│   Voit uniquement:                                │
│   - Alex Brown (#512)                             │
│   - Sarah Lee (#334)                              │
│   - Tom Davis (#056)                              │
└──────────────────────────────────────────────────┘
```

---

## 📁 Structure des Fichiers

### Frontend

```
app/dashboard/
├── sasp/agents/page.tsx      ✅ Page SASP
├── lspd/agents/page.tsx      ✅ Page LSPD
├── bcso/agents/page.tsx      ✅ Page BCSO
├── doj/agents/page.tsx       ✅ Page DOJ
├── samc/agents/page.tsx      ✅ Page SAMC
├── safd/agents/page.tsx      ✅ Page SAFD
├── dynasty8/agents/page.tsx  ✅ Page Dynasty8
└── ems/agents/page.tsx       ✅ Page EMS

hooks/
└── useSupabaseAgents.ts      ✅ Hook Realtime principal

lib/supabase/
└── client.ts                 ✅ Client Supabase + types DB

types/
├── agent.ts                  ✅ Types TypeScript locaux
└── agent-adapter.ts          ✅ Conversion local ↔ DB
```

### Backend (SQL)

```
supabase/migrations/
├── full_reset_and_create.sql ✅ Script complet (RECOMMANDÉ)
├── create_agents_table.sql   ✅ Création seule
└── 00_reset_database.sql     ✅ Reset seul
```

### Documentation

```
.claude/Documentation/Agents/
├── README.md                      ✅ Ce fichier
├── GUIDE-INSTALLATION.md          ✅ Guide pas à pas
├── DOCUMENTATION-TECHNIQUE.md     ✅ Détails techniques
└── CHANGELOG.md                   ✅ Historique des versions
```

---

## 🚀 Démarrage Rapide

### Étape 1 : Exécuter le Script SQL

1. Ouvrir **Supabase Dashboard**
2. Aller dans **SQL Editor**
3. Copier `/supabase/migrations/full_reset_and_create.sql`
4. Exécuter (`Cmd/Ctrl + Enter`)
5. Vérifier le message de succès ✓

### Étape 2 : Activer Realtime

1. Aller dans **Database** > **Replication**
2. Activer **Realtime** sur table `agents`
3. Activer **Realtime** sur table `agent_history`

### Étape 3 : Tester l'Application

```bash
npm run dev
```

1. Se connecter à l'application
2. Sélectionner agence **SASP**
3. Naviguer vers **Agents**
4. Voir les 5 agents de test ✓

---

## 📊 Données de Test

Le script SQL insère automatiquement **5 agents SASP** :

| Badge | Nom | Grade | Division | Statut |
|-------|-----|-------|----------|--------|
| #247 | John Smith | Sergeant | Patrol | Active |
| #189 | Michael Johnson | Officer | Traffic | Off Duty |
| #334 | Sarah Williams | Corporal | K9 | Active |
| #056 | David Martinez | Lieutenant | SWAT | Active |
| #512 | Alex Brown | Cadet | Patrol | Training |

---

## 🎨 Configuration

### Grades (8 niveaux)

```typescript
const grades = [
  'cadet',      // Gris    - Ordre: 1
  'officer',    // Bleu    - Ordre: 2
  'corporal',   // Vert    - Ordre: 3
  'sergeant',   // Jaune   - Ordre: 4
  'lieutenant', // Orange  - Ordre: 5
  'captain',    // Rouge   - Ordre: 6
  'commander',  // Violet  - Ordre: 7
  'chief'       // Or      - Ordre: 8
];
```

### Statuts (4 types)

```typescript
const statuts = [
  'active',     // 🟢 Vert    - En service
  'off_duty',   // 🔴 Rouge   - Hors service
  'training',   // 🟡 Jaune   - En formation
  'leave'       // ⚪ Gris    - En congé
];
```

### Divisions (6 types)

```typescript
const divisions = [
  'patrol',         // 🚓 Patrouille
  'traffic',        // 🚦 Circulation
  'k9',             // 🐕 Unité canine
  'swat',           // 🎯 SWAT
  'detectives',     // 🔍 Enquêtes
  'administration'  // 📋 Administration
];
```

### Certifications (9 types)

```typescript
const certifications = [
  'SWAT',       // 🎯 Forces spéciales
  'K9',         // 🐕 Maître-chien
  'FTO',        // 👨‍🏫 Formateur
  'Detective',  // 🔍 Enquêteur
  'Traffic',    // 🚦 Circulation
  'Firearms',   // 🔫 Armes à feu
  'Medic',      // 🏥 Secourisme
  'Negotiator', // 💬 Négociateur
  'Pilot'       // ✈️ Pilote
];
```

---

## 🔐 Sécurité

### Row Level Security (RLS)

Toutes les requêtes sont automatiquement filtrées :

```sql
-- Exemple : User avec agencies = ['sasp', 'doj']

-- SELECT
SELECT * FROM agents;
→ Retourne uniquement: agency_id IN ('sasp', 'doj')

-- INSERT
INSERT INTO agents (agency_id, ...) VALUES ('lspd', ...);
→ ERREUR: Permission denied (pas dans ['sasp', 'doj'])

-- UPDATE
UPDATE agents SET ... WHERE agency_id = 'bcso';
→ ERREUR: Permission denied (pas dans ['sasp', 'doj'])

-- DELETE
DELETE FROM agents WHERE agency_id = 'ems';
→ ERREUR: Permission denied (pas dans ['sasp', 'doj'])
```

### Mode Admin

Users avec `isAdmin: true` dans JWT :
- ✅ Voient TOUS les agents de TOUTES les agences
- ✅ Peuvent créer/modifier/supprimer dans TOUTES les agences
- ⚠️ À utiliser avec précaution

---

## ⚡ Performance

### Optimisations Database

- **8 Index** pour requêtes rapides
- **RLS** avec index sur `agency_id` (critique)
- **Trigger** automatique pour `updated_at`
- **Foreign Keys** avec CASCADE

### Optimisations React

- `useMemo` pour filtrage (recalcul uniquement si nécessaire)
- `useMemo` pour statistiques (évite parcours répétés)
- `useMemo` pour conversion Supabase → Local
- `useCallback` pour fonctions CRUD (évite re-créations)

### Métriques Attendues

- **Chargement initial** : ~300-500ms
- **Ajout agent** : ~150-300ms
- **Synchronisation Realtime** : ~50-200ms
- **Filtrage côté client** : <10ms

---

## 📝 Utilisation

### Ajouter un Agent

```typescript
// Dans le composant
const { addAgent } = useSupabaseAgents('sasp');

const handleAddAgent = async (newAgent) => {
  const supabaseData = localToSupabase(newAgent, 'sasp');
  await addAgent(supabaseData);
};
```

### Modifier un Agent

```typescript
const { updateAgent } = useSupabaseAgents('sasp');

await updateAgent(agentId, {
  grade: 'sergeant',
  status: 'active'
});
```

### Supprimer un Agent

```typescript
const { deleteAgent } = useSupabaseAgents('sasp');

await deleteAgent(agentId);
```

### Recharger Manuellement

```typescript
const { refetch } = useSupabaseAgents('sasp');

await refetch();
```

---

## 🐛 Dépannage

### Agents n'apparaissent pas

**Vérifier** :
1. Script SQL exécuté ? → Voir Table Editor
2. Realtime activé ? → Database > Replication
3. Variables env configurées ? → `.env.local`
4. User a des agences ? → Vérifier JWT `user_metadata.agencies`

### Synchronisation ne fonctionne pas

**Vérifier** :
1. WebSocket connecté ? → Console du navigateur
2. Canal créé ? → `agents:sasp`, `agents:lspd`, etc.
3. Erreurs Realtime ? → Dashboard Supabase > Logs

### Erreur "Permission denied"

**Cause** : RLS empêche l'accès

**Solution** :
1. Vérifier que `agency_id` est dans `user_metadata.agencies`
2. Vérifier que le JWT est valide
3. Mode admin ? Ajouter `isAdmin: true` au JWT

---

## 🎯 Prochaines Étapes

### Court Terme
- [ ] Modal "Modifier Agent"
- [ ] Confirmation suppression
- [ ] Gestion du superviseur (dropdown)
- [ ] Historique automatique

### Moyen Terme
- [ ] Pagination (>100 agents)
- [ ] Recherche full-text avancée
- [ ] Export CSV / PDF
- [ ] Import en masse CSV

### Long Terme
- [ ] Statistiques avancées
- [ ] Graphiques de performance
- [ ] Badges d'excellence
- [ ] Notifications temps réel

---

## 📚 Documentation Complète

| Document | Description |
|----------|-------------|
| **README.md** (ce fichier) | Vue d'ensemble et démarrage rapide |
| **GUIDE-INSTALLATION.md** | Guide pas à pas détaillé |
| **DOCUMENTATION-TECHNIQUE.md** | Architecture et détails techniques |
| **CHANGELOG.md** | Historique des versions |

---

## 🤝 Support

### Fichiers Importants

- **Hook principal** : `/hooks/useSupabaseAgents.ts:20`
- **Types locaux** : `/types/agent.ts:1`
- **Adaptateurs** : `/types/agent-adapter.ts:10`
- **Client Supabase** : `/lib/supabase/client.ts:15`
- **Page SASP** : `/app/dashboard/sasp/agents/page.tsx:133`

### SQL Queries Utiles

```sql
-- Compter agents par agence
SELECT agency_id, COUNT(*)
FROM agents
GROUP BY agency_id;

-- Voir policies RLS
SELECT * FROM pg_policies
WHERE tablename = 'agents';

-- Voir index
SELECT * FROM pg_indexes
WHERE tablename = 'agents';
```

---

## ✅ Checklist de Validation

Avant de merger dans `main` :

- [ ] Script SQL exécuté sans erreur
- [ ] Realtime activé sur tables
- [ ] Variables d'environnement configurées
- [ ] Compilation sans erreur TypeScript
- [ ] Build Next.js réussi
- [ ] Ajout d'agent fonctionne
- [ ] Synchronisation temps réel testée
- [ ] Isolation multi-tenant vérifiée
- [ ] Filtres fonctionnent correctement
- [ ] Modal profil s'ouvre correctement

---

## 📈 Statistiques du Projet

- **Fichiers créés** : 18
- **Lignes de code** : ~3500
- **Lignes de documentation** : ~1200
- **Tables Database** : 2
- **Types ENUM** : 3
- **Policies RLS** : 6
- **Index** : 8
- **Pages UI** : 8

---

## 💻 Commandes Utiles

```bash
# Développement
npm run dev

# Build production
npm run build

# Démarrer production
npm start

# Linter
npm run lint

# Type check
npx tsc --noEmit
```

---

## 🏆 Crédits

**Développé par** : Snowzy
**Projet** : OlympusMDT
**Date** : 2025-11-01
**Branche** : Agents
**Version** : 1.0.0

---

## 📄 Licence

Projet interne OlympusMDT

---

**Prêt à commencer ?** → Consultez le [GUIDE-INSTALLATION.md](./GUIDE-INSTALLATION.md)

**Questions techniques ?** → Consultez la [DOCUMENTATION-TECHNIQUE.md](./DOCUMENTATION-TECHNIQUE.md)

**Voir l'historique ?** → Consultez le [CHANGELOG.md](./CHANGELOG.md)

---

Créé par Snowzy avec ❤️ pour OlympusMDT
