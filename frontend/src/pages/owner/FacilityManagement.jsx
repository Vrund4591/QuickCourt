import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../utils/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ImageUpload from '../../components/common/ImageUpload'
import { PlusIcon, PencilIcon, EyeIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import { VENUE_TYPES, AMENITIES } from '../../utils/constants'
import toast from 'react-hot-toast'

const FacilityManagement = () => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    location: '',
    venueType: 'INDOOR',
    amenities: [],
    images: []
  })
  const queryClient = useQueryClient()

  const { data: facilities, isLoading, error } = useQuery({
    queryKey: ['owner-facilities'],
    queryFn: async () => {
      const response = await api.get('/facilities/owner')
      return response.data.facilities || []
    },
    retry: 1,
    staleTime: 1000 * 60 * 5
  })

  const createFacilityMutation = useMutation({
    mutationFn: async (facilityData) => {
      const response = await api.post('/facilities', facilityData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['owner-facilities'])
      toast.success('Facility created successfully')
      setShowAddForm(false)
      setFormData({
        name: '',
        description: '',
        address: '',
        location: '',
        venueType: 'INDOOR',
        amenities: []
      })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create facility')
    }
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.description.trim() || !formData.address.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    createFacilityMutation.mutate(formData)
  }

  const handleAmenityChange = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const handleImagesChange = (newImages) => {
    setFormData(prev => ({ ...prev, images: newImages }))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Facilities</h2>
          <p className="text-gray-600 mb-4">
            {error.response?.data?.message || 'Failed to load facilities'}
          </p>
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Facility Management</h1>
          <p className="text-gray-600">Manage your sports facilities</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-[#714B67] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Facility</span>
        </button>
      </div>

      {/* Add Facility Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Add New Facility</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facility Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter facility name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue Type
                </label>
                <select
                  value={formData.venueType}
                  onChange={(e) => setFormData(prev => ({ ...prev, venueType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {VENUE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <textarea
                required
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter complete address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your facility"
              />
            </div>

            {/* Image Upload Section */}
            <ImageUpload
              images={formData.images}
              onImagesChange={handleImagesChange}
              multiple={true}
              maxImages={10}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amenities
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {AMENITIES.map(amenity => (
                  <label key={amenity} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityChange(amenity)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={createFacilityMutation.isLoading}
                className="bg-[#714B67] text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
              >
                {createFacilityMutation.isLoading ? 'Creating...' : 'Create Facility'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Facilities List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Your Facilities</h2>
        </div>
        <div className="p-6">
          {!facilities || facilities.length === 0 ? (
            <div className="text-center py-8">
              <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No facilities yet. Add your first facility!</p>
              <p className="text-sm text-gray-500">Create a facility to start managing courts and bookings.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {facilities.map((facility) => (
                <div key={facility.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{facility.name}</h3>
                      <p className="text-gray-600">{facility.address}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(facility.status)}`}>
                      {facility.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{facility.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{facility.venueType}</span>
                      <span>{facility.courts?.length || 0} Courts</span>
                      {facility.amenities && facility.amenities.length > 0 && (
                        <span>{facility.amenities.length} Amenities</span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button 
                        className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        title="Edit Facility"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Status Messages */}
                  {facility.status === 'PENDING' && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        Your facility is pending approval. You'll be notified once it's reviewed.
                      </p>
                    </div>
                  )}
                  
                  {facility.status === 'REJECTED' && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        Your facility was rejected. Please contact support for more information.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FacilityManagement
