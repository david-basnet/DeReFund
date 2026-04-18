import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import { useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';

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
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();

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
    try {
      const response = await authAPI.login(credentials);
      localStorage.setItem('token', response.data.token);
      
      // Get user from response
      const userData = response.data?.user || response.user || response.data;
      setUser(userData);
      
      // Auto-connect wallet on login
      setTimeout(() => {
        open();
      }, 500);

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      localStorage.setItem('token', response.data.token);
      
      const userFromResponse = response.data?.user || response.user || response.data;
      setUser(userFromResponse);
      
      // Auto-connect wallet on register
      setTimeout(() => {
        open();
      }, 500);

      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // Terminate wallet connection on logout
    disconnect();
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

