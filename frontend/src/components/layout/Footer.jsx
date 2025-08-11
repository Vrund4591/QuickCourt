import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#604058] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-[#604058] font-bold text-sm">QC</span>
              </div>
              <span className="ml-2 text-xl font-bold">QuickCourt</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Book local sports facilities with ease. Join matches, connect with players, 
              and enjoy your favorite sports in your area.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/venues" className="text-gray-300 hover:text-white transition-colors">
                  Find Venues
                </Link>
              </li>
              <li>
                <span className="text-gray-300">How it Works</span>
              </li>
              <li>
                <span className="text-gray-300">About Us</span>
              </li>
              <li>
                <span className="text-gray-300">Contact</span>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-300">Help Center</span>
              </li>
              <li>
                <span className="text-gray-300">Privacy Policy</span>
              </li>
              <li>
                <span className="text-gray-300">Terms of Service</span>
              </li>
              <li>
                <span className="text-gray-300">FAQ</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © 2024 QuickCourt. All rights reserved. Made with ❤️ for sports enthusiasts.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;