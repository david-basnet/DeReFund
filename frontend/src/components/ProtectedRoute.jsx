import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (requiredRole) {
    // Case-insensitive role comparison - handle various possible role field names
    const userRole = (user.role || user.user_role || user.userRole || '').toUpperCase();
    const requiredRoleUpper = requiredRole.toUpperCase();
    
    if (userRole !== requiredRoleUpper) {
      return <Navigate to="/" replace state={{ from: location }} />;
    }
  }

  return children;
};

export default ProtectedRoute;

