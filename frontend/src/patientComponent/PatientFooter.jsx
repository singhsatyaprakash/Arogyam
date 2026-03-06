import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaEnvelope } from 'react-icons/fa';

const PatientFooter = () => {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h4 className="text-lg font-bold text-gray-800">Arogyam</h4>
            <p className="text-sm text-gray-500">Trusted telemedicine for patients and doctors.</p>
          </div>

          <div className="flex gap-8">
            <div className="hidden sm:block">
              <h5 className="text-sm font-semibold text-gray-700 mb-2">Company</h5>
              <ul className="text-sm text-gray-500 space-y-1">
                <li><Link to="/about" className="hover:underline">About</Link></li>
                <li><Link to="/careers" className="hover:underline">Careers</Link></li>
                <li><Link to="/contact" className="hover:underline">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-semibold text-gray-700 mb-2">Support</h5>
              <ul className="text-sm text-gray-500 space-y-1">
                <li><Link to="/help" className="hover:underline">Help Center</Link></li>
                <li><Link to="/terms" className="hover:underline">Terms</Link></li>
                <li><Link to="/privacy" className="hover:underline">Privacy</Link></li>
              </ul>
            </div>

            <div className="flex items-start flex-col">
              <h5 className="text-sm font-semibold text-gray-700 mb-2">Stay Updated</h5>
              <div className="flex items-center gap-3">
                <a href="#" aria-label="facebook" className="text-gray-500 hover:text-gray-700"><FaFacebookF /></a>
                <a href="#" aria-label="twitter" className="text-gray-500 hover:text-gray-700"><FaTwitter /></a>
                <a href="#" aria-label="instagram" className="text-gray-500 hover:text-gray-700"><FaInstagram /></a>
                <a href="#" aria-label="newsletter" className="text-gray-500 hover:text-gray-700"><FaEnvelope /></a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t pt-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Arogyam. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default PatientFooter;