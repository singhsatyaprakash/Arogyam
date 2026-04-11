import { FaUserMd, FaCalendarAlt, FaComments, FaUsers, FaVideo, FaSignOutAlt, FaChevronDown, FaBars, FaTimes, FaMicrophone, FaHome, FaFileMedical, FaLightbulb, FaPills, FaCheckCircle } from "react-icons/fa";
import { MdOutlineSettings } from "react-icons/md";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import noProfileImage from "../assets/noProfile.webp";
import { DoctorContext } from "../contexts/DoctorContext";
import axios from "axios";

const DoctorNavbar = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const { doctor, setDoctor } = useContext(DoctorContext);

  const handleLogout = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('doctorToken');
    if (token) {
      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/doctors/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        // Ignore logout API errors and always clear local auth state.
      }
    }

    setDoctor(null);
    localStorage.removeItem('token');
    localStorage.removeItem('doctorToken');
    localStorage.removeItem('role');
    navigate('/');
  };

  const displayName = doctor?.doctor?.name || 'N/A';
  const displayEmail = doctor?.doctor?.email || 'N/A';
  const profileImageSrc = doctor?.doctor?.profileImage || noProfileImage;
  const verified = !!doctor?.doctor?.isVerified;
  const unread = doctor?.doctor?.unreadMessages || 0;

  const logoColor = 'text-red-500';
  const activeClass = 'bg-red-50 text-red-700 border border-red-200 shadow-sm';
  const inactiveClass = 'text-gray-600 hover:bg-gray-100 hover:text-red-700 border border-transparent';
  const badgeClass = 'bg-red-600 text-white';

  const navLinks = [
    { path: "/doctor/dashboard", label: "Dashboard", icon: FaHome },
    { path: "/doctor/appointments", label: "Appointments", icon: FaCalendarAlt },
    { path: "/doctor/chats", label: "Patient Chats", icon: FaComments, badge: unread },
    { path: "/doctor/voice-calls", label: "Voice Calls", icon: FaMicrophone },
    { path: "/doctor/video-calls", label: "Video Calls", icon: FaVideo },
    { path: "/doctor/medicines", label: "Medications", icon: FaPills },
    { path: "/doctor/notes", label: "Notes", icon: FaFileMedical },
    { path: "/doctor/case-studies", label: "Case Studies", icon: FaUsers },
    { path: "/doctor/share-ideas", label: "Share Ideas", icon: FaLightbulb },
    { path: "/doctor/settings", label: "Settings", icon: MdOutlineSettings },
  ];
  
  const linkBase = 'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition';

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex lg:flex-col bg-white/95 backdrop-blur border-r border-red-100 z-40 shadow-lg">
        <div className="h-20 flex items-center px-5 border-b border-red-100 bg-gradient-to-r from-red-50 to-rose-50">
          <Link to="/doctor/dashboard" className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-xl bg-white border border-red-200 text-red-600 flex items-center justify-center shadow-sm">
              <FaUserMd className={`${logoColor} text-xl`} />
            </span>
            <span className="font-bold text-xl text-gray-800">
              Aro<span className="text-red-600">gyam</span>
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
                className={({ isActive }) => `${linkBase} ${isActive ? activeClass : inactiveClass}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{link.label}</span>
                {link.badge > 0 && <span className={`ml-auto inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${badgeClass}`}>{link.badge}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-red-100 bg-gradient-to-b from-white to-red-50/60">
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
            <img src={profileImageSrc} alt="Doctor" className="w-11 h-11 rounded-full object-cover border border-red-200" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-800 truncate">{displayName}</p>
                {verified && <FaCheckCircle className="text-green-500" />}
              </div>
              <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <Link to="/doctor/settings" className="block w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200">
              Settings
            </Link>
            <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100 flex items-center gap-2">
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Topbar */}
      <header className="lg:hidden w-full bg-white/95 backdrop-blur border-b border-red-100 sticky top-0 z-50">
        <div className="px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="p-2 text-gray-700 rounded-lg hover:bg-gray-100">
              <FaBars />
            </button>
            <Link to="/doctor/dashboard" className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-red-100 border border-red-200 text-red-600 flex items-center justify-center">
                <FaUserMd className={`${logoColor} text-sm`} />
              </span>
              <span className="font-bold text-md text-gray-800">
                Aro<span className="text-red-600">gyam</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setProfileOpen((p) => !p)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100">
              <img src={profileImageSrc} alt="Doctor" className="w-8 h-8 rounded-full object-cover border border-red-200" />
              <FaChevronDown className="text-gray-500" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl border-r border-red-100">
            <div className="h-20 flex items-center px-4 justify-between bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-100">
              <Link to="/doctor/dashboard" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                <span className="h-9 w-9 rounded-lg bg-white border border-red-200 text-red-600 flex items-center justify-center">
                  <FaUserMd className={`${logoColor} text-base`} />
                </span>
                <span className="font-bold text-lg text-gray-800">
                  Aro<span className="text-red-600">gyam</span>
                </span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-white">
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
                    className={({ isActive }) => `${linkBase} ${isActive ? activeClass : inactiveClass}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{link.label}</span>
                    {link.badge > 0 && <span className={`ml-auto inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${badgeClass}`}>{link.badge}</span>}
                  </NavLink>
                );
              })}
            </nav>

            <div className="p-4 border-t">
              <div className="flex items-center gap-3">
                <img src={profileImageSrc} alt="Doctor" className="w-10 h-10 rounded-full object-cover border border-red-200" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <Link to="/doctor/settings" className="block text-sm px-3 py-2 rounded-lg hover:bg-gray-100" onClick={() => setMobileOpen(false)}>
                  Settings
                </Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="w-full text-left text-sm px-3 py-2 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2">
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Profile dropdown for mobile topbar */}
      {profileOpen && (
        <div className="lg:hidden fixed right-4 top-16 z-50">
          <div className="w-56 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
            <div className="p-3 border-b bg-gradient-to-r from-red-50 to-rose-50">
              <div className="font-semibold text-gray-800 truncate">{displayName}</div>
              <div className="text-xs text-gray-500 truncate">{displayEmail}</div>
            </div>
            <div className="py-2">
              <Link to="/doctor/dashboard" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setProfileOpen(false)}>
                Dashboard
              </Link>
              <Link to="/doctor/settings" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setProfileOpen(false)}>
                Settings
              </Link>
              <button onClick={() => { handleLogout(); setProfileOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2">
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DoctorNavbar;