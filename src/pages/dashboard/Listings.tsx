import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/lib/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Property } from '@/lib/types'

export default function Listings() {
  const { user } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('marketer_id', user?.id)
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
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 0
    }).format(price)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800'
      case 'Sold Out':
        return 'bg-red-100 text-red-800'
      case 'Reserved':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)

      if (error) throw error

      console.log('Property deleted:', id)
      setSuccessMessage('Property deleted successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)

      fetchProperties()
    } catch (error) {
      console.error('Error deleting property:', error)
    }
    setDeleteConfirm(null)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
          <p className="text-gray-600 mt-1">Manage your property listings</p>
        </div>
        <Link
          to="/dashboard/add-property"
          className="px-6 py-3 bg-primary-blue text-white rounded-lg font-semibold hover:scale-105 transition-transform duration-200"
        >
          + Add New Property
        </Link>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
          {successMessage}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
          </div>
          <p className="text-gray-600 mt-4">Loading properties...</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties yet</h3>
          <p className="text-gray-600 mb-6">Get started by adding your first property listing</p>
          <Link
            to="/dashboard/add-property"
            className="inline-block px-6 py-3 bg-primary-blue text-white rounded-lg font-semibold hover:scale-105 transition-transform duration-200"
          >
            Add Your First Property
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative h-48">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(property.status)}`}>
                  {property.status}
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                  {property.title}
                </h3>

                <p className="text-gray-600 text-sm mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {property.location}
                </p>

                <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                  <span>{property.type}</span>
                  <span>{property.area} m²</span>
                  <span>{property.bedrooms} Beds</span>
                </div>

                <p className="text-2xl font-bold text-primary-blue mb-4">
                  {formatPrice(property.price)}
                </p>

                <div className="flex gap-2">
                  <Link
                    to={`/dashboard/listings/${property.id}/edit`}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-center hover:bg-gray-200 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => setDeleteConfirm(property.id)}
                    className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this property? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
