import { useState } from 'react';
import { TASK_STATUSES } from '../constants/taskStatuses';

export default function TaskForm({ onAdd, isSubmitting }) {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState(TASK_STATUSES[0]);
  const [validationMessage, setValidationMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setValidationMessage('Enter a task title.');
      return;
    }

    setValidationMessage('');
    const wasAdded = await onAdd(trimmedTitle, status);

    if (wasAdded) {
      setTitle('');
      setStatus(TASK_STATUSES[0]);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">Add a task</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Start it in To Do or choose its current stage.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="min-w-0 flex-1">
            <label
              htmlFor="task-title"
              className="block text-xs font-semibold uppercase tracking-wide text-slate-600"
            >
              Task title
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setValidationMessage('');
              }}
              placeholder="e.g. Draft the project brief"
              maxLength={255}
              disabled={isSubmitting}
              aria-invalid={Boolean(validationMessage)}
              aria-describedby={
                validationMessage ? 'task-title-error' : undefined
              }
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          <div className="md:w-44">
            <label
              htmlFor="task-status"
              className="block text-xs font-semibold uppercase tracking-wide text-slate-600"
            >
              Status
            </label>
            <select
              id="task-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              disabled={isSubmitting}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
            >
              {TASK_STATUSES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-400 md:w-auto"
          >
            {isSubmitting ? 'Adding…' : 'Add Task'}
          </button>
        </div>

        {validationMessage && (
          <p
            id="task-title-error"
            role="alert"
            className="mt-2 text-xs font-medium text-rose-600"
          >
            {validationMessage}
          </p>
        )}
      </form>
    </section>
  );
}
