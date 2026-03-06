import React from "react";
import { Link } from "react-router-dom";
import { FaStethoscope } from "react-icons/fa";

const DoctorRegisterNavbar = () => {
  return (
    <nav className="w-full bg-white border-b px-6 py-3 flex items-center justify-between
                    fixed top-0 left-0 z-50">
      
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
          <FaStethoscope className="text-white text-base" />
        </div>
        <span className="text-lg font-bold text-gray-800">
          Aro<span className="text-red-500">gyam</span>
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500 hidden sm:block">
          Already registered?
        </span>
        <Link
          to="/"
          className="bg-red-500 text-white px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-red-600 transition"
        >
          Sign In
        </Link>
      </div>
    </nav>
  );
};

export default DoctorRegisterNavbar;
