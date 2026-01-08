-- ===================================
-- WIPE TOTAL DE LA BASE DE DONNÉES
-- ===================================
-- ATTENTION: Cette commande efface TOUT (tables, types, fonctions, RLS)
-- Pour repartir de zéro à 100%
-- Créé par Snowzy

-- 1. Supprimer le schéma public et le recréer (Méthode radicale et propre)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- 2. Rétablir les permissions par défaut
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;

-- 3. Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Base de données totalement effacée. Vous pouvez maintenant exécuter master_mdt_schema.sql';
END $$;
