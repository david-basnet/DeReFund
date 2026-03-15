# 🧪 Complete Testing Guide - DeReFund Platform

## 🚀 **Before Testing - Database Setup**

### **IMPORTANT: Run Database Migration First!**

1. Open your Neon SQL Editor
2. Run the migration script: `backend/database/migrations/add_volunteer_verification.sql`
3. This will:
   - Add new campaign status enum values
   - Create `volunteer_verifications` table
   - Add admin approval columns to campaigns

## 📋 **Testing Scenarios**

### **1. Donor/Volunteer Testing**

#### **A. Register & Login**
1. Go to homepage
2. Click "Join Us"
3. Register as **Donor**
4. Login with credentials
5. ✅ Should see Donor Dashboard

#### **B. Report Disaster**
1. Navigate to `/donor/report-disaster` or use navbar
2. Fill in disaster form:
   - Title: "Flood in Mumbai"
   - Description: "Severe flooding affecting thousands"
   - Location: "Mumbai, Maharashtra, India"
   - Severity: "CRITICAL"
   - Add image URLs (optional)
3. Submit
4. ✅ Disaster should be created with status `PENDING`
5. ✅ Should redirect to `/disasters`

#### **C. Browse Disasters**
1. Navigate to `/disasters`
2. ✅ Should see approved disasters
3. Click on a disaster
4. ✅ Should see disaster details and related campaigns

#### **D. Verify Campaigns**
1. Navigate to `/donor/verify`
2. ✅ Should see campaigns with status `PENDING_VERIFICATION`
3. Click "Verify Campaign" on a campaign
4. ✅ Should see verification count increase
5. ✅ Progress bar should update
6. ✅ After 20 verifications, status should change to `PENDING_ADMIN_APPROVAL`

#### **E. Browse & Donate**
1. Navigate to `/campaigns`
2. ✅ Should see only `LIVE` campaigns by default
3. Click on a campaign
4. ✅ Should see campaign details
5. ✅ If campaign is `LIVE`, should be able to donate
6. ✅ If campaign is not `LIVE`, donation should be blocked

### **2. NGO Testing**

#### **A. Register & Get Verified**
1. Register as **NGO**
2. Complete NGO profile
3. Upload verification documents
4. ✅ Status should be `PENDING`
5. Admin needs to verify (see Admin Testing)

#### **B. Create Campaign**
1. Login as verified NGO
2. Navigate to `/ngo/create-campaign`
3. Fill in campaign form:
   - Title: "Emergency Relief Fund"
   - Description: "Providing food and shelter"
   - Target Amount: 50000
   - Link to approved disaster (optional)
4. Submit
5. ✅ Campaign should be created with status `PENDING_VERIFICATION`
6. ✅ Should redirect to campaign detail page

#### **C. View Campaigns**
1. Navigate to `/ngo/campaigns`
2. ✅ Should see all campaigns created by this NGO
3. ✅ Should see status badges (PENDING_VERIFICATION, etc.)
4. Click on a campaign
5. ✅ Should see campaign management page

#### **D. Report Disaster**
1. Navigate to `/ngo/disasters/report`
2. Submit a disaster case
3. ✅ Should work same as donor disaster reporting

### **3. Admin Testing**

#### **A. Verify NGO**
1. Login as Admin
2. Navigate to `/admin/users`
3. Filter by role: NGO
4. ✅ Should see NGOs with `PENDING` verification
5. Click "Approve" on an NGO
6. ✅ NGO status should change to `APPROVED`

#### **B. Approve Disasters**
1. Navigate to `/admin/disasters`
2. ✅ Should see disasters with status `PENDING`
3. Click "Approve" on a disaster
4. ✅ Disaster status should change to `APPROVED`
5. ✅ Disaster should now be visible to public

#### **C. Approve Campaigns**
1. Navigate to `/admin/campaigns`
2. ✅ Should see campaigns with status `PENDING_ADMIN_APPROVAL`
3. ✅ Should see verification count (should be 20/20)
4. Click "Approve" on a campaign
5. ✅ Campaign status should change to `LIVE`
6. ✅ Campaign can now receive donations

#### **D. View Logs**
1. Navigate to `/admin/logs`
2. ✅ Should see all admin actions
3. ✅ Should see user verifications, disaster approvals, campaign approvals

## 🔄 **Complete Workflow Test**

### **End-to-End Test:**

1. **Donor reports disaster**
   - Donor → `/donor/report-disaster`
   - Submit disaster case
   - ✅ Status: PENDING

2. **Admin approves disaster**
   - Admin → `/admin/disasters`
   - Approve disaster
   - ✅ Status: APPROVED

3. **NGO creates campaign**
   - NGO → `/ngo/create-campaign`
   - Link to approved disaster
   - Submit campaign
   - ✅ Status: PENDING_VERIFICATION

4. **20 Volunteers verify**
   - 20 different donors → `/donor/verify`
   - Each verifies the campaign
   - ✅ After 20th verification, status: PENDING_ADMIN_APPROVAL

5. **Admin approves campaign**
   - Admin → `/admin/campaigns`
   - Approve campaign
   - ✅ Status: LIVE

6. **Donor donates**
   - Donor → `/campaigns`
   - Click on LIVE campaign
   - Donate
   - ✅ Donation recorded
   - ✅ Campaign progress updates

## 🐛 **Common Issues & Solutions**

### **Issue: Campaign status not updating**
- **Solution**: Check if database migration was run
- **Solution**: Verify enum values in database

### **Issue: Can't verify campaign**
- **Solution**: Check if user is logged in as DONOR
- **Solution**: Check if campaign status is PENDING_VERIFICATION
- **Solution**: Check if user already verified (one verification per user)

### **Issue: Can't donate**
- **Solution**: Campaign must be LIVE status
- **Solution**: Check donation API response for error message

### **Issue: Admin can't see campaigns**
- **Solution**: Campaigns must have status PENDING_ADMIN_APPROVAL or VERIFIED_BY_VOLUNTEERS
- **Solution**: Check if 20 volunteers have verified

## ✅ **Feature Checklist**

- [x] Donor can report disasters
- [x] Admin can approve disasters
- [x] NGO can create campaigns
- [x] Campaigns start as PENDING_VERIFICATION
- [x] Volunteers can verify campaigns
- [x] 20 verifications required
- [x] Admin can approve campaigns after verification
- [x] Only LIVE campaigns can receive donations
- [x] All status badges display correctly
- [x] GSAP animations work
- [x] Responsive design works
- [x] Navigation works for all roles

## 📊 **Expected Database State**

After running migration:
- `campaign_status` enum should have: DRAFT, PENDING_VERIFICATION, VERIFIED_BY_VOLUNTEERS, PENDING_ADMIN_APPROVAL, LIVE, COMPLETED, CANCELLED
- `volunteer_verifications` table should exist
- `campaigns` table should have `admin_approved_by` and `admin_approved_at` columns

## 🎯 **Success Criteria**

✅ All workflows complete without errors
✅ Status transitions work correctly
✅ Donations only work for LIVE campaigns
✅ Volunteer verification counts correctly
✅ Admin can approve after 20 verifications
✅ UI animations work smoothly
✅ All pages are responsive

