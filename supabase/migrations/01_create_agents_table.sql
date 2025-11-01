-- Migration: Création de la table agents pour OlympusMDT
-- Créé par Snowzy
-- Description: Table pour gérer les agents de chaque agence avec isolation par agency_id

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

-- Créer la table agents
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identification
  agency_id TEXT NOT NULL, -- sasp, samc, safd, dynasty8, doj
  discord_username TEXT NOT NULL,
  discord_user_id TEXT,
  discord_avatar TEXT,
  badge TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,

  -- Grade et affectation
  grade agent_grade NOT NULL DEFAULT 'cadet',
  division agent_division NOT NULL DEFAULT 'patrol',
  certifications TEXT[] DEFAULT '{}', -- Array de certifications (SWAT, K9, FTO, etc.)
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

-- Index pour optimiser les requêtes
CREATE INDEX idx_agents_agency_id ON public.agents(agency_id);
CREATE INDEX idx_agents_status ON public.agents(status);
CREATE INDEX idx_agents_grade ON public.agents(grade);
CREATE INDEX idx_agents_division ON public.agents(division);
CREATE INDEX idx_agents_date_joined ON public.agents(date_joined DESC);
CREATE INDEX idx_agents_discord_user_id ON public.agents(discord_user_id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Table pour l'historique des agents
CREATE TABLE IF NOT EXISTS public.agent_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'promotion', 'demotion', 'certification', 'action', 'note'
  description TEXT NOT NULL,
  performed_by UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_agent_history_agent_id ON public.agent_history(agent_id);
CREATE INDEX idx_agent_history_created_at ON public.agent_history(created_at DESC);

-- ===================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===================================

-- Activer RLS sur la table agents
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

-- Policy pour agent_history (même logique)
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
-- DONNÉES DE TEST
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

-- Commentaire sur la table
COMMENT ON TABLE public.agents IS 'Table des agents par agence avec isolation RLS';
COMMENT ON TABLE public.agent_history IS 'Historique des actions et changements des agents';
