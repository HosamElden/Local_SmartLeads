import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '@/components/Header'
import PropertyCardNew from '@/components/PropertyCardNew'
import PropertyFilters, { FilterValues } from '@/components/PropertyFilters'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/context/AuthContext'
import { Buyer, Property } from '@/lib/types'

export default function Properties() {
  const { user, isAuthenticated } = useAuth()
  const buyer = isAuthenticated && user?.userType === 'buyer' ? (user as Buyer) : null
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterValues>({
    minPrice: 0,
    maxPrice: 10000000,
    location: 'All Locations',
    bedrooms: 'Any',
    propertyType: 'All Types',
    minArea: 0
  })

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'Available')
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedProperties = data?.map(prop => ({
        id: prop.id,
        marketerId: prop.marketer_id,
        title: prop.title,
        type: prop.type,
        location: prop.location,
        projectName: prop.project_name,
        price: Number(prop.price),
        area: Number(prop.area),
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        deliveryDate: new Date(prop.delivery_date),
        paymentPlan: prop.payment_plan,
        images: prop.images,
        description: prop.description,
        status: prop.status,
        createdAt: new Date(prop.created_at),
        updatedAt: new Date(prop.updated_at)
      })) || []

      setProperties(formattedProperties)
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          property.title.toLowerCase().includes(query) ||
          property.location.toLowerCase().includes(query) ||
          property.type.toLowerCase().includes(query) ||
          property.description.toLowerCase().includes(query)

        if (!matchesSearch) return false
      }

      if (property.price < filters.minPrice || property.price > filters.maxPrice) {
        return false
      }

      if (filters.location !== 'All Locations' && property.location !== filters.location) {
        return false
      }

      if (filters.bedrooms !== 'Any') {
        const minBedrooms = parseInt(filters.bedrooms)
        if (property.bedrooms < minBedrooms) {
          return false
        }
      }

      if (filters.propertyType !== 'All Types' && property.type !== filters.propertyType) {
        return false
      }

      if (filters.minArea > 0 && property.area < filters.minArea) {
        return false
      }

      return true
    })
  }, [filters, searchQuery, properties])

  const getScoreColor = (tier: string) => {
    switch (tier) {
      case 'Hot':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Warm':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Cold':
        return 'bg-gray-100 text-gray-600 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getScoreEmoji = (tier: string) => {
    switch (tier) {
      case 'Hot':
        return '🔥'
      case 'Warm':
        return '⚡'
      case 'Cold':
        return '❄️'
      default:
        return ''
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {buyer && (
          <div className={`mb-6 p-6 rounded-xl border-2 ${getScoreColor(buyer.scoreTier)}`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-lg font-bold mb-1">Welcome back, {buyer.fullName}!</h2>
                <p className="text-sm opacity-80">Your profile is helping us match you with the best properties</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{buyer.score}</div>
                  <div className="text-xs opacity-80">Lead Score</div>
                </div>
                <div className={`px-4 py-2 rounded-full font-semibold text-sm ${getScoreColor(buyer.scoreTier)}`}>
                  {getScoreEmoji(buyer.scoreTier)} {buyer.scoreTier} Lead
                </div>
                <Link
                  to="/my-interests"
                  className="px-4 py-2 bg-white rounded-lg font-semibold text-sm hover:bg-opacity-90 transition-colors border-2 border-current"
                >
                  My Interests
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Available Properties</h1>
          <p className="text-gray-600 text-sm">
            Showing {filteredProperties.length} of {filteredProperties.length} properties
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Filters
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mb-6">
            <PropertyFilters onFilterChange={setFilters} />
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
            </div>
            <p className="text-gray-600 mt-4">Loading properties...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-600 text-lg">No properties found matching your filters.</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCardNew key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
