import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaEnvelope } from 'react-icons/fa';

const PatientFooter = () => {
  return (
    <footer className="border-t border-emerald-100 bg-gradient-to-b from-white to-emerald-50/50">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gray-200 bg-white/90 backdrop-blur p-6 sm:p-7 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h4 className="text-2xl font-bold text-gray-900 tracking-tight">
                Aro<span className="text-emerald-600">gyam</span>
              </h4>
              <p className="text-sm text-gray-600 mt-2 max-w-md">
                Trusted telemedicine for patients and doctors. Book consultations, chat securely, and manage care in one place.
              </p>

              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="text-xs rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-emerald-700">24x7 access</span>
                <span className="text-xs rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-sky-700">Verified doctors</span>
                <span className="text-xs rounded-full bg-violet-50 border border-violet-200 px-3 py-1 text-violet-700">Secure chats</span>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-semibold text-gray-800 mb-3">Company</h5>
              <ul className="text-sm text-gray-600 space-y-2">
                <li><Link to="/about" className="hover:text-emerald-700">About</Link></li>
                <li><Link to="/careers" className="hover:text-emerald-700">Careers</Link></li>
                <li><Link to="/contact" className="hover:text-emerald-700">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-semibold text-gray-800 mb-3">Support</h5>
              <ul className="text-sm text-gray-600 space-y-2">
                <li><Link to="/help" className="hover:text-emerald-700">Help Center</Link></li>
                <li><Link to="/terms" className="hover:text-emerald-700">Terms</Link></li>
                <li><Link to="/privacy" className="hover:text-emerald-700">Privacy</Link></li>
              </ul>

              <div className="mt-4">
                <h5 className="text-sm font-semibold text-gray-800 mb-2">Stay Updated</h5>
                <div className="flex items-center gap-2">
                  <a href="#" aria-label="facebook" className="h-8 w-8 rounded-lg border border-gray-200 text-gray-500 hover:text-emerald-700 hover:border-emerald-300 inline-flex items-center justify-center"><FaFacebookF /></a>
                  <a href="#" aria-label="twitter" className="h-8 w-8 rounded-lg border border-gray-200 text-gray-500 hover:text-emerald-700 hover:border-emerald-300 inline-flex items-center justify-center"><FaTwitter /></a>
                  <a href="#" aria-label="instagram" className="h-8 w-8 rounded-lg border border-gray-200 text-gray-500 hover:text-emerald-700 hover:border-emerald-300 inline-flex items-center justify-center"><FaInstagram /></a>
                  <a href="#" aria-label="newsletter" className="h-8 w-8 rounded-lg border border-gray-200 text-gray-500 hover:text-emerald-700 hover:border-emerald-300 inline-flex items-center justify-center"><FaEnvelope /></a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-4 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Arogyam. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PatientFooter;