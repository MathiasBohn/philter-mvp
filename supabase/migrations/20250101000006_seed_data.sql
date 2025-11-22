-- =====================================================================================
-- Migration: Seed Data
-- Description: Populates database with initial buildings and templates for testing
-- Version: 1.0
-- Date: 2025-01-22
-- =====================================================================================

-- =====================================================================================
-- SECTION 1: SEED BUILDINGS
-- =====================================================================================

-- Building 1: The Dakota (Iconic NYC Co-op)
INSERT INTO buildings (id, name, address, building_type, policies, created_at, updated_at)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'The Dakota',
    '{
        "street": "1 West 72nd Street",
        "city": "New York",
        "state": "NY",
        "zip": "10023",
        "neighborhood": "Upper West Side"
    }'::jsonb,
    'COOP',
    '{
        "petsAllowed": true,
        "maxPets": 2,
        "petRestrictions": "Dogs under 50 lbs",
        "smokingAllowed": false,
        "sublettingAllowed": false,
        "renovationPolicy": "Board approval required for all renovations",
        "boardPackageFee": 500,
        "minimumDownPayment": 20,
        "financingAllowed": true,
        "pieds-a-terre": "Not permitted",
        "parentsPurchasing": "Not permitted",
        "guarantorsAllowed": true
    }'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Building 2: 15 Central Park West (Luxury Condo)
INSERT INTO buildings (id, name, address, building_type, policies, created_at, updated_at)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    '15 Central Park West',
    '{
        "street": "15 Central Park West",
        "city": "New York",
        "state": "NY",
        "zip": "10023",
        "neighborhood": "Upper West Side"
    }'::jsonb,
    'CONDO',
    '{
        "petsAllowed": true,
        "maxPets": 3,
        "petRestrictions": "No breed restrictions",
        "smokingAllowed": false,
        "sublettingAllowed": true,
        "sublettingRestrictions": "Minimum 6-month lease, maximum 2 years per 5-year period",
        "renovationPolicy": "Notice required, no structural changes",
        "boardPackageFee": 750,
        "minimumDownPayment": 10,
        "financingAllowed": true,
        "pieds-a-terre": "Permitted",
        "parentsPurchasing": "Permitted",
        "guarantorsAllowed": true
    }'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Building 3: Stuyvesant Town (Rental Complex)
INSERT INTO buildings (id, name, address, building_type, policies, created_at, updated_at)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    'Stuyvesant Town',
    '{
        "street": "300 First Avenue",
        "city": "New York",
        "state": "NY",
        "zip": "10009",
        "neighborhood": "East Village"
    }'::jsonb,
    'RENTAL',
    '{
        "petsAllowed": true,
        "maxPets": 2,
        "petRestrictions": "Dogs under 50 lbs, no aggressive breeds",
        "smokingAllowed": false,
        "sublettingAllowed": true,
        "sublettingRestrictions": "Landlord approval required",
        "renovationPolicy": "Minor modifications allowed with approval",
        "applicationFee": 100,
        "minimumIncome": "40x monthly rent",
        "creditScoreMinimum": 650,
        "guarantorsAllowed": true
    }'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Building 4: 432 Park Avenue (Ultra-Luxury Condo)
INSERT INTO buildings (id, name, address, building_type, policies, created_at, updated_at)
VALUES (
    '44444444-4444-4444-4444-444444444444',
    '432 Park Avenue',
    '{
        "street": "432 Park Avenue",
        "city": "New York",
        "state": "NY",
        "zip": "10022",
        "neighborhood": "Midtown East"
    }'::jsonb,
    'CONDO',
    '{
        "petsAllowed": true,
        "maxPets": 2,
        "petRestrictions": "Service animals always permitted",
        "smokingAllowed": false,
        "sublettingAllowed": true,
        "sublettingRestrictions": "Minimum 6-month lease",
        "renovationPolicy": "Architect approval required",
        "boardPackageFee": 1000,
        "minimumDownPayment": 10,
        "financingAllowed": true,
        "pieds-a-terre": "Permitted",
        "parentsPurchasing": "Permitted",
        "guarantorsAllowed": true
    }'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Building 5: 740 Park Avenue (Exclusive Co-op)
INSERT INTO buildings (id, name, address, building_type, policies, created_at, updated_at)
VALUES (
    '55555555-5555-5555-5555-555555555555',
    '740 Park Avenue',
    '{
        "street": "740 Park Avenue",
        "city": "New York",
        "state": "NY",
        "zip": "10021",
        "neighborhood": "Upper East Side"
    }'::jsonb,
    'COOP',
    '{
        "petsAllowed": true,
        "maxPets": 1,
        "petRestrictions": "Small dogs and cats only",
        "smokingAllowed": false,
        "sublettingAllowed": false,
        "renovationPolicy": "Extensive board review required",
        "boardPackageFee": 2500,
        "minimumDownPayment": 50,
        "financingAllowed": false,
        "pieds-a-terre": "Not permitted",
        "parentsPurchasing": "Not permitted",
        "guarantorsAllowed": false,
        "interviewRequired": true
    }'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================================================
-- SECTION 2: SEED TEMPLATES
-- =====================================================================================

-- Template 1: Standard Co-op Purchase Template (The Dakota)
INSERT INTO templates (id, building_id, name, is_published, sections, required_documents, custom_disclosures, created_at, updated_at)
VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'Dakota Standard Co-op Purchase',
    true,
    '{
        "profile": {"required": true, "order": 1},
        "parties": {"required": true, "order": 2},
        "people": {"required": true, "order": 3},
        "income": {"required": true, "order": 4},
        "financials": {"required": true, "order": 5},
        "realEstate": {"required": true, "order": 6},
        "leaseTerms": {"required": false, "order": 7},
        "buildingPolicies": {"required": true, "order": 8},
        "documents": {"required": true, "order": 9},
        "disclosures": {"required": true, "order": 10},
        "coverLetter": {"required": true, "order": 11},
        "review": {"required": true, "order": 12}
    }'::jsonb,
    '{
        "GOVERNMENT_ID": {"required": true, "minCount": 1},
        "BANK_STATEMENT": {"required": true, "minCount": 3, "note": "Last 3 months"},
        "TAX_RETURN": {"required": true, "minCount": 2, "note": "Last 2 years"},
        "PAY_STUB": {"required": true, "minCount": 2, "note": "Last 2 pay stubs"},
        "EMPLOYMENT_LETTER": {"required": true, "minCount": 1},
        "REFERENCE_LETTER": {"required": true, "minCount": 2}
    }'::jsonb,
    '{
        "boardInterview": {
            "title": "Board Interview Acknowledgment",
            "content": "I understand that The Dakota requires an in-person board interview and agree to attend if requested.",
            "required": true
        },
        "financialReview": {
            "title": "Financial Review Acknowledgment",
            "content": "I authorize The Dakota Board to conduct a thorough financial review including credit check and verification of all submitted information.",
            "required": true
        }
    }'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Template 2: Luxury Condo Purchase Template (15 CPW)
INSERT INTO templates (id, building_id, name, is_published, sections, required_documents, custom_disclosures, created_at, updated_at)
VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222',
    '15 CPW Condo Purchase',
    true,
    '{
        "profile": {"required": true, "order": 1},
        "parties": {"required": true, "order": 2},
        "people": {"required": true, "order": 3},
        "income": {"required": true, "order": 4},
        "financials": {"required": true, "order": 5},
        "realEstate": {"required": false, "order": 6},
        "leaseTerms": {"required": false, "order": 7},
        "buildingPolicies": {"required": true, "order": 8},
        "documents": {"required": true, "order": 9},
        "disclosures": {"required": true, "order": 10},
        "coverLetter": {"required": false, "order": 11},
        "review": {"required": true, "order": 12}
    }'::jsonb,
    '{
        "GOVERNMENT_ID": {"required": true, "minCount": 1},
        "BANK_STATEMENT": {"required": true, "minCount": 2, "note": "Last 2 months"},
        "TAX_RETURN": {"required": true, "minCount": 2, "note": "Last 2 years"},
        "EMPLOYMENT_LETTER": {"required": false, "minCount": 0},
        "REFERENCE_LETTER": {"required": false, "minCount": 0}
    }'::jsonb,
    '{
        "condoRules": {
            "title": "Condo Rules Acknowledgment",
            "content": "I have reviewed and agree to comply with all building rules and regulations.",
            "required": true
        }
    }'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Template 3: Co-op Sublet Template (The Dakota)
INSERT INTO templates (id, building_id, name, is_published, sections, required_documents, custom_disclosures, created_at, updated_at)
VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '11111111-1111-1111-1111-111111111111',
    'Dakota Co-op Sublet',
    false,
    '{
        "profile": {"required": true, "order": 1},
        "parties": {"required": false, "order": 2},
        "people": {"required": true, "order": 3},
        "income": {"required": true, "order": 4},
        "financials": {"required": true, "order": 5},
        "realEstate": {"required": false, "order": 6},
        "leaseTerms": {"required": true, "order": 7},
        "buildingPolicies": {"required": true, "order": 8},
        "documents": {"required": true, "order": 9},
        "disclosures": {"required": true, "order": 10},
        "coverLetter": {"required": true, "order": 11},
        "review": {"required": true, "order": 12}
    }'::jsonb,
    '{
        "GOVERNMENT_ID": {"required": true, "minCount": 1},
        "BANK_STATEMENT": {"required": true, "minCount": 2, "note": "Last 2 months"},
        "EMPLOYMENT_LETTER": {"required": true, "minCount": 1},
        "REFERENCE_LETTER": {"required": true, "minCount": 2}
    }'::jsonb,
    '{
        "sublettingTerms": {
            "title": "Subletting Terms Acknowledgment",
            "content": "I understand that subletting is not permitted at The Dakota without express written permission from the Board, which is granted at their sole discretion.",
            "required": true
        },
        "ownerResponsibility": {
            "title": "Owner Responsibility",
            "content": "I understand that the shareholder/owner remains fully responsible for all lease obligations and building compliance.",
            "required": true
        }
    }'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Template 4: Condo Lease Template (15 CPW)
INSERT INTO templates (id, building_id, name, is_published, sections, required_documents, custom_disclosures, created_at, updated_at)
VALUES (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '22222222-2222-2222-2222-222222222222',
    '15 CPW Condo Lease',
    true,
    '{
        "profile": {"required": true, "order": 1},
        "parties": {"required": false, "order": 2},
        "people": {"required": true, "order": 3},
        "income": {"required": true, "order": 4},
        "financials": {"required": true, "order": 5},
        "realEstate": {"required": false, "order": 6},
        "leaseTerms": {"required": true, "order": 7},
        "buildingPolicies": {"required": true, "order": 8},
        "documents": {"required": true, "order": 9},
        "disclosures": {"required": true, "order": 10},
        "coverLetter": {"required": false, "order": 11},
        "review": {"required": true, "order": 12}
    }'::jsonb,
    '{
        "GOVERNMENT_ID": {"required": true, "minCount": 1},
        "BANK_STATEMENT": {"required": true, "minCount": 2, "note": "Last 2 months"},
        "PAY_STUB": {"required": true, "minCount": 2, "note": "Last 2 pay stubs"},
        "EMPLOYMENT_LETTER": {"required": true, "minCount": 1}
    }'::jsonb,
    '{
        "leaseTerms": {
            "title": "Lease Terms Acknowledgment",
            "content": "I have reviewed the lease terms and agree to all conditions, including rent amount, lease duration, and renewal terms.",
            "required": true
        },
        "buildingAccess": {
            "title": "Building Access and Amenities",
            "content": "I understand the building access policies and amenity usage rules.",
            "required": true
        }
    }'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Template 5: Ultra-Exclusive Co-op Purchase (740 Park)
INSERT INTO templates (id, building_id, name, is_published, sections, required_documents, custom_disclosures, created_at, updated_at)
VALUES (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    '55555555-5555-5555-5555-555555555555',
    '740 Park Avenue Exclusive Purchase',
    true,
    '{
        "profile": {"required": true, "order": 1},
        "parties": {"required": true, "order": 2},
        "people": {"required": true, "order": 3},
        "income": {"required": true, "order": 4},
        "financials": {"required": true, "order": 5},
        "realEstate": {"required": true, "order": 6},
        "leaseTerms": {"required": false, "order": 7},
        "buildingPolicies": {"required": true, "order": 8},
        "documents": {"required": true, "order": 9},
        "disclosures": {"required": true, "order": 10},
        "coverLetter": {"required": true, "order": 11},
        "review": {"required": true, "order": 12}
    }'::jsonb,
    '{
        "GOVERNMENT_ID": {"required": true, "minCount": 1},
        "BANK_STATEMENT": {"required": true, "minCount": 6, "note": "Last 6 months"},
        "TAX_RETURN": {"required": true, "minCount": 3, "note": "Last 3 years"},
        "PAY_STUB": {"required": true, "minCount": 3, "note": "Last 3 pay stubs"},
        "EMPLOYMENT_LETTER": {"required": true, "minCount": 1},
        "REFERENCE_LETTER": {"required": true, "minCount": 3, "note": "Professional and personal references"},
        "OTHER_FINANCIAL": {"required": true, "minCount": 1, "note": "Investment portfolio statements"}
    }'::jsonb,
    '{
        "financialRequirements": {
            "title": "Financial Requirements",
            "content": "I understand that 740 Park Avenue requires minimum 50% down payment, no financing, and liquid assets of at least 3x the purchase price.",
            "required": true
        },
        "boardInterview": {
            "title": "Board Interview Requirement",
            "content": "I acknowledge that a rigorous board interview is required and that all applicants and co-applicants must attend.",
            "required": true
        },
        "exclusivity": {
            "title": "Building Exclusivity",
            "content": "I understand that 740 Park Avenue maintains the highest standards for residency and that approval is at the sole discretion of the Board.",
            "required": true
        }
    }'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================================================
-- VERIFICATION
-- =====================================================================================

-- Verify buildings were inserted
DO $$
DECLARE
    building_count integer;
    template_count integer;
BEGIN
    SELECT COUNT(*) INTO building_count FROM buildings;
    SELECT COUNT(*) INTO template_count FROM templates;

    RAISE NOTICE '✅ Seed data inserted successfully!';
    RAISE NOTICE 'Buildings: %', building_count;
    RAISE NOTICE 'Templates: %', template_count;
END $$;

-- Show buildings
SELECT
    name,
    building_type,
    address->>'neighborhood' as neighborhood
FROM buildings
ORDER BY name;

-- Show templates
SELECT
    t.name as template_name,
    b.name as building_name,
    t.is_published,
    jsonb_object_keys(t.sections) as sections_count
FROM templates t
JOIN buildings b ON t.building_id = b.id
ORDER BY t.name;
