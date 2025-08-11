import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const BookingPage = () => {
  const { facilityId } = useParams();
  const [searchParams] = useSearchParams();
  const courtId = searchParams.get('court');
  const navigate = useNavigate();

  const [facility, setFacility] = useState(null);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const timeSlots = [
    { id: 1, startTime: '06:00', endTime: '07:00' },
    { id: 2, startTime: '07:00', endTime: '08:00' },
    { id: 3, startTime: '08:00', endTime: '09:00' },
    { id: 4, startTime: '09:00', endTime: '10:00' },
    { id: 5, startTime: '10:00', endTime: '11:00' },
    { id: 6, startTime: '11:00', endTime: '12:00' },
    { id: 7, startTime: '12:00', endTime: '13:00' },
    { id: 8, startTime: '13:00', endTime: '14:00' },
    { id: 9, startTime: '14:00', endTime: '15:00' },
    { id: 10, startTime: '15:00', endTime: '16:00' },
    { id: 11, startTime: '16:00', endTime: '17:00' },
    { id: 12, startTime: '17:00', endTime: '18:00' },
    { id: 13, startTime: '18:00', endTime: '19:00' },
    { id: 14, startTime: '19:00', endTime: '20:00' },
    { id: 15, startTime: '20:00', endTime: '21:00' },
    { id: 16, startTime: '21:00', endTime: '22:00' },
  ];

  useEffect(() => {
    fetchFacility();
  }, [facilityId]);

  useEffect(() => {
    if (facility && courtId) {
      const court = facility.courts.find(c => c.id === courtId);
      setSelectedCourt(court);
    }
  }, [facility, courtId]);

  const fetchFacility = async () => {
    try {
      const response = await axios.get(`/facilities/${facilityId}`);
      if (response.data.success) {
        setFacility(response.data.facility);
      }
    } catch (error) {
      toast.error('Failed to load facility details');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotToggle = (slot) => {
    setSelectedSlots(prev => {
      const isSelected = prev.find(s => s.id === slot.id);
      if (isSelected) {
        return prev.filter(s => s.id !== slot.id);
      } else {
        return [...prev, slot];
      }
    });
  };

  const calculateTotal = () => {
    if (!selectedCourt || selectedSlots.length === 0) return 0;
    return selectedSlots.length * selectedCourt.pricePerHour;
  };

  const handleProceedToConfirmation = () => {
    if (!selectedCourt || !selectedDate || selectedSlots.length === 0) {
      toast.error('Please select court, date and time slots');
      return;
    }

    const bookingData = {
      facilityId,
      courtId: selectedCourt.id,
      selectedDate,
      selectedSlots,
      totalAmount: calculateTotal()
    };

    navigate(`/booking-confirmation/${facilityId}`, { state: bookingData });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Facility not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Book {facility.name}</h1>
              
              {/* Court Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Select Court</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {facility.courts.map((court) => (
                    <div
                      key={court.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedCourt?.id === court.id
                          ? 'border-[#604058] bg-[#604058]/10'
                          : 'border-gray-200 hover:border-[#604058]'
                      }`}
                      onClick={() => setSelectedCourt(court)}
                    >
                      <h4 className="font-semibold">{court.name}</h4>
                      <p className="text-gray-600">{court.sportType}</p>
                      <p className="text-[#604058] font-bold">₹{court.pricePerHour}/hr</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Select Date</h3>
                <input
                  type="date"
                  className="input-field max-w-xs"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Time Slots */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Select Time Slots</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.id}
                      className={`p-3 text-sm border rounded-lg transition-colors ${
                        selectedSlots.find(s => s.id === slot.id)
                          ? 'border-[#604058] bg-[#604058] text-white'
                          : 'border-gray-200 hover:border-[#604058]'
                      }`}
                      onClick={() => handleSlotToggle(slot)}
                    >
                      {slot.startTime} - {slot.endTime}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
              
              {selectedCourt && (
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Court:</span>
                    <span>{selectedCourt.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sport:</span>
                    <span>{selectedCourt.sportType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{selectedDate || 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time Slots:</span>
                    <span>{selectedSlots.length} slot(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per hour:</span>
                    <span>₹{selectedCourt.pricePerHour}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>₹{calculateTotal()}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleProceedToConfirmation}
                disabled={!selectedCourt || !selectedDate || selectedSlots.length === 0}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
