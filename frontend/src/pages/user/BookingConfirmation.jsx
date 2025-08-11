import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircleIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline'

const BookingConfirmation = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)

  const bookingData = location.state
  
  if (!bookingData) {
    navigate('/venues')
    return null
  }

  const { facility, court, date, slots } = bookingData
  const totalAmount = court.pricePerHour * slots.length

  const handleConfirmBooking = async () => {
    setLoading(true)
    
    // Navigate to payment page with booking data
    navigate('/payment', {
      state: {
        ...bookingData,
        totalAmount
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Confirm Your Booking</h1>
            <p className="text-gray-600">Please review your booking details before proceeding to payment</p>
          </div>

          {/* Booking Details Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-6">Booking Details</h2>
            
            {/* Facility Info */}
            <div className="border-b border-gray-200 pb-4 mb-4">
              <div className="flex items-start space-x-4">
                {facility.images && facility.images[0] && (
                  <img
                    src={facility.images[0]}
                    alt={facility.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{facility.name}</h3>
                  <div className="flex items-center text-gray-600 mt-1">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span className="text-sm">{facility.address}</span>
                  </div>
                  <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium mt-2">
                    {facility.venueType}
                  </span>
                </div>
              </div>
            </div>

            {/* Court and Time Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Court</label>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-semibold">{court.name}</p>
                    <p className="text-sm text-gray-600">{court.sportType}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-semibold">{new Date(date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">{new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Slots</label>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {slots.map((slot, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {slot}:00 - {parseInt(slot) + 1}:00
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    <span>Duration: {slots.length} hour(s)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Price Breakdown</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Court rental ({slots.length} hour(s))</span>
                <span>₹{court.pricePerHour} × {slots.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform fee</span>
                <span>₹0</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-blue-600">₹{totalAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Important Notes</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Booking cancellation is allowed up to 2 hours before the start time</li>
                    <li>Please arrive 15 minutes before your booking time</li>
                    <li>Carry a valid ID for verification</li>
                    <li>Follow facility rules and regulations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={handleConfirmBooking}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingConfirmation
