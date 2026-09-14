import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-6xl font-bold text-slate-300">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-2 text-slate-500">The page you are looking for doesn't exist.</p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
      >
        Back to home
      </Link>
    </section>
  );
}