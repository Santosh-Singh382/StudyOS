import Badge from '../Badge';
import { SESSION_MODES, SESSION_MODE_HEX } from '../../utils/constants';
import { formatStudyTime, sessionWhenLabel } from '../../utils/format';

const MODE_LABELS = Object.fromEntries(SESSION_MODES.map((m) => [m.value, m.label]));

export default function SessionRow({ session, showDate = false }) {
  const { subject, mode, status } = session;
  const modeLabel = MODE_LABELS[mode] || mode;
  const modeColor = SESSION_MODE_HEX[mode] || '#64748b';
  const durationSeconds = session.totalSeconds || session.durationSeconds || 0;
  const cancelled = status === 'CANCELLED';

  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        {subject?.color ? (
          <span
            className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
            style={{ backgroundColor: subject.color }}
            aria-hidden="true"
          />
        ) : (
          <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-slate-300" aria-hidden="true" />
        )}
        <div className="min-w-0">
          <p className={`truncate text-sm font-semibold ${cancelled ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
            {subject?.name || 'General'}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <Badge label={modeLabel} color={modeColor} />
            {cancelled && <Badge label="Cancelled" color="#64748b" />}
          </div>
        </div>
      </div>
      <div className="flex flex-shrink-0 flex-col items-end gap-0.5">
        <span className="text-sm font-medium tabular-nums text-slate-700">
          {formatStudyTime(durationSeconds)}
        </span>
        <span className="text-xs text-slate-400">
          {session.startedAt && sessionWhenLabel(session.startedAt)}
        </span>
      </div>
    </li>
  );
}