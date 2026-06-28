import { Menu, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const DashboardTopbar = ({ title, subtitle, onMenuClick, actions }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-ink-300/60 bg-paper/90 px-5 py-4 backdrop-blur-md dark:border-dark-700 dark:bg-dark-950/90 lg:px-8">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="rounded-lg p-2 text-ink-500 hover:bg-paper-200 dark:text-ink-300 dark:hover:bg-dark-800 lg:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-display text-lg font-semibold text-ink dark:text-paper-100 sm:text-xl">{title}</h1>
          {subtitle && <p className="text-sm text-ink-500 dark:text-ink-300">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <Link
          to="/jobs"
          className="hidden rounded-xl border border-ink-300 bg-paper-100 px-3 py-2.5 text-sm font-medium text-ink-500 transition-colors hover:bg-paper-200 dark:border-dark-600 dark:bg-dark-800 dark:text-ink-300 dark:hover:bg-dark-700 sm:inline-flex"
        >
          Browse jobs
        </Link>
        <button
          onClick={toggleTheme}
          className="rounded-xl border border-ink-300 bg-paper-100 p-2.5 text-ink-500 transition-colors hover:bg-paper-200 dark:border-dark-600 dark:bg-dark-800 dark:text-ink-300 dark:hover:bg-dark-700"
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </button>
      </div>
    </header>
  );
};

export default DashboardTopbar;
