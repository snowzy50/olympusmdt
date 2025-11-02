-- Migration: Créer la table agencies si elle n'existe pas
-- Créé par: Snowzy
-- Date: 2025-11-01

-- Vérifier et créer la table agencies si elle n'existe pas
CREATE TABLE IF NOT EXISTS agencies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insérer les agences par défaut si la table est vide
INSERT INTO agencies (id, name, code, description, color) VALUES
  ('sasp', 'San Andreas State Police', 'SASP', 'Police d''État de San Andreas', '#3b82f6'),
  ('samc', 'San Andreas Medical Center', 'SAMC', 'Centre Médical de San Andreas', '#ef4444'),
  ('safd', 'San Andreas Fire Department', 'SAFD', 'Pompiers de San Andreas', '#f59e0b'),
  ('dynasty8', 'Dynasty 8', 'D8', 'Agence immobilière', '#10b981'),
  ('doj', 'Department of Justice', 'DOJ', 'Département de la Justice', '#8b5cf6')
ON CONFLICT (id) DO NOTHING;

-- Index
CREATE INDEX IF NOT EXISTS idx_agencies_code ON agencies(code);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_agencies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agencies_updated_at
  BEFORE UPDATE ON agencies
  FOR EACH ROW
  EXECUTE FUNCTION update_agencies_updated_at();

-- Commentaires
COMMENT ON TABLE agencies IS 'Table des agences du système OlympusMDT';
