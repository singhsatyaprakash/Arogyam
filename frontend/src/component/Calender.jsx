import React, { useMemo, useState } from 'react';

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
        map[i.date] = (map[i.date] || 0) + 1;
      }
      return map;
    } catch {
      return {};
    }
  }, [viewDate]);

  const handlePick = (d) => {
    onChange?.(startOfDay(d));
  };

  return (
    <section className={`bg-white border shadow-sm rounded-2xl ${className}`}>
      <header className="p-4 sm:p-5 border-b">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{monthLabel(viewDate)}</h2>
            <p className="text-xs sm:text-sm text-gray-500">Pick a date</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewDate((d) => addMonths(d, -1))}
              className="px-3 py-2 rounded-xl border hover:bg-gray-50 active:bg-gray-100 text-sm"
              aria-label="Previous month"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))}
              className="px-3 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 active:bg-red-700 text-sm"
              aria-label="Go to current month"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setViewDate((d) => addMonths(d, 1))}
              className="px-3 py-2 rounded-xl border hover:bg-gray-50 active:bg-gray-100 text-sm"
              aria-label="Next month"
            >
              Next
            </button>
          </div>
        </div>
      </header>

      <div className="p-3 sm:p-4">
        <div className="grid grid-cols-7 gap-2 text-xs font-medium text-gray-500 px-1">
          {WEEKDAYS.map((w) => (
            <div key={w} className="text-center py-2">
              {w}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2 mt-1">
          {days.map((d) => {
            const inMonth = isSameMonth(d, viewDate);
            const isToday = isSameDay(d, today);
            const isSelected = selected ? isSameDay(d, selected) : false;
            const count = dayCounts[isoDate(d)] || 0;

            const base =
              'relative w-full aspect-square rounded-lg border text-sm sm:text-base flex items-center justify-center transition select-none';
            const muted = inMonth ? 'bg-white text-gray-900 hover:bg-gray-50' : 'bg-gray-50 text-gray-400 hover:bg-gray-100';
            const todayRing = isToday ? 'ring-2 ring-red-300' : '';
            const selectedStyle = isSelected ? 'bg-red-500 border-red-500 text-white hover:bg-red-600' : '';

            return (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => handlePick(d)}
                className={[base, muted, todayRing, selectedStyle].filter(Boolean).join(' ')}
                aria-label={d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                aria-pressed={isSelected}
                aria-current={isToday ? 'date' : undefined}
              >
                {d.getDate()}
                {count > 0 && (
                  <span className={`absolute bottom-1 right-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-white text-red-600' : 'bg-red-500 text-white'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-gray-600">
          <div>
            Selected:{' '}
            <span className="font-medium text-gray-900">{selected ? selected.toLocaleDateString() : 'None'}</span>
          </div>
          <div className="text-gray-500">Tip: tap a date to select</div>
        </div>
      </div>
    </section>
  );
};

export default Calender;