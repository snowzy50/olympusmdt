-- Migration: Créer la table agents si elle n'existe pas
-- Créé par: Snowzy
-- Date: 2025-11-01

-- Vérifier et créer la table agents si elle n'existe pas
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  discord_id TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  agency_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  badge_number TEXT,
  rank TEXT,
  division TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ,
  CONSTRAINT fk_agency FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE
);

-- Index
CREATE INDEX IF NOT EXISTS idx_agents_discord_id ON agents(discord_id);
CREATE INDEX IF NOT EXISTS idx_agents_agency_id ON agents(agency_id);
CREATE INDEX IF NOT EXISTS idx_agents_role ON agents(role);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_agents_updated_at();

-- Commentaires
COMMENT ON TABLE agents IS 'Table des agents du système OlympusMDT';
