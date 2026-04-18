# API Documentation

Complete reference for DeReFund REST API endpoints.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require JWT authentication. Include token in Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Authentication (`/auth`)

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "DONOR" | "NGO" | "ADMIN"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user_id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "DONOR"
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "user_id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "DONOR"
  }
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

#### Update Profile
```http
PATCH /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "wallet_address": "0x..."
}
```

---

### Disasters (`/disasters`)

#### Get All Disasters (Public)
```http
GET /disasters
```

#### Get Disaster by ID (Public)
```http
GET /disasters/:caseId
```

#### Create Disaster
```http
POST /disasters
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Flood Relief - Region A",
  "description": "Severe flooding in low-lying areas",
  "location": "City, State",
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "longitude": 72.8777,
  "latitude": 19.0760,
  "images": ["url1", "url2"]
}
```

#### Update Disaster Status (Admin Only)
```http
PATCH /disasters/:caseId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "APPROVED" | "REJECTED"
}
```

---

### Campaigns (`/campaigns`)

#### Get Public Campaigns
```http
GET /campaigns/public
```

#### Get Public Campaign by ID
```http
GET /campaigns/public/:campaignId
```

#### Get Verified NGOs (Public)
```http
GET /campaigns/public/verified-ngos
```

#### Get Public Impact Stats (Public)
```http
GET /campaigns/public/stats
```

#### Get User's Campaigns (Authenticated)
```http
GET /campaigns
Authorization: Bearer <token>
```

#### Create Campaign (NGO Only)
```http
POST /campaigns
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Emergency Relief Fund",
  "description": "Providing aid to affected families",
  "target_amount": "100000",
  "case_id": "uuid-of-disaster"
}
```

#### Create Donor Proposal (Donor Only)
```http
POST /campaigns/donor-proposal
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Community Relief",
  "description": "...",
  "target_amount": "50000",
  "ngo_id": "uuid-of-ngo"
}
```

#### Get Campaign by ID
```http
GET /campaigns/:campaignId
Authorization: Bearer <token>
```

#### Update Campaign
```http
PATCH /campaigns/:campaignId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description"
}
```

#### NGO Confirm Donor Proposal
```http
PATCH /campaigns/:campaignId/ngo-confirm
Authorization: Bearer <token>
Content-Type: application/json

{
  "decision": "ACCEPT" | "REJECT"
}
```

---

### Donations (`/donations`)

#### Get Donations by Campaign (Public)
```http
GET /donations/campaign/:campaignId
```

#### Get My Donations (Authenticated)
```http
GET /donations/my-donations
Authorization: Bearer <token>
```

#### Get Donation by ID (Public)
```http
GET /donations/:donationId
```

#### Create Donation (Authenticated)
```http
POST /donations
Authorization: Bearer <token>
Content-Type: application/json

{
  "campaign_id": "uuid",
  "amount": "100",
  "tx_hash": "0x..."
}
```

---

### Milestones (`/milestones`)

#### Get Milestones by Campaign (Public)
```http
GET /milestones/campaign/:campaignId
```

#### Get Milestone by ID (Public)
```http
GET /milestones/:milestoneId
```

#### Create Milestone (Authenticated)
```http
POST /milestones
Authorization: Bearer <token>
Content-Type: application/json

{
  "campaign_id": "uuid",
  "title": "Phase 1: Food Distribution",
  "description": "Provide food to 500 families",
  "amount_to_release": "25000",
  "order_index": 0
}
```

#### Update Milestone Status (Admin Only)
```http
PATCH /milestones/:milestoneId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "APPROVED" | "REJECTED" | "SUBMITTED"
}
```

---

### Volunteer Verification (`/volunteer-verification`)

#### Get Pending Verification Campaigns
```http
GET /volunteer-verification/pending
Authorization: Bearer <token>
```

#### Get Campaign Verification Status
```http
GET /volunteer-verification/campaign/:campaignId
Authorization: Bearer <token>
```

#### Verify Campaign
```http
POST /volunteer-verification/campaign/:campaignId/verify
Authorization: Bearer <token>
```

---

### Admin (`/admin`)

#### Get All Users
```http
GET /admin/users
Authorization: Bearer <token>
```

#### Delete User
```http
DELETE /admin/users/:userId
Authorization: Bearer <token>
```

#### Verify User (NGO Verification)
```http
PATCH /admin/verify-user/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "APPROVED" | "REJECTED"
}
```

#### Get Pending Campaigns
```http
GET /admin/campaigns/pending
Authorization: Bearer <token>
```

#### Approve Campaign
```http
PATCH /admin/campaigns/:campaignId/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "APPROVED" | "REJECTED"
}
```

#### Get Admin Logs
```http
GET /admin/logs
Authorization: Bearer <token>
```

#### Get Dashboard Stats
```http
GET /admin/dashboard/stats
Authorization: Bearer <token>
```

---

### File Upload (`/upload`)

#### Upload Files
```http
POST /upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

files: [file1, file2, ...]
```

**Response:**
```json
{
  "success": true,
  "urls": ["url1", "url2"]
}
```

## Status Enums

### Campaign Status
- `DRAFT` - Initial creation
- `PENDING_VERIFICATION` - Awaiting volunteer verification
- `VERIFIED_BY_VOLUNTEERS` - 20+ verifications received
- `PENDING_ADMIN_APPROVAL` - Awaiting admin review
- `PENDING_NGO_VERIFICATION` - Donor proposal awaiting NGO
- `LIVE` - Active and accepting donations
- `COMPLETED` - Goal reached, campaign closed
- `CANCELLED` - Campaign cancelled

### Disaster Severity
- `LOW`
- `MEDIUM`
- `HIGH`
- `CRITICAL`

### Disaster Status
- `PENDING`
- `APPROVED`
- `REJECTED`

### Milestone Status
- `PENDING`
- `SUBMITTED`
- `APPROVED`
- `REJECTED`

### User Role
- `DONOR`
- `NGO`
- `ADMIN`

### Verification Status
- `PENDING`
- `APPROVED`
- `REJECTED`
