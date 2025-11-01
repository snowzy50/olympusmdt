-- Migration: Création de la table events avec support Realtime
-- Créé par: Snowzy
-- Date: 2025-11-01
-- Description: Architecture complète pour la gestion des événements avec synchronisation temps réel

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

-- Commentaires pour documentation
COMMENT ON TABLE events IS 'Table de gestion des événements avec support Realtime';
COMMENT ON COLUMN events.id IS 'Identifiant unique au format EVE-YYYY-NNN';
COMMENT ON COLUMN events.participants IS 'Liste des participants au format JSON [{id, name, role}]';
COMMENT ON COLUMN events.resources IS 'Ressources nécessaires au format JSON [{type, name, quantity}]';
COMMENT ON COLUMN events.recurrence IS 'Configuration de récurrence au format JSON {type, interval, end_date}';
COMMENT ON COLUMN events.reminder IS 'Configuration des rappels au format JSON {enabled, time_before}';
