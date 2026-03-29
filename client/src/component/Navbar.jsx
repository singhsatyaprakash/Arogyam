import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserMd, FaBars, FaTimes } from "react-icons/fa";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState(() => localStorage.getItem('role') || 'patient');
  const navigate = useNavigate();

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "role") setRole(e.newValue || "patient");
    };
    const onRoleChange = (e) => {
      setRole(e?.detail || localStorage.getItem("role") || "patient");
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("roleChange", onRoleChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("roleChange", onRoleChange);
    };
  }, []);

  const primaryBtnClass = role === 'patient'
    ? 'bg-emerald-600 hover:bg-emerald-700'
    : 'bg-rose-600 hover:bg-rose-700';
  const logoColorClass = role === 'patient' ? 'text-green-500' : 'text-red-500';
  const brandAccentClass = role === 'patient' ? 'text-emerald-600' : 'text-rose-600';
  const softAccentBg = role === 'patient' ? 'from-emerald-50 to-cyan-50' : 'from-rose-50 to-orange-50';
  const linkHoverClass = role === 'patient' ? 'hover:text-emerald-700' : 'hover:text-rose-700';
  const mobileBorderClass = role === 'patient' ? 'border-emerald-100' : 'border-rose-100';

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="w-full px-4 sm:px-6 py-3 flex items-center justify-between">

        {/* LEFT: Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <span className={`h-10 w-10 rounded-xl bg-gradient-to-br ${softAccentBg} border border-gray-200 inline-flex items-center justify-center`}>
            <FaUserMd className={`text-xl ${logoColorClass}`} />
          </span>
          <span className="text-xl font-bold text-gray-800 tracking-tight">
            Aro<span className={brandAccentClass}>gyam</span>
          </span>
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-700">
          <Link to="/" className={`px-3 py-2 rounded-lg transition ${linkHoverClass} hover:bg-gray-100`}>
            Home
          </Link>
          <Link to="/about" className={`px-3 py-2 rounded-lg transition ${linkHoverClass} hover:bg-gray-100`}>
            About
          </Link>
          <Link to="/contact" className={`px-3 py-2 rounded-lg transition ${linkHoverClass} hover:bg-gray-100`}>
            Contact
          </Link>

          <button
            onClick={() => navigate("/")}
            className={`ml-2 px-5 py-2.5 ${primaryBtnClass} text-white rounded-xl font-semibold transition shadow-sm`}
          >
            Login
          </button>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden text-2xl text-gray-700 h-10 w-10 inline-flex items-center justify-center rounded-lg hover:bg-gray-100"
          onClick={() => setOpen(!open)}
        >
          {open ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className={`md:hidden bg-white border-t ${mobileBorderClass} shadow-md`}>
          <div className="flex flex-col px-5 py-4 gap-2 text-gray-700 font-medium">
            <Link onClick={() => setOpen(false)} to="/" className={`px-3 py-2 rounded-lg transition ${linkHoverClass} hover:bg-gray-100`}>
              Home
            </Link>
            <Link onClick={() => setOpen(false)} to="/about" className={`px-3 py-2 rounded-lg transition ${linkHoverClass} hover:bg-gray-100`}>
              About
            </Link>
            <Link onClick={() => setOpen(false)} to="/contact" className={`px-3 py-2 rounded-lg transition ${linkHoverClass} hover:bg-gray-100`}>
              Contact
            </Link>

            <button
              onClick={() => {
                setOpen(false);
                navigate("/");
              }}
              className={`mt-2 w-full py-2.5 ${primaryBtnClass} text-white rounded-xl font-semibold transition shadow-sm`}
            >
              Login
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
