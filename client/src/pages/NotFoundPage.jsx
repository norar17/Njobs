import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout';

const NotFoundPage = () => {
  return (
    <PublicLayout>
      <div className="flex flex-col items-center justify-center px-6 py-32 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-ink-300 bg-paper-100 dark:border-dark-700 dark:bg-dark-850">
          <Compass className="h-7 w-7 text-ink-400" />
        </div>
        <h1 className="font-display text-3xl font-semibold text-ink dark:text-paper-100">Page not found</h1>
        <p className="mt-2 max-w-sm text-sm text-ink-500 dark:text-ink-300">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <Link to="/" className="btn-primary mt-6">Back to home</Link>
      </div>
    </PublicLayout>
  );
};

export default NotFoundPage;
