-- Activer Realtime sur les tables organizations
-- Créé par: Snowzy
-- Fix: Le Realtime nécessite que les tables soient publiées dans supabase_realtime

-- Activer la réplication Realtime sur les tables
ALTER PUBLICATION supabase_realtime ADD TABLE organizations;
ALTER PUBLICATION supabase_realtime ADD TABLE organization_members;
ALTER PUBLICATION supabase_realtime ADD TABLE organization_relations;
ALTER PUBLICATION supabase_realtime ADD TABLE territories;
ALTER PUBLICATION supabase_realtime ADD TABLE territory_pois;

-- Vérifier que les tables sont bien publiées
-- (Pour debug: SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';)
