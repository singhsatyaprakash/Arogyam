import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, Pencil, X, Calendar, RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'doctorconnect:doctor:todos:v1';

function isoDate(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function toIso(val) {
  // Accept Date or string
  if (val instanceof Date) return isoDate(val);
  if (typeof val === 'string') return val;
  return isoDate();
}
function uid() {
  if (typeof crypto !== 'undefined' && crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const TodoList = ({ value, onChange }) => {
  const today = useMemo(() => isoDate(), []);
  // shared/controlled date support
  const [viewDate, setViewDate] = useState(value ? toIso(value) : today);
  useEffect(() => {
    if (value) setViewDate(toIso(value));
  }, [value]);
  const setDate = (next) => {
    const iso = toIso(next);
    setViewDate(iso);
    onChange?.(iso);
  };

  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [text, setText] = useState('');
  const [moveId, setMoveId] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore quota / private mode
    }
  }, [items]);

  const list = useMemo(
    () =>
      items
        .filter((i) => i.date === viewDate)
        .sort((a, b) => {
          // Incomplete first, then by createdAt
          if (a.completed && !b.completed) return 1;
          if (!a.completed && b.completed) return -1;
          return (a.createdAt ?? 0) - (b.createdAt ?? 0);
        }),
    [items, viewDate]
  );

  const completedCount = useMemo(() => list.filter((i) => i.completed).length, [list]);
  const totalCount = list.length;
  const progressPct = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  const addItem = () => {
    const value = text.trim();
    if (!value) return;

    setItems((prev) => [
      ...prev,
      { id: uid(), date: viewDate, text: value.slice(0, 180), completed: false, createdAt: Date.now() },
    ]);
    setText('');
    inputRef.current?.focus();
  };
  const toggle = (id) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i)));
  };
  const remove = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };
  const startEdit = (id) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, editing: true } : { ...i, editing: false })));
  };
  const cancelEdit = (id) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, editing: false } : i)));
  };
  const commitEdit = (id, nextText) => {
    const value = (nextText ?? '').trim().slice(0, 180);
    if (!value) return;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, text: value, editing: false } : i)));
  };
  const clearCompleted = () => {
    setItems((prev) => prev.filter((i) => !(i.date === viewDate && i.completed)));
  };
  const clearAll = () => {
    // remove all tasks for the current date
    setItems((prev) => prev.filter((i) => i.date !== viewDate));
  };
  const carryForward = () => {
    // copy incomplete tasks to tomorrow and switch view
    const next = isoDate(new Date(new Date(viewDate).getTime() + 24 * 60 * 60 * 1000));
    setItems((prev) => {
      const clones = prev
        .filter((i) => i.date === viewDate && !i.completed)
        .map((i) => ({ ...i, id: uid(), date: next, completed: false, createdAt: Date.now() }));
      return [...prev, ...clones];
    });
    setDate(next);
  };
  const resetToToday = () => setDate(today);

  return (
    <section className="bg-white border shadow-sm rounded-2xl">
      <header className="p-5 sm:p-6 border-b">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Today’s Todo</h2>
            <p className="text-sm text-gray-500">Keep a focused list for the day. Saved locally on this device.</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                aria-label="Select date"
                type="date"
                value={viewDate}
                onChange={(e) => setDate(e.target.value)}
                className="pl-9 pr-3 py-2 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <button
              type="button"
              onClick={resetToToday}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-xl border hover:bg-gray-50"
              title="Jump to today"
            >
              <RotateCcw className="w-4 h-4" />
              Today
            </button>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 transition-[width] duration-300"
              style={{ width: `${progressPct}%` }}
              aria-hidden="true"
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>
              {completedCount}/{totalCount} completed
            </span>
            <span>{progressPct}%</span>
          </div>
        </div>
      </header>

      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* input row */}
          <div className="flex-1">
            <label className="sr-only" htmlFor="todo-input">
              Add a task
            </label>
            <input
              id="todo-input"
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addItem();
              }}
              placeholder="Add a task for today…"
              className="w-full px-4 py-3 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="mt-2 text-xs text-gray-500">Tip: Press Enter to add. Click the pencil to edit.</p>
          </div>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 active:bg-red-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        <div className="mt-5 space-y-2">
          {list.length === 0 ? (
            <div className="rounded-xl border bg-gray-50 p-5 text-sm text-gray-600">
              No tasks for this date. Add one above.
            </div>
          ) : (
            list.map((item) => (
              <div key={item.id} className="group flex items-start gap-3 p-3 rounded-xl border hover:bg-gray-50 transition">
                {/* toggle */}
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className="mt-0.5 text-gray-500 hover:text-gray-700"
                  aria-label={item.completed ? 'Mark as not completed' : 'Mark as completed'}
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  {item.editing ? (
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        defaultValue={item.text}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitEdit(item.id, e.currentTarget.value);
                          if (e.key === 'Escape') cancelEdit(item.id);
                        }}
                        className="w-full px-3 py-2 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <button
                        type="button"
                        onClick={() => cancelEdit(item.id)}
                        className="p-2 rounded-lg border hover:bg-gray-50"
                        aria-label="Cancel edit"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <p className={`text-sm break-words ${item.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                      {item.text}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                  {!item.editing && (
                    <button
                      type="button"
                      onClick={() => startEdit(item.id)}
                      className="p-2 rounded-lg border hover:bg-gray-50"
                      aria-label="Edit task"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setMoveId(item.id)}
                    className="p-2 rounded-lg border hover:bg-gray-50"
                    aria-label="Reschedule task"
                    title="Move to another date"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                  {moveId === item.id && (
                    <input
                      type="date"
                      className="ml-1 px-2 py-1 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      defaultValue={viewDate}
                      onChange={(e) => {
                        const next = e.target.value;
                        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, date: next } : i)));
                        setMoveId(null);
                      }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="p-2 rounded-lg border hover:bg-gray-50"
                    aria-label="Delete task"
                  >
                    <Trash2 className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={carryForward}
              disabled={list.filter((i) => !i.completed).length === 0}
              className="inline-flex items-center justify-center px-3 py-2 text-sm rounded-xl border hover:bg-gray-50 disabled:opacity-50"
              title="Copy incomplete to tomorrow"
            >
              Carry forward
            </button>
            <button
              type="button"
              onClick={clearAll}
              disabled={list.length === 0}
              className="inline-flex items-center justify-center px-3 py-2 text-sm rounded-xl border hover:bg-gray-50 disabled:opacity-50"
              title="Remove all tasks for this date"
            >
              Clear all
            </button>
          </div>
          <button
            type="button"
            onClick={clearCompleted}
            disabled={completedCount === 0}
            className="inline-flex items-center justify-center px-4 py-2 text-sm rounded-xl border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear completed
          </button>
        </div>
      </div>
    </section>
  );
};

export default TodoList;