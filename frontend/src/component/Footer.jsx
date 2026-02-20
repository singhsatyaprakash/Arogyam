import React, { useState, useEffect } from "react";
import { FaUserMd, FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  const [role, setRole] = useState(() => localStorage.getItem('role') || 'patient');

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

  const topBgClass = role === 'patient' ? 'bg-gradient-to-r from-green-800 to-green-900' : 'bg-gradient-to-r from-red-800 to-red-900';
  const brandAccentClass = role === 'patient' ? 'text-green-400' : 'text-red-400';
  const socialHoverClass = role === 'patient' ? 'hover:bg-green-500' : 'hover:bg-red-500';
  const bottomBorderClass = role === 'patient' ? 'border-green-800' : 'border-red-800';

  return (
    <footer className={`${topBgClass} text-gray-100 mt-10`}>
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FaUserMd className={`${brandAccentClass} text-2xl`} />
            <span className="text-xl font-bold text-white">
              Aro<span className={`${brandAccentClass}`}>gyam</span>
            </span>
          </div>
          <p className="text-sm text-gray-200 leading-relaxed">
            Arogyam helps patients connect with verified doctors instantly
            through chat, voice, and video consultations.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-white transition">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-white transition">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white transition">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/register/doctor" className="hover:text-white transition">
                Join as Doctor
              </Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-white font-semibold mb-4">Support</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/help" className="hover:text-white transition">
                Help Center
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-white transition">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-white transition">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 className="text-white font-semibold mb-4">Follow Us</h4>
          <div className="flex gap-3">
            <a
              href="#"
              className={`w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 ${socialHoverClass} transition`}
              aria-label="facebook"
            >
              <FaFacebookF />
            </a>
            <a
              href="#"
              className={`w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 ${socialHoverClass} transition`}
              aria-label="twitter"
            >
              <FaTwitter />
            </a>
            <a
              href="#"
              className={`w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 ${socialHoverClass} transition`}
              aria-label="linkedin"
            >
              <FaLinkedinIn />
            </a>
            <a
              href="#"
              className={`w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 ${socialHoverClass} transition`}
              aria-label="instagram"
            >
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={`border-t ${bottomBorderClass} py-4 text-center text-sm text-gray-200`}>
        © {new Date().getFullYear()} Arogyam. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
