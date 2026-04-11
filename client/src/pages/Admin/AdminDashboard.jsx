import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaChartLine,
  FaEnvelopeOpenText,
  FaComments,
  FaQuestionCircle,
  FaPlusCircle,
  FaSignOutAlt,
  FaUserCheck,
  FaUserShield
} from "react-icons/fa";
import AdminNavbar from "./AdminNavbar";

export const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    if (localStorage.getItem("role") === "admin") {
      localStorage.removeItem("role");
    }
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-orange-50 to-amber-100 relative overflow-hidden">
      <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-rose-300/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl pointer-events-none" />
      <AdminNavbar onLogout={handleLogout} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-7 relative z-10 space-y-6">
        <section className="bg-white/90 backdrop-blur-md rounded-3xl border border-rose-100 shadow-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <FaUserShield className="text-lg" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">Admin Dashboard</h2>
                <p className="text-sm text-gray-600 mt-1">Manage admin access, secure accounts, and keep platform operations in control.</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/admin/add")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 transition"
            >
              <FaPlusCircle />
              Add New Admin
            </button>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-rose-200 bg-white/90 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">Security Status</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-2">Protected</p>
            <p className="text-sm text-gray-600 mt-1">Admin routes are behind token validation.</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-white/90 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Quick Task</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-2">Create Admin</p>
            <p className="text-sm text-gray-600 mt-1">Add trusted members in seconds with email credentials.</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-white/90 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">System Note</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-2">Monitor Sessions</p>
            <p className="text-sm text-gray-600 mt-1">Force logout is available from the top-right action.</p>
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/admin/add")}
            className="rounded-2xl border border-emerald-200 bg-emerald-50/90 text-emerald-800 p-6 text-left hover:bg-emerald-100/90 transition"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <FaPlusCircle className="text-lg" />
                <span className="font-extrabold text-lg">Create New Admin</span>
              </div>
              <FaArrowRight className="text-sm" />
            </div>
            <p className="text-sm mt-3 text-emerald-900/80">
              Send onboarding credentials directly to the new admin email address.
            </p>
          </button>

          <button
            onClick={handleLogout}
            className="rounded-2xl border border-rose-200 bg-rose-50/90 text-rose-800 p-6 text-left hover:bg-rose-100/90 transition"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <FaSignOutAlt className="text-lg" />
                <span className="font-extrabold text-lg">Logout Session</span>
              </div>
              <FaArrowRight className="text-sm" />
            </div>
            <p className="text-sm mt-3 text-rose-900/80">
              End the active admin session and return to admin login safely.
            </p>
          </button>
        </section>

        <section className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white/90 border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-rose-700 font-bold">
              <FaEnvelopeOpenText />
              Account Recovery Ready
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Admin forgot-password OTP flow is configured and available from admin login.
            </p>
          </div>
          <div className="rounded-2xl bg-white/90 border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-700 font-bold">
              <FaChartLine />
              Operational Controls
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Use this panel for administrative lifecycle tasks and secure access management.
            </p>
          </div>
        </section>

        <section className="bg-white/90 backdrop-blur-md rounded-3xl border border-rose-100 shadow-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">Roadmap</p>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">Planned Admin Modules</h3>
            </div>
            <span className="rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1">
              Coming Soon
            </span>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-rose-50 p-5 shadow-sm">
              <div className="h-11 w-11 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
                <FaQuestionCircle />
              </div>
              <h4 className="font-extrabold text-gray-900 text-lg">Support Q/A</h4>
              <p className="text-sm text-gray-600 mt-2">
                A space for admin-managed questions, answers, and support guidance.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-emerald-50 p-5 shadow-sm">
              <div className="h-11 w-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <FaComments />
              </div>
              <h4 className="font-extrabold text-gray-900 text-lg">Messages</h4>
              <p className="text-sm text-gray-600 mt-2">
                Centralized admin messaging for internal updates and notifications.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-amber-50 p-5 shadow-sm">
              <div className="h-11 w-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <FaUserCheck />
              </div>
              <h4 className="font-extrabold text-gray-900 text-lg">Doctor Verification</h4>
              <p className="text-sm text-gray-600 mt-2">
                Review and approve incoming doctor verification requests here later.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-sky-50 p-5 shadow-sm">
              <div className="h-11 w-11 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-4">
                <FaChartLine />
              </div>
              <h4 className="font-extrabold text-gray-900 text-lg">Pending Requests</h4>
              <p className="text-sm text-gray-600 mt-2">
                A future inbox for support requests and queue-based admin tasks.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
