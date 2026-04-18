import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Wallet, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { assets } from '../assets/assets';
import { useAccount, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, openLoginModal } = useAuth();
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const truncateAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-outline-variant/30 bg-surface/90 backdrop-blur-xl shadow-sm">
      <div className="flex justify-between items-center px-6 py-4 max-w-screen-2xl mx-auto">
        {/* Left: Logo + primary nav */}
        <div className="flex items-center gap-4 lg:gap-8">
          <Link
            to="/"
            className="inline-flex shrink-0 items-center border-0 bg-transparent p-0 shadow-none outline-none ring-0 transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <img
              src={assets.logo}
              alt="DeReFund"
              className="block h-10 w-auto sm:h-12 md:h-14"
              width={180}
              height={50}
              decoding="async"
            />
          </Link>

          <div className="hidden lg:flex gap-4 items-center">
            <Link
              to="/"
              className={`text-sm font-bold transition-colors px-3 py-1.5 rounded-lg border border-black ${
                isActive('/')
                  ? 'bg-black text-white'
                  : 'text-on-surface-variant hover:bg-black/5'
              }`}
            >
              Home
            </Link>
            <Link
              to="/campaigns"
              className={`text-sm font-bold transition-colors px-3 py-1.5 rounded-lg border border-black ${
                isActive('/campaigns')
                  ? 'bg-black text-white'
                  : 'text-on-surface-variant hover:bg-black/5'
              }`}
            >
              Campaigns
            </Link>
            <Link
              to="/disasters"
              className={`text-sm font-bold transition-colors px-3 py-1.5 rounded-lg border border-black ${
                isActive('/disasters')
                  ? 'bg-black text-white'
                  : 'text-on-surface-variant hover:bg-black/5'
              }`}
            >
              Disasters
            </Link>
            <Link
              to="/ledger"
              className={`text-sm font-bold transition-colors px-3 py-1.5 rounded-lg border border-black ${
                isActive('/ledger')
                  ? 'bg-black text-white'
                  : 'text-on-surface-variant hover:bg-black/5'
              }`}
            >
              Ledger
            </Link>
            {user && user.role !== 'NGO' && (
              <Link
                to="/volunteer/voting"
                className={`text-sm font-bold transition-colors px-3 py-1.5 rounded-lg border border-black ${
                  isActive('/volunteer/voting')
                    ? 'bg-black text-white'
                    : 'text-on-surface-variant hover:bg-black/5'
                }`}
              >
                Voting
              </Link>
            )}
            <Link
              to="/about"
              className={`text-sm font-bold transition-colors px-3 py-1.5 rounded-lg border border-black ${
                isActive('/about')
                  ? 'bg-black text-white'
                  : 'text-on-surface-variant hover:bg-black/5'
              }`}
            >
              About
            </Link>
          </div>
        </div>

        {/* Right: search + actions */}
        <div className="flex items-center gap-2 lg:gap-3">
          <div
            className={`mr-1 hidden sm:block transition-all duration-300 ${
              isConnected ? 'max-w-[140px] lg:max-w-[180px]' : 'max-w-[200px] lg:max-w-[260px]'
            }`}
            role="search"
          >
            <div className="flex h-9 w-full items-center gap-2 rounded-lg border border-black bg-surface-container-high px-3 shadow-sm transition-colors focus-within:ring-1 focus-within:ring-primary/15">
              <input
                type="text"
                name="nav-search"
                enterKeyHint="search"
                autoComplete="off"
                placeholder="Search..."
                className="nav-search-input min-w-0 flex-1 border-0 bg-transparent py-0 text-xs text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-0"
                aria-label="Search relief efforts"
              />
              <Search className="pointer-events-none h-4 w-4 shrink-0 text-primary" strokeWidth={2.25} aria-hidden />
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
              className="hidden lg:inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-black bg-surface-container-highest px-3 text-xs font-bold text-on-surface-variant shadow-sm transition hover:bg-surface-dim active:scale-[0.98]"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span className="hidden xl:inline">Dashboard</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={openLoginModal}
              className="hidden lg:inline-flex h-9 items-center justify-center rounded-lg border border-black bg-surface-container-highest px-4 text-xs font-bold text-on-surface-variant shadow-sm transition hover:bg-surface-dim active:scale-[0.98]"
            >
              Sign In
            </button>
          )}

          {/* Wallet Connection */}
          {isConnected ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="hidden lg:inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-black bg-primary/5 px-3 text-xs font-bold text-primary shadow-sm transition hover:bg-primary/10"
              >
                <Wallet className="h-3.5 w-3.5" />
                <span className="font-mono">{truncateAddress(address)}</span>
              </button>
              <button
                type="button"
                onClick={() => disconnect()}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black bg-surface-container-highest text-on-surface-variant transition hover:bg-error/10 hover:text-error"
                title="Disconnect Wallet"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => open()}
              className="hidden lg:inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-black bg-primary/5 px-3 text-xs font-bold text-primary shadow-sm transition hover:bg-primary/10 active:scale-[0.98]"
            >
              <Wallet className="h-3.5 w-3.5" />
              Connect
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate('/campaigns')}
            className="primary-gradient inline-flex h-9 items-center justify-center rounded-lg px-4 text-xs font-bold text-white shadow-md transition border border-black active:scale-[0.98]"
          >
            Donate
          </button>

          <button
            type="button"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-on-surface-variant transition border border-black hover:bg-surface-container-high hover:text-primary"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
        </div>
      </div>
      <div className="h-px w-full bg-outline-variant/40" />
    </nav>
  );
};

export default Navbar;
