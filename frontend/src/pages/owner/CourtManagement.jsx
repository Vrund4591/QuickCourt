import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../utils/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ImageUpload from '../../components/common/ImageUpload'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  Cog6ToothIcon 
} from '@heroicons/react/24/outline'
import { SPORT_TYPES } from '../../utils/constants'
import toast from 'react-hot-toast'

const CourtManagement = () => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCourt, setEditingCourt] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    sportType: 'BADMINTON',
    pricePerHour: '',
    facilityId: '',
    images: []
  })
  const queryClient = useQueryClient()

  // Get owner's facilities
  const { data: facilities } = useQuery({
    queryKey: ['owner-facilities'],
    queryFn: async () => {
      const response = await api.get('/facilities/owner')
      return response.data.facilities || []
    }
  })

  // Get owner's courts
  const { data: courts, isLoading, error } = useQuery({
    queryKey: ['owner-courts'],
    queryFn: async () => {
      const response = await api.get('/owner/courts')
      return response.data.courts || []
    },
    retry: 1
  })

  // Create court mutation
  const createCourtMutation = useMutation({
    mutationFn: async (courtData) => {
      console.log('Creating court with data:', courtData)
      const response = await api.post('/courts', courtData)
      console.log('Court creation response:', response.data)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['owner-courts'])
      queryClient.invalidateQueries(['owner-facilities'])
      queryClient.invalidateQueries(['facility'])
      toast.success('Court created successfully')
      setShowAddForm(false)
      resetForm()
    },
    onError: (error) => {
      console.error('Court creation error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      
      let errorMessage = 'Failed to create court'
      
      if (error.response?.data?.details?.includes('Unknown argument `images`')) {
        errorMessage = 'Court created but images are not supported yet. Please run database migration first.'
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      toast.error(errorMessage)
    }
  })

  // Update court mutation
  const updateCourtMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/owner/courts/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['owner-courts'])
      toast.success('Court updated successfully')
      setEditingCourt(null)
      resetForm()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update court')
    }
  })

  // Delete court mutation
  const deleteCourtMutation = useMutation({
    mutationFn: async (courtId) => {
      const response = await api.delete(`/owner/courts/${courtId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['owner-courts'])
      toast.success('Court deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete court')
    }
  })

  const resetForm = () => {
    setFormData({
      name: '',
      sportType: 'BADMINTON',
      pricePerHour: '',
      facilityId: '',
      images: []
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.pricePerHour || !formData.facilityId) {
      toast.error('Please fill in all required fields')
      return
    }

    const courtData = {
      name: formData.name.trim(),
      sportType: formData.sportType,
      pricePerHour: parseFloat(formData.pricePerHour),
      facilityId: formData.facilityId,
      images: formData.images
    }

    console.log('Submitting court data:', courtData) // Debug log

    if (editingCourt) {
      updateCourtMutation.mutate({ id: editingCourt.id, data: courtData })
    } else {
      createCourtMutation.mutate(courtData)
    }
  }

  const handleEdit = (court) => {
    setEditingCourt(court)
    setFormData({
      name: court.name,
      sportType: court.sportType,
      pricePerHour: court.pricePerHour.toString(),
      facilityId: court.facilityId,
      images: court.images || []
    })
    setShowAddForm(true)
  }

  const handleImagesChange = (newImages) => {
    setFormData(prev => ({ ...prev, images: newImages }))
  }

  const handleDelete = (courtId) => {
    if (window.confirm('Are you sure you want to delete this court? This action cannot be undone.')) {
      deleteCourtMutation.mutate(courtId)
    }
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingCourt(null)
    resetForm()
  }

  if (isLoading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Courts</h2>
          <p className="text-gray-600 mb-4">
            {error.response?.data?.message || 'Failed to load courts'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Court Management</h1>
          <p className="text-gray-600">Manage courts for your facilities</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          disabled={!facilities || facilities.length === 0}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Court</span>
        </button>
      </div>

      {/* No facilities message */}
      {(!facilities || facilities.length === 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Facilities Found</h3>
            <p className="text-yellow-700 mb-4">You need to create a facility before adding courts.</p>
            <button
              onClick={() => window.location.href = '/owner/facilities'}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
            >
              Go to Facility Management
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Court Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">
            {editingCourt ? 'Edit Court' : 'Add New Court'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facility *
                </label>
                <select
                  required
                  value={formData.facilityId}
                  onChange={(e) => setFormData(prev => ({ ...prev, facilityId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a facility</option>
                  {facilities?.map(facility => (
                    <option key={facility.id} value={facility.id}>
                      {facility.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Court Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Court 1, Premium Court"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sport Type *
                </label>
                <select
                  required
                  value={formData.sportType}
                  onChange={(e) => setFormData(prev => ({ ...prev, sportType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SPORT_TYPES.map(sport => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Hour (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData(prev => ({ ...prev, pricePerHour: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Court Images */}
            <ImageUpload
              images={formData.images}
              onImagesChange={handleImagesChange}
              multiple={true}
              maxImages={5}
            />

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={createCourtMutation.isLoading || updateCourtMutation.isLoading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
              >
                {createCourtMutation.isLoading || updateCourtMutation.isLoading 
                  ? (editingCourt ? 'Updating...' : 'Creating...') 
                  : (editingCourt ? 'Update Court' : 'Create Court')
                }
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Courts List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Your Courts</h2>
        </div>
        <div className="p-6">
          {!courts || courts.length === 0 ? (
            <div className="text-center py-8">
              <Cog6ToothIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No courts yet. Add your first court!</p>
              <p className="text-sm text-gray-500">Create courts to start receiving bookings.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {courts.map((court) => (
                <div key={court.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">{court.name}</h3>
                        <span className="text-lg font-bold text-blue-600">
                          ₹{court.pricePerHour}/hour
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">Facility: {court.facility?.name}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {court.sportType}
                        </span>
                        <span>{court._count?.bookings || 0} Confirmed Bookings</span>
                      </div>
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <button 
                        onClick={() => handleEdit(court)}
                        className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        title="Edit Court"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(court.id)}
                        disabled={deleteCourtMutation.isLoading}
                        className="p-2 text-gray-600 hover:text-red-600 disabled:opacity-50 transition-colors"
                        title="Delete Court"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Court Statistics */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">Court Statistics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-bold text-blue-600">{court._count?.bookings || 0}</p>
                        <p className="text-gray-600">Total Bookings</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-green-600">
                          ₹{(court._count?.bookings || 0) * court.pricePerHour}
                        </p>
                        <p className="text-gray-600">Total Revenue</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-yellow-600">
                          {Math.round(((court._count?.bookings || 0) / 30) * 100)}%
                        </p>
                        <p className="text-gray-600">Monthly Utilization</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-purple-600">Active</p>
                        <p className="text-gray-600">Status</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CourtManagement
