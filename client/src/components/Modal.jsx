import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => {
    if (!open) return undefined;

    function handleKey(event) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKey);
    document.body.classList.add('overflow-hidden');

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.classList.remove('overflow-hidden');
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${
          wide ? 'max-w-2xl' : 'max-w-md'
        } max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl`}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}