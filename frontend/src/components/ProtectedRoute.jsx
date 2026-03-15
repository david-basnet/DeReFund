import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole) {
    // Case-insensitive role comparison - handle various possible role field names
    const userRole = (user.role || user.user_role || user.userRole || '').toUpperCase();
    const requiredRoleUpper = requiredRole.toUpperCase();
    
    // Allow DONOR role to access donor routes (handle both DONOR and donor)
    if (userRole !== requiredRoleUpper) {
      // Special case: if required is DONOR and user role is empty/undefined but user exists, allow access
      // This handles cases where role might not be in the response
      if (requiredRoleUpper === 'DONOR' && !userRole && user) {
        // Allow access if user exists (they're logged in)
        return children;
      }
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

