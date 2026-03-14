import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Dot } from 'lucide-react';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const STORAGE_KEY = 'doctorconnect:doctor:todos:v1';

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function monthLabel(d) {
  return d.toLocaleString(undefined, { month: 'long', year: 'numeric' });
}

function addMonths(d, delta) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

function buildCalendarDays(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay(); // 0..6 (Sun..Sat)

  const gridStart = new Date(year, month, 1 - startWeekday);
  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
    days.push(d);
  }
  return days;
}

function isoDate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const Calender = ({ value, onChange, className = '' }) => {
  const today = useMemo(() => startOfDay(new Date()), []);
  const selected = value ? startOfDay(new Date(value)) : null;

  const [viewDate, setViewDate] = useState(() =>
    selected ? new Date(selected.getFullYear(), selected.getMonth(), 1) : addMonths(today, 0)
  );

  const days = useMemo(() => buildCalendarDays(viewDate), [viewDate]);

  // count tasks per iso date (from local storage)
  const dayCounts = useMemo(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      const map = {};
      for (const i of arr) {
        const completedCount = arr.filter(t => t.date === i.date && t.completed).length;
        const totalCount = arr.filter(t => t.date === i.date).length;
        if (!map[i.date]) {
          map[i.date] = { total: 0, completed: 0 };
        }
      }
      for (const i of arr) {
        if (!map[i.date]) {
          map[i.date] = { total: 0, completed: 0 };
        }
        map[i.date].total += 1;
        if (i.completed) map[i.date].completed += 1;
      }
      return map;
    } catch {
      return {};
    }
  }, [viewDate]);

  const handlePick = (d) => {
    onChange?.(startOfDay(d));
  };

  const isPast = (d) => {
    const dayStart = startOfDay(d);
    return dayStart < today && !isSameDay(dayStart, today);
  };

  const isFuture = (d) => {
    const dayStart = startOfDay(d);
    return dayStart > today;
  };

  return (
    <section className={`bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-lg rounded-3xl overflow-hidden ${className}`}>
      <header className="p-6 sm:p-8 bg-gradient-to-r from-red-500 to-red-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent)]" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">{monthLabel(viewDate)}</h2>
                <p className="text-sm text-red-100 mt-0.5">Select a date to view tasks</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewDate((d) => addMonths(d, -1))}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all active:scale-95"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all font-medium text-sm active:scale-95"
              aria-label="Go to current month"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setViewDate((d) => addMonths(d, 1))}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all active:scale-95"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="p-6 sm:p-8">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {WEEKDAYS.map((w) => (
            <div key={w} className="text-center py-2 text-xs sm:text-sm font-semibold text-gray-600">
              {w}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((d, idx) => {
            const inMonth = isSameMonth(d, viewDate);
            const isToday = isSameDay(d, today);
            const isSelected = selected ? isSameDay(d, selected) : false;
            const taskData = dayCounts[isoDate(d)];
            const hasTasks = taskData && taskData.total > 0;
            const allCompleted = hasTasks && taskData.completed === taskData.total;
            const hasIncomplete = hasTasks && taskData.completed < taskData.total;

            let baseStyles = 'relative group w-full aspect-square rounded-2xl border-2 text-sm sm:text-base font-medium flex flex-col items-center justify-center transition-all duration-200 select-none cursor-pointer';
            
            let colorStyles = '';
            if (isSelected) {
              colorStyles = 'bg-gradient-to-br from-red-500 to-red-600 border-red-500 text-white shadow-lg shadow-red-500/30 scale-105';
            } else if (!inMonth) {
              colorStyles = 'bg-gray-50 border-gray-100 text-gray-300 hover:bg-gray-100';
            } else if (isToday) {
              colorStyles = 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 text-blue-900 font-bold ring-2 ring-blue-300 ring-offset-2 hover:shadow-md';
            } else if (isPast(d)) {
              colorStyles = 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300';
            } else if (isFuture(d)) {
              colorStyles = 'bg-white border-gray-200 text-gray-700 hover:bg-gradient-to-br hover:from-red-50 hover:to-red-100 hover:border-red-200';
            } else {
              colorStyles = 'bg-white border-gray-200 text-gray-900 hover:bg-gradient-to-br hover:from-red-50 hover:to-red-100 hover:border-red-300';
            }

            return (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => handlePick(d)}
                className={`${baseStyles} ${colorStyles}`}
                aria-label={d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                aria-pressed={isSelected}
                aria-current={isToday ? 'date' : undefined}
                style={{
                  animation: `fadeIn 0.3s ease-out ${idx * 0.01}s both`
                }}
              >
                <span className={`${isSelected ? 'text-white' : ''}`}>
                  {d.getDate()}
                </span>
                
                {/* Task Indicators */}
                {hasTasks && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-0.5">
                    {allCompleted ? (
                      <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-green-500'} animate-pulse`} />
                    ) : hasIncomplete ? (
                      <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-yellow-500'} animate-pulse`} />
                    ) : null}
                  </div>
                )}

                {/* Hover Tooltip */}
                {hasTasks && (
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                      {taskData.completed}/{taskData.total} tasks done
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend & Selected Date Info */}
        <div className="mt-6 space-y-4">
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs sm:text-sm text-gray-600">All Complete</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-xs sm:text-sm text-gray-600">Has Tasks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-300 ring-2 ring-blue-300" />
                <span className="text-xs sm:text-sm text-gray-600">Today</span>
              </div>
            </div>
          </div>

          {selected && (
            <div className="bg-gradient-to-r from-red-50 to-white rounded-2xl p-4 border-2 border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Selected Date</p>
                  <p className="text-base sm:text-lg font-bold text-gray-900">
                    {selected.toLocaleDateString(undefined, { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                {dayCounts[isoDate(selected)] && (
                  <div className="text-right">
                    <p className="text-xs text-gray-600 mb-1">Tasks</p>
                    <p className="text-base sm:text-lg font-bold text-red-600">
                      {dayCounts[isoDate(selected)].completed}/{dayCounts[isoDate(selected)].total}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </section>
  );
};

export default Calender;