import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const VenueDetailPage = () => {
  const { id } = useParams();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVenue();
  }, [id]);

  const fetchVenue = async () => {
    try {
      const response = await axios.get(`/facilities/${id}`);
      if (response.data.success) {
        setVenue(response.data.facility);
      }
    } catch (error) {
      toast.error('Failed to load venue details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Venue not found</h2>
          <Link to="/venues" className="btn-primary">Back to Venues</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{venue.name}</h1>
          <p className="text-gray-600 mb-6">{venue.description}</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Venue Info */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Venue Information</h3>
              <div className="space-y-2">
                <p><strong>Address:</strong> {venue.address}</p>
                <p><strong>Type:</strong> {venue.venueType}</p>
                <p><strong>Owner:</strong> {venue.owner.fullName}</p>
              </div>

              {venue.amenities && venue.amenities.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-4">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {venue.amenities.map((amenity, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Courts */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Available Courts</h3>
              <div className="space-y-4">
                {venue.courts.map((court) => (
                  <div key={court.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{court.name}</h4>
                      <span className="text-lg font-bold text-[#604058]">₹{court.pricePerHour}/hr</span>
                    </div>
                    <p className="text-gray-600 mb-4">Sport: {court.sportType}</p>
                    <Link 
                      to={`/booking/${venue.id}?court=${court.id}`}
                      className="btn-primary w-full text-center block"
                    >
                      Book This Court
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueDetailPage;
