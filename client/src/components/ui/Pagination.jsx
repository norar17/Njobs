import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ page, pages, total, limit, onPageChange }) => {
  if (pages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const maxVisible = 5;
  let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
  let endPage = Math.min(pages, startPage + maxVisible - 1);
  if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1);

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-ink-300/60 px-4 py-3.5 dark:border-dark-700 sm:flex-row">
      <p className="text-xs text-ink-400 dark:text-ink-300">
        Showing <span className="text-ink dark:text-paper-100">{start}–{end}</span> of{' '}
        <span className="text-ink dark:text-paper-100">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-paper-200 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-dark-800 dark:hover:text-paper-100"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-1.5">
          {pageNumbers.map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                p === page ? 'bg-brand text-white' : 'text-ink-500 hover:bg-paper-200 hover:text-ink dark:text-ink-300 dark:hover:bg-dark-800 dark:hover:text-paper-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-paper-200 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-dark-800 dark:hover:text-paper-100"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
