-- =====================================================
-- SCRIPT COMBINE: DEFCON + INFRACTIONS + WEAPONS
-- Execute ce script dans Supabase Studio > SQL Editor
-- Cree par: Snowzy
-- =====================================================

-- =====================================================
-- PARTIE 1: TABLE DEFCON_STATUS
-- =====================================================

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

DROP POLICY IF EXISTS "defcon_status_select_policy" ON defcon_status;
CREATE POLICY "defcon_status_select_policy" ON defcon_status
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "defcon_status_insert_policy" ON defcon_status;
CREATE POLICY "defcon_status_insert_policy" ON defcon_status
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "defcon_status_update_policy" ON defcon_status;
CREATE POLICY "defcon_status_update_policy" ON defcon_status
  FOR UPDATE USING (true);

-- Ajouter a la publication realtime
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

-- =====================================================
-- PARTIE 2: TABLE INFRACTIONS (Livret Penal)
-- =====================================================

-- Table infractions
CREATE TABLE IF NOT EXISTS infractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('contravention', 'delit_mineur', 'delit_majeur', 'crime')),
  name TEXT NOT NULL,
  description TEXT,
  base_fine INTEGER,
  fine_formula TEXT,
  gav_duration INTEGER,
  notes TEXT,
  penalties TEXT[],
  requires_prosecutor BOOLEAN DEFAULT false,
  requires_tribunal BOOLEAN DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour recherche et filtres
CREATE INDEX IF NOT EXISTS idx_infractions_category ON infractions(category);
CREATE INDEX IF NOT EXISTS idx_infractions_is_active ON infractions(is_active);
CREATE INDEX IF NOT EXISTS idx_infractions_base_fine ON infractions(base_fine);

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

DROP POLICY IF EXISTS "infractions_select_policy" ON infractions;
CREATE POLICY "infractions_select_policy" ON infractions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "infractions_insert_policy" ON infractions;
CREATE POLICY "infractions_insert_policy" ON infractions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "infractions_update_policy" ON infractions;
CREATE POLICY "infractions_update_policy" ON infractions
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "infractions_delete_policy" ON infractions;
CREATE POLICY "infractions_delete_policy" ON infractions
  FOR DELETE USING (true);

-- Ajouter a la publication realtime
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

-- =====================================================
-- PARTIE 3: TABLE WEAPONS_REGISTRY (Gun Control)
-- =====================================================

-- Table weapons_registry
CREATE TABLE IF NOT EXISTS weapons_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('A', 'B', 'C', 'D')),
  name TEXT NOT NULL,
  description TEXT,
  free_possession BOOLEAN DEFAULT false,
  carry_prohibited BOOLEAN DEFAULT false,
  possession_prohibited BOOLEAN DEFAULT false,
  requires_permit BOOLEAN DEFAULT false,
  requires_declaration BOOLEAN DEFAULT false,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour recherche et filtres
CREATE INDEX IF NOT EXISTS idx_weapons_registry_category ON weapons_registry(category);
CREATE INDEX IF NOT EXISTS idx_weapons_registry_is_active ON weapons_registry(is_active);
CREATE INDEX IF NOT EXISTS idx_weapons_registry_requires_permit ON weapons_registry(requires_permit);

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

DROP POLICY IF EXISTS "weapons_registry_select_policy" ON weapons_registry;
CREATE POLICY "weapons_registry_select_policy" ON weapons_registry
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "weapons_registry_insert_policy" ON weapons_registry;
CREATE POLICY "weapons_registry_insert_policy" ON weapons_registry
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "weapons_registry_update_policy" ON weapons_registry;
CREATE POLICY "weapons_registry_update_policy" ON weapons_registry
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "weapons_registry_delete_policy" ON weapons_registry;
CREATE POLICY "weapons_registry_delete_policy" ON weapons_registry
  FOR DELETE USING (true);

-- Ajouter a la publication realtime
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

-- =====================================================
-- PARTIE 4: MODIFICATIONS TABLES EXISTANTES (SI ELLES EXISTENT)
-- =====================================================

-- Ajouter la colonne infraction_id a la table fines (si la table existe)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fines') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'fines' AND column_name = 'infraction_id'
    ) THEN
      ALTER TABLE fines ADD COLUMN infraction_id UUID REFERENCES infractions(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Ajouter la colonne defcon_multiplier a la table fines (si la table existe)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fines') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'fines' AND column_name = 'defcon_multiplier'
    ) THEN
      ALTER TABLE fines ADD COLUMN defcon_multiplier DECIMAL(3,2) DEFAULT 1.0;
    END IF;
  END IF;
END $$;

-- Ajouter la colonne weapon_id a la table seizures (si la table existe)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'seizures') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'seizures' AND column_name = 'weapon_id'
    ) THEN
      ALTER TABLE seizures ADD COLUMN weapon_id UUID REFERENCES weapons_registry(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Ajouter la colonne weapon_category a la table seizures (si la table existe)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'seizures') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'seizures' AND column_name = 'weapon_category'
    ) THEN
      ALTER TABLE seizures ADD COLUMN weapon_category TEXT CHECK (weapon_category IN ('A', 'B', 'C', 'D'));
    END IF;
  END IF;
END $$;

-- Index pour les nouvelles colonnes (si les tables existent)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fines') THEN
    CREATE INDEX IF NOT EXISTS idx_fines_infraction_id ON fines(infraction_id);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'seizures') THEN
    CREATE INDEX IF NOT EXISTS idx_seizures_weapon_id ON seizures(weapon_id);
    CREATE INDEX IF NOT EXISTS idx_seizures_weapon_category ON seizures(weapon_category);
  END IF;
END $$;

-- =====================================================
-- PARTIE 5: INSERER UN DEFCON PAR DEFAUT (Niveau 5)
-- =====================================================

INSERT INTO defcon_status (agency_id, level, description, activated_by, is_active)
SELECT 'sasp', 5, 'Niveau normal - Aucune menace', 'Systeme', true
WHERE NOT EXISTS (SELECT 1 FROM defcon_status WHERE agency_id = 'sasp' AND is_active = true);

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================

SELECT 'Migration terminee avec succes!' as status;
