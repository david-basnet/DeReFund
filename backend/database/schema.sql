-- DeReFund Database Schema (Updated)
-- Run this in Neon SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TYPE user_role AS ENUM ('DONOR', 'NGO', 'ADMIN');

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT true,
    wallet_address VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_is_active ON users(is_active);

-- ============================================
-- 2. USER_VERIFICATION TABLE
-- ============================================
CREATE TYPE verification_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE document_type AS ENUM ('REGISTRATION', 'LICENSE', 'CERTIFICATE', 'OTHER');

CREATE TABLE user_verification (
    verification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    document_type document_type NOT NULL,
    document_url TEXT NOT NULL,
    status verification_status DEFAULT 'PENDING',
    verified_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for user_verification
CREATE INDEX idx_verification_user_id ON user_verification(user_id);
CREATE INDEX idx_verification_status ON user_verification(status);
CREATE INDEX idx_verification_verified_by ON user_verification(verified_by);

-- ============================================
-- 3. DISASTER_CASES TABLE
-- ============================================
CREATE TYPE disaster_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE disaster_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE disaster_cases (
    case_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submitted_by UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(150) NOT NULL,
    longitude DECIMAL(10, 8),
    latitude DECIMAL(10, 8),
    images TEXT[], -- Array of image URLs
    video TEXT, -- Video URL
    status disaster_status DEFAULT 'PENDING',
    severity disaster_severity NOT NULL DEFAULT 'MEDIUM',
    reviewed_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for disaster_cases
CREATE INDEX idx_disaster_submitted_by ON disaster_cases(submitted_by);
CREATE INDEX idx_disaster_status ON disaster_cases(status);
CREATE INDEX idx_disaster_severity ON disaster_cases(severity);
CREATE INDEX idx_disaster_reviewed_by ON disaster_cases(reviewed_by);
CREATE INDEX idx_disaster_created_at ON disaster_cases(created_at DESC);
CREATE INDEX idx_disaster_location ON disaster_cases(latitude, longitude);

-- ============================================
-- 4. DISASTER_APPROVALS TABLE (Optional - for multi-authority approvals)
-- ============================================
CREATE TABLE disaster_approvals (
    approval_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES disaster_cases(case_id) ON DELETE CASCADE,
    approved_by UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(case_id, approved_by) -- Prevent duplicate approvals from same admin
);

-- Indexes for disaster_approvals
CREATE INDEX idx_approval_case_id ON disaster_approvals(case_id);
CREATE INDEX idx_approval_approved_by ON disaster_approvals(approved_by);

-- ============================================
-- 5. CAMPAIGNS TABLE
-- ============================================
CREATE TYPE campaign_status AS ENUM ('DRAFT', 'LIVE', 'COMPLETED', 'CANCELLED');

CREATE TABLE campaigns (
    campaign_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ngo_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    case_id UUID REFERENCES disaster_cases(case_id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    target_amount NUMERIC(18, 2) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(18, 2) DEFAULT 0 CHECK (current_amount >= 0),
    contract_address VARCHAR(100),
    status campaign_status DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for campaigns
CREATE INDEX idx_campaign_ngo_id ON campaigns(ngo_id);
CREATE INDEX idx_campaign_case_id ON campaigns(case_id);
CREATE INDEX idx_campaign_status ON campaigns(status);
CREATE INDEX idx_campaign_contract_address ON campaigns(contract_address);
CREATE INDEX idx_campaign_created_at ON campaigns(created_at DESC);

-- ============================================
-- 6. MILESTONES TABLE
-- ============================================
CREATE TYPE milestone_status AS ENUM ('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED');

CREATE TABLE milestones (
    milestone_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    amount_to_release NUMERIC(18, 2) NOT NULL CHECK (amount_to_release > 0),
    order_index INTEGER NOT NULL,
    status milestone_status DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campaign_id, order_index)
);

-- Indexes for milestones
CREATE INDEX idx_milestone_campaign_id ON milestones(campaign_id);
CREATE INDEX idx_milestone_status ON milestones(status);
CREATE INDEX idx_milestone_order ON milestones(campaign_id, order_index);

-- ============================================
-- 7. MILESTONE_PROOF TABLE
-- ============================================
CREATE TYPE proof_review_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE milestone_proof (
    proof_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    milestone_id UUID NOT NULL REFERENCES milestones(milestone_id) ON DELETE CASCADE,
    document_url TEXT NOT NULL,
    file_hash TEXT NOT NULL, -- SHA-256 hash for blockchain integrity
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    status proof_review_status DEFAULT 'PENDING',
    reviewed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for milestone_proof
CREATE INDEX idx_proof_milestone_id ON milestone_proof(milestone_id);
CREATE INDEX idx_proof_status ON milestone_proof(status);
CREATE INDEX idx_proof_file_hash ON milestone_proof(file_hash);
CREATE INDEX idx_proof_verified_by ON milestone_proof(verified_by);

-- ============================================
-- 8. SMART_CONTRACT_TRANSACTIONS TABLE
-- ============================================
CREATE TYPE tx_type AS ENUM ('DONATION', 'RELEASE');

CREATE TABLE smart_contract_transactions (
    release_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    milestone_id UUID REFERENCES milestones(milestone_id) ON DELETE SET NULL,
    campaign_id UUID REFERENCES campaigns(campaign_id) ON DELETE SET NULL,
    tx_hash VARCHAR(100) UNIQUE NOT NULL,
    tx_type tx_type NOT NULL,
    block_number BIGINT,
    gas_used BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for smart_contract_transactions
CREATE INDEX idx_tx_milestone_id ON smart_contract_transactions(milestone_id);
CREATE INDEX idx_tx_campaign_id ON smart_contract_transactions(campaign_id);
CREATE INDEX idx_tx_hash ON smart_contract_transactions(tx_hash);
CREATE INDEX idx_tx_type ON smart_contract_transactions(tx_type);
CREATE INDEX idx_tx_created_at ON smart_contract_transactions(created_at DESC);

-- ============================================
-- 9. DONATIONS TABLE
-- ============================================
CREATE TABLE donations (
    donation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    donor_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    amount NUMERIC(18, 2) NOT NULL CHECK (amount > 0),
    tx_hash VARCHAR(100) UNIQUE NOT NULL,
    block_number BIGINT,
    token_type VARCHAR(20) DEFAULT 'MATIC', -- MATIC, USDC, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for donations
CREATE INDEX idx_donation_campaign_id ON donations(campaign_id);
CREATE INDEX idx_donation_donor_id ON donations(donor_id);
CREATE INDEX idx_donation_tx_hash ON donations(tx_hash);
CREATE INDEX idx_donation_created_at ON donations(created_at DESC);
CREATE INDEX idx_donation_campaign_donor ON donations(campaign_id, donor_id);
CREATE INDEX idx_donation_token_type ON donations(token_type);

-- ============================================
-- 10. ADMIN_LOGS TABLE
-- ============================================
CREATE TABLE admin_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    details JSONB, -- Flexible JSON for action-specific data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for admin_logs
CREATE INDEX idx_log_user_id ON admin_logs(user_id);
CREATE INDEX idx_log_action ON admin_logs(action);
CREATE INDEX idx_log_created_at ON admin_logs(created_at DESC);
CREATE INDEX idx_log_user_action ON admin_logs(user_id, action);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables that have updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_verification_updated_at BEFORE UPDATE ON user_verification
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disaster_cases_updated_at BEFORE UPDATE ON disaster_cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milestone_proof_updated_at BEFORE UPDATE ON milestone_proof
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE users IS 'Main users table - stores donors, NGOs, and admins. Passwords are never stored in plain text; only cryptographic hashes are persisted.';
COMMENT ON TABLE user_verification IS 'User verification documents. Verification actions are auditable and traceable to an administrator.';
COMMENT ON TABLE disaster_cases IS 'Disaster reports with geo-coordinates. Status lifecycle: pending → approved/rejected';
COMMENT ON TABLE disaster_approvals IS 'Multi-authority approval tracking. Allows future multi-authority approvals.';
COMMENT ON TABLE campaigns IS 'Fundraising campaigns linked to disasters. Contract address ties backend to blockchain.';
COMMENT ON TABLE milestones IS 'Campaign milestones released sequentially to prevent misuse.';
COMMENT ON TABLE milestone_proof IS 'Proof files with SHA-256 hashes. Hashes ensure proofs cannot be replaced without detection.';
COMMENT ON TABLE smart_contract_transactions IS 'On-chain events mirrored off-chain for analytics and UI rendering.';
COMMENT ON TABLE donations IS 'Blockchain donations with transaction hashes and block numbers.';
COMMENT ON TABLE admin_logs IS 'Audit trail for all admin actions. A-grade security practice.';

COMMENT ON COLUMN users.password_hash IS 'Cryptographic hash - never plain text';
COMMENT ON COLUMN users.wallet_address IS 'Off-chain storage only - for mapping purposes';
COMMENT ON COLUMN user_verification.document_url IS 'URL to stored document (not raw file)';
COMMENT ON COLUMN disaster_cases.longitude IS 'Geo-coordinate for disaster location';
COMMENT ON COLUMN disaster_cases.latitude IS 'Geo-coordinate for disaster location';
COMMENT ON COLUMN campaigns.contract_address IS 'Smart contract address on Polygon';
COMMENT ON COLUMN milestone_proof.file_hash IS 'SHA-256 hash of uploaded proof file - critical for blockchain integrity';
COMMENT ON COLUMN smart_contract_transactions.tx_hash IS 'Blockchain transaction hash - unique identifier';
COMMENT ON COLUMN donations.tx_hash IS 'Blockchain transaction hash - unique identifier';
