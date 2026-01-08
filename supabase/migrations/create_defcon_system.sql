-- Migration: Systeme DEFCON
-- Description: Table pour gerer les niveaux d'alerte DEFCON par agence

-- Table defcon_status
CREATE TABLE IF NOT EXISTS defcon_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
  description TEXT,
  duration_hours INTEGER,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  activated_by TEXT NOT NULL,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_defcon_status_agency_id ON defcon_status(agency_id);
CREATE INDEX IF NOT EXISTS idx_defcon_status_is_active ON defcon_status(is_active);
CREATE INDEX IF NOT EXISTS idx_defcon_status_level ON defcon_status(level);
CREATE INDEX IF NOT EXISTS idx_defcon_status_started_at ON defcon_status(started_at DESC);

-- Trigger pour updated_at automatique
CREATE OR REPLACE FUNCTION update_defcon_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_defcon_status_updated_at ON defcon_status;
CREATE TRIGGER trigger_defcon_status_updated_at
  BEFORE UPDATE ON defcon_status
  FOR EACH ROW
  EXECUTE FUNCTION update_defcon_status_updated_at();

-- Activer Realtime
ALTER TABLE defcon_status REPLICA IDENTITY FULL;

-- RLS Policies
ALTER TABLE defcon_status ENABLE ROW LEVEL SECURITY;

-- Politique de lecture: tout le monde peut lire
CREATE POLICY "defcon_status_select_policy" ON defcon_status
  FOR SELECT USING (true);

-- Politique d'insertion: authentifie seulement
CREATE POLICY "defcon_status_insert_policy" ON defcon_status
  FOR INSERT WITH CHECK (true);

-- Politique de mise a jour: authentifie seulement
CREATE POLICY "defcon_status_update_policy" ON defcon_status
  FOR UPDATE USING (true);

-- Ajouter a la publication realtime si elle existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE defcon_status;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- Commentaires
COMMENT ON TABLE defcon_status IS 'Niveaux d''alerte DEFCON par agence';
COMMENT ON COLUMN defcon_status.level IS 'Niveau DEFCON (1=guerre, 5=normal)';
COMMENT ON COLUMN defcon_status.agency_id IS 'ID de l''agence (sasp, samc, etc.)';
COMMENT ON COLUMN defcon_status.activated_by IS 'Nom de la personne qui a active le niveau';
COMMENT ON COLUMN defcon_status.is_active IS 'Si ce niveau est actuellement actif';
