import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { CreditCardIcon, LockClosedIcon } from '@heroicons/react/24/outline'

const Payment = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const bookingData = location.state
  
  if (!bookingData) {
    navigate('/venues')
    return null
  }

  const { facility, court, date, slots, totalAmount } = bookingData

  const handlePayment = async () => {
    setLoading(true)

    try {
      // Check if Razorpay SDK is loaded
      if (!window.Razorpay) {
        throw new Error('Payment system is not available. Please refresh the page and try again.')
      }

      // Validate booking data
      if (!facility || !court || !slots || slots.length === 0) {
        throw new Error('Invalid booking data. Please try again.')
      }

      // Format slots for API
      const formattedSlots = slots.map(slot => ({
        startTime: `${slot.padStart(2, '0')}:00`,
        endTime: `${(parseInt(slot) + 1).toString().padStart(2, '0')}:00`
      }))

      console.log('Creating booking with:', {
        facilityId: facility.id,
        courtId: court.id,
        selectedDate: date,
        selectedSlots: formattedSlots,
        totalAmount
      })

      // Create booking first
      const bookingResponse = await api.post('/bookings', {
        facilityId: facility.id,
        courtId: court.id,
        selectedDate: date,
        selectedSlots: formattedSlots,
        totalAmount
      })

      console.log('Booking response:', bookingResponse.data)

      if (!bookingResponse.data.success) {
        throw new Error(bookingResponse.data.message || 'Failed to create booking')
      }

      const bookings = bookingResponse.data.bookings
      const bookingIds = bookings.map(b => b.id)

      console.log('Booking IDs:', bookingIds)

      // Create Razorpay order
      const orderResponse = await api.post('/payment/create-order', {
        amount: totalAmount,
        currency: 'INR',
        bookingIds
      })

      console.log('Order response:', orderResponse.data)

      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.message || 'Failed to create payment order')
      }

      const { order, key } = orderResponse.data

      if (!order || !order.id) {
        throw new Error('Invalid payment order received')
      }

      // Initialize Razorpay payment
      const options = {
        key: key || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'QuickCourt',
        description: `Booking for ${facility.name} - ${court.name}`,
        order_id: order.id,
        handler: async function (response) {
          console.log('Payment success response:', response)
          try {
            // Verify payment
            const verificationResponse = await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingIds
            })

            console.log('Verification response:', verificationResponse.data)

            if (verificationResponse.data.success) {
              toast.success('Payment successful! Booking confirmed.')
              navigate('/my-bookings')
            } else {
              throw new Error('Payment verification failed')
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            toast.error('Payment verification failed. Please contact support.')
          }
        },
        prefill: {
          name: user.fullName,
          email: user.email,
          contact: user.phone || ''
        },
        notes: {
          facility_name: facility.name,
          court_name: court.name,
          booking_date: date,
          slots: slots.join(',')
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed')
            // Handle payment cancellation
            api.post('/payment/cancel', {
              orderId: order.id,
              bookingIds
            }).catch(console.error)
            setLoading(false)
          }
        }
      }

      console.log('Razorpay options:', options)

      const rzp = new window.Razorpay(options)
      
      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error)
        toast.error(`Payment failed: ${response.error.description}`)
        setLoading(false)
      })
      
      rzp.open()

    } catch (error) {
      console.error('Payment error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Payment initialization failed'
      toast.error(errorMessage)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <CreditCardIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Secure Payment</h1>
            <p className="text-gray-600">Complete your booking with secure payment</p>
          </div>

          {/* Booking Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Booking Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Facility:</span>
                <span>{facility.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Court:</span>
                <span>{court.name} ({court.sportType})</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date:</span>
                <span>{new Date(date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Time Slots:</span>
                <div className="text-right">
                  {slots.sort((a, b) => parseInt(a) - parseInt(b)).map((slot, index) => (
                    <div key={index} className="text-sm">
                      {slot.padStart(2, '0')}:00 - {(parseInt(slot) + 1).toString().padStart(2, '0')}:00
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-blue-600">₹{totalAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Payment Method</h2>
            <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center">
                <img
                  src="https://razorpay.com/assets/razorpay-logo.svg"
                  alt="Razorpay"
                  className="h-8 mr-4"
                />
                <div>
                  <p className="font-semibold">Razorpay Secure Payment</p>
                  <p className="text-sm text-gray-600">Pay using UPI, Cards, NetBanking & more</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <LockClosedIcon className="h-5 w-5 text-green-600 mr-2" />
              <div className="text-sm">
                <p className="font-semibold text-green-800">Secure Payment</p>
                <p className="text-green-700">Your payment information is encrypted and secure</p>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-[#714B67] text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Processing...
              </>
            ) : (
              <>
                <LockClosedIcon className="h-5 w-5 mr-2" />
                Pay ₹{totalAmount}
              </>
            )}
          </button>

          {/* Cancel Button */}
          <button
            onClick={() => navigate('/venues')}
            className="w-full mt-4 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancel Booking
          </button>
        </div>
      </div>
    </div>
  )
}

export default Payment
