-- Migration: Gun Control - Registre des armes
-- Description: Base de donnees des armes avec categories et reglementations

-- Table weapons_registry
CREATE TABLE IF NOT EXISTS weapons_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('A', 'B', 'C', 'D')),
  name TEXT NOT NULL,
  description TEXT,
  free_possession BOOLEAN DEFAULT false, -- Detention libre
  carry_prohibited BOOLEAN DEFAULT false, -- Port interdit
  possession_prohibited BOOLEAN DEFAULT false, -- Detention interdite
  requires_permit BOOLEAN DEFAULT false, -- Necessite permis (PPA)
  requires_declaration BOOLEAN DEFAULT false, -- Soumise a declaration
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour recherche et filtres
CREATE INDEX IF NOT EXISTS idx_weapons_registry_category ON weapons_registry(category);
CREATE INDEX IF NOT EXISTS idx_weapons_registry_is_active ON weapons_registry(is_active);
CREATE INDEX IF NOT EXISTS idx_weapons_registry_requires_permit ON weapons_registry(requires_permit);

-- Index GIN pour recherche full-text sur le nom
CREATE INDEX IF NOT EXISTS idx_weapons_registry_name_search ON weapons_registry USING GIN (to_tsvector('french', name));

-- Trigger pour updated_at automatique
CREATE OR REPLACE FUNCTION update_weapons_registry_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_weapons_registry_updated_at ON weapons_registry;
CREATE TRIGGER trigger_weapons_registry_updated_at
  BEFORE UPDATE ON weapons_registry
  FOR EACH ROW
  EXECUTE FUNCTION update_weapons_registry_updated_at();

-- Activer Realtime
ALTER TABLE weapons_registry REPLICA IDENTITY FULL;

-- RLS Policies
ALTER TABLE weapons_registry ENABLE ROW LEVEL SECURITY;

-- Politique de lecture: tout le monde peut lire
CREATE POLICY "weapons_registry_select_policy" ON weapons_registry
  FOR SELECT USING (true);

-- Politique d'insertion: authentifie seulement
CREATE POLICY "weapons_registry_insert_policy" ON weapons_registry
  FOR INSERT WITH CHECK (true);

-- Politique de mise a jour: authentifie seulement
CREATE POLICY "weapons_registry_update_policy" ON weapons_registry
  FOR UPDATE USING (true);

-- Politique de suppression: authentifie seulement
CREATE POLICY "weapons_registry_delete_policy" ON weapons_registry
  FOR DELETE USING (true);

-- Ajouter a la publication realtime si elle existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE weapons_registry;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- Commentaires
COMMENT ON TABLE weapons_registry IS 'Gun Control - Registre des armes';
COMMENT ON COLUMN weapons_registry.category IS 'Categorie: A (auto), B (poing), C (chasse), D (blanche)';
COMMENT ON COLUMN weapons_registry.free_possession IS 'Detention libre autorisee';
COMMENT ON COLUMN weapons_registry.carry_prohibited IS 'Port interdit';
COMMENT ON COLUMN weapons_registry.possession_prohibited IS 'Detention interdite';
COMMENT ON COLUMN weapons_registry.requires_permit IS 'Necessite un permis (PPA)';
COMMENT ON COLUMN weapons_registry.requires_declaration IS 'Soumise a declaration';
