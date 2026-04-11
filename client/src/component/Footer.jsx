import React, { useState, useEffect } from "react";
import { FaUserMd, FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = ({ role: roleProp }) => {
  const [role, setRole] = useState(() => localStorage.getItem('role') || 'patient');

  const effectiveRole = roleProp === 'doctor' || roleProp === 'patient' ? roleProp : role;

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

  const isPatient = effectiveRole === "patient";
  const topBgClass = isPatient
    ? "bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900"
    : "bg-gradient-to-br from-rose-950 via-rose-900 to-red-900";
  const brandAccentClass = isPatient ? "text-emerald-300" : "text-rose-300";
  const socialHoverClass = isPatient ? "hover:bg-emerald-500" : "hover:bg-rose-500";
  const bottomBorderClass = isPatient ? "border-emerald-700/50" : "border-rose-700/50";
  const chipClass = isPatient
    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
    : "border-rose-400/30 bg-rose-400/10 text-rose-100";
  const linkHoverClass = isPatient ? "hover:text-emerald-200" : "hover:text-rose-200";
  const socialBaseClass = isPatient
    ? "border-emerald-300/20 bg-white/10"
    : "border-rose-300/20 bg-white/10";

  return (
    <footer className={`${topBgClass} text-gray-100 mt-10 relative overflow-hidden`}>
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-white blur-3xl" />
        <div className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-white blur-3xl" />
      </div>

      {/* Top Section */}
      <div className="relative max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-sm">
              <FaUserMd className={`${brandAccentClass} text-xl`} />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Aro<span className={`${brandAccentClass}`}>gyam</span>
            </span>
          </div>
          <p className="text-sm text-gray-100/90 leading-relaxed max-w-xs">
            Arogyam helps patients connect with verified doctors instantly
            through chat, voice, and video consultations.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className={`text-xs px-3 py-1 rounded-full border ${chipClass}`}>Verified Doctors</span>
            <span className={`text-xs px-3 py-1 rounded-full border ${chipClass}`}>Secure Consults</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-4 tracking-wide">Quick Links</h4>
          <ul className="space-y-2.5 text-sm text-gray-100/90">
            <li>
              <Link to="/" className={`${linkHoverClass} transition`}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className={`${linkHoverClass} transition`}>
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" className={`${linkHoverClass} transition`}>
                Contact
              </Link>
            </li>
            <li>
              <Link to="/register/doctor" className={`${linkHoverClass} transition`}>
                Join as Doctor
              </Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-white font-semibold mb-4 tracking-wide">Support</h4>
          <ul className="space-y-2.5 text-sm text-gray-100/90">
            <li>
              <Link to="/help" className={`${linkHoverClass} transition`}>
                Help Center
              </Link>
            </li>
            <li>
              <Link to="/privacy" className={`${linkHoverClass} transition`}>
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className={`${linkHoverClass} transition`}>
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 className="text-white font-semibold mb-4 tracking-wide">Follow Us</h4>
          <p className="text-sm text-gray-100/80 mb-4">Stay updated with our latest health initiatives.</p>
          <div className="flex gap-3">
            <a
              href="#"
              className={`w-10 h-10 flex items-center justify-center rounded-full border ${socialBaseClass} ${socialHoverClass} transition text-white`}
              aria-label="facebook"
            >
              <FaFacebookF />
            </a>
            <a
              href="#"
              className={`w-10 h-10 flex items-center justify-center rounded-full border ${socialBaseClass} ${socialHoverClass} transition text-white`}
              aria-label="twitter"
            >
              <FaTwitter />
            </a>
            <a
              href="#"
              className={`w-10 h-10 flex items-center justify-center rounded-full border ${socialBaseClass} ${socialHoverClass} transition text-white`}
              aria-label="linkedin"
            >
              <FaLinkedinIn />
            </a>
            <a
              href="#"
              className={`w-10 h-10 flex items-center justify-center rounded-full border ${socialBaseClass} ${socialHoverClass} transition text-white`}
              aria-label="instagram"
            >
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={`relative border-t ${bottomBorderClass} py-4 text-center text-sm text-gray-100/90`}>
        © {new Date().getFullYear()} Arogyam. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
