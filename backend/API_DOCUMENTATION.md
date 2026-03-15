# DeReFund API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 🔐 Auth Endpoints

### Register
- **POST** `/api/auth/register`
- **Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "role": "DONOR",
  "wallet_address": "0x..." // optional
}
```

### Login
- **POST** `/api/auth/login`
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

### Get Profile
- **GET** `/api/auth/me`
- **Auth:** Required

---

## 🌍 Disaster Endpoints

### Get All Disasters
- **GET** `/api/disasters?page=1&limit=10&status=APPROVED&severity=HIGH`
- **Public**

### Get Disaster by ID
- **GET** `/api/disasters/:caseId`
- **Public**

### Create Disaster Case
- **POST** `/api/disasters`
- **Auth:** Required
- **Body:**
```json
{
  "title": "Flood in Mumbai",
  "description": "Severe flooding...",
  "location": "Mumbai, India",
  "severity": "HIGH",
  "longitude": 72.8777,
  "latitude": 19.0760,
  "images": ["url1", "url2"],
  "video": "url" // optional
}
```

### Approve/Reject Disaster
- **PATCH** `/api/disasters/:caseId/status`
- **Auth:** Admin only
- **Body:**
```json
{
  "status": "APPROVED" // or "REJECTED"
}
```

---

## 🎯 Campaign Endpoints

### Get All Campaigns
- **GET** `/api/campaigns?page=1&limit=10&status=LIVE&ngo_id=uuid`
- **Auth:** Required

### Get Campaign by ID
- **GET** `/api/campaigns/:campaignId`
- **Auth:** Required

### Create Campaign
- **POST** `/api/campaigns`
- **Auth:** NGO only
- **Body:**
```json
{
  "case_id": "uuid", // optional
  "title": "Help Flood Victims",
  "description": "Campaign description...",
  "target_amount": 10000,
  "contract_address": "0x..." // optional
}
```

### Update Campaign
- **PATCH** `/api/campaigns/:campaignId`
- **Auth:** Required (NGO owner or Admin)
- **Body:** (any fields to update)

---

## 💰 Donation Endpoints

### Create Donation
- **POST** `/api/donations`
- **Auth:** Required
- **Body:**
```json
{
  "campaign_id": "uuid",
  "amount": 100.50,
  "tx_hash": "0x...",
  "block_number": 12345, // optional
  "token_type": "MATIC" // optional, default: MATIC
}
```

### Get Donations by Campaign
- **GET** `/api/donations/campaign/:campaignId?page=1&limit=10`
- **Public**

### Get My Donations
- **GET** `/api/donations/my-donations?page=1&limit=10`
- **Auth:** Required

### Get Donation by ID
- **GET** `/api/donations/:donationId`
- **Public**

---

## 🎯 Milestone Endpoints

### Get Milestones by Campaign
- **GET** `/api/milestones/campaign/:campaignId`
- **Public**

### Get Milestone by ID
- **GET** `/api/milestones/:milestoneId`
- **Public**

### Create Milestone
- **POST** `/api/milestones`
- **Auth:** Required (NGO owner or Admin)
- **Body:**
```json
{
  "campaign_id": "uuid",
  "title": "Phase 1: Emergency Relief",
  "description": "Provide food and water",
  "amount_to_release": 5000,
  "order_index": 1
}
```

### Update Milestone Status
- **PATCH** `/api/milestones/:milestoneId/status`
- **Auth:** Admin only
- **Body:**
```json
{
  "status": "APPROVED" // PENDING, SUBMITTED, APPROVED, REJECTED
}
```

---

## 👨‍💼 Admin Endpoints

### Verify User (NGO)
- **PATCH** `/api/admin/verify-user/:userId`
- **Auth:** Admin only
- **Body:**
```json
{
  "status": "APPROVED",
  "document_type": "REGISTRATION",
  "document_url": "https://..."
}
```

### Get All Users
- **GET** `/api/admin/users?page=1&limit=10&role=NGO`
- **Auth:** Admin only

### Get Admin Logs
- **GET** `/api/admin/logs?page=1&limit=20`
- **Auth:** Admin only

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Server Error

