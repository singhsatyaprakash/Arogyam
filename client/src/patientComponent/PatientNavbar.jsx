import React, { useState, useContext } from "react";
import {
  FaUser,
  FaCalendarAlt,
  FaComments,
  FaVideo,
  FaStar,
  FaBars,
  FaTimes,
  FaHome,
  FaSignOutAlt,
  FaChevronDown,
  FaCheckCircle,
  FaClipboardList,
  FaUserMd,
} from "react-icons/fa";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { PatientContext } from "../contexts/PatientContext";
import noProfileImage from "../assets/noProfile.webp";
import axios from "axios";

const PatientNavbar = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();

  const { patient, setPatient } = useContext(PatientContext);

  const displayName =
    patient?.patient?.name || patient?.name || "Patient";
  const displayEmail =
    patient?.patient?.email || patient?.email || "";
  const profileImage =
    patient?.patient?.profileImage ||
    patient?.profileImage ||
    noProfileImage;

  const unread =
    patient?.patient?.unreadMessages ||
    patient?.unreadMessages ||
    0;

  const verified =
    patient?.patient?.isVerified ||
    patient?.isVerified ||
    false;

  const logoColor = "text-green-500";
  const activeClass = "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm";
  const inactiveClass =
    "text-gray-600 hover:bg-gray-100 hover:text-emerald-700 border border-transparent";
  const badgeClass = "bg-emerald-600 text-white";
  const linkBase =
    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition";

  const navLinks = [
    { path: "/patient/dashboard", label: "Dashboard", icon: FaHome },
    {
      path: "/patient/appointments",
      label: "Book Appointments",
      icon: FaCalendarAlt,
    },
    {
      path: "/patient/booked-appointment",
      label: "My Doctor/Appointments",
      icon: FaUserMd,
    },
    {
      path: "/patient/chats",
      label: "Chats",
      icon: FaComments,
      badge: unread,
    },
    { path: "/patient/video-calls", label: "Video Calls", icon: FaVideo },
    { path: "/patient/reviews", label: "Reviews", icon: FaStar },
    {
      path: "/patient/daily-routine",
      label: "Daily Routine",
      icon: FaClipboardList,
    },
  ];

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/patients/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        // Ignore logout API errors and always clear local auth state.
      }
    }

    setPatient(null);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex lg:flex-col bg-white/95 backdrop-blur border-r border-emerald-100 z-40 shadow-lg">
        <div className="h-20 flex items-center px-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-cyan-50">
          <Link to="/patient/dashboard" className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-xl bg-white border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-sm">
              <FaUser className={`${logoColor} text-xl`} />
            </span>
            <span className="font-bold text-xl text-gray-800">
              Aro<span className="text-emerald-600">gyam</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `${linkBase} ${
                    isActive ? activeClass : inactiveClass
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span className="truncate">{link.label}</span>

                {link.badge && link.badge > 0 && (
                  <span
                    className={`ml-auto inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${badgeClass}`}
                  >
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-emerald-100 bg-gradient-to-b from-white to-emerald-50/60">
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
            <img
              src={profileImage}
              alt="profile"
              className="w-11 h-11 rounded-full object-cover border border-emerald-200"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {displayName}
                </p>

                {verified && (
                  <FaCheckCircle className="text-green-500" />
                )}
              </div>

              <p className="text-xs text-gray-500 truncate">
                {displayEmail}
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <Link
              to="/patient/settings"
              className="block w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200"
            >
              Settings
            </Link>

            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100 flex items-center gap-2"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Topbar */}
      <header className="lg:hidden w-full bg-white/95 backdrop-blur border-b border-emerald-100 sticky top-0 z-50">
        <div className="px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <FaBars />
            </button>

            <Link
              to="/patient/dashboard"
              className="flex items-center gap-2"
            >
              <span className="h-8 w-8 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                <FaUser className={`${logoColor} text-sm`} />
              </span>

              <span className="font-bold text-md text-gray-800">
                Aro<span className="text-emerald-600">gyam</span>
              </span>
            </Link>
          </div>

          <button
            onClick={() => setProfileOpen((p) => !p)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100"
          >
            <img
              src={profileImage}
              alt="profile"
              className="w-8 h-8 rounded-full object-cover border border-emerald-200"
            />

            <FaChevronDown className="text-gray-500" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl border-r border-emerald-100">
            <div className="h-20 flex items-center px-4 justify-between bg-gradient-to-r from-emerald-50 to-cyan-50 border-b border-emerald-100">
              <Link
                to="/patient/dashboard"
                className="flex items-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <span className="h-9 w-9 rounded-lg bg-white border border-emerald-200 text-emerald-600 flex items-center justify-center">
                  <FaUser className={`${logoColor} text-base`} />
                </span>

                <span className="font-bold text-lg text-gray-800">
                  Aro<span className="text-emerald-600">gyam</span>
                </span>
              </Link>

              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-white"
              >
                <FaTimes />
              </button>
            </div>

            <nav className="px-3 py-4 space-y-2 overflow-y-auto">
              {navLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `${linkBase} ${
                        isActive ? activeClass : inactiveClass
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />

                    <span className="truncate">{link.label}</span>

                    {link.badge && link.badge > 0 && (
                      <span
                        className={`ml-auto inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${badgeClass}`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            <div className="p-4 border-t">
              <div className="flex items-center gap-3">
                <img
                  src={profileImage}
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover border border-emerald-200"
                />

                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {displayName}
                  </p>

                  <p className="text-xs text-gray-500">
                    {displayEmail}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Link
                  to="/patient/settings"
                  onClick={() => setMobileOpen(false)}
                  className="block text-sm px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  Settings
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="w-full text-left text-sm px-3 py-2 text-red-600 rounded-lg hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Profile dropdown */}
      {profileOpen && (
        <div className="lg:hidden fixed right-4 top-16 z-50">
          <div className="w-56 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
            <div className="p-3 border-b bg-gradient-to-r from-emerald-50 to-cyan-50">
              <div className="font-semibold text-gray-800 truncate">
                {displayName}
              </div>

              <div className="text-xs text-gray-500 truncate">
                {displayEmail}
              </div>
            </div>

            <div className="py-2">
              <Link
                to="/patient/dashboard"
                className="block px-4 py-2 text-sm hover:bg-gray-50"
                onClick={() => setProfileOpen(false)}
              >
                Dashboard
              </Link>

              <Link
                to="/patient/settings"
                className="block px-4 py-2 text-sm hover:bg-gray-50"
                onClick={() => setProfileOpen(false)}
              >
                Settings
              </Link>

              <button
                onClick={() => {
                  handleLogout();
                  setProfileOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PatientNavbar;
