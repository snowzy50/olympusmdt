-- ===================================
-- RESET COMPLET DE LA BASE DE DONNÉES
-- ===================================
-- ATTENTION: Ce script supprime TOUTES les données existantes
-- À utiliser uniquement pour un reset complet
-- Créé par Snowzy

-- Désactiver temporairement les triggers et contraintes
SET session_replication_role = 'replica';

-- Supprimer toutes les policies RLS existantes
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

-- Supprimer tous les types ENUM personnalisés
DROP TYPE IF EXISTS agent_grade CASCADE;
DROP TYPE IF EXISTS agent_status CASCADE;
DROP TYPE IF EXISTS agent_division CASCADE;

-- Supprimer toutes les fonctions personnalisées
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Réactiver les contraintes
SET session_replication_role = 'origin';

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Base de données nettoyée avec succès. Prêt pour la recréation.';
END $$;
