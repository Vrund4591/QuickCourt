import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const VenuesPage = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    sportType: '',
    venueType: '',
    priceRange: ''
  });

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const response = await axios.get('/facilities');
      if (response.data.success) {
        setVenues(response.data.facilities);
      }
    } catch (error) {
      toast.error('Failed to load venues');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const filteredVenues = venues.filter(venue => {
    const matchesSearch = venue.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         venue.address.toLowerCase().includes(filters.search.toLowerCase());
    const matchesVenueType = !filters.venueType || venue.venueType === filters.venueType;
    
    return matchesSearch && matchesVenueType;
  });

  const getAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getMinPrice = (courts) => {
    if (!courts || courts.length === 0) return 0;
    return Math.min(...courts.map(court => court.pricePerHour));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sports Venues</h1>
          <p className="text-gray-600">Find and book the perfect venue for your sport</p>
        </div>

        {/* Filters */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                name="search"
                placeholder="Search venues..."
                className="input-field"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Venue Type</label>
              <select
                name="venueType"
                className="input-field"
                value={filters.venueType}
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                <option value="INDOOR">Indoor</option>
                <option value="OUTDOOR">Outdoor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sport Type</label>
              <select
                name="sportType"
                className="input-field"
                value={filters.sportType}
                onChange={handleFilterChange}
              >
                <option value="">All Sports</option>
                <option value="BADMINTON">Badminton</option>
                <option value="TENNIS">Tennis</option>
                <option value="FOOTBALL">Football</option>
                <option value="BASKETBALL">Basketball</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <select
                name="priceRange"
                className="input-field"
                value={filters.priceRange}
                onChange={handleFilterChange}
              >
                <option value="">All Prices</option>
                <option value="0-500">Under ₹500</option>
                <option value="500-1000">₹500 - ₹1000</option>
                <option value="1000+">Above ₹1000</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600">{filteredVenues.length} venues found</p>
        </div>

        {/* Venues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => (
            <Link key={venue.id} to={`/venues/${venue.id}`} className="card hover:scale-105 transition-transform">
              <div className="relative">
                {venue.images && venue.images.length > 0 ? (
                  <img
                    src={venue.images[0]}
                    alt={venue.name}
                    className="w-full h-48 object-cover rounded-t-xl"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-t-xl flex items-center justify-center">
                    <span className="text-gray-400 text-lg">No Image</span>
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 text-sm font-medium">
                  {venue.venueType}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{venue.name}</h3>
                <p className="text-gray-600 mb-2">{venue.address}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {getAverageRating(venue.reviews) > 0 ? (
                      <>
                        <div className="star-rating">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`star ${i < Math.floor(getAverageRating(venue.reviews)) ? '' : 'empty'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          ({getAverageRating(venue.reviews)})
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">No reviews</span>
                    )}
                  </div>
                  <span className="text-lg font-bold text-[#604058]">
                    ₹{getMinPrice(venue.courts)}/hr
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {venue.courts.slice(0, 3).map((court) => (
                    <span
                      key={court.id}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {court.sportType}
                    </span>
                  ))}
                  {venue.courts.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      +{venue.courts.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredVenues.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No venues found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VenuesPage;
