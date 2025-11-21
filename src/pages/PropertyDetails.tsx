import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Header from '@/components/Header'
import PropertyCardNew from '@/components/PropertyCardNew'
import InterestButton from '@/components/InterestButton'
import { supabase } from '@/lib/supabase'
import { Property } from '@/lib/types'

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>()
  const [property, setProperty] = useState<Property | null>(null)
  const [similarProperties, setSimilarProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (id) {
      fetchProperty()
    }
  }, [id])

  const fetchProperty = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (error) throw error

      if (data) {
        const formattedProperty: Property = {
          id: data.id,
          marketerId: data.marketer_id,
          title: data.title,
          type: data.type,
          location: data.location,
          projectName: data.project_name,
          price: Number(data.price),
          area: Number(data.area),
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          deliveryDate: new Date(data.delivery_date),
          paymentPlan: data.payment_plan,
          images: data.images,
          description: data.description,
          status: data.status,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at)
        }
        setProperty(formattedProperty)
        fetchSimilarProperties(formattedProperty.location, formattedProperty.type)
      } else {
        setProperty(null)
      }
    } catch (error) {
      console.error('Error fetching property:', error)
      setProperty(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchSimilarProperties = async (location: string, type: string) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'Available')
        .neq('id', id)
        .or(`location.eq.${location},type.eq.${type}`)
        .limit(3)

      if (error) throw error

      const formatted = data?.map(prop => ({
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

      setSimilarProperties(formatted)
    } catch (error) {
      console.error('Error fetching similar properties:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
            <p className="text-gray-600 mt-4">Loading property...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Property Not Found</h1>
            <Link to="/properties" className="text-primary-blue hover:underline">
              Browse all properties
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
  }


  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/properties" className="inline-flex items-center text-primary-blue hover:underline mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Properties
        </Link>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="relative h-96 md:h-[500px]">
            <img
              src={property.images[currentImageIndex]}
              alt={property.title}
              className="w-full h-full object-cover"
            />

            {property.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {property.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full font-semibold text-gray-900">
              {property.type}
            </div>
          </div>

          <div className="p-8">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{property.title}</h1>
                <p className="text-gray-600 text-lg flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {property.location}
                  {property.projectName && ` • ${property.projectName}`}
                </p>
              </div>
              <div className="mt-4 lg:mt-0">
                <p className="text-4xl font-bold text-primary-blue">{formatPrice(property.price)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 pb-8 border-b border-gray-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">{property.area}</div>
                <div className="text-sm text-gray-600">Area (m²)</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">{property.bedrooms}</div>
                <div className="text-sm text-gray-600">Bedrooms</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">{property.bathrooms}</div>
                <div className="text-sm text-gray-600">Bathrooms</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">{property.status}</div>
                <div className="text-sm text-gray-600">Status</div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Payment Plan</h3>
                <p className="text-gray-700">{property.paymentPlan}</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Delivery Date</h3>
                <p className="text-gray-700">{formatDate(property.deliveryDate)}</p>
              </div>
            </div>

            <InterestButton property={property} />
          </div>
        </div>

        {similarProperties.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Similar Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProperties.map((prop) => (
                <PropertyCardNew key={prop.id} property={prop} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
