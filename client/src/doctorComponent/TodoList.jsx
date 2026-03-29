import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, Pencil, X, Calendar, RotateCcw, Clock, AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'doctorconnect:doctor:todos:v1';

function isoDate(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function toIso(val) {
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
  const [viewDate, setViewDate] = useState(value ? toIso(value) : today);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiTimeoutRef = useRef(null);
  const activeDate = value ? toIso(value) : viewDate;
  
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
  const [priority, setPriority] = useState('medium');
  const inputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (confettiTimeoutRef.current) {
        clearTimeout(confettiTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('Failed to persist todos:', err);
    }
  }, [items]);

  const list = useMemo(
    () =>
      items
        .filter((i) => i.date === activeDate)
        .sort((a, b) => {
          if (a.completed && !b.completed) return 1;
          if (!a.completed && b.completed) return -1;
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          const aPriority = priorityOrder[a.priority] ?? 1;
          const bPriority = priorityOrder[b.priority] ?? 1;
          if (aPriority !== bPriority) return aPriority - bPriority;
          return (a.createdAt ?? 0) - (b.createdAt ?? 0);
        }),
    [items, activeDate]
  );

  const completedCount = useMemo(() => list.filter((i) => i.completed).length, [list]);
  const totalCount = list.length;
  const progressPct = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  const triggerConfetti = () => {
    setShowConfetti(true);
    if (confettiTimeoutRef.current) {
      clearTimeout(confettiTimeoutRef.current);
    }
    confettiTimeoutRef.current = setTimeout(() => setShowConfetti(false), 3000);
  };

  const addItem = () => {
    const value = text.trim();
    if (!value) return;

    setItems((prev) => [
      ...prev,
      { id: uid(), date: viewDate, text: value.slice(0, 180), completed: false, createdAt: Date.now(), priority },
    ]);
    setText('');
    setPriority('medium');
    inputRef.current?.focus();
  };

  const toggle = (id) => {
    let shouldCelebrate = false;
    setItems((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i));
      const dayItems = next.filter((i) => i.date === activeDate);
      shouldCelebrate = dayItems.length > 0 && dayItems.every((i) => i.completed);
      return next;
    });
    if (shouldCelebrate) triggerConfetti();
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
    setItems((prev) => prev.filter((i) => !(i.date === activeDate && i.completed)));
  };

  const clearAll = () => {
    setItems((prev) => prev.filter((i) => i.date !== activeDate));
  };

  const carryForward = () => {
    const next = isoDate(new Date(new Date(activeDate).getTime() + 24 * 60 * 60 * 1000));
    setItems((prev) => {
      const clones = prev
        .filter((i) => i.date === activeDate && !i.completed)
        .map((i) => ({ ...i, id: uid(), date: next, completed: false, createdAt: Date.now() }));
      return [...prev, ...clones];
    });
    setDate(next);
  };

  const resetToToday = () => setDate(today);

  const getPriorityColor = (p) => {
    switch (p) {
      case 'high': return 'border-l-4 border-l-red-500 bg-red-50/50';
      case 'low': return 'border-l-4 border-l-blue-500 bg-blue-50/50';
      default: return 'border-l-4 border-l-yellow-500 bg-yellow-50/50';
    }
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'high': return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">High</span>;
      case 'low': return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">Low</span>;
      default: return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">Med</span>;
    }
  };

  const isToday = activeDate === today;
  const isPast = activeDate < today;
  const incompleteTasks = list.filter((i) => !i.completed).length;

  return (
    <section className="bg-gradient-to-br from-white via-white to-gray-50 border border-gray-200/80 shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden relative">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                left: `${(i * 17) % 100}%`,
                top: '-10px',
                backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'][i % 5],
                animationDelay: `${(i % 6) * 0.08}s`,
                animationDuration: `${2 + (i % 4) * 0.5}s`
              }}
            />
          ))}
        </div>
      )}

      <header className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-red-500 to-red-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent)]" />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2">
                <Clock className="w-6 h-6 sm:w-7 sm:h-7" />
                {isToday ? "Today's Tasks" : isPast ? "Past Tasks" : "Future Tasks"}
              </h2>
              <p className="text-sm text-red-100 mt-1">
                {isToday ? "Stay focused and productive" : "Plan ahead or review past work"}
              </p>
            </div>

            <div className="flex w-full sm:w-auto items-center gap-2 flex-wrap">
              <div className="relative flex-1 sm:flex-none sm:min-w-[190px]">
                <Calendar className="w-4 h-4 text-white/70 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  aria-label="Select date"
                  type="date"
                  value={activeDate}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border-2 border-white/20 bg-white/10 text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition"
                />
              </div>
              {!isToday && (
                <button
                  type="button"
                  onClick={resetToToday}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition font-medium w-full sm:w-auto"
                  title="Jump to today"
                >
                  <RotateCcw className="w-4 h-4" />
                  Today
                </button>
              )}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/90">
                {completedCount} of {totalCount} completed
              </span>
              <span className="text-sm font-bold">{progressPct}%</span>
            </div>
            <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="h-full bg-gradient-to-r from-white to-red-100 transition-all duration-500 ease-out shadow-lg"
                style={{ width: `${progressPct}%` }}
                aria-hidden="true"
              />
            </div>
            {isPast && incompleteTasks > 0 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-red-100 bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{incompleteTasks} incomplete task{incompleteTasks !== 1 ? 's' : ''} from this date</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8">
        {/* Add Task Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Add New Task</label>
              <input
                id="todo-input"
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    addItem();
                  }
                }}
                placeholder="What needs to be done?"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all placeholder-gray-400"
              />
            </div>
            
            <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
              <div className="flex flex-wrap gap-2 flex-1">
                <label className="text-sm font-medium text-gray-700 self-center mr-1">Priority:</label>
                {['high', 'medium', 'low'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      priority === p
                        ? p === 'high'
                          ? 'bg-red-500 text-white shadow-md'
                          : p === 'low'
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-yellow-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
              
              <button
                type="button"
                onClick={addItem}
                disabled={!text.trim()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 active:scale-95 transition-all font-medium shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 w-full lg:w-auto"
              >
                <Plus className="w-5 h-5" />
                Add Task
              </button>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {list.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Circle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No tasks for this date</p>
              <p className="text-sm text-gray-500 mt-1">Add your first task to get started</p>
            </div>
          ) : (
            list.map((item, index) => (
              <div
                key={item.id}
                className={`group flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl border-2 transition-all duration-200 hover:shadow-md ${
                  item.completed
                    ? 'bg-gray-50 border-gray-200'
                    : getPriorityColor(item.priority || 'medium')
                } ${item.editing ? 'ring-2 ring-red-500' : ''}`}
                style={{
                  animation: `slideIn 0.3s ease-out ${index * 0.05}s both`
                }}
              >
                {/* Checkbox */}
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className="mt-0.5 sm:mt-1 text-gray-400 hover:text-gray-700 transition-all active:scale-90"
                  aria-label={item.completed ? 'Mark as not completed' : 'Mark as completed'}
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600 animate-checkmark" />
                  ) : (
                    <Circle className="w-6 h-6" />
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
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-red-500 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <button
                        type="button"
                        onClick={() => cancelEdit(item.id)}
                        className="p-2.5 rounded-xl border-2 border-gray-200 hover:bg-gray-100 transition"
                        aria-label="Cancel edit"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p
                        className={`text-sm sm:text-base break-words ${
                          item.completed ? 'text-gray-400 line-through' : 'text-gray-800 font-medium'
                        }`}
                      >
                        {item.text}
                      </p>
                      {!item.completed && (item.priority || 'medium') !== 'medium' && (
                        <div className="mt-2">{getPriorityBadge(item.priority || 'medium')}</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center flex-wrap sm:flex-nowrap gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity justify-end">
                  {!item.editing && !item.completed && (
                    <>
                      <button
                        type="button"
                        onClick={() => startEdit(item.id)}
                        className="p-2 sm:p-2.5 rounded-xl border border-gray-200 hover:bg-white hover:shadow-sm transition"
                        aria-label="Edit task"
                      >
                        <Pencil className="w-4 h-4 text-gray-600" />
                      </button>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setMoveId(moveId === item.id ? null : item.id)}
                          className="p-2 sm:p-2.5 rounded-xl border border-gray-200 hover:bg-white hover:shadow-sm transition"
                          aria-label="Reschedule task"
                          title="Move to another date"
                        >
                          <Calendar className="w-4 h-4 text-gray-600" />
                        </button>
                        {moveId === item.id && (
                          <input
                            type="date"
                            autoFocus
                            className="absolute right-0 top-12 z-10 px-3 py-2 text-sm rounded-xl border-2 border-red-500 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            defaultValue={activeDate}
                            onChange={(e) => {
                              const next = e.target.value;
                              setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, date: next } : i)));
                              setMoveId(null);
                            }}
                            onBlur={() => setMoveId(null)}
                          />
                        )}
                      </div>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="p-2 sm:p-2.5 rounded-xl border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:shadow-sm transition"
                    aria-label="Delete task"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Actions Footer */}
        {list.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={carryForward}
                disabled={incompleteTasks === 0}
                className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                title="Copy incomplete to tomorrow"
              >
                Carry Forward
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition"
                title="Remove all tasks for this date"
              >
                Clear All
              </button>
            </div>
            <button
              type="button"
              onClick={clearCompleted}
              disabled={completedCount === 0}
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md shadow-green-500/20"
            >
              Clear Completed ({completedCount})
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes checkmark {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }
        
        .animate-checkmark {
          animation: checkmark 0.3s ease-out;
        }
        
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        .animate-confetti {
          animation: confetti 3s ease-in-out forwards;
        }
      `}</style>
    </section>
  );
};

export default TodoList;