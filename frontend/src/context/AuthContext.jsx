import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthFormOpen, setIsAuthFormOpen] = useState(false);
  const [authFormMode, setAuthFormMode] = useState('signin');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      // Backend returns: { success, message, data: { user: {...} } }
      // So we need response.data.user
      const userData = response.data?.user || response.user || response.data || response;
      console.log('User profile fetched:', userData); // Debug log
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    localStorage.setItem('token', response.data.token);
    // Set user immediately from login response
    if (response.data?.user) {
      setUser(response.data.user);
    }
    // Also fetch full profile to ensure we have all data
    await fetchUserProfile();
    return response;
  };

  const register = async (userData) => {
    const response = await authAPI.register(userData);
    localStorage.setItem('token', response.data.token);
    await fetchUserProfile();
    return response;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const openLoginModal = () => {
    setIsAuthFormOpen(true);
    setAuthFormMode('signin');
  };

  const openRegisterModal = () => {
    setIsAuthFormOpen(true);
    setAuthFormMode('signup');
  };

  const closeModals = () => {
    setIsAuthFormOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthFormOpen,
        authFormMode,
        user,
        loading,
        login,
        register,
        logout,
        openLoginModal,
        openRegisterModal,
        closeModals,
        setIsAuthFormOpen,
        setAuthFormMode,
        fetchUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

