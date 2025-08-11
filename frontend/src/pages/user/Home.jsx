import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, Star, Calendar, Users, Trophy, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import api from '../../utils/api';

const Home = () => {
  const [location, setLocation] = useState('Ahmedabad');
  const [searchQuery, setSearchQuery] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      const response = await api.get('/facilities');
      const facilitiesData = Array.isArray(response.data) 
        ? response.data 
        : response.data.facilities || [];
      setFacilities(facilitiesData.slice(0, 8)); // Show only first 8 facilities
    } catch (error) {
      console.error('Error fetching facilities:', error);
      setFacilities([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    navigate('/venues', { 
      state: { 
        searchQuery, 
        location 
      } 
    });
  };

  const handleFacilityClick = (facility) => {
    navigate(`/venues/${facility.id}`, { 
      state: { facility } 
    });
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(facilities.length / 4));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(facilities.length / 4)) % Math.ceil(facilities.length / 4));
  };

  const popularSports = [
    { 
      name: 'Badminton', 
      image: (
        <svg viewBox="0 0 100 100" className="w-full h-32">
          <rect width="100" height="100" fill="#10B981" />
          <rect x="10" y="30" width="80" height="40" fill="none" stroke="white" strokeWidth="2" />
          <line x1="50" y1="30" x2="50" y2="70" stroke="white" strokeWidth="1" />
          <ellipse cx="30" cy="20" rx="4" ry="6" fill="white" />
          <path d="M 30 14 L 27 20 L 33 20 Z" fill="#4B5563" />
        </svg>
      ),
      color: 'from-green-500 to-green-600' 
    },
    { 
      name: 'Football', 
      image: (
        <svg viewBox="0 0 100 100" className="w-full h-32">
          <rect width="100" height="100" fill="#3B82F6" />
          <rect x="15" y="25" width="70" height="50" fill="none" stroke="white" strokeWidth="2" rx="3" />
          <circle cx="50" cy="50" r="15" fill="none" stroke="white" strokeWidth="2" />
          <circle cx="50" cy="50" r="2" fill="white" />
          <circle cx="50" cy="20" r="8" fill="white" />
          <path d="M 45 15 L 50 10 L 55 15 L 50 20 Z" fill="#1F2937" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600' 
    },
    { 
      name: 'Cricket', 
      image: (
        <svg viewBox="0 0 100 100" className="w-full h-32">
          <rect width="100" height="100" fill="#F97316" />
          <rect x="20" y="20" width="60" height="60" fill="#22C55E" rx="30" />
          <rect x="45" y="15" width="10" height="30" fill="#8B4513" rx="5" />
          <circle cx="50" cy="60" r="8" fill="#DC2626" />
          <path d="M 42 60 Q 50 52 58 60" stroke="white" strokeWidth="1" fill="none" />
        </svg>
      ),
      color: 'from-orange-500 to-orange-600' 
    },
    { 
      name: 'Swimming', 
      image: (
        <svg viewBox="0 0 100 100" className="w-full h-32">
          <rect width="100" height="100" fill="#06B6D4" />
          <rect x="10" y="30" width="80" height="40" fill="#0EA5E9" rx="5" />
          <path d="M 15 40 Q 25 35 35 40 Q 45 45 55 40 Q 65 35 75 40 Q 85 45 95 40" stroke="white" strokeWidth="2" fill="none" />
          <path d="M 15 50 Q 25 45 35 50 Q 45 55 55 50 Q 65 45 75 50 Q 85 55 95 50" stroke="white" strokeWidth="2" fill="none" />
          <circle cx="25" cy="25" r="3" fill="white" />
        </svg>
      ),
      color: 'from-cyan-500 to-cyan-600' 
    },
    { 
      name: 'Tennis', 
      image: (
        <svg viewBox="0 0 100 100" className="w-full h-32">
          <rect width="100" height="100" fill="#8B5CF6" />
          <rect x="15" y="25" width="70" height="50" fill="#059669" />
          <line x1="50" y1="25" x2="50" y2="75" stroke="white" strokeWidth="1" />
          <rect x="15" y="25" width="70" height="50" fill="none" stroke="white" strokeWidth="2" />
          <circle cx="35" cy="15" r="4" fill="#FBBF24" />
          <rect x="60" y="10" width="3" height="15" fill="#8B4513" />
          <ellipse cx="61.5" cy="8" rx="6" ry="3" fill="#374151" />
        </svg>
      ),
      color: 'from-purple-500 to-purple-600' 
    },
    { 
      name: 'Table Tennis', 
      image: (
        <svg viewBox="0 0 100 100" className="w-full h-32">
          <rect width="100" height="100" fill="#EF4444" />
          <rect x="20" y="40" width="60" height="30" fill="#1F2937" rx="2" />
          <line x1="50" y1="35" x2="50" y2="45" stroke="white" strokeWidth="1" />
          <circle cx="30" cy="25" r="3" fill="white" />
          <rect x="65" y="20" width="2" height="10" fill="#8B4513" />
          <ellipse cx="66" cy="18" rx="4" ry="2" fill="#DC2626" />
        </svg>
      ),
      color: 'from-red-500 to-red-600' 
    },
  ];

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-3 w-3 text-yellow-400 fill-current opacity-50" />);
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-3 w-3 text-gray-300" />);
    }
    
    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50">
  
      
      {/* Hero Section - Top 50% */}
      <div className="bg-white min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex flex-col lg:flex-row h-full">
            {/* Left side - Image Space */}
            <div className="lg:w-1/2 flex items-center justify-center py-8 lg:py-12">
              <div className="w-full max-w-lg">
                <svg viewBox="0 0 400 300" className="w-full h-auto">
                  <defs>
                    <linearGradient id="courtGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#1E40AF" />
                    </linearGradient>
                    <linearGradient id="ballGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#D97706" />
                    </linearGradient>
                  </defs>
                  
                  {/* Background */}
                  <rect width="400" height="300" fill="#F8FAFC" rx="10" />
                  
                  {/* Tennis Court */}
                  <rect x="50" y="80" width="180" height="120" fill="url(#courtGradient)" rx="5" />
                  <line x1="140" y1="80" x2="140" y2="200" stroke="white" strokeWidth="2" />
                  <rect x="50" y="80" width="180" height="120" fill="none" stroke="white" strokeWidth="2" rx="5" />
                  
                  {/* Badminton Court */}
                  <rect x="250" y="100" width="120" height="80" fill="#10B981" rx="3" />
                  <line x1="310" y1="100" x2="310" y2="180" stroke="white" strokeWidth="1.5" />
                  <rect x="250" y="100" width="120" height="80" fill="none" stroke="white" strokeWidth="1.5" rx="3" />
                  
                  {/* Tennis Ball */}
                  <circle cx="300" cy="60" r="15" fill="url(#ballGradient)" />
                  <path d="M 290 60 Q 300 50 310 60 Q 300 70 290 60" stroke="white" strokeWidth="2" fill="none" />
                  
                  {/* Badminton Shuttlecock */}
                  <ellipse cx="120" cy="50" rx="8" ry="12" fill="white" />
                  <path d="M 120 38 L 115 50 L 125 50 Z" fill="#6B7280" />
                  
                  {/* Player Silhouettes */}
                  <g transform="translate(90, 120)">
                    <circle cx="0" cy="-15" r="8" fill="#374151" />
                    <rect x="-6" y="-7" width="12" height="25" fill="#374151" rx="6" />
                    <rect x="-4" y="18" width="3" height="15" fill="#374151" />
                    <rect x="1" y="18" width="3" height="15" fill="#374151" />
                    <rect x="-8" y="-2" width="6" height="3" fill="#374151" rx="1.5" />
                    <rect x="2" y="-2" width="6" height="3" fill="#374151" rx="1.5" />
                  </g>
                  
                  <g transform="translate(320, 140)">
                    <circle cx="0" cy="-10" r="6" fill="#374151" />
                    <rect x="-4" y="-4" width="8" height="18" fill="#374151" rx="4" />
                    <rect x="-3" y="14" width="2" height="10" fill="#374151" />
                    <rect x="1" y="14" width="2" height="10" fill="#374151" />
                    <rect x="-6" y="0" width="4" height="2" fill="#374151" rx="1" />
                    <rect x="2" y="0" width="4" height="2" fill="#374151" rx="1" />
                  </g>
                  
                  {/* Decorative Elements */}
                  <circle cx="80" cy="30" r="3" fill="#3B82F6" opacity="0.6" />
                  <circle cx="340" cy="40" r="2" fill="#10B981" opacity="0.6" />
                  <circle cx="60" cy="250" r="2.5" fill="#F59E0B" opacity="0.6" />
                  <circle cx="360" cy="260" r="3" fill="#EF4444" opacity="0.6" />
                </svg>
              </div>
            </div>

            {/* Right side - Location and Search Section */}
            <div className="lg:w-1/2 flex flex-col justify-center py-8 lg:py-12">
              <div className="space-y-6">
                {/* Header */}
                <div className="text-center lg:text-left">
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Caveat, cursive' }}>
                    QUICKCOURT
                  </h1>
                  <div className="flex items-center justify-center lg:justify-start space-x-6">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <span className="text-lg font-medium text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>Book</span>
                    </div>
                    <div className="flex items-center space-x-2">

                      
                    </div>
                  </div>
                </div>

                {/* Location Input */}
                <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <input
                    type="text"
                    placeholder="Ahmedabad"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>

                {/* Find Players & Venues Section */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Caveat, cursive' }}>
                    FIND PLAYERS & VENUES NEARBY
                  </h2>
                  <p className="text-gray-600 text-sm mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Seamlessly explore sports venues and play with sports enthusiasts just like you!
                  </p>
                  
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Search venues, sports..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                    <button
                      onClick={handleSearch}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      <Search className="h-4 w-4" />
                      <span>Search</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Book Venues Section - Below 50% with Slider */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Caveat, cursive' }}>Book Venues</h2>
            <button
              onClick={() => navigate('/venues')}
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <span>See all venues</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="relative">
              {/* Venue Cards */}
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {Array.from({ length: Math.ceil(facilities.length / 4) }).map((_, slideIndex) => (
                    <div key={slideIndex} className="flex-none w-full">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {facilities.slice(slideIndex * 4, slideIndex * 4 + 4).map((facility) => (
                          <div
                            key={facility.id}
                            onClick={() => handleFacilityClick(facility)}
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden border"
                          >
                            {/* Image */}
                            <div className="aspect-w-16 aspect-h-9">
                              <img
                                src={facility.images?.[0] || '/api/placeholder/300/200'}
                                alt={facility.name}
                                className="w-full h-48 object-cover"
                              />
                            </div>
                            
                            {/* Content */}
                            <div className="p-4 space-y-3">
                              {/* Venue Name */}
                              <h3 className="font-bold text-lg text-gray-900" style={{ fontFamily: 'Caveat, cursive' }}>{facility.name}</h3>
                              
                              {/* Location */}
                              <div className="flex items-center text-gray-600 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{facility.location}</span>
                              </div>
                              
                              {/* Available Sports */}
                              <div className="flex flex-wrap gap-1">
                                {facility.sports?.slice(0, 3).map((sport, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                                    style={{ fontFamily: 'Inter, sans-serif' }}
                                  >
                                    {sport}
                                  </span>
                                ))}
                                {facility.sports?.length > 3 && (
                                  <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    +{facility.sports.length - 3}
                                  </span>
                                )}
                              </div>
                              
                              {/* Indoor/Outdoor */}
                              <div className="flex items-center justify-between">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  facility.type === 'indoor' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-orange-100 text-orange-800'
                                }`} style={{ fontFamily: 'Inter, sans-serif' }}>
                                  {facility.type?.toUpperCase() || 'INDOOR'}
                                </span>
                                
                                {/* Reviews */}
                                <div className="flex items-center space-x-1">
                                  <div className="flex items-center">
                                    {renderStars(facility.averageRating || 4.5)}
                                  </div>
                                  <span className="text-xs text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    ({facility.reviewCount || 0})
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows */}
              {facilities.length > 4 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow z-10"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow z-10"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Popular Sports Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Caveat, cursive' }}>Popular Sports</h2>
            <p className="text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
              Discover and book your favorite sports facilities
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularSports.map((sport) => (
              <div
                key={sport.name}
                className="group cursor-pointer"
                onClick={() => navigate('/venues', { state: { sport: sport.name } })}
              >
                <div className="relative overflow-hidden rounded-lg shadow-md group-hover:shadow-lg transition-shadow">
                  {sport.image}
                  <div className={`absolute inset-0 bg-gradient-to-t ${sport.color} opacity-70`}></div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-white font-semibold text-sm" style={{ fontFamily: 'Caveat, cursive' }}>{sport.name}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


    </div>
  );
};

export default Home;
