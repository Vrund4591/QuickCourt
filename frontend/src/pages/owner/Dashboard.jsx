import { useQuery } from '@tanstack/react-query'
import api from '../../utils/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { 
  BuildingOfficeIcon, 
  CalendarIcon, 
  CurrencyRupeeIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline'

const OwnerDashboard = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['owner-dashboard'],
    queryFn: async () => {
      const response = await api.get('/owner/dashboard')
      return response.data
    }
  })

  if (isLoading) return <LoadingSpinner />

  const stats = dashboardData?.stats || {}
  const recentBookings = dashboardData?.recentBookings || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's an overview of your facilities.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <BuildingOfficeIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Facilities</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalFacilities || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBookings || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <CurrencyRupeeIcon className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">This Month Earnings</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.monthlyEarnings || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Active Courts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeCourts || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Recent Bookings</h2>
        {recentBookings.length === 0 ? (
          <div className="text-center py-8">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No recent bookings</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Facility</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Time</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-100">
                    <td className="py-3 px-4">{booking.user?.fullName}</td>
                    <td className="py-3 px-4">{booking.facility?.name}</td>
                    <td className="py-3 px-4">{new Date(booking.bookingDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{booking.startTime} - {booking.endTime}</td>
                    <td className="py-3 px-4">₹{booking.totalAmount}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default OwnerDashboard
