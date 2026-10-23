import { TASK_STATUSES } from '../constants/taskStatuses';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const buttonBase =
  'inline-flex items-center justify-center rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40';

export default function TaskCard({ task, isPending, onMove, onDelete }) {
  const statusIndex = TASK_STATUSES.indexOf(task.status);
  const canMoveLeft = statusIndex > 0;
  const canMoveRight =
    statusIndex >= 0 && statusIndex < TASK_STATUSES.length - 1;
  const createdAt = new Date(task.created_at);
  const hasValidCreatedAt = !Number.isNaN(createdAt.getTime());

  return (
    <article
      aria-busy={isPending}
      className={`rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:shadow-md ${
        isPending ? 'opacity-60' : ''
      }`}
    >
      <h3 className="break-words text-sm font-semibold leading-6 text-slate-900">
        {task.title}
      </h3>

      {hasValidCreatedAt && (
        <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
          Added{' '}
          <time dateTime={task.created_at} title={createdAt.toLocaleString()}>
            {dateFormatter.format(createdAt)}
          </time>
        </p>
      )}

      <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => onMove(task, -1)}
            disabled={isPending || !canMoveLeft}
            className={`${buttonBase} border-slate-200 bg-white text-slate-600 hover:bg-slate-50`}
          >
            <span aria-hidden="true" className="mr-1">
              ←
            </span>
            Move Left
          </button>
          <button
            type="button"
            onClick={() => onMove(task, 1)}
            disabled={isPending || !canMoveRight}
            className={`${buttonBase} border-slate-200 bg-white text-slate-600 hover:bg-slate-50`}
          >
            Move Right
            <span aria-hidden="true" className="ml-1">
              →
            </span>
          </button>
        </div>
        <button
          type="button"
          onClick={() => onDelete(task)}
          disabled={isPending}
          className={`${buttonBase} w-full border-rose-100 bg-rose-50/50 text-rose-600 hover:bg-rose-50`}
        >
          Delete
        </button>
      </div>
    </article>
  );
}
