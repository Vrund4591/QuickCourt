import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../utils/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { CheckIcon, XMarkIcon, EyeIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const FacilityApproval = () => {
  const queryClient = useQueryClient()

  const { data: facilities, isLoading } = useQuery({
    queryKey: ['pending-facilities'],
    queryFn: async () => {
      const response = await api.get('/admin/facilities/pending')
      return response.data.facilities
    }
  })

  const approveFacilityMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await api.put(`/admin/facilities/${id}/status`, { status })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-facilities'])
      toast.success('Facility status updated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update facility status')
    }
  })

  const handleApprove = (facilityId) => {
    if (window.confirm('Are you sure you want to approve this facility?')) {
      approveFacilityMutation.mutate({ id: facilityId, status: 'APPROVED' })
    }
  }

  const handleReject = (facilityId) => {
    if (window.confirm('Are you sure you want to reject this facility?')) {
      approveFacilityMutation.mutate({ id: facilityId, status: 'REJECTED' })
    }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Facility Approval</h1>
        <p className="text-gray-600">Review and approve pending facility registrations</p>
      </div>

      {facilities?.length === 0 ? (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No pending facilities</h2>
          <p className="text-gray-600">All facilities have been reviewed</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {facilities?.map((facility) => (
            <div key={facility.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{facility.name}</h3>
                  <p className="text-gray-600 mb-2">{facility.address}</p>
                  <p className="text-gray-700 mb-4">{facility.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Owner:</span>
                      <p className="text-gray-600">{facility.owner?.fullName}</p>
                      <p className="text-gray-600">{facility.owner?.email}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Venue Type:</span>
                      <p className="text-gray-600">{facility.venueType}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Submitted:</span>
                      <p className="text-gray-600">{new Date(facility.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {facility.amenities && facility.amenities.length > 0 && (
                    <div className="mt-4">
                      <span className="font-medium text-gray-700">Amenities:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {facility.amenities.map((amenity, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 ml-6">
                  <button
                    onClick={() => handleApprove(facility.id)}
                    disabled={approveFacilityMutation.isLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
                  >
                    <CheckIcon className="h-4 w-4" />
                    <span>Approve</span>
                  </button>
                  
                  <button
                    onClick={() => handleReject(facility.id)}
                    disabled={approveFacilityMutation.isLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                    <EyeIcon className="h-4 w-4" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FacilityApproval
