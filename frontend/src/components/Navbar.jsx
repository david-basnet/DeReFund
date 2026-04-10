import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, openLoginModal } = useAuth();

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm">
      <div className="flex justify-between items-center px-6 py-4 max-w-screen-2xl mx-auto">
        {/* Left: Logo + primary nav */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate('/')}
            className="text-2xl font-black tracking-tighter text-blue-700 dark:text-blue-400"
          >
            DeReFund
          </button>

          <div className="hidden md:flex gap-6 items-center">
            <Link
              to="/campaigns"
              className={`font-sans text-sm font-medium transition-colors pb-1 ${
                isActive('/campaigns')
                  ? 'text-blue-700 dark:text-blue-400 border-b-2 border-blue-700 dark:border-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
              }`}
            >
              Browse
            </Link>
            <Link
              to="/disasters"
              className={`font-sans text-sm font-medium transition-colors ${
                isActive('/disasters')
                  ? 'text-blue-700 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
              }`}
            >
              Disasters
            </Link>
            <Link
              to="/about"
              className={`font-sans text-sm font-medium transition-colors ${
                isActive('/about')
                  ? 'text-blue-700 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
              }`}
            >
              About Us
            </Link>
          </div>
        </div>

        {/* Right: search + actions */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center bg-surface-container-high px-3 py-1.5 rounded-lg mr-2">
            <span className="material-symbols-outlined text-outline text-sm mr-2">search</span>
            <input
              type="text"
              placeholder="Search relief efforts..."
              className="bg-transparent border-none focus:ring-0 text-sm w-48 placeholder-slate-400"
            />
          </div>

          {user ? (
            <button
              onClick={() =>
                navigate(
                  user.role === 'NGO'
                    ? '/ngo'
                    : user.role === 'ADMIN'
                    ? '/admin'
                    : '/donor',
                )
              }
              className="hidden lg:block font-sans text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors px-4 py-2 rounded-md active:scale-95 duration-150"
            >
              Dashboard
            </button>
          ) : (
            <button
              onClick={openLoginModal}
              className="hidden lg:block font-sans text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors px-4 py-2 rounded-md active:scale-95 duration-150"
            >
              Sign In
            </button>
          )}

          <button
            onClick={() => navigate('/campaigns')}
            className="primary-gradient text-white px-5 py-2.5 rounded-md text-sm font-bold active:scale-95 duration-150 shadow-md"
          >
            Donate Now
          </button>

          <button className="p-2 text-slate-600">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </div>
      <div className="bg-slate-100 dark:bg-slate-800 h-px w-full" />
    </nav>
  );
};

export default Navbar;
