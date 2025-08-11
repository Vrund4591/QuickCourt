import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { UserIcon, EnvelopeIcon, PhoneIcon, PencilIcon, CalendarDaysIcon, CalendarIcon, ClockIcon, MapPinIcon, XMarkIcon, KeyIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [filterStatus, setFilterStatus] = useState('all')
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || ''
  })

  const { data: bookings, isLoading: bookingsLoading, error } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const response = await api.get('/bookings/my-bookings')
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to load bookings')
      }
      return response.data.bookings
    },
    retry: 1,
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: activeTab === 'bookings' // Only fetch when bookings tab is active
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

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await updateProfile(formData)
    
    if (result.success) {
      setIsEditing(false)
    }
    
    setLoading(false)
  }

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      avatar: user?.avatar || ''
    })
    setIsEditing(false)
  }

  const handlePasswordChange = (e) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    setPasswordLoading(true)
    
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })

      if (response.data.success) {
        toast.success('Password changed successfully')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setPasswordLoading(false)
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

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

  const renderProfileContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Profile Details</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#714B67] text-white rounded-lg hover:bg-[#5d3d57] transition-colors"
          >
            <PencilIcon className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Form Fields */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="h-4 w-4 inline mr-2" />
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67] disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <EnvelopeIcon className="h-4 w-4 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={true}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <PhoneIcon className="h-4 w-4 inline mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Enter your phone number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67] disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex space-x-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#714B67] text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#5d3d57] disabled:bg-gray-400 transition-colors"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Account Info */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Account Type:</span>
            <span className="ml-2 font-medium">{user?.role}</span>
          </div>
          <div>
            <span className="text-gray-600">Member Since:</span>
            <span className="ml-2 font-medium">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Email Verified:</span>
            <span className={`ml-2 font-medium ${user?.isVerified ? 'text-green-600' : 'text-red-600'}`}>
              {user?.isVerified ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Account Status:</span>
            <span className={`ml-2 font-medium ${user?.isActive ? 'text-green-600' : 'text-red-600'}`}>
              {user?.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderBookingsContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">My Bookings</h2>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-4">
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

      {bookingsLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#714B67]"></div>
          <span className="ml-2">Loading bookings...</span>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Bookings</h3>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#714B67] text-white px-4 py-2 rounded-lg hover:bg-[#5d3d57]"
          >
            Retry
          </button>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-8">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-600 mb-6">
            {filterStatus === 'all' 
              ? "You haven't made any bookings yet." 
              : `No ${filterStatus} bookings found.`}
          </p>
          <button
            onClick={() => window.location.href = '/venues'}
            className="bg-[#714B67] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#5d3d57] transition-colors"
          >
            Browse Venues
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-gray-50 rounded-lg p-6">
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
                        <p className="font-bold text-[#714B67]">₹{booking.totalAmount}</p>
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

  const renderPasswordContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
      </div>

      {/* Password Form */}
      <form onSubmit={handlePasswordSubmit}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <KeyIcon className="h-4 w-4 inline mr-2" />
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.current ? (
                    <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <KeyIcon className="h-4 w-4 inline mr-2" />
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.new ? (
                    <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <KeyIcon className="h-4 w-4 inline mr-2" />
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.confirm ? (
                    <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={passwordLoading}
              className="flex-1 bg-[#714B67] text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#5d3d57] disabled:bg-gray-400 transition-colors"
            >
              {passwordLoading ? 'Changing Password...' : 'Change Password'}
            </button>
            <button
              type="button"
              onClick={() => {
                setPasswordData({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                })
              }}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Clear Form
            </button>
          </div>
        </div>
      </form>

      {/* Security Tips */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Password Security Tips</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>• Use at least 8 characters with a mix of letters, numbers, and symbols</p>
          <p>• Don't use personal information like your name or email</p>
          <p>• Don't reuse passwords from other accounts</p>
          <p>• Consider using a password manager for stronger security</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-6 max-w-7xl mx-auto">
        {/* Sidebar - 30% */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* User Info */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                <img
                  src={formData.avatar || '/default-avatar.png'}
                  alt="Profile"
                  className="h-20 w-20 rounded-full object-cover border-4 border-gray-200"
                />
                {isEditing && (
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 bg-[#714B67] text-white rounded-full p-1 hover:bg-[#5d3d57]"
                  >
                    <PencilIcon className="h-3 w-3" />
                  </button>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center">{user?.fullName}</h3>
              <p className="text-sm text-gray-600">{user?.role}</p>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'profile' 
                    ? 'bg-[#714B67] text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <UserIcon className="h-5 w-5" />
                <span>Edit Profile</span>
              </button>
              
              <button
                onClick={() => setActiveTab('bookings')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'bookings' 
                    ? 'bg-[#714B67] text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <CalendarDaysIcon className="h-5 w-5" />
                <span>View All Bookings</span>
              </button>

              <button
                onClick={() => setActiveTab('password')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'password' 
                    ? 'bg-[#714B67] text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <KeyIcon className="h-5 w-5" />
                <span>Change Password</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content - 70% */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            {activeTab === 'profile' ? renderProfileContent() : 
             activeTab === 'bookings' ? renderBookingsContent() : 
             renderPasswordContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile