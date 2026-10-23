import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from './api/tasks';
import KanbanColumn from './components/KanbanColumn';
import TaskForm from './components/TaskForm';
import { TASK_STATUSES } from './constants/taskStatuses';

function LoadingBoard() {
  return (
    <div
      className="grid grid-cols-1 gap-5 md:grid-cols-3"
      aria-label="Loading tasks"
      aria-busy="true"
    >
      {TASK_STATUSES.map((status) => (
        <div
          key={status}
          className="rounded-2xl border border-slate-200 bg-white/70 p-4"
        >
          <div className="mb-4 h-4 w-24 animate-pulse rounded bg-slate-200" />
          <div className="space-y-3">
            <div className="h-24 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-24 animate-pulse rounded-xl bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [pendingTaskIds, setPendingTaskIds] = useState(() => new Set());
  const [error, setError] = useState('');

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const loadedTasks = await getTasks();
      setTasks(loadedTasks);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  function setTaskPending(taskId, isPending) {
    setPendingTaskIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (isPending) {
        nextIds.add(taskId);
      } else {
        nextIds.delete(taskId);
      }

      return nextIds;
    });
  }

  async function handleAddTask(title, status) {
    setIsCreating(true);
    setError('');

    try {
      const newTask = await createTask({ title, status });
      setTasks((currentTasks) => [...currentTasks, newTask]);
      return true;
    } catch (requestError) {
      setError(requestError.message);
      return false;
    } finally {
      setIsCreating(false);
    }
  }

  async function handleMoveTask(task, direction) {
    const currentIndex = TASK_STATUSES.indexOf(task.status);
    const nextStatus = TASK_STATUSES[currentIndex + direction];

    if (!nextStatus) {
      return;
    }

    setTaskPending(task.id, true);
    setError('');

    try {
      const updatedTask = await updateTask(task.id, { status: nextStatus });
      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === updatedTask.id ? updatedTask : currentTask,
        ),
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setTaskPending(task.id, false);
    }
  }

  async function handleDeleteTask(task) {
    if (!window.confirm(`Delete "${task.title}"?`)) {
      return;
    }

    setTaskPending(task.id, true);
    setError('');

    try {
      await deleteTask(task.id);
      setTasks((currentTasks) =>
        currentTasks.filter((currentTask) => currentTask.id !== task.id),
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setTaskPending(task.id, false);
    }
  }

  const tasksByStatus = useMemo(() => {
    const groupedTasks = Object.fromEntries(
      TASK_STATUSES.map((status) => [status, []]),
    );

    for (const task of tasks) {
      if (groupedTasks[task.status]) {
        groupedTasks[task.status].push(task);
      }
    }

    return groupedTasks;
  }, [tasks]);

  const isMutating = isCreating || pendingTaskIds.size > 0;

  return (
    <div className="min-h-screen bg-slate-100">
      <div
        className="h-1.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500"
        aria-hidden="true"
      />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
              Task Board
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Kanban Board
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
              Keep work moving from To Do to Done, one simple step at a time.
            </p>
          </div>

          <button
            type="button"
            onClick={loadTasks}
            disabled={isLoading || isMutating}
            className="inline-flex items-center justify-center self-start rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
          >
            Refresh
          </button>
        </header>

        <TaskForm onAdd={handleAddTask} isSubmitting={isCreating} />

        {error && (
          <div
            role="alert"
            className="mt-5 flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between"
          >
            <p>{error}</p>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={loadTasks}
                className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-sm ring-1 ring-inset ring-rose-200 transition hover:bg-rose-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={() => setError('')}
                className="rounded-md px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="mt-6">
          {isLoading ? (
            <LoadingBoard />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {TASK_STATUSES.map((status) => (
                <KanbanColumn
                  key={status}
                  status={status}
                  tasks={tasksByStatus[status]}
                  pendingTaskIds={pendingTaskIds}
                  onMove={handleMoveTask}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          )}
        </div>

        <footer className="mt-8 text-center text-xs text-slate-400">
          React · Express · PostgreSQL
        </footer>
      </main>
    </div>
  );
}
