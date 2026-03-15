# Database Migration Commands

Run these SQL commands in your Neon SQL Editor to update the database schema for the new workflow requirements.

## Migration Script

```sql
-- ============================================
-- Update Workflow Requirements Migration
-- ============================================

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

-- 4. Add admin_approved_by and admin_approved_at if not exists
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS admin_approved_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS admin_approved_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_campaign_admin_approved_by ON campaigns(admin_approved_by);

-- 5. Ensure volunteer_verifications table exists
CREATE TABLE IF NOT EXISTS volunteer_verifications (
    verification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    volunteer_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campaign_id, volunteer_id)
);

CREATE INDEX IF NOT EXISTS idx_volunteer_verification_campaign ON volunteer_verifications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_verification_volunteer ON volunteer_verifications(volunteer_id);

-- Note: Making case_id NOT NULL is commented out to avoid breaking existing data
-- If you want to enforce this, first update all NULL case_ids, then run:
-- ALTER TABLE campaigns ALTER COLUMN case_id SET NOT NULL;
```

## Verification

After running the migration, verify the changes:

```sql
-- Check if new columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_verification' 
AND column_name IN ('document_file', 'document_filename', 'document_mimetype');

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'disaster_cases' 
AND column_name IN ('image_files', 'image_filenames', 'image_mimetypes');

-- Check campaign status enum values
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'campaign_status');

-- Check volunteer_verifications table
SELECT * FROM volunteer_verifications LIMIT 1;
```

## Important Notes

1. **File Storage**: Files are stored as BYTEA in the database. For production, consider using cloud storage (S3, Cloudinary) and storing URLs instead.

2. **Case ID Requirement**: The migration doesn't make `case_id` NOT NULL to avoid breaking existing campaigns. You may want to update existing campaigns first, then enforce the constraint.

3. **Volunteer Verification**: Changed from requiring 20 verifications to 1 verification. This is handled in the backend code (`volunteerVerificationController.js`).

4. **NGO Verification**: NGOs must be approved before creating campaigns. This is enforced in the backend (`campaignController.js`).

