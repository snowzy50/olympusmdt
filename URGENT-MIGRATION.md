# 🚨 URGENT - Migrations SQL à exécuter

## Pourquoi l'interface n'a pas changé ?

La nouvelle interface utilise **Supabase** au lieu de **localStorage**, mais la table `events` n'existe pas encore dans votre base de données !

---

## ✅ Solution : Exécuter les migrations SQL (5 minutes)

### Étape 1 : Ouvrir Supabase Dashboard

1. Aller sur : https://supabase.com/dashboard
2. Se connecter
3. Sélectionner le projet : **gyhjbbrlrcrstbklsxwh**
4. Cliquer sur **SQL Editor** dans le menu latéral

### Étape 2 : Créer la table events

**Copier-coller ce SQL et cliquer sur "Run" :**

```sql
-- Création de la table events
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('patrouille', 'formation', 'réunion', 'opération', 'maintenance', 'tribunal', 'personnel', 'autre')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  agency_id TEXT NOT NULL,
  location TEXT,
  participants JSONB DEFAULT '[]'::jsonb,
  resources JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  recurrence JSONB,
  color TEXT,
  reminder JSONB,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  all_day BOOLEAN DEFAULT false,
  CONSTRAINT fk_agency FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_events_agency_id ON events(agency_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_end_date ON events(end_date);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_date_range ON events(start_date, end_date);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Activer Realtime pour la table events
ALTER PUBLICATION supabase_realtime ADD TABLE events;
```

✅ **Vous devriez voir :** "Success. No rows returned"

### Étape 3 : Configurer RLS (Sécurité)

**Copier-coller ce SQL et cliquer sur "Run" :**

```sql
-- Activer RLS sur la table events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Politique SELECT: Les utilisateurs peuvent voir les événements de leur agence
CREATE POLICY "Users can view events from their agency"
  ON events
  FOR SELECT
  USING (
    agency_id IN (
      SELECT agency_id
      FROM agents
      WHERE discord_id = auth.jwt() ->> 'sub'
    )
  );

-- Politique INSERT: Les utilisateurs peuvent créer des événements pour leur agence
CREATE POLICY "Users can create events for their agency"
  ON events
  FOR INSERT
  WITH CHECK (
    agency_id IN (
      SELECT agency_id
      FROM agents
      WHERE discord_id = auth.jwt() ->> 'sub'
    )
  );

-- Politique UPDATE: Les utilisateurs peuvent modifier les événements de leur agence
CREATE POLICY "Users can update events from their agency"
  ON events
  FOR UPDATE
  USING (
    agency_id IN (
      SELECT agency_id
      FROM agents
      WHERE discord_id = auth.jwt() ->> 'sub'
    )
  )
  WITH CHECK (
    agency_id IN (
      SELECT agency_id
      FROM agents
      WHERE discord_id = auth.jwt() ->> 'sub'
    )
  );

-- Politique DELETE: Les utilisateurs peuvent supprimer les événements de leur agence
CREATE POLICY "Users can delete events from their agency"
  ON events
  FOR DELETE
  USING (
    agency_id IN (
      SELECT agency_id
      FROM agents
      WHERE discord_id = auth.jwt() ->> 'sub'
    )
  );

-- Politique spéciale pour les administrateurs (accès à toutes les agences)
CREATE POLICY "Admins can view all events"
  ON events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM agents
      WHERE discord_id = auth.jwt() ->> 'sub'
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all events"
  ON events
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM agents
      WHERE discord_id = auth.jwt() ->> 'sub'
      AND role = 'admin'
    )
  );
```

✅ **Vous devriez voir :** "Success. No rows returned"

### Étape 4 : Rafraîchir l'application

```bash
# Dans votre terminal
npm run dev
```

Puis **rafraîchir la page** dans le navigateur (F5 ou Cmd+R)

---

## 🎉 Résultat attendu

Après ces 3 étapes, vous verrez :

✨ **Interface COMPLÈTEMENT NOUVELLE :**
- Design moderne avec glassmorphism
- Calendrier interactif avec animations
- Cartes d'événements élégantes
- Modal moderne pour les détails
- Formulaire stylé
- Indicateur de connexion Realtime (vert)
- Statistiques en temps réel
- Filtres et recherche avancés

---

## ❓ En cas de problème

### Erreur "relation events does not exist"
→ L'étape 2 n'a pas été exécutée correctement

### Erreur "new row violates row-level security policy"
→ L'étape 3 n'a pas été exécutée correctement

### La page ne change toujours pas
→ Vider le cache du navigateur (Ctrl+Shift+Del)
→ Redémarrer le serveur `npm run dev`

---

## 📞 Besoin d'aide ?

Les fichiers SQL complets sont aussi disponibles dans :
- `/supabase/migrations/create_events_table.sql`
- `/supabase/migrations/create_events_rls.sql`

**Temps estimé : 5 minutes maximum** ⏱️
