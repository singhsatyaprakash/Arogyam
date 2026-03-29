import React from "react";
import { Link } from "react-router-dom";
import { FaStethoscope } from "react-icons/fa";

const DoctorRegisterNavbar = () => {
  return (
    <nav className="w-full bg-white/90 backdrop-blur-md border-b border-rose-100 px-4 sm:px-6 py-3.5 flex items-center justify-between fixed top-0 left-0 z-50 shadow-sm">
      
      {/* Left: Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl flex items-center justify-center shadow-sm">
          <FaStethoscope className="text-white text-sm" />
        </div>
        <span className="text-xl font-bold text-gray-800 tracking-tight">
          Aro<span className="text-rose-600">gyam</span>
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 sm:gap-4">
        <span className="text-sm text-gray-500 hidden sm:block">
          Already registered?
        </span>
        <Link
          to="/"
          className="bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-rose-700 transition shadow-sm"
        >
          Sign In
        </Link>
      </div>
    </nav>
  );
};

export default DoctorRegisterNavbar;
