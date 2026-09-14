export function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-violet-600" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
        <span aria-hidden="true">✦</span>
      </div>
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {message && <p className="max-w-sm text-sm text-slate-500">{message}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="mx-auto flex w-full max-w-md flex-col items-center gap-3 rounded-2xl bg-red-50 px-6 py-10 text-center ring-1 ring-red-200"
    >
      <p className="text-sm font-semibold text-red-700">Something went wrong</p>
      <p className="text-sm text-red-600/80">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
        >
          Try again
        </button>
      )}
    </div>
  );
}