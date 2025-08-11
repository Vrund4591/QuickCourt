import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const NavLink = ({ to, children, mobile = false }) => {
    const isActive = location.pathname === to;
    const baseClasses = mobile 
      ? "block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
      : "px-3 py-2 text-sm font-medium rounded-md transition-colors";
    
    const activeClasses = isActive 
      ? "text-[#604058] bg-[#604058]/10" 
      : "text-gray-700 hover:text-[#604058] hover:bg-gray-50";

    return (
      <Link 
        to={to} 
        className={`${baseClasses} ${activeClasses}`}
        onClick={() => setIsMenuOpen(false)}
      >
        {children}
      </Link>
    );
  };

  const getUserNavigation = () => {
    if (!user) return [];

    switch (user.role) {
      case 'USER':
        return [
          { name: 'Home', href: '/' },
          { name: 'Venues', href: '/venues' },
          { name: 'My Bookings', href: '/my-bookings' },
          { name: 'Profile', href: '/profile' },
        ];
      case 'FACILITY_OWNER':
        return [
          { name: 'Dashboard', href: '/owner/dashboard' },
          { name: 'Facilities', href: '/owner/facilities' },
          { name: 'Courts', href: '/owner/courts' },
          { name: 'Bookings', href: '/owner/bookings' },
          { name: 'Profile', href: '/profile' },
        ];
      case 'ADMIN':
        return [
          { name: 'Dashboard', href: '/admin/dashboard' },
          { name: 'Facilities', href: '/admin/facilities' },
          { name: 'Users', href: '/admin/users' },
          { name: 'Profile', href: '/profile' },
        ];
      default:
        return [];
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-br from-[#604058] to-[#8B6B85] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">QC</span>
              </div>
              <span className="ml-2 text-xl font-bold text-[#604058]">QuickCourt</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {user ? (
              <>
                {getUserNavigation().map((item) => (
                  <NavLink key={item.name} to={item.href}>
                    {item.name}
                  </NavLink>
                ))}
                <div className="ml-4 flex items-center space-x-2">
                  <div className="flex items-center">
                    {user.avatar ? (
                      <img 
                        className="h-8 w-8 rounded-full border-2 border-[#604058]" 
                        src={user.avatar} 
                        alt={user.fullName} 
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-[#604058] flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.fullName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {user.fullName}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ml-2 btn-secondary"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="btn-secondary">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user ? (
              <>
                <div className="flex items-center px-4 py-3 border-b border-gray-200">
                  {user.avatar ? (
                    <img 
                      className="h-10 w-10 rounded-full border-2 border-[#604058]" 
                      src={user.avatar} 
                      alt={user.fullName} 
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-[#604058] flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user.fullName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user.fullName}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
                {getUserNavigation().map((item) => (
                  <NavLink key={item.name} to={item.href} mobile>
                    {item.name}
                  </NavLink>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="space-y-2 px-4 py-3">
                <Link 
                  to="/login" 
                  className="block w-full text-center btn-secondary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="block w-full text-center btn-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
