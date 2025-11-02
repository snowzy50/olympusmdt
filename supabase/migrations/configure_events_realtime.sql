-- Migration: Configuration Realtime complète pour la table events
-- Créé par: Snowzy
-- Date: 2025-11-02
-- Description: Configure REPLICA IDENTITY FULL pour recevoir toutes les colonnes lors des DELETE

-- Configurer REPLICA IDENTITY FULL pour la table events
-- Cela permet à Realtime de recevoir toutes les colonnes lors d'un DELETE
-- Par défaut, PostgreSQL n'envoie que la clé primaire
ALTER TABLE events REPLICA IDENTITY FULL;

-- S'assurer que la table est bien dans la publication Realtime
-- (normalement déjà fait mais on vérifie)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE events;
  END IF;
END $$;

-- Commentaire
COMMENT ON TABLE events IS 'Table de gestion des événements avec support Realtime (REPLICA IDENTITY FULL)';
