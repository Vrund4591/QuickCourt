import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state;
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      toast.success('Payment successful! Your booking is confirmed.');
      navigate('/my-bookings');
    }, 2000);
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment session expired</h2>
          <button onClick={() => navigate('/venues')} className="btn-primary">
            Back to Venues
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Payment</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Form */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="input-field"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="input-field"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span>Booking ID:</span>
                  <span className="font-mono text-sm">{bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{bookingData.selectedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time Slots:</span>
                  <span>{bookingData.selectedSlots.length} slots</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{bookingData.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee:</span>
                  <span>₹{Math.round(bookingData.totalAmount * 0.05)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%):</span>
                  <span>₹{Math.round(bookingData.totalAmount * 0.18)}</span>
                </div>
                <hr />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>₹{Math.round(bookingData.totalAmount * 1.23)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={handlePayment}
              disabled={processing}
              className="btn-primary min-w-48"
            >
              {processing ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Pay ₹${Math.round(bookingData.totalAmount * 1.23)}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
