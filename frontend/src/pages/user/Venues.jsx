import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../utils/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { MagnifyingGlassIcon, MapPinIcon, StarIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { SPORT_TYPES, VENUE_TYPES } from '../../utils/constants'

const Venues = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    sportType: searchParams.get('sportType') || '',
    venueType: searchParams.get('venueType') || '',
    priceRange: searchParams.get('priceRange') || '',
    rating: searchParams.get('rating') || '',
    page: parseInt(searchParams.get('page')) || 1
  })
  const [showFilters, setShowFilters] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState(null)

  const { data: allData, isLoading } = useQuery({
    queryKey: ['allVenues'],
    queryFn: async () => {
      const response = await api.get('/facilities')
      return response.data
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  // Memoized filtered facilities based on current filters
  const filteredData = useMemo(() => {
    if (!allData?.facilities) return { facilities: [], pagination: {} }
    
    let filtered = [...allData.facilities]
    
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(facility => 
        facility.name.toLowerCase().includes(searchTerm) ||
        facility.address.toLowerCase().includes(searchTerm) ||
        facility.venueType.toLowerCase().includes(searchTerm) ||
        facility.courts?.some(court => 
          court.sportType.toLowerCase().includes(searchTerm)
        )
      )
    }
    
    // Sport type filter
    if (filters.sportType) {
      filtered = filtered.filter(facility =>
        facility.courts?.some(court => court.sportType === filters.sportType)
      )
    }
    
    // Venue type filter
    if (filters.venueType) {
      filtered = filtered.filter(facility => 
        facility.venueType === filters.venueType
      )
    }
    
    // Price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange === '2000+' 
        ? [2000, Infinity] 
        : filters.priceRange.split('-').map(Number)
      
      filtered = filtered.filter(facility => {
        const minPrice = facility.courts && facility.courts.length > 0
          ? Math.min(...facility.courts.map(court => court.pricePerHour))
          : 0
        return minPrice >= min && (max === Infinity || minPrice <= max)
      })
    }
    
    // Rating filter
    if (filters.rating) {
      const minRating = parseFloat(filters.rating)
      filtered = filtered.filter(facility => {
        if (!facility.reviews || facility.reviews.length === 0) return false
        const avgRating = facility.reviews.reduce((sum, review) => sum + review.rating, 0) / facility.reviews.length
        return avgRating >= minRating
      })
    }
    
    // Pagination
    const page = filters.page || 1
    const limit = 9 // Items per page
    const totalCount = filtered.length
    const totalPages = Math.ceil(totalCount / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedFacilities = filtered.slice(startIndex, endIndex)
    
    return {
      facilities: paginatedFacilities,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  }, [allData?.facilities, filters])

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '' && !(key === 'page' && value === 1)) {
        params.append(key, value)
      }
    })
    setSearchParams(params)
  }, [filters, setSearchParams])

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const searchValue = e.target.search.value.trim()
    handleFilterChange('search', searchValue)
  }

  const handleSearchInputChange = (e) => {
    const searchValue = e.target.value
    // Update the search filter immediately for UI responsiveness
    setFilters(prev => ({ ...prev, search: searchValue }))
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    
    // Debounce the API call to avoid too many requests
    const newTimeout = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        search: searchValue.trim(),
        page: 1 // Reset to first page when search changes
      }))
    }, 500)
    
    setSearchTimeout(newTimeout)
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      sportType: '',
      venueType: '',
      priceRange: '',
      rating: '',
      page: 1
    })
  }

  const getAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  }

  const getMinPrice = (courts) => {
    if (!courts || courts.length === 0) return 0
    return Math.min(...courts.map(court => court.pricePerHour))
  }

  if (isLoading) return <LoadingSpinner />

  const { facilities = [], pagination = {} } = filteredData || {}

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Sports Venues</h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                name="search"
                type="text"
                placeholder="Search venues by name, location, or sport..."
                value={filters.search}
                onChange={handleSearchInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#714B67] text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FunnelIcon className="h-5 w-5" />
              <span>Filters</span>
            </button>
            
            {Object.entries(filters).some(([key, value]) => value && value !== '' && !(key === 'page' && value === 1)) && (
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear All Filters
              </button>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Sport Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sport Type</label>
                  <select
                    value={filters.sportType}
                    onChange={(e) => handleFilterChange('sportType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Sports</option>
                    {SPORT_TYPES.map(sport => (
                      <option key={sport} value={sport}>{sport}</option>
                    ))}
                  </select>
                </div>

                {/* Venue Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Venue Type</label>
                  <select
                    value={filters.venueType}
                    onChange={(e) => handleFilterChange('venueType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    {VENUE_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any Price</option>
                    <option value="0-500">₹0 - ₹500</option>
                    <option value="500-1000">₹500 - ₹1000</option>
                    <option value="1000-2000">₹1000 - ₹2000</option>
                    <option value="2000+">₹2000+</option>
                  </select>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                  <select
                    value={filters.rating}
                    onChange={(e) => handleFilterChange('rating', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any Rating</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="2">2+ Stars</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {facilities.length} of {pagination.totalCount || 0} venues
          </p>
        </div>

        {/* Venues Grid */}
        {facilities.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏸</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No venues found</h2>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters</p>
            <button
              onClick={clearFilters}
              className="bg-[#714B67] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {facilities.map((facility) => {
              const averageRating = getAverageRating(facility.reviews)
              const minPrice = getMinPrice(facility.courts)
              const sportTypes = [...new Set(facility.courts?.map(court => court.sportType) || [])]

              return (
                <Link
                  key={facility.id}
                  to={`/venues/${facility.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Image */}
                  <div className="h-48 bg-gray-200">
                    {facility.images && facility.images[0] ? (
                      <img
                        src={facility.images[0]}
                        alt={facility.name}
                        className="w-full h-full object-cover"
                      />
                    ) : facility.courts && facility.courts[0]?.images && facility.courts[0].images[0] ? (
                      <img
                        src={facility.courts[0].images[0]}
                        alt={facility.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        No image available
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {facility.name}
                      </h3>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {facility.venueType}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      <span className="text-sm line-clamp-1">{facility.address}</span>
                    </div>

                    {/* Sports */}
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {sportTypes.slice(0, 3).map((sport, index) => (
                          <span
                            key={index}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                          >
                            {sport}
                          </span>
                        ))}
                        {sportTypes.length > 3 && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            +{sportTypes.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Rating and Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {averageRating > 0 ? (
                          <>
                            <StarIconSolid className="h-4 w-4 text-yellow-400 mr-1" />
                            <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
                            <span className="text-xs text-gray-500 ml-1">
                              ({facility.reviews?.length || 0})
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500">No ratings yet</span>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">₹{minPrice}</p>
                        <p className="text-xs text-gray-500">per hour</p>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center">
            <div className="flex space-x-2">
              <button
                onClick={() => handleFilterChange('page', filters.page - 1)}
                disabled={!pagination.hasPrev}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handleFilterChange('page', page)}
                  className={`px-4 py-2 border rounded-lg ${
                    filters.page === page
                      ? 'bg-[#714B67] text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handleFilterChange('page', filters.page + 1)}
                disabled={!pagination.hasNext}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Venues
