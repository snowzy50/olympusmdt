# Guide d'Installation - Système de Gestion des Agents

## Vue d'ensemble

Ce guide explique comment installer et configurer le système de gestion des agents avec Supabase Realtime pour OlympusMDT.

Créé par Snowzy

---

## Prérequis

- Compte Supabase actif
- Accès au Dashboard Supabase de votre projet
- Variables d'environnement configurées :
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Étape 1 : Configuration de la Base de Données

### 1.1 Accéder au SQL Editor

1. Ouvrez votre Dashboard Supabase
2. Naviguez vers **SQL Editor** dans le menu latéral
3. Cliquez sur **New Query**

### 1.2 Exécuter le Script de Migration

1. Ouvrez le fichier `/supabase/migrations/full_reset_and_create.sql`
2. Copiez tout le contenu du fichier
3. Collez-le dans le SQL Editor
4. Cliquez sur **Run** ou appuyez sur `Cmd/Ctrl + Enter`

### 1.3 Vérifier le Résultat

Vous devriez voir un message de succès similaire à :

```
========================================
✓✓✓ BASE DE DONNÉES CRÉÉE AVEC SUCCÈS
========================================
Tables créées:
  - public.agents (avec 5 agents de test SASP)
  - public.agent_history

RLS activé avec policies par agence
Index et triggers créés

Prêt à utiliser !
```

---

## Étape 2 : Vérification des Tables

### 2.1 Vérifier la Table `agents`

1. Naviguez vers **Table Editor** dans Supabase
2. Vous devriez voir deux nouvelles tables :
   - `agents`
   - `agent_history`

### 2.2 Vérifier les Données de Test

1. Cliquez sur la table `agents`
2. Vous devriez voir **5 agents de test SASP** :
   - John Smith (Sergeant)
   - Michael Johnson (Officer)
   - Sarah Williams (Corporal)
   - David Martinez (Lieutenant)
   - Alex Brown (Cadet)

---

## Étape 3 : Configuration du Realtime

### 3.1 Activer Realtime sur les Tables

1. Dans le Dashboard Supabase, allez dans **Database** > **Replication**
2. Trouvez la table `agents`
3. Activez **Realtime** pour cette table
4. Répétez pour la table `agent_history`

### 3.2 Vérifier les Canaux Realtime

Les canaux suivants seront créés automatiquement par l'application :
- `agents:sasp`
- `agents:doj`
- `agents:samc`
- `agents:safd`
- `agents:dynasty8`
- `agents:bcso`
- `agents:lspd`
- `agents:ems`

---

## Étape 4 : Test de l'Application

### 4.1 Démarrer le Serveur de Développement

```bash
npm run dev
```

### 4.2 Accéder à la Page Agents

1. Connectez-vous à l'application
2. Sélectionnez l'agence **SASP**
3. Naviguez vers **Agents** dans le menu
4. Route : `/dashboard/sasp/agents`

### 4.3 Vérifier les Fonctionnalités

- [ ] **Affichage** : Les 5 agents de test doivent apparaître
- [ ] **Statistiques** : Les cartes de stats doivent afficher les bons chiffres
- [ ] **Filtres** : Testez la recherche, les filtres par grade, statut, division
- [ ] **Ajout** : Cliquez sur "Ajouter un Agent" et créez un nouvel agent
- [ ] **Realtime** : Ouvrez deux onglets, ajoutez un agent dans l'un, il doit apparaître dans l'autre instantanément

---

## Étape 5 : Test Multi-Agences

### 5.1 Tester l'Isolation des Données

1. Créez un agent dans **SASP**
2. Changez d'agence vers **LSPD**
3. L'agent SASP ne doit **PAS** apparaître dans LSPD
4. Créez un agent dans LSPD
5. Retournez à SASP
6. L'agent LSPD ne doit **PAS** apparaître dans SASP

### 5.2 Vérifier les Permissions RLS

Les Row Level Security (RLS) policies garantissent :
- Les utilisateurs ne voient QUE les agents de leurs agences
- Les admins (`isAdmin: true`) voient TOUS les agents
- Impossible d'accéder aux données d'autres agences via l'API

---

## Structure de la Base de Données

### Table `agents`

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique (auto-généré) |
| agency_id | TEXT | Identifiant de l'agence (sasp, lspd, etc.) |
| discord_username | TEXT | Nom d'utilisateur Discord |
| discord_user_id | TEXT | ID Discord (optionnel) |
| discord_avatar | TEXT | URL avatar Discord (optionnel) |
| badge | TEXT | Numéro de badge (unique par agence) |
| first_name | TEXT | Prénom |
| last_name | TEXT | Nom |
| grade | ENUM | Grade (cadet → chief) |
| division | ENUM | Division (patrol, traffic, k9, swat, etc.) |
| certifications | TEXT[] | Tableau des certifications |
| status | ENUM | Statut (active, off_duty, training, leave) |
| supervisor_id | UUID | ID du superviseur (optionnel) |
| phone | TEXT | Téléphone (optionnel) |
| radio | TEXT | Radio (optionnel) |
| date_joined | TIMESTAMPTZ | Date d'entrée |
| created_at | TIMESTAMPTZ | Date de création |
| updated_at | TIMESTAMPTZ | Date de mise à jour (auto) |
| total_hours | INTEGER | Heures totales |
| interventions | INTEGER | Nombre d'interventions |
| arrests | INTEGER | Nombre d'arrestations |
| reports_written | INTEGER | Rapports écrits |
| notes | TEXT | Notes (optionnel) |

### Table `agent_history`

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique |
| agent_id | UUID | Référence vers l'agent |
| type | TEXT | Type d'événement |
| description | TEXT | Description |
| performed_by | UUID | Qui a effectué l'action |
| created_at | TIMESTAMPTZ | Date de création |
| metadata | JSONB | Métadonnées supplémentaires |

---

## Types ENUM

### `agent_grade`
- cadet
- officer
- corporal
- sergeant
- lieutenant
- captain
- commander
- chief

### `agent_status`
- active
- off_duty
- training
- leave

### `agent_division`
- patrol
- traffic
- k9
- swat
- detectives
- administration

---

## Dépannage

### Erreur : "relation agents does not exist"

**Solution** : Vous n'avez pas exécuté le script SQL. Retournez à l'Étape 1.

### Erreur : "permission denied for table agents"

**Solution** : Les RLS policies ne sont pas correctement configurées. Vérifiez que le script a été exécuté complètement.

### Les agents n'apparaissent pas en temps réel

**Solution** :
1. Vérifiez que Realtime est activé sur la table `agents` dans Supabase
2. Vérifiez la console du navigateur pour des erreurs de connexion WebSocket
3. Vérifiez que `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont correctes

### Les agents d'autres agences apparaissent

**Solution** : Les RLS policies ne fonctionnent pas correctement. Vérifiez :
1. Que votre JWT contient bien le champ `user_metadata.agencies`
2. Que le `agency_id` dans la table correspond bien à ceux dans `user_metadata.agencies`

---

## Scripts Utiles

### Réinitialiser Complètement la Base

```sql
-- Exécuter dans SQL Editor
\i supabase/migrations/full_reset_and_create.sql
```

### Vérifier les Policies RLS

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('agents', 'agent_history');
```

### Compter les Agents par Agence

```sql
SELECT
  agency_id,
  COUNT(*) as total_agents,
  COUNT(*) FILTER (WHERE status = 'active') as active,
  COUNT(*) FILTER (WHERE status = 'off_duty') as off_duty
FROM agents
GROUP BY agency_id
ORDER BY agency_id;
```

---

## Support

Pour toute question ou problème, consultez :
- Documentation technique : `/Users/snowzy/olympusmdt/.claude/Documentation/Agents/`
- Code source : `/Users/snowzy/olympusmdt/app/dashboard/*/agents/`
- Hooks : `/Users/snowzy/olympusmdt/hooks/useSupabaseAgents.ts`

---

Créé par Snowzy - OlympusMDT
