-- Add building code field to buildings table
-- This allows users to enter a 6-character code to identify buildings

-- Step 1: Add code column (nullable first)
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS code TEXT;

-- Step 2: Update existing buildings with codes
UPDATE buildings SET code = 'DAKOTA' WHERE id = '11111111-1111-1111-1111-111111111111';
UPDATE buildings SET code = 'CPW015' WHERE id = '22222222-2222-2222-2222-222222222222';
UPDATE buildings SET code = 'STUYTN' WHERE id = '33333333-3333-3333-3333-333333333333';
UPDATE buildings SET code = 'PARK43' WHERE id = '44444444-4444-4444-4444-444444444444';
UPDATE buildings SET code = 'PARK74' WHERE id = '55555555-5555-5555-5555-555555555555';

-- Step 3: Add constraints after data is populated
ALTER TABLE buildings ALTER COLUMN code SET NOT NULL;
ALTER TABLE buildings ADD CONSTRAINT buildings_code_unique UNIQUE (code);

-- Step 4: Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_buildings_code ON buildings(code);
