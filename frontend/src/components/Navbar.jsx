import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { assets } from '../assets/assets';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, openLoginModal } = useAuth();

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-outline-variant/30 bg-surface/90 backdrop-blur-xl shadow-sm">
      <div className="flex justify-between items-center px-6 py-4 max-w-screen-2xl mx-auto">
        {/* Left: Logo + primary nav */}
        <div className="flex items-center gap-8">
          {/* Use <Link>, not <button> — buttons get UA / theme background even when "transparent" */}
          <Link
            to="/"
            className="inline-flex max-w-[min(320px,46vw)] shrink-0 items-center border-0 bg-transparent p-0 shadow-none outline-none ring-0 transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <img
              src={assets.logo}
              alt="DeReFund"
              className="block h-12 w-auto max-h-20 object-contain object-left sm:h-14 md:h-16"
              width={320}
              height={80}
              decoding="async"
            />
          </Link>

          <div className="hidden md:flex gap-6 items-center">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors pb-1 ${
                isActive('/')
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Home
            </Link>
            <Link
              to="/campaigns"
              className={`text-sm font-medium transition-colors pb-1 ${
                isActive('/campaigns')
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Live Campaigns
            </Link>
            <Link
              to="/disasters"
              className={`text-sm font-medium transition-colors border-b-2 border-transparent pb-1 ${
                isActive('/disasters')
                  ? 'text-primary border-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Disasters
            </Link>
            {user && user.role !== 'NGO' && (
              <Link
                to="/volunteer/voting"
                className={`text-sm font-medium transition-colors border-b-2 border-transparent pb-1 ${
                  isActive('/volunteer/voting')
                    ? 'text-primary border-primary'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                Volunteer Voting
              </Link>
            )}
            <Link
              to="/about"
              className={`text-sm font-medium transition-colors border-b-2 border-transparent pb-1 ${
                isActive('/about')
                  ? 'text-primary border-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              About Us
            </Link>
          </div>
        </div>

        {/* Right: search + actions — shared h-10 + min-width so CTAs align */}
        <div className="flex items-center gap-3">
          <div
            className="mr-1 block min-w-[120px] max-w-[min(200px,26vw)] sm:min-w-[220px] sm:max-w-[min(280px,28vw)]"
            role="search"
          >
            <div className="flex h-10 w-full items-center gap-2 rounded-lg border border-outline-variant/50 bg-surface-container-high px-3 shadow-sm transition-colors focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/15">
              <input
                type="text"
                name="nav-search"
                enterKeyHint="search"
                autoComplete="off"
                placeholder="Search relief efforts..."
                className="nav-search-input min-w-0 flex-1 border-0 bg-transparent py-0 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-0"
                aria-label="Search relief efforts"
              />
              <Search className="pointer-events-none h-[18px] w-[18px] shrink-0 text-primary" strokeWidth={2.25} aria-hidden />
            </div>
          </div>

          {user ? (
            <button
              type="button"
              onClick={() =>
                navigate(
                  user.role === 'NGO'
                    ? '/ngo'
                    : user.role === 'ADMIN'
                    ? '/admin'
                    : '/donor',
                )
              }
              className="hidden lg:inline-flex h-10 min-w-34 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-highest px-4 text-sm font-semibold text-on-surface-variant shadow-sm transition hover:bg-surface-dim active:scale-[0.98]"
            >
              Dashboard
            </button>
          ) : (
            <button
              type="button"
              onClick={openLoginModal}
              className="hidden lg:inline-flex h-10 min-w-34 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-highest px-4 text-sm font-semibold text-on-surface-variant shadow-sm transition hover:bg-surface-dim active:scale-[0.98]"
            >
              Sign In
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate('/campaigns')}
            className="primary-gradient inline-flex h-10 min-w-34 items-center justify-center rounded-lg px-4 text-sm font-semibold text-white shadow-md transition active:scale-[0.98]"
          >
            Donate Now
          </button>

          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-on-surface-variant transition hover:bg-surface-container-high hover:text-primary"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
          </button>
        </div>
      </div>
      <div className="h-px w-full bg-outline-variant/40" />
    </nav>
  );
};

export default Navbar;
