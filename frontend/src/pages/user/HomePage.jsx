import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const HomePage = () => {
  const { user } = useAuth();

  const popularSports = [
    { name: 'Badminton', icon: '🏸', venues: 25 },
    { name: 'Tennis', icon: '🎾', venues: 18 },
    { name: 'Football', icon: '⚽', venues: 12 },
    { name: 'Basketball', icon: '🏀', venues: 8 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="primary-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Welcome to QuickCourt
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Book local sports facilities instantly. Join matches and connect with players in your area.
            </p>
            {user?.role === 'USER' && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/venues" className="btn-secondary bg-white text-[#604058] hover:bg-gray-100">
                  Find Venues
                </Link>
                <Link to="/my-bookings" className="btn-primary bg-white/20 text-white border-white hover:bg-white/30">
                  My Bookings
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popular Sports */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Sports</h2>
          <p className="text-lg text-gray-600">Discover the most booked sports in your area</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularSports.map((sport) => (
            <div key={sport.name} className="card p-6 text-center hover:scale-105 transition-transform">
              <div className="text-4xl mb-4">{sport.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{sport.name}</h3>
              <p className="text-gray-600">{sport.venues} venues available</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose QuickCourt?</h2>
            <p className="text-lg text-gray-600">Experience the best in sports facility booking</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#604058] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Booking</h3>
              <p className="text-gray-600">Book your favorite venues in seconds with our streamlined process.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#604058] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">💳</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Payments</h3>
              <p className="text-gray-600">Safe and secure payment processing with multiple payment options.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#604058] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🏆</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Venues</h3>
              <p className="text-gray-600">All venues are verified and maintain high standards of quality.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
