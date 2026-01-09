-- =====================================================
-- DONNER LES PERMISSIONS COMPLETES
-- Execute ce script dans Supabase Studio
-- =====================================================

-- Donner les droits INSERT au role anon et authenticated
GRANT INSERT ON infractions TO anon;
GRANT INSERT ON infractions TO authenticated;
GRANT SELECT ON infractions TO anon;
GRANT SELECT ON infractions TO authenticated;
GRANT UPDATE ON infractions TO anon;
GRANT UPDATE ON infractions TO authenticated;
GRANT DELETE ON infractions TO anon;
GRANT DELETE ON infractions TO authenticated;

GRANT INSERT ON weapons_registry TO anon;
GRANT INSERT ON weapons_registry TO authenticated;
GRANT SELECT ON weapons_registry TO anon;
GRANT SELECT ON weapons_registry TO authenticated;
GRANT UPDATE ON weapons_registry TO anon;
GRANT UPDATE ON weapons_registry TO authenticated;
GRANT DELETE ON weapons_registry TO anon;
GRANT DELETE ON weapons_registry TO authenticated;

GRANT INSERT ON defcon_status TO anon;
GRANT INSERT ON defcon_status TO authenticated;
GRANT SELECT ON defcon_status TO anon;
GRANT SELECT ON defcon_status TO authenticated;
GRANT UPDATE ON defcon_status TO anon;
GRANT UPDATE ON defcon_status TO authenticated;

SELECT 'Permissions accordees avec succes!' as status;
