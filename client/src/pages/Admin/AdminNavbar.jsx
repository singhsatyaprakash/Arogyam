import React from "react";
import { FaShieldAlt, FaSignOutAlt } from "react-icons/fa";

const AdminNavbar = ({ onLogout }) => {
  const now = new Date();
  const day = now.toLocaleDateString(undefined, { weekday: "long" });
  const date = now.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric"
  });

  return (
    <header className="sticky top-0 z-20 border-b border-rose-200/60 bg-white/75 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <FaShieldAlt />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.18em] text-rose-700 font-semibold">Arogyam Panel</p>
            <h1 className="text-sm sm:text-base font-bold text-gray-900 truncate">Admin Command Center</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block text-right leading-tight">
            <p className="text-xs font-semibold text-gray-700">{day}</p>
            <p className="text-xs text-gray-500">{date}</p>
          </div>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold px-3 py-2 transition"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
