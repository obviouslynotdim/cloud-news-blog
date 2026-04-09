export function PaginationControls({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
      <button
        className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-bold text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        Previous
      </button>
      <p className="text-sm font-semibold text-zinc-600">
        Page {page} of {totalPages}
      </p>
      <button
        className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-bold text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next
      </button>
    </div>
  );
}
