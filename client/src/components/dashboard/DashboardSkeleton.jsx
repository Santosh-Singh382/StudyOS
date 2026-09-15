export default function DashboardSkeleton() {
  const pulse = 'animate-pulse rounded-xl bg-slate-100';
  return (
    <div className="mt-6 space-y-6" aria-hidden="true">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className={`${pulse} h-28`} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className={`${pulse} h-44 lg:col-span-2`} />
        <div className={`${pulse} h-44`} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className={`${pulse} h-32`} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className={`${pulse} h-72 lg:col-span-2`} />
        <div className={`${pulse} h-72`} />
      </div>
      <div className={`${pulse} h-40`} />
    </div>
  );
}