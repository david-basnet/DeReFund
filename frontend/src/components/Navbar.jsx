import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const profileRef = useRef(null);
  const { openLoginModal, openRegisterModal, user, logout } = useAuth();
  
  const isNGOPage = location.pathname.startsWith('/ngo');
  const isDonorPage = location.pathname.startsWith('/donor');
  const isCampaignsPage = location.pathname.startsWith('/campaigns');
  const isDisastersPage = location.pathname.startsWith('/disasters');

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Handle navbar visibility on scroll
  useEffect(() => {
    let isMounted = true;
    
    const handleScroll = () => {
      if (!isMounted) return;
      
      try {
        const currentScrollY = window.scrollY;
        const lastScrollY = lastScrollYRef.current;
        
        if (currentScrollY < 10) {
          // Show navbar at top
          setIsVisible(true);
        } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
          // Hide navbar when scrolling down
          setIsVisible(false);
        } else if (currentScrollY < lastScrollY) {
          // Show navbar when scrolling up
          setIsVisible(true);
        }
        
        lastScrollYRef.current = currentScrollY;
      } catch (error) {
        // Silently handle any errors during scroll
        console.error('Scroll handler error:', error);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      isMounted = false;
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/');
  };

  const isActiveLink = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Navigation links for non-logged-in users
  const publicNavLinks = [
    { path: '/', label: 'Home' },
    { path: '/campaigns', label: 'Campaigns' },
    { path: '/disasters', label: 'Disasters' },
    { path: '/about', label: 'About' },
  ];

  // Navigation links for donors
  const donorNavLinks = [
    { path: '/donor', label: 'Dashboard' },
    { path: '/campaigns', label: 'Browse Campaigns' },
    { path: '/donor/donations', label: 'My Donations' },
    { path: '/donor/verify', label: 'Verify Campaigns' },
  ];

  // Navigation links for NGOs
  const ngoNavLinks = [
    { path: '/ngo', label: 'Dashboard' },
    { path: '/campaigns', label: 'Browse Campaigns' },
    { path: '/disasters', label: 'Disasters' },
  ];

  // Navigation links for Admins
  const adminNavLinks = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/disasters', label: 'Disasters' },
    { path: '/admin/campaigns', label: 'Campaigns' },
    { path: '/admin/logs', label: 'Logs' },
  ];

  const currentNavLinks = user 
    ? (user.role === 'ADMIN' ? adminNavLinks : user.role === 'NGO' ? ngoNavLinks : donorNavLinks)
    : publicNavLinks;

  return (
    <nav className={`bg-white shadow-md fixed top-0 left-0 right-0 z-50 border-b border-gray-100 transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 group"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="text-3xl font-bold bg-gradient-to-r from-purple to-light-purple bg-clip-text text-transparent group-hover:from-light-purple group-hover:to-purple transition-all font-playfair tracking-tight">
              DeReFund
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {currentNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-5 py-3 rounded-xl text-sm font-bold transition-all font-dmsans tracking-tight ${
                  isActiveLink(link.path)
                    ? 'text-purple bg-purple/10'
                    : 'text-dark-gray hover:text-purple hover:bg-light-gray'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Create Campaign Button - Only for NGOs */}
            {user?.role === 'NGO' && (
              <Link
                to="/ngo/create-campaign"
                className="ml-2 bg-gradient-to-r from-purple to-light-purple text-white px-5 py-3 rounded-xl hover-lift shadow-lg transition-all duration-300 font-bold text-sm font-dmsans tracking-tight"
              >
                + Create Campaign
              </Link>
            )}

            {/* User Profile or Join Us */}
            {user ? (
              <div className="relative ml-4" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 px-4 py-3 rounded-xl hover:bg-light-gray transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple to-light-purple flex items-center justify-center text-white text-sm font-bold shadow-md">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-bold text-dark-gray hidden xl:block font-dmsans tracking-tight">
                    {user.name || 'User'}
                  </span>
                  <svg
                    className={`w-4 h-4 text-dark-gray transition-transform ${
                      isProfileOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray/20 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray">
                      <p className="text-sm font-bold text-dark-green font-dmsans tracking-tight">{user.name}</p>
                      <p className="text-xs text-dark-gray truncate font-dmsans tracking-tight">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-bold rounded-full bg-purple/10 text-purple font-dmsans tracking-tight">
                        {user.role === 'NGO' ? 'NGO' : 'Donor/Volunteer'}
                      </span>
                    </div>
                    <Link
                      to={user.role === 'NGO' ? '/ngo/profile' : '/donor/profile'}
                      className="block px-4 py-2 text-sm text-dark-gray hover:bg-light-gray transition-colors font-dmsans tracking-tight"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    {user.role === 'DONOR' && (
                      <>
                        <Link
                          to="/donor/donations"
                          className="block px-4 py-2 text-sm text-dark-gray hover:bg-light-gray transition-colors font-dmsans tracking-tight"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          My Donations
                        </Link>
                        <Link
                          to="/donor/saved"
                          className="block px-4 py-2 text-sm text-dark-gray hover:bg-light-gray transition-colors font-dmsans tracking-tight"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          Saved Campaigns
                        </Link>
                        <Link
                          to="/donor/impact"
                          className="block px-4 py-2 text-sm text-dark-gray hover:bg-light-gray transition-colors font-dmsans tracking-tight"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          My Impact
                        </Link>
                      </>
                    )}
                    {user.role === 'NGO' && (
                      <Link
                        to="/ngo/analytics"
                        className="block px-4 py-2 text-sm text-dark-gray hover:bg-light-gray transition-colors font-dmsans tracking-tight"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Analytics
                      </Link>
                    )}
                    <div className="border-t border-gray mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-dmsans tracking-tight"
                      >
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="ml-4">
                <button
                  onClick={openLoginModal}
                  className="px-6 py-3 text-white rounded-xl hover-lift shadow-lg transition-all duration-300 font-bold text-sm font-dmsans tracking-tight"
                  style={{ backgroundColor: '#002455' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#050E3C'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#002455'}
                >
                  Join Us
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-dark-gray p-2 rounded-xl hover:bg-light-gray transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray animate-in slide-in-from-top-2">
            <div className="space-y-1">
              {currentNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-3 rounded-xl text-base font-bold transition-colors font-dmsans tracking-tight ${
                    isActiveLink(link.path)
                      ? 'text-purple bg-purple/10'
                      : 'text-dark-gray hover:text-purple hover:bg-light-gray'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {user?.role === 'NGO' && (
                <Link
                  to="/ngo/create-campaign"
                  className="block px-4 py-3 mt-2 bg-gradient-to-r from-purple to-light-purple text-white rounded-xl text-center font-bold hover-lift shadow-lg transition-all duration-300 font-dmsans tracking-tight"
                  onClick={() => setIsMenuOpen(false)}
                >
                  + Create Campaign
                </Link>
              )}

              {user ? (
                <div className="pt-4 mt-4 border-t border-gray">
                  <Link
                    to={user.role === 'NGO' ? '/ngo/profile' : '/donor/profile'}
                    className="block px-4 py-3 text-dark-gray hover:text-purple hover:bg-light-gray rounded-xl transition-colors font-dmsans tracking-tight"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-dmsans tracking-tight"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="pt-4 mt-4 border-t border-gray">
                  <button
                    onClick={() => {
                      openLoginModal();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full px-4 py-3 text-center text-white rounded-xl hover-lift shadow-lg transition-all duration-300 font-bold font-dmsans tracking-tight"
                    style={{ backgroundColor: '#002455' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#050E3C'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#002455'}
                  >
                    Join Us
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
