-- Migration: Liens entre tables existantes et nouvelles tables
-- Description: Ajouter les references aux infractions et armes dans fines et seizures

-- Ajouter la colonne infraction_id a la table fines
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fines' AND column_name = 'infraction_id'
  ) THEN
    ALTER TABLE fines ADD COLUMN infraction_id UUID REFERENCES infractions(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Ajouter la colonne defcon_multiplier a la table fines
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fines' AND column_name = 'defcon_multiplier'
  ) THEN
    ALTER TABLE fines ADD COLUMN defcon_multiplier DECIMAL(3,2) DEFAULT 1.0;
  END IF;
END $$;

-- Ajouter la colonne weapon_id a la table seizures
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seizures' AND column_name = 'weapon_id'
  ) THEN
    ALTER TABLE seizures ADD COLUMN weapon_id UUID REFERENCES weapons_registry(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Ajouter la colonne weapon_category a la table seizures (pour reference rapide)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seizures' AND column_name = 'weapon_category'
  ) THEN
    ALTER TABLE seizures ADD COLUMN weapon_category TEXT CHECK (weapon_category IN ('A', 'B', 'C', 'D'));
  END IF;
END $$;

-- Index pour les nouvelles colonnes
CREATE INDEX IF NOT EXISTS idx_fines_infraction_id ON fines(infraction_id);
CREATE INDEX IF NOT EXISTS idx_seizures_weapon_id ON seizures(weapon_id);
CREATE INDEX IF NOT EXISTS idx_seizures_weapon_category ON seizures(weapon_category);

-- Commentaires
COMMENT ON COLUMN fines.infraction_id IS 'Reference a l''infraction du livret penal';
COMMENT ON COLUMN fines.defcon_multiplier IS 'Multiplicateur DEFCON applique a l''amende';
COMMENT ON COLUMN seizures.weapon_id IS 'Reference a l''arme dans le registre';
COMMENT ON COLUMN seizures.weapon_category IS 'Categorie de l''arme (A, B, C, D)';
