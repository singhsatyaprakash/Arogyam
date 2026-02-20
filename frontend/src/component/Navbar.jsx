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
    ? 'bg-green-500 hover:bg-green-600'
    : 'bg-red-500 hover:bg-red-600';
  const logoColorClass = role === 'patient' ? 'text-green-500' : 'text-red-500';
  const loginTextClass = role === 'patient' ? 'text-green-600' : 'text-red-600';

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b">
      <div className="w-full px-6 py-3 flex items-center justify-between">

        {/* LEFT: Logo */}
        <div className="flex items-center gap-2">
          <FaUserMd className={`text-2xl ${logoColorClass}`} />
          <span className="text-xl font-bold text-gray-800">
            Aro<span className={` ${logoColorClass}`}>gyam</span>
          </span>
        </div>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link to="/" className="hover:text-red-500 transition">
            Home
          </Link>
          <Link to="/about" className="hover:text-red-500 transition">
            About
          </Link>
          <Link to="/contact" className="hover:text-red-500 transition">
            Contact
          </Link>

          <button
            onClick={() => navigate("/")}
            className={`px-5 py-2 ${primaryBtnClass} text-white rounded-lg font-semibold transition`}
          >
            Login
          </button>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden text-2xl text-gray-700"
          onClick={() => setOpen(!open)}
        >
          {open ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden bg-white border-t shadow-md">
          <div className="flex flex-col px-6 py-4 gap-4 text-gray-700 font-medium">
            <Link onClick={() => setOpen(false)} to="/">
              Home
            </Link>
            <Link onClick={() => setOpen(false)} to="/about">
              About
            </Link>
            <Link onClick={() => setOpen(false)} to="/contact">
              Contact
            </Link>

            <button
              onClick={() => {
                setOpen(false);
                navigate("/");
              }}
              className={`mt-2 w-full py-2 ${primaryBtnClass} text-white rounded-lg font-semibold transition`}
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
