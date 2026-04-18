# User Guide

Complete guide for using DeReFund as a Donor, NGO, or Admin.

## Getting Started

### Creating an Account

1. Navigate to the registration page
2. Select your role:
   - **Donor**: Want to contribute to relief efforts
   - **NGO**: Represent an organization managing campaigns
   - **Admin**: Platform administrator
3. Fill in your details (name, email, password)
4. Complete registration

### Connecting Wallet

1. Install MetaMask browser extension
2. Create or import your wallet
3. Switch to Polygon Mumbai Testnet:
   - Network Name: `Polygon Mumbai`
   - RPC URL: `https://rpc-mumbai.maticvigil.com`
   - Chain ID: `80001`
   - Currency Symbol: `MATIC`

---

## For Donors

### Browsing Campaigns

1. Visit the home page to see featured campaigns
2. Use filters to find campaigns by:
   - Status (LIVE, Completed)
   - Target amount
   - Creation date

### Donating to Campaigns

**Prerequisites:**
- Connected MetaMask wallet
- MATIC tokens on Mumbai testnet (get free from faucet)

**Steps:**
1. Select a LIVE campaign
2. Click "Donate Now"
3. Enter donation amount
4. Confirm transaction in MetaMask
5. Wait for blockchain confirmation
6. Transaction hash is recorded for transparency

### Verifying Campaigns

Help verify campaign authenticity:

1. Navigate to "Verify Campaigns"
2. Browse campaigns pending verification
3. Review campaign details and documentation
4. Click "Verify as Authentic" if you believe it's legitimate
5. Once 20 donors verify, campaign moves to admin review

### Reporting Disasters

Report new disaster situations:

1. Go to "Report Disaster"
2. Fill in details:
   - Title and description
   - Location (city, state)
   - Severity level
   - GPS coordinates (optional)
   - Upload photos/videos
3. Submit for admin review

### Viewing Donation History

Track all your donations:

1. Go to "My Donations"
2. View complete history with:
   - Donation amount
   - Campaign name
   - Transaction hash (verifiable on blockchain)
   - Date and time

---

## For NGOs

### Creating an Account

1. Register with NGO role
2. Upload verification documents:
   - Registration certificate
   - NGO registration documents
   - Tax exemption certificate
3. Wait for admin verification (1-3 business days)

### Creating a Campaign

**Requirements:**
- Admin-verified NGO account
- Linked approved disaster case (optional but recommended)

**Steps:**
1. Go to "Create Campaign"
2. Fill in campaign details:
   - Title and description
   - Target amount
   - Link to disaster case
   - Upload campaign images
3. Submit for volunteer verification

### Managing Campaigns

View and manage your campaigns:

1. Go to "My Campaigns"
2. See campaign list with status
3. Click campaign to:
   - View donation progress
   - Update details (if in DRAFT)
   - Add milestones
   - View donor list

### Reviewing Donor Proposals

If enabled, review campaigns proposed by donors:

1. Go to "Pending Proposals"
2. Review proposal details
3. Accept or reject:
   - **Accept**: Campaign moves to verification
   - **Reject**: Creator is notified with reason

### Creating Milestones

Break campaigns into phases:

1. Select a campaign
2. Go to "Add Milestone"
3. Define milestone:
   - Title and description
   - Amount to release at completion
   - Order in sequence
4. Submit evidence when milestone complete
5. Wait for admin approval to release funds

---

## For Admins

### Dashboard Overview

Access admin dashboard to see:
- Total users (by role)
- Active campaigns
- Total donations
- Recent admin logs

### User Management

**Verifying NGOs:**

1. Go to "User Management"
2. Find NGO with pending verification
3. Review submitted documents
4. Approve or reject with reason

**Managing Users:**

- View all users by role
- Deactivate suspicious accounts
- View user activity logs

### Disaster Approval

Review reported disasters:

1. Go to "Pending Disasters"
2. Review details and evidence
3. Approve if legitimate
4. Reject with reason if false report

### Campaign Approval

After volunteer verification:

1. Go to "Pending Campaigns"
2. Review campaign details
3. Check verification count (minimum 20)
4. Approve to make LIVE
5. Reject with reason if problematic

### Managing Milestones

Review milestone completion:

1. Go to "Milestone Requests"
2. Review submitted evidence
3. Approve to release milestone funds
4. Reject with feedback

### Viewing Logs

Track all admin actions:

1. Go to "Admin Logs"
2. See timestamped action history
3. Filter by action type or user

---

## Campaign Status Workflow

```
                    ┌──────────────┐
                    │    DRAFT     │
                    └──────┬───────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  PENDING_VERIFICATION  │
              └───────────┬────────────┘
                          │ 20 volunteer verifications
                          ▼
         ┌────────────────────────────────┐
         │   VERIFIED_BY_VOLUNTEERS       │
         └────────────┬───────────────────┘
                      │ Admin review
                      ▼
   ┌──────────────────────────────┐
   │ PENDING_NGO_VERIFICATION (if donor-proposed) │
   └──────────────────────────────┘
                      │
                      ▼
       ┌─────────────────────────────┐
       │ PENDING_ADMIN_APPROVAL       │
       └──────────────┬──────────────┘
                      │ Admin approves
                      ▼
              ┌──────────────┐
              │     LIVE     │◄──────────── Accepts donations
              └──────┬───────┘
                     │
           ┌─────────┴─────────┐
           │                   │
           ▼                   ▼
    ┌───────────┐       ┌───────────┐
    │ COMPLETED │       │ CANCELLED │
    └───────────┘       └───────────┘
```

## Disaster Status Workflow

```
┌──────────┐     Admin      ┌──────────┐
│ PENDING  │ ── approves ── │ APPROVED │
└──────────┘                └──────────┘
      │
      │ Admin rejects
      ▼
┌──────────┐
│ REJECTED │
└──────────┘
```

## Security Best Practices

1. **Never share your private keys**
2. **Use strong, unique passwords**
3. **Verify transaction details before confirming**
4. **Check contract addresses carefully**
5. **Report suspicious campaigns immediately**

## Troubleshooting

### Wallet Connection Issues
- Ensure MetaMask is installed
- Check network is set to Polygon Mumbai
- Refresh the page and try again

### Transaction Failed
- Check you have sufficient MATIC
- Increase gas limit if needed
- Try again with slightly higher gas price

### Campaign Not Visible
- Ensure campaign status is LIVE
- Check if wallet is connected
- Contact admin if issue persists
