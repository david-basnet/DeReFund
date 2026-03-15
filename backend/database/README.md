# Database Schema (Updated)

## Setup Instructions

1. Open your Neon SQL Editor
2. Copy and paste the entire contents of `schema.sql`
3. Execute the script
4. Verify all tables are created

## Tables Created (10 Total)

1. **users** - Main user accounts (Donors, NGOs, Admins)
   - ✅ `is_active` flag for account management
   - ✅ `password_hash` (never plain text)
   - ✅ `wallet_address` for blockchain mapping

2. **user_verification** - Separate verification system
   - ✅ Document URLs (not raw files)
   - ✅ `verified_by` for audit trail
   - ✅ Traceable to administrator

3. **disaster_cases** - Disaster reports with geo-coordinates
   - ✅ `longitude` and `latitude` for mapping
   - ✅ `images` array and `video` URL
   - ✅ Status lifecycle management

4. **disaster_approvals** - Multi-authority approval tracking
   - ✅ Optional table for future multi-authority system
   - ✅ Prevents duplicate approvals

5. **campaigns** - Fundraising campaigns
   - ✅ `contract_address` for blockchain integration
   - ✅ Linked to disasters and NGOs

6. **milestones** - Campaign milestones
   - ✅ `order_index` for sequential release
   - ✅ Prevents misuse through ordering

7. **milestone_proof** - Proof verification system
   - ✅ `file_hash` (SHA-256) for blockchain integrity
   - ✅ Hashes ensure proofs cannot be replaced

8. **smart_contract_transactions** - On-chain event tracking
   - ✅ Mirrors blockchain events off-chain
   - ✅ Supports DONATION and RELEASE types
   - ✅ Critical for analytics and UI

9. **donations** - Blockchain donations
   - ✅ `block_number` for blockchain tracking
   - ✅ `token_type` support (MATIC, USDC, etc.)

10. **admin_logs** - Audit trail system
    - ✅ A-grade security practice
    - ✅ JSONB for flexible action details
    - ✅ Complete audit trail

## Key Features

- ✅ UUID primary keys for all tables
- ✅ Foreign key constraints with CASCADE/SET NULL
- ✅ ENUM types for all status fields
- ✅ Automatic `updated_at` triggers
- ✅ Comprehensive indexes for performance
- ✅ Check constraints for data validation
- ✅ Geo-coordinates for disaster mapping
- ✅ Blockchain integrity (file hashes, tx hashes)
- ✅ Complete audit trail system

## Viva-Ready Points

1. **Security**: "Passwords are never stored in plain text; only cryptographic hashes are persisted."
2. **Auditability**: "Verification actions are auditable and traceable to an administrator."
3. **Geo-location**: "Disaster cases include geo-coordinates for precise location mapping."
4. **Blockchain Integrity**: "Hashes ensure proofs cannot be replaced without detection."
5. **Sequential Milestones**: "Milestones are released sequentially to prevent misuse."
6. **On-chain Mirroring**: "On-chain events are mirrored off-chain for analytics and UI rendering."
7. **Audit Trail**: "Complete admin action logging for security and compliance."

## Notes

- All primary keys use `_id` suffix (user_id, campaign_id, etc.)
- Donors don't need verification (is_verified removed, using user_verification table)
- NGOs require admin approval via user_verification table
- Wallet addresses stored off-chain only
- Transaction hashes are unique identifiers
- File hashes ensure blockchain integrity
