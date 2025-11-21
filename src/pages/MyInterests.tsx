import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/lib/context/AuthContext'
import Header from '@/components/Header'
import PropertyCardNew from '@/components/PropertyCardNew'
import { supabase } from '@/lib/supabase'
import { Property, Buyer } from '@/lib/types'

export default function MyInterests() {
  const { user } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && user.userType === 'buyer') {
      fetchMyInterests()
    }
  }, [user])

  const fetchMyInterests = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data: leads, error } = await supabase
        .from('leads')
        .select(`
          property_id,
          properties (*)
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedProperties = leads?.map(lead => {
        const prop = (lead as any).properties
        return {
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
        }
      }).filter(p => p !== null) as Property[] || []

      setProperties(formattedProperties)
    } catch (error) {
      console.error('Error fetching interests:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Interests</h1>
          <p className="text-gray-600">Properties you've expressed interest in</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
            <p className="text-gray-600 mt-4">Loading your interests...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No interests yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't expressed interest in any properties yet. Browse properties to get started.
            </p>
            <Link
              to="/properties"
              className="inline-block px-6 py-3 bg-primary-blue text-white rounded-lg font-semibold hover:scale-105 transition-transform duration-200"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCardNew key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
