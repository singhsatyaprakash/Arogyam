// DoctorNavbar.jsx (Updated)
// Converted into a responsive sidebar + topbar for mobile
import { FaUserMd, FaCalendarAlt, FaComments, FaUsers, FaVideo, FaCog, FaSignOutAlt, FaChevronDown, FaBars, FaTimes, FaHome, FaFileMedical, FaLightbulb, FaPills, FaCheckCircle } from "react-icons/fa";
import { NavLink, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import noProfileImage from "../assets/noProfile.webp";
import { useDoctor } from "../contexts/DoctorContext";

const DoctorNavbar = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [role, setRole] = useState(() => localStorage.getItem('role') || 'doctor');

  useEffect(() => {
    const onStorage = (e) => { if (e.key === 'role') setRole(e.newValue || 'doctor'); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const { doctor, logout } = useDoctor();

  const displayName = doctor?.name || 'Dr. Satyal';
  const displayEmail = doctor?.email || 'dr.satyal@medicare.com';
  const profileImageSrc = doctor?.profileImage || noProfileImage;
  const verified = !!doctor?.isVerified;
  const unread = doctor?.unreadMessages || 0;

  const logoColor = role === 'doctor' ? 'text-red-500' : 'text-green-500';
  const activeClass = role === 'doctor' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600';
  const inactiveClass = role === 'doctor'
    ? 'text-gray-600 hover:bg-gray-100 hover:text-red-600'
    : 'text-gray-600 hover:bg-gray-100 hover:text-green-600';
  const badgeClass = role === 'doctor' ? 'bg-red-600 text-white' : 'bg-green-600 text-white';

  const navLinks = [
    { path: "/doctor/dashboard", label: "Dashboard", icon: FaHome },
    { path: "/doctor/appointments", label: "Appointments", icon: FaCalendarAlt },
    { path: "/doctor/chats", label: "Patient Chats", icon: FaComments, badge: unread },
    { path: "/doctor/video-sessions", label: "Video Calls", icon: FaVideo },
    { path: "/doctor/medicines", label: "Medications", icon: FaPills },
    { path: "/doctor/notes", label: "Notes", icon: FaFileMedical },
    { path: "/doctor/case-studies", label: "Case Studies", icon: FaUsers },
    { path: "/doctor/share-ideas", label: "Share Ideas", icon: FaLightbulb },
  ];

  const linkBase = "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition";

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex lg:flex-col bg-white border-r shadow-sm z-40">
        <div className="h-16 flex items-center px-4">
          <Link to="/doctor/dashboard" className="flex items-center gap-2">
            <FaUserMd className={`${logoColor} text-2xl`} />
            <span className="font-bold text-lg text-gray-800">Aro<span className={`${role === 'doctor' ? 'text-red-500' : 'text-green-500'}`}>gyam</span></span>
          </Link>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => `${linkBase} ${isActive ? activeClass : inactiveClass}`}
              >
                <Icon className="w-4 h-4" />
                <span className="truncate">{link.label}</span>
                {link.badge > 0 && <span className={`ml-auto inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${badgeClass}`}>{link.badge}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <img src={profileImageSrc} alt="Doctor" className="w-10 h-10 rounded-full object-cover border" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-800 truncate">{displayName}</p>
                {verified && <FaCheckCircle className="text-green-500" />}
              </div>
              <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <Link to="/doctor/settings" className={`block w-full text-left text-sm px-3 py-2 rounded-md hover:bg-gray-100 ${role === 'doctor' ? '' : ''}`}>Settings</Link>
            <button onClick={() => logout()} className={`w-full text-left text-sm px-3 py-2 ${role === 'doctor' ? 'text-red-600' : 'text-green-600'} rounded-md hover:bg-gray-100 flex items-center gap-2`}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Topbar */}
      <header className="lg:hidden w-full bg-white shadow sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="p-2 text-gray-700">
              <FaBars />
            </button>
            <Link to="/doctor/dashboard" className="flex items-center gap-2">
              <FaUserMd className={`${logoColor} text-xl`} />
              <span className="font-bold text-md text-gray-800">Aro<span className={`${role === 'doctor' ? 'text-red-500' : 'text-green-500'}`}>gyam</span></span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setProfileOpen(p => !p)} className="flex items-center gap-2 p-1 rounded-md hover:bg-gray-100">
              <img src={profileImageSrc} alt="Doctor" className="w-8 h-8 rounded-full object-cover border" />
              <FaChevronDown className="text-gray-500" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-md">
            <div className="h-16 flex items-center px-4 justify-between">
              <Link to="/doctor/dashboard" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                <FaUserMd className={`${logoColor} text-2xl`} />
                <span className="font-bold text-lg text-gray-800">Aro<span className={`${role === 'doctor' ? 'text-red-500' : 'text-green-500'}`}>gyam</span></span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="p-2"><FaTimes /></button>
            </div>

            <nav className="px-2 py-4 space-y-1 overflow-y-auto">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) => `${linkBase} ${isActive ? activeClass : inactiveClass}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="truncate">{link.label}</span>
                    {link.badge > 0 && <span className={`ml-auto inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${badgeClass}`}>{link.badge}</span>}
                  </NavLink>
                );
              })}
            </nav>

            <div className="p-4 border-t">
              <div className="flex items-center gap-3">
                <img src={profileImageSrc} alt="Doctor" className="w-10 h-10 rounded-full object-cover border" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <Link to="/doctor/settings" className="block w-full text-left text-sm px-3 py-2 rounded-md hover:bg-gray-100" onClick={() => setMobileOpen(false)}>Settings</Link>
                <button onClick={() => { logout(); setMobileOpen(false); }} className={`w-full text-left text-sm px-3 py-2 ${role === 'doctor' ? 'text-red-600' : 'text-green-600'} rounded-md hover:bg-gray-100 flex items-center gap-2`}>
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
          <div className="w-56 bg-white border rounded-md shadow-lg">
            <div className="p-3 border-b">
              <div className="font-semibold text-gray-800">{displayName}</div>
              <div className="text-xs text-gray-500">{displayEmail}</div>
            </div>
            <div className="py-2">
              <Link to="/doctor/dashboard" className="block px-4 py-2 text-sm hover:bg-gray-50">Dashboard</Link>
              <Link to="/doctor/settings" className="block px-4 py-2 text-sm hover:bg-gray-50">Settings</Link>
              <button onClick={() => logout()} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"><FaSignOutAlt /> Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DoctorNavbar;