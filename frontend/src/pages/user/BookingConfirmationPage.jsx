import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BookingConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state;

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No booking data found</h2>
          <button onClick={() => navigate('/venues')} className="btn-primary">
            Back to Venues
          </button>
        </div>
      </div>
    );
  }

  const handleConfirmBooking = () => {
    // Simulate booking creation and redirect to payment
    const bookingId = 'booking_' + Date.now();
    navigate(`/payment/${bookingId}`, { state: bookingData });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Confirm Your Booking</h1>
          
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Booking Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Date</p>
                  <p className="font-semibold">{bookingData.selectedDate}</p>
                </div>
                <div>
                  <p className="text-gray-600">Court</p>
                  <p className="font-semibold">Court {bookingData.courtId}</p>
                </div>
                <div>
                  <p className="text-gray-600">Time Slots</p>
                  <p className="font-semibold">
                    {bookingData.selectedSlots.map(slot => 
                      `${slot.startTime}-${slot.endTime}`
                    ).join(', ')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Total Amount</p>
                  <p className="font-semibold text-[#604058] text-xl">₹{bookingData.totalAmount}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="btn-secondary"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirmBooking}
                className="btn-primary"
              >
                Confirm & Pay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
