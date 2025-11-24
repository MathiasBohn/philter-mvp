-- Seed Buildings via Direct SQL
-- This bypasses the Supabase API schema cache issue

-- Insert sample buildings
INSERT INTO buildings (name, building_type, address, policies) VALUES
(
  'The Dakota',
  'COOP',
  '{"street": "1 West 72nd Street", "city": "New York", "state": "NY", "zip": "10023"}',
  '{"pets_allowed": true, "smoking_allowed": false, "subletting_allowed": false, "min_down_payment": 0.50}'
),
(
  '15 Central Park West',
  'CONDO',
  '{"street": "15 Central Park West", "city": "New York", "state": "NY", "zip": "10023"}',
  '{"pets_allowed": true, "smoking_allowed": false, "subletting_allowed": true, "min_down_payment": 0.10}'
),
(
  'Stuyvesant Town',
  'RENTAL',
  '{"street": "First Avenue", "city": "New York", "state": "NY", "zip": "10009"}',
  '{"pets_allowed": true, "smoking_allowed": false, "subletting_allowed": true}'
),
(
  '432 Park Avenue',
  'CONDO',
  '{"street": "432 Park Avenue", "city": "New York", "state": "NY", "zip": "10022"}',
  '{"pets_allowed": false, "smoking_allowed": false, "subletting_allowed": true, "min_down_payment": 0.20}'
),
(
  '740 Park Avenue',
  'COOP',
  '{"street": "740 Park Avenue", "city": "New York", "state": "NY", "zip": "10021"}',
  '{"pets_allowed": false, "smoking_allowed": false, "subletting_allowed": false, "min_down_payment": 1.0}'
)
ON CONFLICT DO NOTHING;

-- Verify insertion
SELECT
  id,
  name,
  building_type,
  address->>'street' as street,
  address->>'city' as city,
  created_at
FROM buildings
ORDER BY name;
