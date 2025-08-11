import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../utils/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { CalendarIcon, ClockIcon, MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const MyBookings = () => {
  const [filterStatus, setFilterStatus] = useState('all')
  const queryClient = useQueryClient()

  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const response = await api.get('/bookings/my-bookings')
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to load bookings')
      }
      return response.data.bookings
    },
    retry: 1,
    staleTime: 1000 * 60 * 2 // 2 minutes
  })

  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId) => {
      const response = await api.put(`/bookings/${bookingId}/cancel`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-bookings'])
      toast.success('Booking cancelled successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to cancel booking')
    }
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const canCancelBooking = (booking) => {
    const bookingDateTime = new Date(`${booking.bookingDate.split('T')[0]}T${booking.startTime}`)
    const now = new Date()
    const timeDiff = bookingDateTime.getTime() - now.getTime()
    const hoursDiff = timeDiff / (1000 * 3600)
    
    return booking.status === 'CONFIRMED' && hoursDiff > 2
  }

  const filteredBookings = bookings?.filter(booking => {
    if (filterStatus === 'all') return true
    return booking.status === filterStatus.toUpperCase()
  }) || []

  if (isLoading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Bookings</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#714B67] text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Bookings</h1>
        
        {/* Filter Tabs */}
        <div className="flex space-x-4 mb-6">
          {['all', 'confirmed', 'pending', 'cancelled', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-[#714B67] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h2>
          <p className="text-gray-600 mb-6">
            {filterStatus === 'all' 
              ? "You haven't made any bookings yet." 
              : `No ${filterStatus} bookings found.`}
          </p>
          <button
            onClick={() => window.location.href = '/venues'}
            className="bg-[#714B67] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Browse Venues
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                {/* Booking Info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{booking.facility.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      <span>{booking.facility.address}</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      <span>{new Date(`1970-01-01T${booking.startTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(`1970-01-01T${booking.endTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{booking.court.name}</p>
                        <p className="text-sm text-gray-600">{booking.court.sportType}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">₹{booking.totalAmount}</p>
                        <p className="text-sm text-gray-600">Total Amount</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {canCancelBooking(booking) && (
                  <div className="mt-4 lg:mt-0 lg:ml-6">
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to cancel this booking?')) {
                          cancelBookingMutation.mutate(booking.id)
                        }
                      }}
                      disabled={cancelBookingMutation.isLoading}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyBookings
