-- ===================================
-- SCRIPT COMPLET : RESET + CRÉATION
-- ===================================
-- Ce script combine le reset et la création de la base de données
-- À exécuter dans le SQL Editor de Supabase Dashboard
-- Créé par Snowzy

-- ===================================
-- PARTIE 1: NETTOYAGE
-- ===================================

-- Désactiver temporairement les triggers et contraintes
SET session_replication_role = 'replica';

-- Supprimer toutes les tables existantes
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

-- Supprimer tous les types ENUM personnalisés
DROP TYPE IF EXISTS agent_grade CASCADE;
DROP TYPE IF EXISTS agent_status CASCADE;
DROP TYPE IF EXISTS agent_division CASCADE;

-- Supprimer toutes les fonctions personnalisées
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Réactiver les contraintes
SET session_replication_role = 'origin';

-- ===================================
-- PARTIE 2: CRÉATION DES TYPES ENUM
-- ===================================

-- Créer le type ENUM pour les grades
CREATE TYPE agent_grade AS ENUM (
  'cadet',
  'officer',
  'corporal',
  'sergeant',
  'lieutenant',
  'captain',
  'commander',
  'chief'
);

-- Créer le type ENUM pour les statuts
CREATE TYPE agent_status AS ENUM (
  'active',
  'off_duty',
  'training',
  'leave'
);

-- Créer le type ENUM pour les divisions
CREATE TYPE agent_division AS ENUM (
  'patrol',
  'traffic',
  'k9',
  'swat',
  'detectives',
  'administration'
);

-- ===================================
-- PARTIE 3: CRÉATION DES TABLES
-- ===================================

-- Créer la table agents
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identification
  agency_id TEXT NOT NULL,
  discord_username TEXT NOT NULL,
  discord_user_id TEXT,
  discord_avatar TEXT,
  badge TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,

  -- Grade et affectation
  grade agent_grade NOT NULL DEFAULT 'cadet',
  division agent_division NOT NULL DEFAULT 'patrol',
  certifications TEXT[] DEFAULT '{}',
  status agent_status NOT NULL DEFAULT 'off_duty',

  -- Hiérarchie
  supervisor_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,

  -- Contact
  phone TEXT,
  radio TEXT,

  -- Dates
  date_joined TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Statistiques
  total_hours INTEGER DEFAULT 0,
  interventions INTEGER DEFAULT 0,
  arrests INTEGER DEFAULT 0,
  reports_written INTEGER DEFAULT 0,

  -- Notes administratives
  notes TEXT,

  -- Constraints
  CONSTRAINT unique_badge_per_agency UNIQUE (agency_id, badge),
  CONSTRAINT unique_discord_per_agency UNIQUE (agency_id, discord_username)
);

-- Table pour l'historique des agents
CREATE TABLE public.agent_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  performed_by UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ===================================
-- PARTIE 4: CRÉATION DES INDEX
-- ===================================

CREATE INDEX idx_agents_agency_id ON public.agents(agency_id);
CREATE INDEX idx_agents_status ON public.agents(status);
CREATE INDEX idx_agents_grade ON public.agents(grade);
CREATE INDEX idx_agents_division ON public.agents(division);
CREATE INDEX idx_agents_date_joined ON public.agents(date_joined DESC);
CREATE INDEX idx_agents_discord_user_id ON public.agents(discord_user_id);
CREATE INDEX idx_agent_history_agent_id ON public.agent_history(agent_id);
CREATE INDEX idx_agent_history_created_at ON public.agent_history(created_at DESC);

-- ===================================
-- PARTIE 5: FONCTIONS ET TRIGGERS
-- ===================================

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

-- ===================================
-- PARTIE 6: ROW LEVEL SECURITY (RLS)
-- ===================================

-- Activer RLS
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_history ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs peuvent voir les agents de leurs agences
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

-- Policy: Les utilisateurs peuvent insérer des agents dans leurs agences
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

-- Policy: Les utilisateurs peuvent mettre à jour les agents de leurs agences
CREATE POLICY "Users can update agents in their agencies"
  ON public.agents
  FOR UPDATE
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

-- Policy: Les utilisateurs peuvent supprimer les agents de leurs agences
CREATE POLICY "Users can delete agents in their agencies"
  ON public.agents
  FOR DELETE
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

-- Policy pour agent_history
CREATE POLICY "Users can view agent history from their agencies"
  ON public.agent_history
  FOR SELECT
  USING (
    agent_id IN (
      SELECT id FROM public.agents
      WHERE agency_id = ANY(
        SELECT unnest(
          COALESCE(
            (auth.jwt() -> 'user_metadata' ->> 'agencies')::text[],
            '{}'::text[]
          )
        )
      )
    )
    OR
    (auth.jwt() -> 'user_metadata' ->> 'isAdmin')::boolean = true
  );

CREATE POLICY "Users can insert agent history in their agencies"
  ON public.agent_history
  FOR INSERT
  WITH CHECK (
    agent_id IN (
      SELECT id FROM public.agents
      WHERE agency_id = ANY(
        SELECT unnest(
          COALESCE(
            (auth.jwt() -> 'user_metadata' ->> 'agencies')::text[],
            '{}'::text[]
          )
        )
      )
    )
    OR
    (auth.jwt() -> 'user_metadata' ->> 'isAdmin')::boolean = true
  );

-- ===================================
-- PARTIE 7: DONNÉES DE TEST
-- ===================================

-- Insérer quelques agents de test pour SASP
INSERT INTO public.agents (
  agency_id,
  discord_username,
  discord_user_id,
  badge,
  first_name,
  last_name,
  grade,
  division,
  certifications,
  status,
  total_hours,
  interventions,
  arrests,
  reports_written
) VALUES
  ('sasp', 'Snowzy', '190549997098500096', '#247', 'John', 'Smith', 'sergeant', 'patrol', ARRAY['FTO', 'Firearms'], 'active', 245, 89, 34, 67),
  ('sasp', 'Officer_Mike', NULL, '#189', 'Michael', 'Johnson', 'officer', 'traffic', ARRAY['Traffic'], 'off_duty', 156, 45, 12, 38),
  ('sasp', 'K9_Handler_Sarah', NULL, '#334', 'Sarah', 'Williams', 'corporal', 'k9', ARRAY['K9', 'FTO'], 'active', 412, 156, 67, 124),
  ('sasp', 'SWAT_Leader', NULL, '#056', 'David', 'Martinez', 'lieutenant', 'swat', ARRAY['SWAT', 'Firearms', 'Negotiator'], 'active', 678, 234, 98, 189),
  ('sasp', 'Cadet_Alex', NULL, '#512', 'Alex', 'Brown', 'cadet', 'patrol', ARRAY[]::text[], 'training', 23, 5, 1, 8);

-- ===================================
-- COMMENTAIRES
-- ===================================

COMMENT ON TABLE public.agents IS 'Table des agents par agence avec isolation RLS';
COMMENT ON TABLE public.agent_history IS 'Historique des actions et changements des agents';

-- ===================================
-- FIN DU SCRIPT
-- ===================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✓✓✓ BASE DE DONNÉES CRÉÉE AVEC SUCCÈS';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables créées:';
    RAISE NOTICE '  - public.agents (avec 5 agents de test SASP)';
    RAISE NOTICE '  - public.agent_history';
    RAISE NOTICE '';
    RAISE NOTICE 'RLS activé avec policies par agence';
    RAISE NOTICE 'Index et triggers créés';
    RAISE NOTICE '';
    RAISE NOTICE 'Prêt à utiliser !';
END $$;
