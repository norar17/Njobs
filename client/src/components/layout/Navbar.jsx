import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, X, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import BrandLogo from '../ui/Logo';

const dashboardPathFor = (role) => {
  if (role === 'employer') return '/employer/dashboard';
  if (role === 'admin') return '/admin/dashboard';
  return '/applicant/dashboard';
};

const Logo = () => (
  <Link to="/" className="flex items-center gap-2">
    <BrandLogo />
    <span className="font-display text-[17px] font-bold text-ink dark:text-paper-100">
      N<span className="text-brand">Jobs</span>
    </span>
  </Link>
);

const Navbar = () => {
  const { user, logout, isApplicant, isEmployer, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink-300/60 bg-paper/90 backdrop-blur-md dark:border-dark-700 dark:bg-dark-950/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">
            <NavLink
              to="/jobs"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? 'text-brand' : 'text-ink-500 hover:text-ink dark:text-ink-300 dark:hover:text-paper-100'}`
              }
            >
              Find Jobs
            </NavLink>
            {isEmployer && (
              <NavLink
                to="/employer/jobs/new"
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${isActive ? 'text-brand' : 'text-ink-500 hover:text-ink dark:text-ink-300 dark:hover:text-paper-100'}`
                }
              >
                Post a Job
              </NavLink>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="rounded-xl border border-ink-300 bg-paper-100 p-2.5 text-ink-500 transition-colors hover:bg-paper-200 dark:border-dark-600 dark:bg-dark-800 dark:text-ink-300 dark:hover:bg-dark-700"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>

          {user ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-xl border border-ink-300 bg-paper-100 px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper-200 dark:border-dark-600 dark:bg-dark-800 dark:text-paper-100 dark:hover:bg-dark-700"
              >
                <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-brand/15 text-xs font-semibold text-brand-500">
                  {user.avatar?.url ? (
                    <img src={user.avatar.url} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    user.name?.charAt(0).toUpperCase()
                  )}
                </div>
                {user.name?.split(' ')[0]}
                <ChevronDown className="h-3.5 w-3.5 text-ink-400" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-ink-300/60 bg-paper-100 p-1.5 shadow-card-hover dark:border-dark-700 dark:bg-dark-850">
                    <Link
                      to={dashboardPathFor(user.role)}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-paper-200 dark:text-paper-100 dark:hover:bg-dark-800"
                    >
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-status-rejected hover:bg-status-rejected/10"
                    >
                      <LogOut className="h-4 w-4" /> Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link to="/login" className="btn-ghost">
                Log in
              </Link>
              <Link to="/register" className="btn-primary">
                Sign up
              </Link>
            </div>
          )}

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="rounded-xl border border-ink-300 bg-paper-100 p-2.5 text-ink-500 md:hidden dark:border-dark-600 dark:bg-dark-800 dark:text-ink-300"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-ink-300/60 bg-paper px-4 py-4 md:hidden dark:border-dark-700 dark:bg-dark-950">
          <nav className="flex flex-col gap-1">
            <Link to="/jobs" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-paper-200 dark:text-paper-100 dark:hover:bg-dark-800">
              Find Jobs
            </Link>
            {isEmployer && (
              <Link to="/employer/jobs/new" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-paper-200 dark:text-paper-100 dark:hover:bg-dark-800">
                Post a Job
              </Link>
            )}
            {user ? (
              <>
                <Link to={dashboardPathFor(user.role)} onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-paper-200 dark:text-paper-100 dark:hover:bg-dark-800">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-status-rejected hover:bg-status-rejected/10">
                  Log out
                </button>
              </>
            ) : (
              <div className="mt-2 flex gap-2 px-3">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1">
                  Log in
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary flex-1">
                  Sign up
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
