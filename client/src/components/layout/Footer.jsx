import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';

const Footer = () => {
  return (
    <footer className="border-t border-ink-300/60 bg-paper-100 dark:border-dark-700 dark:bg-dark-900">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="font-display text-sm font-bold text-ink dark:text-paper-100">
              N<span className="text-brand">Jobs</span>
            </span>
          </div>
          <p className="text-xs text-ink-400 dark:text-ink-300">
            © {new Date().getFullYear()} NJobs. Built for portfolio demonstration purposes.
          </p>
          <div className="flex gap-5 text-xs text-ink-500 dark:text-ink-300">
            <Link to="/jobs" className="hover:text-brand">Find Jobs</Link>
            <Link to="/register" className="hover:text-brand">For Employers</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
