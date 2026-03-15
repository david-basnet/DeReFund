-- Migration: Update Workflow Requirements
-- Changes:
-- 1. Update campaign status enum to include new statuses
-- 2. Change volunteer verification requirement from 20 to 1
-- 3. Add file storage support for documents and images
-- 4. Make case_id required for campaigns

-- 1. Update campaign_status enum (if not already done)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'campaign_status' AND 
                   EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'PENDING_VERIFICATION' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'campaign_status'))) THEN
        ALTER TYPE campaign_status ADD VALUE IF NOT EXISTS 'PENDING_VERIFICATION';
        ALTER TYPE campaign_status ADD VALUE IF NOT EXISTS 'VERIFIED_BY_VOLUNTEERS';
        ALTER TYPE campaign_status ADD VALUE IF NOT EXISTS 'PENDING_ADMIN_APPROVAL';
    END IF;
END $$;

-- 2. Add file storage columns to user_verification (for document uploads)
ALTER TABLE user_verification 
ADD COLUMN IF NOT EXISTS document_file BYTEA,
ADD COLUMN IF NOT EXISTS document_filename VARCHAR(255),
ADD COLUMN IF NOT EXISTS document_mimetype VARCHAR(100);

-- 3. Add file storage columns to disaster_cases (for image uploads)
ALTER TABLE disaster_cases 
ADD COLUMN IF NOT EXISTS image_files BYTEA[],
ADD COLUMN IF NOT EXISTS image_filenames VARCHAR(255)[],
ADD COLUMN IF NOT EXISTS image_mimetypes VARCHAR(100)[];

-- 4. Make case_id NOT NULL for campaigns (campaigns must have a disaster)
-- First, set any NULL case_ids to a default or handle them
-- Note: This might fail if there are existing campaigns without case_id
-- You may need to handle existing data first
-- ALTER TABLE campaigns ALTER COLUMN case_id SET NOT NULL;

-- 5. Add admin_approved_by and admin_approved_at if not exists
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS admin_approved_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS admin_approved_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_campaign_admin_approved_by ON campaigns(admin_approved_by);

-- 6. Ensure volunteer_verifications table exists
CREATE TABLE IF NOT EXISTS volunteer_verifications (
    verification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    volunteer_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campaign_id, volunteer_id)
);

CREATE INDEX IF NOT EXISTS idx_volunteer_verification_campaign ON volunteer_verifications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_verification_volunteer ON volunteer_verifications(volunteer_id);

