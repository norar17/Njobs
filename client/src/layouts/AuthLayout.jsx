import { Link } from 'react-router-dom';
import Logo from '../components/ui/Logo';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="flex min-h-screen bg-paper dark:bg-dark-950">
      <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden border-r border-ink-300/60 bg-dark-950 p-10 lg:flex dark:border-dark-700">
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand/25 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-gold/10 blur-3xl" aria-hidden="true" />

        <Link to="/" className="relative z-10 flex items-center gap-2.5">
          <Logo size="lg" />
          <span className="font-display text-[16px] font-bold text-paper-100">
            N<span className="text-brand-400">Jobs</span>
          </span>
        </Link>

        <div className="relative z-10 max-w-md">
          <h2 className="font-display text-3xl font-semibold leading-tight text-paper-100">
            Find work. Hire talent. Know who's worth it.
          </h2>
          <p className="mt-4 text-ink-300">
            NJobs connects applicants with real opportunities — and lets you rate the
            companies that hired you, so the next applicant knows what they're walking into.
          </p>

          <div className="mt-8 flex items-center gap-6 text-sm text-ink-300">
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-gold text-gold"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 19.771l-7.416 3.642 1.48-8.279L0 9.306l8.332-1.151z" /></svg>
              Honest reviews
            </div>
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none"><path d="M5 13l4 4L19 7" stroke="#159E92" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              One-click apply
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-ink-400">© {new Date().getFullYear()} NJobs.</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <Logo size="lg" />
            <span className="font-display text-[16px] font-bold text-ink dark:text-paper-100">
              N<span className="text-brand">Jobs</span>
            </span>
          </Link>

          <h1 className="font-display text-2xl font-semibold text-ink dark:text-paper-100">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-300">{subtitle}</p>}

          <div className="mt-7">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
