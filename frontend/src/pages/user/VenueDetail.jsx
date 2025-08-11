import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../utils/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { MapPinIcon, StarIcon, ClockIcon, PhoneIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'

const VenueDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedCourt, setSelectedCourt] = useState(null)
  const [selectedSlots, setSelectedSlots] = useState([])

  const { data: facility, isLoading } = useQuery({
    queryKey: ['facility', id],
    queryFn: async () => {
      const response = await api.get(`/facilities/${id}`)
      return response.data.facility
    }
  })

  useEffect(() => {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0]
    setSelectedDate(today)
  }, [])

  const handleSlotSelection = (slot) => {
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(prev => prev.filter(s => s !== slot))
    } else {
      setSelectedSlots(prev => [...prev, slot])
    }
  }

  const handleBookNow = () => {
    if (!selectedCourt || selectedSlots.length === 0) {
      toast.error('Please select a court and time slots')
      return
    }

    navigate('/booking/confirm', {
      state: {
        facility,
        court: selectedCourt,
        date: selectedDate,
        slots: selectedSlots
      }
    })
  }

  if (isLoading) return <LoadingSpinner />

  if (!facility) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Venue not found</h2>
          <button onClick={() => navigate('/venues')} className="mt-4 text-blue-600 hover:text-blue-800">
            Back to venues
          </button>
        </div>
      </div>
    )
  }

  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ]

  const averageRating = facility.reviews?.length > 0 
    ? facility.reviews.reduce((sum, review) => sum + review.rating, 0) / facility.reviews.length 
    : 0

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Images */}
            <div>
              {facility.images && facility.images.length > 0 ? (
                <img
                  src={facility.images[0]}
                  alt={facility.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{facility.name}</h1>
              
              <div className="flex items-center mb-3">
                <MapPinIcon className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-600">{facility.address}</span>
              </div>

              {averageRating > 0 && (
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      star <= averageRating ? (
                        <StarIconSolid key={star} className="h-5 w-5 text-yellow-400" />
                      ) : (
                        <StarIcon key={star} className="h-5 w-5 text-gray-300" />
                      )
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600">
                    {averageRating.toFixed(1)} ({facility.reviews?.length} reviews)
                  </span>
                </div>
              )}

              <div className="mb-4">
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {facility.venueType}
                </span>
              </div>

              <p className="text-gray-700 mb-6">{facility.description}</p>

              {/* Amenities */}
              {facility.amenities && facility.amenities.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {facility.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Courts and Booking */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Courts List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Available Courts</h2>
              <div className="space-y-3">
                {facility.courts?.map((court) => (
                  <div
                    key={court.id}
                    onClick={() => setSelectedCourt(court)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedCourt?.id === court.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{court.name}</h3>
                        <p className="text-sm text-gray-600">{court.sportType}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">₹{court.pricePerHour}</p>
                        <p className="text-xs text-gray-500">per hour</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Book Your Slot</h2>
              
              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Time Slots */}
              {selectedCourt && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Time Slots
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => handleSlotSelection(slot)}
                        className={`p-3 border rounded-lg text-center transition-colors ${
                          selectedSlots.includes(slot)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Booking Summary */}
              {selectedCourt && selectedSlots.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold mb-2">Booking Summary</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Court:</span> {selectedCourt.name}</p>
                    <p><span className="font-medium">Date:</span> {selectedDate}</p>
                    <p><span className="font-medium">Slots:</span> {selectedSlots.join(', ')}</p>
                    <p><span className="font-medium">Duration:</span> {selectedSlots.length} hour(s)</p>
                    <p className="text-lg font-bold text-blue-600">
                      Total: ₹{selectedCourt.pricePerHour * selectedSlots.length}
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={handleBookNow}
                disabled={!selectedCourt || selectedSlots.length === 0}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {facility.reviews && facility.reviews.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-bold mb-4">Reviews</h2>
            <div className="space-y-4">
              {facility.reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-4">
                  <div className="flex items-center mb-2">
                    <img
                      src={review.user.avatar || '/default-avatar.png'}
                      alt={review.user.fullName}
                      className="h-8 w-8 rounded-full mr-3"
                    />
                    <div>
                      <p className="font-medium">{review.user.fullName}</p>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          star <= review.rating ? (
                            <StarIconSolid key={star} className="h-4 w-4 text-yellow-400" />
                          ) : (
                            <StarIcon key={star} className="h-4 w-4 text-gray-300" />
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VenueDetail
