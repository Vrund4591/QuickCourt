import { useState, useEffect } from 'react'
import {
  UserCircleIcon,
  PencilIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CameraIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XMarkIcon,
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import api from '../../utils/api'

const OwnerProfile = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [facilities, setFacilities] = useState([])
  const [stats, setStats] = useState({
    totalFacilities: 0,
    totalBookings: 0,
    monthlyRevenue: 0,
    activeBookings: 0
  })
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchProfile()
    fetchStats()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/profile')
      if (response.data) {
        setUser(response.data.user || response.data)
        setFormData({
          fullName: response.data.user?.fullName || response.data.fullName || '',
          email: response.data.user?.email || response.data.email || '',
          phone: response.data.user?.phone || response.data.phone || '',
          // address: response.data.user?.address || response.data.address || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Use specific endpoints that we know exist
      const [facilitiesRes, bookingsRes] = await Promise.all([
        api.get('/facilities/my-facilities'),
        api.get('/bookings')
      ]);

      const facilities = facilitiesRes.data.facilities || []
      const bookings = bookingsRes.data.bookings || []

      console.log('Facilities data:', facilities)
      console.log('Bookings data:', bookings)
      
      // Set facilities state for displaying in profile
      setFacilities(facilities)

      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()

      setStats({
        totalFacilities: facilities.length,
        totalBookings: bookings.length,
        monthlyRevenue: bookings
          .filter(b => {
            const bookingDate = new Date(b.bookingDate || b.date)
            return b.status !== 'CANCELLED' && 
                   bookingDate.getMonth() === currentMonth &&
                   bookingDate.getFullYear() === currentYear
          })
          .reduce((sum, b) => sum + (b.totalAmount || b.amount || 0), 0),
        activeBookings: bookings.filter(b => 
          b.status === 'CONFIRMED' || b.status === 'PENDING' || 
          b.status === 'confirmed' || b.status === 'pending'
        ).length
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      setStats({
        totalFacilities: 0,
        totalBookings: 0,
        monthlyRevenue: 0,
        activeBookings: 0
      })
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required to set new password'
      }
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'New password must be at least 6 characters'
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setSuccessMessage('')

    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      setLoading(true)
      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      }

      // Add password fields only if new password is provided
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword
        updateData.newPassword = formData.newPassword
      }

      const response = await api.put('/auth/profile', updateData)
      
      if (response.data.success) {
        setSuccessMessage('Profile updated successfully!')
        setUser(response.data.user)
        setIsEditing(false)
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message })
      } else {
        setErrors({ submit: 'Failed to update profile. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setErrors({})
    setSuccessMessage('')
  }

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#714B67] border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[#714B67] to-purple-600 px-6 py-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                  <UserCircleIcon className="w-16 h-16 text-white" />
                </div>
                <button className="absolute bottom-0 right-0 bg-white text-[#714B67] p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors">
                  <CameraIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold caveat">{user?.fullName || 'Facility Owner'}</h1>
                <p className="text-white/80 mb-2">{user?.email}</p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="bg-white/20 px-3 py-1 rounded-full">Facility Owner</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 border-b">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2">
                <BuildingStorefrontIcon className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalFacilities}</p>
              <p className="text-sm text-gray-600">Facilities</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2">
                <CalendarDaysIcon className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              <p className="text-sm text-gray-600">Total Bookings</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2">
                <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.monthlyRevenue}</p>
              <p className="text-sm text-gray-600">This Month</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2">
                <ChartBarIcon className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.activeBookings}</p>
              <p className="text-sm text-gray-600">Active</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-[#714B67] text-[#714B67]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('facilities')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'facilities'
                    ? 'border-[#714B67] text-[#714B67]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Facilities
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'security'
                    ? 'border-[#714B67] text-[#714B67]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Security Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              {successMessage}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 bg-[#714B67] text-white px-4 py-2 rounded-lg hover:bg-[#5d3a56] transition-colors"
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form Fields */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#714B67] focus:border-transparent transition-colors ${
                          !isEditing ? 'bg-gray-50' : 'bg-white'
                        } ${errors.fullName ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#714B67] focus:border-transparent transition-colors ${
                          !isEditing ? 'bg-gray-50' : 'bg-white'
                        } ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="Enter your email"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#714B67] focus:border-transparent transition-colors ${
                          !isEditing ? 'bg-gray-50' : 'bg-white'
                        } ${errors.phone ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#714B67] focus:border-transparent transition-colors ${
                          !isEditing ? 'bg-gray-50' : 'bg-white'
                        } ${errors.address ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="Enter your address"
                      />
                    </div>
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                    )}
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Facilities Tab */}
          {activeTab === 'facilities' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">My Facilities</h2>
                <span className="text-sm text-gray-500">{facilities.length} facilities total</span>
              </div>

              {facilities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {facilities.map((facility, index) => (
                    <div key={facility.id || index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <div className="flex items-start space-x-4">
                        <div className="bg-[#714B67] bg-opacity-10 p-3 rounded-lg">
                          <BuildingStorefrontIcon className="h-6 w-6 text-[#714B67]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 mb-2">
                            {facility.name || 'Facility Name'}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3">
                            {facility.address || 'Address not available'}
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Phone:</span>
                              <span className="text-gray-900">{facility.phone || 'Not provided'}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Email:</span>
                              <span className="text-gray-900">{facility.email || 'Not provided'}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Courts:</span>
                              <span className="text-gray-900">{facility.courts?.length || 0} courts</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Rating:</span>
                              <span className="text-gray-900">
                                {facility.rating ? `${facility.rating}/5` : 'No rating'}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                facility.status === 'ACTIVE' || facility.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {facility.status || (facility.isActive ? 'Active' : 'Inactive')}
                              </span>
                              <div className="flex space-x-2">
                                <button className="text-[#714B67] hover:text-[#5d3a56] text-sm font-medium">
                                  Edit
                                </button>
                                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                  View Details
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BuildingStorefrontIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No facilities yet</h3>
                  <p className="text-gray-500 mb-6">
                    You haven't added any facilities to your account yet.
                  </p>
                  <button className="bg-[#714B67] text-white px-6 py-3 rounded-lg hover:bg-[#5d3a56] transition-colors">
                    Add Your First Facility
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h2>
              <form onSubmit={handleSubmit} className="max-w-md space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#714B67] focus:border-transparent transition-colors ${
                        errors.currentPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#714B67] focus:border-transparent transition-colors ${
                      errors.newPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter new password"
                  />
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#714B67] focus:border-transparent transition-colors ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Confirm new password"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {errors.submit}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#714B67] text-white py-3 px-4 rounded-lg hover:bg-[#5d3a56] transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  ) : null}
                  {loading ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OwnerProfile
