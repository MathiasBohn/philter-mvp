-- Fix buildings table RLS policy to allow authenticated users to read buildings
-- This is required for the application creation form to look up buildings by code

DROP POLICY IF EXISTS "anyone_view_buildings" ON buildings;
DROP POLICY IF EXISTS "authenticated_select_buildings" ON buildings;

CREATE POLICY "authenticated_select_buildings" ON buildings
FOR SELECT TO authenticated USING (true);
