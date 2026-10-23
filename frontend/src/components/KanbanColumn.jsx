import TaskCard from './TaskCard';

const COLUMN_STYLES = {
  'To Do': {
    panel: 'border-slate-200 bg-slate-50',
    dot: 'bg-slate-400',
    count: 'bg-white text-slate-600 ring-slate-200',
    empty: 'border-slate-200 text-slate-400',
  },
  'In Progress': {
    panel: 'border-blue-100 bg-blue-50/60',
    dot: 'bg-blue-500',
    count: 'bg-white text-blue-700 ring-blue-100',
    empty: 'border-blue-200 text-blue-400',
  },
  Done: {
    panel: 'border-emerald-100 bg-emerald-50/60',
    dot: 'bg-emerald-500',
    count: 'bg-white text-emerald-700 ring-emerald-100',
    empty: 'border-emerald-200 text-emerald-500/70',
  },
};

export default function KanbanColumn({
  status,
  tasks,
  pendingTaskIds,
  onMove,
  onDelete,
}) {
  const styles = COLUMN_STYLES[status];
  const headingId = `column-${status.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <section
      aria-labelledby={headingId}
      className={`flex min-h-72 flex-col rounded-2xl border p-3.5 ${styles.panel}`}
    >
      <header className="flex items-center justify-between gap-3 px-1 pb-3">
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${styles.dot}`}
            aria-hidden="true"
          />
          <h2
            id={headingId}
            className="text-sm font-semibold text-slate-800"
          >
            {status}
          </h2>
        </div>
        <span
          className={`inline-flex min-w-7 items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${styles.count}`}
          aria-label={`${tasks.length} ${
            tasks.length === 1 ? 'task' : 'tasks'
          }`}
        >
          {tasks.length}
        </span>
      </header>

      <div className="flex flex-1 flex-col gap-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            isPending={pendingTaskIds.has(task.id)}
            onMove={onMove}
            onDelete={onDelete}
          />
        ))}

        {tasks.length === 0 && (
          <div
            className={`flex min-h-28 flex-1 items-center justify-center rounded-xl border border-dashed px-4 py-8 text-center text-sm ${styles.empty}`}
          >
            No tasks here yet.
          </div>
        )}
      </div>
    </section>
  );
}
