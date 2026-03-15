-- Migration: Add Volunteer Verification System
-- This migration adds volunteer verification for campaigns

-- 1. Update campaign_status enum to include new statuses
ALTER TYPE campaign_status ADD VALUE IF NOT EXISTS 'PENDING_VERIFICATION';
ALTER TYPE campaign_status ADD VALUE IF NOT EXISTS 'VERIFIED_BY_VOLUNTEERS';
ALTER TYPE campaign_status ADD VALUE IF NOT EXISTS 'PENDING_ADMIN_APPROVAL';

-- Note: If the enum already has values, you may need to recreate it:
-- DROP TYPE campaign_status CASCADE;
-- CREATE TYPE campaign_status AS ENUM ('DRAFT', 'PENDING_VERIFICATION', 'VERIFIED_BY_VOLUNTEERS', 'PENDING_ADMIN_APPROVAL', 'LIVE', 'COMPLETED', 'CANCELLED');
-- Then update campaigns table to use the new type

-- 2. Create volunteer_verifications table
CREATE TABLE IF NOT EXISTS volunteer_verifications (
    verification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    volunteer_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campaign_id, volunteer_id) -- Prevent duplicate verifications from same volunteer
);

-- Indexes for volunteer_verifications
CREATE INDEX IF NOT EXISTS idx_volunteer_verification_campaign ON volunteer_verifications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_verification_volunteer ON volunteer_verifications(volunteer_id);

-- 3. Add admin_approved_by and admin_approved_at to campaigns table
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS admin_approved_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS admin_approved_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_campaign_admin_approved_by ON campaigns(admin_approved_by);

