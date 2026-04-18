# Database Schema

DeReFund uses PostgreSQL with Drizzle ORM for type-safe database operations.

## Enums

### user_role
```
DONOR, NGO, ADMIN
```

### verification_status
```
PENDING, APPROVED, REJECTED
```

### disaster_status
```
PENDING, APPROVED, REJECTED
```

### disaster_severity
```
LOW, MEDIUM, HIGH, CRITICAL
```

### campaign_status
```
DRAFT, PENDING_VERIFICATION, VERIFIED_BY_VOLUNTEERS,
PENDING_ADMIN_APPROVAL, PENDING_NGO_VERIFICATION,
LIVE, COMPLETED, CANCELLED
```

### creation_source
```
DONOR, NGO
```

### milestone_status
```
PENDING, SUBMITTED, APPROVED, REJECTED
```

---

## Tables

### users

Primary user table storing account information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | UUID | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| name | VARCHAR(120) | NOT NULL | User's full name |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User's email address |
| password_hash | TEXT | NOT NULL | Bcrypt hashed password |
| role | user_role | NOT NULL | DONOR, NGO, or ADMIN |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Account active status |
| wallet_address | VARCHAR(255) | NULLABLE | MetaMask wallet address |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Account creation time |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update time |

---

### user_verification

Stores NGO verification documents.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| verification_id | UUID | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| user_id | UUID | FK -> users.user_id, UNIQUE | Reference to user |
| document_type | VARCHAR(100) | NOT NULL, DEFAULT 'REGISTRATION' | Type of verification document |
| document_url | TEXT | NOT NULL | Cloudinary URL of document |
| document_file | BYTEA | NULLABLE | Binary file data |
| document_filename | VARCHAR(255) | NULLABLE | Original filename |
| document_mimetype | VARCHAR(100) | NULLABLE | File MIME type |
| status | verification_status | NOT NULL, DEFAULT 'PENDING' | Verification status |
| verified_by | UUID | FK -> users.user_id, NULLABLE | Admin who verified |
| verified_at | TIMESTAMPTZ | NULLABLE | Verification timestamp |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation time |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update time |

---

### disaster_cases

Stores reported disaster information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| case_id | UUID | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| submitted_by | UUID | FK -> users.user_id, NOT NULL | User who reported |
| title | VARCHAR(200) | NOT NULL | Disaster title |
| description | TEXT | NOT NULL | Detailed description |
| location | VARCHAR(150) | NOT NULL | Disaster location |
| severity | disaster_severity | NOT NULL, DEFAULT 'MEDIUM' | Severity level |
| status | disaster_status | NOT NULL, DEFAULT 'PENDING' | Approval status |
| longitude | DOUBLE PRECISION | NULLABLE | GPS longitude |
| latitude | DOUBLE PRECISION | NULLABLE | GPS latitude |
| images | TEXT[] | NOT NULL, DEFAULT '{}' | Array of image URLs |
| video | TEXT | NULLABLE | Video URL |
| reviewed_by | UUID | FK -> users.user_id, NULLABLE | Admin who reviewed |
| reviewed_at | TIMESTAMPTZ | NULLABLE | Review timestamp |
| image_files | BYTEA[] | NULLABLE | Binary image data |
| image_filenames | TEXT[] | NULLABLE | Original filenames |
| image_mimetypes | TEXT[] | NULLABLE | MIME types |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation time |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update time |

**Indexes:**
- `idx_disaster_submitted_by` on `submitted_by`
- `idx_disaster_status` on `status`

---

### campaigns

Stores fundraising campaigns.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| campaign_id | UUID | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| ngo_id | UUID | FK -> users.user_id, NOT NULL | Responsible NGO |
| case_id | UUID | FK -> disaster_cases.case_id | Associated disaster |
| title | VARCHAR(200) | NOT NULL | Campaign title |
| description | TEXT | NOT NULL | Detailed description |
| target_amount | NUMERIC(18,2) | NOT NULL | Fundraising goal |
| current_amount | NUMERIC(18,2) | NOT NULL, DEFAULT '0' | Amount raised |
| contract_address | VARCHAR(100) | NULLABLE | Blockchain contract |
| status | campaign_status | NOT NULL, DEFAULT 'DRAFT' | Campaign status |
| admin_approved_by | UUID | FK -> users.user_id, NULLABLE | Admin approver |
| admin_approved_at | TIMESTAMPTZ | NULLABLE | Approval timestamp |
| creation_source | creation_source | NOT NULL, DEFAULT 'NGO' | DONOR or NGO |
| creator_user_id | UUID | FK -> users.user_id, NULLABLE | Original creator |
| ngo_reviewed_by | UUID | FK -> users.user_id, NULLABLE | NGO reviewer |
| ngo_reviewed_at | TIMESTAMPTZ | NULLABLE | Review timestamp |
| image_urls | TEXT[] | NOT NULL, DEFAULT '{}' | Campaign images |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation time |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update time |

**Indexes:**
- `idx_campaign_ngo_id` on `ngo_id`
- `idx_campaign_case_id` on `case_id`
- `idx_campaign_status` on `status`

---

### donations

Stores donation records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| donation_id | UUID | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| campaign_id | UUID | FK -> campaigns.campaign_id, NOT NULL | Target campaign |
| donor_id | UUID | FK -> users.user_id, NOT NULL | Donor user |
| amount | NUMERIC(18,2) | NOT NULL | Donation amount |
| tx_hash | VARCHAR(66) | NOT NULL, UNIQUE | Blockchain transaction hash |
| block_number | BIGINT | NULLABLE | Block number |
| token_type | VARCHAR(32) | NOT NULL, DEFAULT 'MATIC' | Token type |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Donation time |

**Indexes:**
- `idx_donation_campaign_id` on `campaign_id`
- `idx_donation_donor_id` on `donor_id`

---

### milestones

Stores campaign milestones.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| milestone_id | UUID | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| campaign_id | UUID | FK -> campaigns.campaign_id, NOT NULL | Parent campaign |
| title | VARCHAR(150) | NOT NULL | Milestone title |
| description | TEXT | NULLABLE | Milestone description |
| amount_to_release | NUMERIC(18,2) | NOT NULL | Amount for this milestone |
| order_index | INTEGER | NOT NULL, DEFAULT 0 | Display order |
| status | milestone_status | NOT NULL, DEFAULT 'PENDING' | Milestone status |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation time |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update time |

**Indexes:**
- `idx_milestone_campaign_id` on `campaign_id`

---

### volunteer_verifications

Tracks campaign verification by donors/volunteers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| verification_id | UUID | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| campaign_id | UUID | FK -> campaigns.campaign_id, NOT NULL | Verified campaign |
| volunteer_id | UUID | FK -> users.user_id, NOT NULL | Volunteer verifier |
| verified_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Verification time |

**Constraints:**
- UNIQUE INDEX on `(campaign_id, volunteer_id)` - One verification per volunteer per campaign

**Indexes:**
- `volunteer_verifications_campaign_volunteer_unique` on `(campaign_id, volunteer_id)`

---

### admin_logs

Audit trail for admin actions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| log_id | UUID | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| user_id | UUID | FK -> users.user_id, NOT NULL | Admin who performed action |
| action | VARCHAR(120) | NOT NULL | Action description |
| details | TEXT | NULLABLE | Additional details |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Action timestamp |

---

## Relationships

```
users (1) ─── (N) user_verification
users (1) ─── (N) disaster_cases
users (1) ─── (N) campaigns (as ngo_id)
users (1) ─── (N) campaigns (as creator_user_id)
users (1) ─── (N) donations
users (1) ─── (N) volunteer_verifications
users (1) ─── (N) admin_logs

disaster_cases (1) ─── (N) campaigns

campaigns (1) ─── (N) donations
campaigns (1) ─── (N) milestones
campaigns (1) ─── (N) volunteer_verifications
```

## Migration Commands

```bash
# Generate migration files
npm run db:generate
# or
npx drizzle-kit generate

# Apply migrations
npm run db:migrate
# or
npx drizzle-kit migrate

# Push schema directly (development)
npm run db:push
# or
npx drizzle-kit push
```
