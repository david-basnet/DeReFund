import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
// Public pages
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import BrowseCampaigns from './pages/public/BrowseCampaigns';
import CampaignDetail from './pages/public/CampaignDetail';
import BrowseDisasters from './pages/public/BrowseDisasters';
import DisasterDetail from './pages/public/DisasterDetail';
// Donor pages
import DonorPage from './pages/donor/DonorPage';
import DonorCampaigns from './pages/donor/DonorCampaigns';
import MyDonations from './pages/donor/MyDonations';
import DonorProfile from './pages/donor/DonorProfile';
import SavedCampaigns from './pages/donor/SavedCampaigns';
import ImpactReport from './pages/donor/ImpactReport';
import DonorVolunteerVoting from './pages/donor/VolunteerVoting';
import ReportDisaster from './pages/donor/ReportDisaster';
import DonorCreateCampaign from './pages/donor/DonorCreateCampaign';
// Volunteer pages
import VolunteerVoting from './pages/volunteer/VolunteerVoting';
// NGO pages
import NGODashboard from './pages/ngo/NGODashboard';
import CreateCampaign from './pages/ngo/CreateCampaign';
import NGOCampaigns from './pages/ngo/NGOCampaigns';
import CampaignManagement from './pages/ngo/CampaignManagement';
import EditCampaign from './pages/ngo/EditCampaign';
import NGOProfile from './pages/ngo/NGOProfile';
import NGOAnalytics from './pages/ngo/NGOAnalytics';
import NGOReportDisaster from './pages/ngo/ReportDisaster';
import NGOMilestones from './pages/ngo/NGOMilestones';
import NGODonations from './pages/ngo/NGODonations';
// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDisasters from './pages/admin/AdminDisasters';
import AdminLogs from './pages/admin/AdminLogs';
import AdminCampaigns from './pages/admin/AdminCampaigns';
import AuthForm from './components/AuthForm';
import ErrorBoundary from './components/ErrorBoundary';

const AppContent = () => {
  const {
    isAuthFormOpen,
    authFormMode,
    closeModals,
  } = useAuth();

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/campaigns" element={<BrowseCampaigns />} />
        <Route path="/campaigns/:campaignId" element={<CampaignDetail />} />
        <Route path="/disasters" element={<BrowseDisasters />} />
        <Route path="/disasters/:disasterId" element={<DisasterDetail />} />
        
        {/* Donor Routes */}
        <Route path="/volunteer/voting" element={
          <ProtectedRoute>
            <VolunteerVoting />
          </ProtectedRoute>
        } />
        <Route path="/donor/voting" element={
          <ProtectedRoute requiredRole="DONOR">
            <DonorVolunteerVoting />
          </ProtectedRoute>
        } />
        <Route path="/donor/verify" element={
          <Navigate to="/donor/voting" replace />
        } />
        <Route path="/donor" element={
          <ProtectedRoute requiredRole="DONOR">
            <DonorPage />
          </ProtectedRoute>
        } />
        <Route path="/donor/campaigns" element={
          <ProtectedRoute requiredRole="DONOR">
            <DonorCampaigns />
          </ProtectedRoute>
        } />
        <Route path="/donor/create-campaign" element={
          <ProtectedRoute requiredRole="DONOR">
            <DonorCreateCampaign />
          </ProtectedRoute>
        } />
        <Route path="/donor/donations" element={
          <ProtectedRoute requiredRole="DONOR">
            <MyDonations />
          </ProtectedRoute>
        } />
        <Route path="/donor/profile" element={
          <ProtectedRoute requiredRole="DONOR">
            <DonorProfile />
          </ProtectedRoute>
        } />
        <Route path="/donor/saved" element={
          <ProtectedRoute requiredRole="DONOR">
            <SavedCampaigns />
          </ProtectedRoute>
        } />
        <Route path="/donor/impact" element={
          <ProtectedRoute requiredRole="DONOR">
            <ImpactReport />
          </ProtectedRoute>
        } />
        <Route path="/donor/voting" element={
          <ProtectedRoute requiredRole="DONOR">
            <VolunteerVoting />
          </ProtectedRoute>
        } />
        <Route path="/donor/verify" element={
          <Navigate to="/donor/voting" replace />
        } />
        <Route path="/donor/report-disaster" element={
          <ProtectedRoute requiredRole="DONOR">
            <ReportDisaster />
          </ProtectedRoute>
        } />
        
        {/* NGO Routes */}
        <Route path="/ngo" element={
          <ProtectedRoute requiredRole="NGO">
            <NGODashboard />
          </ProtectedRoute>
        } />
        <Route path="/ngo/create-campaign" element={
          <ProtectedRoute requiredRole="NGO">
            <CreateCampaign />
          </ProtectedRoute>
        } />
        <Route path="/ngo/campaigns" element={
          <ProtectedRoute requiredRole="NGO">
            <NGOCampaigns />
          </ProtectedRoute>
        } />
        <Route path="/ngo/campaigns/:campaignId" element={
          <ProtectedRoute requiredRole="NGO">
            <CampaignManagement />
          </ProtectedRoute>
        } />
        <Route path="/ngo/campaigns/:campaignId/edit" element={
          <ProtectedRoute requiredRole="NGO">
            <EditCampaign />
          </ProtectedRoute>
        } />
        <Route path="/ngo/profile" element={
          <ProtectedRoute requiredRole="NGO">
            <NGOProfile />
          </ProtectedRoute>
        } />
        <Route path="/ngo/analytics" element={
          <ProtectedRoute requiredRole="NGO">
            <NGOAnalytics />
          </ProtectedRoute>
        } />
        <Route path="/ngo/disasters/report" element={
          <ProtectedRoute requiredRole="NGO">
            <NGOReportDisaster />
          </ProtectedRoute>
        } />
        <Route path="/ngo/milestones" element={
          <ProtectedRoute requiredRole="NGO">
            <NGOMilestones />
          </ProtectedRoute>
        } />
        <Route path="/ngo/donations" element={
          <ProtectedRoute requiredRole="NGO">
            <NGODonations />
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminUsers />
          </ProtectedRoute>
        } />
        <Route path="/admin/disasters" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminDisasters />
          </ProtectedRoute>
        } />
        <Route path="/admin/logs" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminLogs />
          </ProtectedRoute>
        } />
        <Route path="/admin/campaigns" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminCampaigns />
          </ProtectedRoute>
        } />
      </Routes>
      
      <AuthForm 
        isOpen={isAuthFormOpen}
        onClose={closeModals}
        initialMode={authFormMode}
      />
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

