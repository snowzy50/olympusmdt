-- Migration: Livret Penal - Table des infractions
-- Description: Base de donnees des infractions avec categories et amendes

-- Table infractions
CREATE TABLE IF NOT EXISTS infractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('contravention', 'delit_mineur', 'delit_majeur', 'crime')),
  name TEXT NOT NULL,
  description TEXT,
  base_fine INTEGER, -- Montant de base en dollars (peut etre null si formule speciale)
  fine_formula TEXT, -- Formule pour calculs speciaux (ex: "x quantite", "25% somme", "6$ par 1$ blanchi")
  gav_duration INTEGER, -- Duree GAV en minutes
  notes TEXT, -- Notes additionnelles (ex: "Retrait permis", "Saisie armes")
  penalties TEXT[], -- Array des peines possibles
  requires_prosecutor BOOLEAN DEFAULT false, -- Necessite procureur
  requires_tribunal BOOLEAN DEFAULT false, -- Necessite tribunal
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour recherche et filtres
CREATE INDEX IF NOT EXISTS idx_infractions_category ON infractions(category);
CREATE INDEX IF NOT EXISTS idx_infractions_is_active ON infractions(is_active);
CREATE INDEX IF NOT EXISTS idx_infractions_base_fine ON infractions(base_fine);

-- Index GIN pour recherche full-text sur le nom
CREATE INDEX IF NOT EXISTS idx_infractions_name_search ON infractions USING GIN (to_tsvector('french', name));

-- Trigger pour updated_at automatique
CREATE OR REPLACE FUNCTION update_infractions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_infractions_updated_at ON infractions;
CREATE TRIGGER trigger_infractions_updated_at
  BEFORE UPDATE ON infractions
  FOR EACH ROW
  EXECUTE FUNCTION update_infractions_updated_at();

-- Activer Realtime
ALTER TABLE infractions REPLICA IDENTITY FULL;

-- RLS Policies
ALTER TABLE infractions ENABLE ROW LEVEL SECURITY;

-- Politique de lecture: tout le monde peut lire
CREATE POLICY "infractions_select_policy" ON infractions
  FOR SELECT USING (true);

-- Politique d'insertion: authentifie seulement
CREATE POLICY "infractions_insert_policy" ON infractions
  FOR INSERT WITH CHECK (true);

-- Politique de mise a jour: authentifie seulement
CREATE POLICY "infractions_update_policy" ON infractions
  FOR UPDATE USING (true);

-- Politique de suppression: authentifie seulement
CREATE POLICY "infractions_delete_policy" ON infractions
  FOR DELETE USING (true);

-- Ajouter a la publication realtime si elle existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE infractions;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- Commentaires
COMMENT ON TABLE infractions IS 'Livret penal - Base des infractions';
COMMENT ON COLUMN infractions.category IS 'Categorie: contravention, delit_mineur, delit_majeur, crime';
COMMENT ON COLUMN infractions.base_fine IS 'Montant de base en dollars';
COMMENT ON COLUMN infractions.fine_formula IS 'Formule si calcul special (ex: x quantite)';
COMMENT ON COLUMN infractions.gav_duration IS 'Duree GAV en minutes';
COMMENT ON COLUMN infractions.penalties IS 'Liste des peines applicables';
