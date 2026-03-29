import React, { useMemo, useState } from "react";
import {
  FaBed,
  FaCheckCircle,
  FaClipboardCheck,
  FaGlassWhiskey,
  FaHeartbeat,
  FaPills,
  FaRunning,
  FaSun,
} from "react-icons/fa";
import PatientNavbar from "../../patientComponent/PatientNavbar";

const INITIAL_TASKS = [
  { id: 1, title: "Morning medication", time: "08:00 AM", category: "Medicine", done: false },
  { id: 2, title: "20 min walk", time: "09:00 AM", category: "Exercise", done: false },
  { id: 3, title: "Blood pressure check", time: "01:00 PM", category: "Vitals", done: false },
  { id: 4, title: "Evening medication", time: "08:00 PM", category: "Medicine", done: false },
  { id: 5, title: "Sleep before 11 PM", time: "10:45 PM", category: "Sleep", done: false },
];

const DailyRoutinePatient = () => {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [waterGlasses, setWaterGlasses] = useState(4);
  const [note, setNote] = useState("");

  const completedCount = useMemo(
    () => tasks.filter((task) => task.done).length,
    [tasks]
  );
  const progressPercent = useMemo(() => {
    if (!tasks.length) return 0;
    return Math.round((completedCount / tasks.length) * 100);
  }, [completedCount, tasks.length]);

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/70 via-white to-cyan-50/60">
      <PatientNavbar />

      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <section className="rounded-2xl border border-emerald-100 bg-white/90 backdrop-blur p-6 sm:p-7 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  Daily Routine
                </h1>
                <p className="text-sm text-gray-600 mt-2">
                  Stay consistent with your medicines, activity, hydration, and rest.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                <FaClipboardCheck /> {progressPercent}% completed today
              </div>
            </div>

            <div className="mt-5 h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">Tasks Done</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{completedCount}/{tasks.length}</p>
              <p className="mt-1 text-xs text-emerald-700 inline-flex items-center gap-1"><FaCheckCircle /> Keep it up</p>
            </div>

            <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">Water Intake</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{waterGlasses} / 8</p>
              <p className="mt-1 text-xs text-cyan-700 inline-flex items-center gap-1"><FaGlassWhiskey /> Hydration goal</p>
            </div>

            <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">Active Habit</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">Walk</p>
              <p className="mt-1 text-xs text-violet-700 inline-flex items-center gap-1"><FaRunning /> 20 mins</p>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">Sleep Target</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">7.5 hrs</p>
              <p className="mt-1 text-xs text-amber-700 inline-flex items-center gap-1"><FaBed /> Before 11 PM</p>
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-cyan-50">
                <h2 className="text-lg font-semibold text-gray-900 inline-flex items-center gap-2">
                  <FaSun className="text-emerald-600" /> Today's Checklist
                </h2>
              </div>

              <div className="divide-y divide-gray-100">
                {tasks.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 hover:bg-gray-50 transition"
                  >
                    <div className="min-w-0">
                      <p className={`font-medium ${task.done ? "text-emerald-700" : "text-gray-900"}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {task.time} • {task.category}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        task.done
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {task.done ? "Completed" : "Pending"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-gray-900 inline-flex items-center gap-2">
                  <FaGlassWhiskey className="text-cyan-600" /> Hydration Tracker
                </h3>

                <p className="text-sm text-gray-600 mt-2">Add water glasses consumed today.</p>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWaterGlasses((v) => Math.max(0, v - 1))}
                    className="h-9 w-9 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    -
                  </button>
                  <div className="flex-1 rounded-lg bg-cyan-50 border border-cyan-100 text-center py-2 font-semibold text-cyan-800">
                    {waterGlasses} glasses
                  </div>
                  <button
                    type="button"
                    onClick={() => setWaterGlasses((v) => Math.min(12, v + 1))}
                    className="h-9 w-9 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-gray-900 inline-flex items-center gap-2">
                  <FaHeartbeat className="text-rose-500" /> Daily Notes
                </h3>

                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={5}
                  placeholder="How are you feeling today? Any symptoms or progress?"
                  className="mt-3 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400"
                />
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <p className="text-sm font-semibold text-emerald-800 inline-flex items-center gap-2">
                  <FaPills /> Medication Reminder
                </p>
                <p className="text-xs text-emerald-700 mt-2">
                  Set alarms for each medicine timing to avoid missed doses.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default DailyRoutinePatient;
