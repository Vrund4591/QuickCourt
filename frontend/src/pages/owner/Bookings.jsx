import { useState, useEffect } from 'react'
import {
  CalendarDaysIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  UserIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import api from '../../utils/api'

const OwnerBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      
      // Try different possible endpoints to get booking data
      let response;
      const possibleEndpoints = [
        // '/api/bookings', // Common REST endpoint
        '/bookings', // Simple bookings endpoint
        // '/owner/bookings', // Owner specific bookings
        // '/api/owner/bookings', // API prefixed owner bookings
        // '/courts/bookings', // Court bookings endpoint
        // '/api/courts/bookings' // API prefixed court bookings
      ];

      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          response = await api.get(endpoint);
          console.log(`Success with endpoint: ${endpoint}`, response.data);
          break;
        } catch (err) {
          console.log(`Failed endpoint: ${endpoint}`, err.response?.status);
          if (endpoint === possibleEndpoints[possibleEndpoints.length - 1]) {
            throw err; // If this is the last endpoint, throw the error
          }
        }
      }
      
      // Handle different response structures
      if (response?.data?.bookings) {
        setBookings(response.data.bookings);
      } else if (response?.data?.data) {
        setBookings(response.data.data);
      } else if (Array.isArray(response?.data)) {
        setBookings(response.data);
      } else if (response?.data?.success && Array.isArray(response?.data?.data)) {
        setBookings(response.data.data);
      } else {
        console.warn('Unexpected response format:', response?.data);
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  // Calculate statistics
  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
    pending: bookings.filter(b => b.status === 'PENDING').length,
    cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
    completed: bookings.filter(b => b.status === 'COMPLETED').length,
    totalRevenue: bookings
      .filter(b => b.status !== 'CANCELLED')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0)
  }

  // Chart data for bookings by status
  const chartData = [
    { name: 'Confirmed', value: stats.confirmed, color: '#10B981' },
    { name: 'Pending', value: stats.pending, color: '#F59E0B' },
    { name: 'Completed', value: stats.completed, color: '#3B82F6' },
    { name: 'Cancelled', value: stats.cancelled, color: '#EF4444' }
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />
      case 'PENDING':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />
      case 'CANCELLED':
        return <XCircleIcon className="h-4 w-4 text-red-500" />
      case 'COMPLETED':
        return <CheckCircleIcon className="h-4 w-4 text-blue-500" />
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1"
    switch (status) {
      case 'CONFIRMED':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'PENDING':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'CANCELLED':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'COMPLETED':
        return `${baseClasses} bg-blue-100 text-blue-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      (booking.user?.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (booking.court?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (booking.facility?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
    
    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const bookingDate = booking.bookingDate?.split('T')[0]
    
    const matchesDate = dateFilter === 'all' || 
                       (dateFilter === 'today' && bookingDate === today) ||
                       (dateFilter === 'week' && bookingDate >= weekAgo)
    
    return matchesSearch && matchesStatus && matchesDate
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#714B67] border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 caveat">Bookings Management</h1>
          <p className="text-gray-600">Track and manage all your court bookings</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-[#714B67]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
              <div className="bg-[#714B67] bg-opacity-10 p-3 rounded-full">
                <CalendarDaysIcon className="h-6 w-6 text-[#714B67]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Confirmed</p>
                <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
                <p className="text-xs text-green-600 mt-1">Active bookings</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-xs text-yellow-600 mt-1">Awaiting approval</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalRevenue}</p>
                <p className="text-xs text-blue-600 mt-1">Lifetime earnings</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Booking Status Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Booking Overview</h3>
              <ChartBarIcon className="h-5 w-5 text-gray-400" />
            </div>
            
            {stats.total > 0 ? (
              <div className="space-y-4">
                {chartData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300" 
                          style={{ 
                            backgroundColor: item.color, 
                            width: `${(item.value / stats.total) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-8 text-right">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ChartBarIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No booking data available</p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Stats</h3>
            <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-[#714B67] to-purple-600 rounded-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Today's Revenue</p>
                    <p className="text-2xl font-bold">
                      {bookings
                        .filter(b => b.status !== 'CANCELLED' && 
                          b.bookingDate?.split('T')[0] === new Date().toISOString().split('T')[0])
                        .reduce((sum, b) => sum + (b.totalAmount || 0), 0)}
                    </p>
                  </div>
                  <CurrencyDollarIcon className="h-8 w-8 text-white/60" />
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">This Week</p>
                    <p className="text-2xl font-bold">
                      {bookings.filter(b => {
                        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                        return b.bookingDate?.split('T')[0] >= weekAgo
                      }).length}
                    </p>
                  </div>
                  <CalendarDaysIcon className="h-8 w-8 text-white/60" />
                </div>
              </div>              <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Completion Rate</p>
                    <p className="text-2xl font-bold">
                      {stats.total > 0 ? Math.round(((stats.completed + stats.confirmed) / stats.total) * 100) : 0}%
                    </p>
                  </div>
                  <CheckCircleIcon className="h-8 w-8 text-white/60" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#714B67] focus:border-transparent transition-colors"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#714B67] focus:border-transparent transition-colors"
              >
                <option value="all">All Status</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#714B67] focus:border-transparent transition-colors"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
              </select>
            </div>

            <button className="flex items-center space-x-2 px-4 py-2 bg-[#714B67] text-white rounded-lg hover:bg-[#5d3a56] transition-colors">
              <DocumentArrowDownIcon className="h-5 w-5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Customer</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Court</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Date & Time</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Amount</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gray-100 p-2 rounded-full">
                            <UserIcon className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {booking.user?.fullName || 'Unknown User'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {booking.user?.email || 'No contact info'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <MapPinIcon className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {booking.court?.name || 'Court Name'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {booking.facility?.name || 'Facility'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">
                            {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'No date'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {booking.startTime || 'No time'} - {booking.endTime || ''}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={getStatusBadge(booking.status)}>
                          {getStatusIcon(booking.status)}
                          <span className="capitalize">{booking.status?.toLowerCase() || 'pending'}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-gray-900">
                          {booking.totalAmount || 0}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <button className="flex items-center space-x-1 text-[#714B67] hover:text-[#5d3a56] transition-colors">
                          <EyeIcon className="h-4 w-4" />
                          <span className="text-sm">View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <CalendarDaysIcon className="h-12 w-12 text-gray-300" />
                        <div>
                          <p className="text-gray-500 text-lg">No bookings found</p>
                          <p className="text-gray-400 text-sm">
                            {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
                              ? 'Try adjusting your filters'
                              : 'Bookings will appear here once customers make reservations'}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OwnerBookings
