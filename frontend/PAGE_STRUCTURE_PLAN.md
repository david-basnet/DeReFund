# DeReFund - Page Structure Plan

## 📋 Overview
This document outlines all pages needed for the DeReFund platform based on user roles and functionality.

---

## 🌐 Pages for Non-Logged-In Users

### 1. **Home Page** (`/`)
- **Status**: ✅ Exists
- **Content**: 
  - Hero section with scroll animations
  - About DeReFund
  - How it works
  - Featured campaigns/disasters
  - Statistics
  - Call-to-action buttons (Sign Up / Log In)

### 2. **Browse Campaigns** (`/campaigns`)
- **Status**: ❌ Needs Creation
- **Content**:
  - Grid/list view of all active campaigns
  - Filter by category, location, urgency
  - Search functionality
  - Sort by: newest, most funded, deadline
  - Campaign cards with: image, title, progress, amount raised, days left
  - Click to view campaign details (requires login to donate)

### 3. **Browse Disasters** (`/disasters`)
- **Status**: ❌ Needs Creation
- **Content**:
  - Map view of disaster locations
  - List/grid view of disaster cases
  - Filter by severity, status, location
  - Disaster cards with: location, severity, status, description
  - Click to view disaster details

### 4. **About Us** (`/about`)
- **Status**: ❌ Needs Creation
- **Content**:
  - Mission and vision
  - How DeReFund works
  - Transparency and trust
  - Team information
  - Contact information

### 5. **How It Works** (`/how-it-works`)
- **Status**: ❌ Needs Creation
- **Content**:
  - Step-by-step guide for donors
  - Step-by-step guide for NGOs
  - Blockchain transparency explanation
  - Milestone system explanation

### 6. **Campaign Details** (`/campaigns/:id`)
- **Status**: ❌ Needs Creation (Public View)
- **Content**:
  - Campaign information (read-only)
  - Progress bar
  - Donor list
  - Milestones
  - "Login to Donate" CTA

### 7. **Disaster Details** (`/disasters/:id`)
- **Status**: ❌ Needs Creation (Public View)
- **Content**:
  - Disaster information
  - Location map
  - Images/videos
  - Related campaigns
  - "Report Similar" option (requires login)

---

## 👤 Pages for Donors/Volunteers (After Login)

### 1. **Donor Dashboard** (`/donor/dashboard`)
- **Status**: ❌ Needs Creation
- **Content**:
  - Total donations made
  - Recent donations
  - Favorite campaigns
  - Impact summary
  - Quick actions (Browse Campaigns, View Profile)

### 2. **Browse & Donate** (`/donor/campaigns`)
- **Status**: ⚠️ Partially Exists (`/donor`)
- **Content**:
  - All active campaigns
  - Filter and search
  - Donate button on each campaign
  - Save/favorite campaigns
  - Donation history per campaign

### 3. **My Donations** (`/donor/donations`)
- **Status**: ❌ Needs Creation
- **Content**:
  - List of all donations made
  - Filter by: status, date, campaign
  - Donation details: amount, date, campaign, transaction hash
  - Receipt download
  - Tax documents

### 4. **My Profile** (`/donor/profile`)
- **Status**: ❌ Needs Creation
- **Content**:
  - Personal information
  - Wallet address
  - Edit profile
  - Change password
  - Notification preferences
  - Account settings

### 5. **Campaign Details (Donor View)** (`/campaigns/:id`)
- **Status**: ❌ Needs Creation
- **Content**:
  - Full campaign information
  - Donate button with amount selector
  - Payment method selection (crypto)
  - Transaction confirmation
  - Milestone tracking
  - Comments/updates section

### 6. **Saved Campaigns** (`/donor/saved`)
- **Status**: ❌ Needs Creation
- **Content**:
  - List of favorited/saved campaigns
  - Quick donate options
  - Remove from saved

### 7. **Impact Report** (`/donor/impact`)
- **Status**: ❌ Needs Creation
- **Content**:
  - Total amount donated
  - Number of campaigns supported
  - Lives impacted (if available)
  - Visual charts and graphs
  - Shareable impact certificate

### 8. **Transaction History** (`/donor/transactions`)
- **Status**: ❌ Needs Creation
- **Content**:
  - All blockchain transactions
  - Transaction status
  - Block explorer links
  - Export transaction history

---

## 🏢 Pages for NGOs (After Login)

### 1. **NGO Dashboard** (`/ngo/dashboard`)
- **Status**: ⚠️ Partially Exists (`/ngo`)
- **Content**:
  - Active campaigns overview
  - Total funds raised
  - Pending approvals
  - Recent donations
  - Quick stats
  - Create campaign button

### 2. **My Campaigns** (`/ngo/campaigns`)
- **Status**: ❌ Needs Creation
- **Content**:
  - List of all campaigns (active, completed, draft)
  - Filter by status
  - Campaign performance metrics
  - Edit/Manage buttons
  - View donations per campaign

### 3. **Create Campaign** (`/ngo/create-campaign`)
- **Status**: ✅ Exists
- **Content**:
  - Campaign form (title, description, target amount)
  - Link to disaster case (optional)
  - Upload images
  - Set milestones
  - Submit for approval

### 4. **Edit Campaign** (`/ngo/campaigns/:id/edit`)
- **Status**: ❌ Needs Creation
- **Content**:
  - Edit campaign details
  - Update milestones
  - Add updates/progress
  - Manage campaign status

### 5. **Campaign Management** (`/ngo/campaigns/:id`)
- **Status**: ❌ Needs Creation
- **Content**:
  - Campaign overview
  - Donations list
  - Milestone management
  - Upload milestone proof
  - Request milestone release
  - Campaign analytics

### 6. **Disaster Cases** (`/ngo/disasters`)
- **Status**: ❌ Needs Creation
- **Content**:
  - Report new disaster
  - View reported disasters
  - Link disasters to campaigns
  - Disaster case status

### 7. **Report Disaster** (`/ngo/disasters/report`)
- **Status**: ❌ Needs Creation
- **Content**:
  - Disaster report form
  - Location (map picker)
  - Severity selection
  - Upload images/videos
  - Description
  - Submit for approval

### 8. **Milestones** (`/ngo/milestones`)
- **Status**: ❌ Needs Creation
- **Content**:
  - All milestones across campaigns
  - Filter by campaign, status
  - Upload proof
  - Request release
  - Track milestone progress

### 9. **Donations Received** (`/ngo/donations`)
- **Status**: ❌ Needs Creation
- **Content**:
  - All donations received
  - Filter by campaign, date
  - Donor information
  - Transaction details
  - Export reports

### 10. **NGO Profile** (`/ngo/profile`)
- **Status**: ❌ Needs Creation
- **Content**:
  - Organization information
  - Verification status
  - Documents
  - Edit profile
  - Team members
  - Contact information

### 11. **Analytics & Reports** (`/ngo/analytics`)
- **Status**: ❌ Needs Creation
- **Content**:
  - Campaign performance charts
  - Donation trends
  - Donor demographics
  - Impact metrics
  - Export reports

---

## 🔐 Shared Pages (All Users)

### 1. **Login/Sign Up** (Modal)
- **Status**: ✅ Exists
- **Content**: AuthForm component

### 2. **Forgot Password** (Modal)
- **Status**: ✅ Exists (within AuthForm)
- **Content**: Password reset flow

### 3. **404 Not Found** (`/*`)
- **Status**: ❌ Needs Creation
- **Content**: Error page with navigation back

---

## 📱 Priority Order for Development

### Phase 1 (Essential - Non-Logged-In)
1. ✅ Home Page (exists)
2. ❌ Browse Campaigns (`/campaigns`)
3. ❌ Campaign Details Public View (`/campaigns/:id`)

### Phase 2 (Donor Core Features)
1. ❌ Donor Dashboard (`/donor/dashboard`)
2. ❌ My Donations (`/donor/donations`)
3. ❌ Campaign Details with Donate (`/campaigns/:id` - authenticated)
4. ❌ Donor Profile (`/donor/profile`)

### Phase 3 (NGO Core Features)
1. ⚠️ NGO Dashboard (enhance existing)
2. ✅ Create Campaign (exists)
3. ❌ My Campaigns (`/ngo/campaigns`)
4. ❌ Campaign Management (`/ngo/campaigns/:id`)
5. ❌ Report Disaster (`/ngo/disasters/report`)

### Phase 4 (Advanced Features)
1. ❌ Milestone Management
2. ❌ Analytics & Reports
3. ❌ Impact Reports
4. ❌ Transaction History

---

## 🎨 Design Considerations

- **Consistent Navigation**: Navbar should adapt based on user role
- **Responsive Design**: All pages must work on mobile, tablet, desktop
- **Loading States**: Show loading indicators for async operations
- **Error Handling**: Graceful error messages and fallbacks
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Optimize images, lazy loading, code splitting

---

## 🔗 Route Structure Summary

```
/                           → Home (public)
/campaigns                  → Browse Campaigns (public)
/campaigns/:id              → Campaign Details (public/auth)
/disasters                  → Browse Disasters (public)
/disasters/:id              → Disaster Details (public)
/about                      → About Us (public)
/how-it-works               → How It Works (public)

/donor/dashboard            → Donor Dashboard
/donor/campaigns            → Browse & Donate
/donor/donations            → My Donations
/donor/profile              → Donor Profile
/donor/saved                → Saved Campaigns
/donor/impact               → Impact Report
/donor/transactions         → Transaction History

/ngo/dashboard              → NGO Dashboard
/ngo/campaigns              → My Campaigns
/ngo/campaigns/:id          → Campaign Management
/ngo/campaigns/:id/edit     → Edit Campaign
/ngo/create-campaign        → Create Campaign (exists)
/ngo/disasters              → Disaster Cases
/ngo/disasters/report       → Report Disaster
/ngo/milestones             → Milestones
/ngo/donations              → Donations Received
/ngo/profile                → NGO Profile
/ngo/analytics              → Analytics & Reports
```

