import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/context/AuthContext'
import PropertyForm from '@/components/PropertyForm'
import { Property } from '@/lib/types'

export default function EditProperty() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  useEffect(() => {
    fetchProperty()
  }, [id])

  const fetchProperty = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .eq('marketer_id', user?.id)
        .single()

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
      }
    } catch (error) {
      console.error('Error fetching property:', error)
      setErrorMessage('Failed to load property')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const imageUrls = data.images.split('\n').map((url: string) => url.trim()).filter((url: string) => url)

      const propertyData = {
        title: data.title,
        type: data.type,
        location: data.location,
        project_name: data.projectName || null,
        price: data.price,
        area: data.area,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        delivery_date: data.deliveryDate,
        payment_plan: data.paymentPlan,
        images: imageUrls,
        description: data.description,
        status: data.status,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('properties')
        .update(propertyData)
        .eq('id', id)
        .eq('marketer_id', user?.id)

      if (error) throw error

      console.log('Property updated successfully')
      setSuccessMessage('Property updated successfully!')

      setTimeout(() => {
        navigate('/dashboard/listings')
      }, 1500)
    } catch (error: any) {
      console.error('Error updating property:', error)
      setErrorMessage(error.message || 'Failed to update property')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
          </div>
          <p className="text-gray-600 mt-4">Loading property...</p>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h2>
          <button
            onClick={() => navigate('/dashboard/listings')}
            className="px-6 py-3 bg-primary-blue text-white rounded-lg font-semibold hover:scale-105 transition-transform duration-200"
          >
            Back to Listings
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
        <p className="text-gray-600 mt-1">Update the property details</p>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
          {errorMessage}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-8">
        <PropertyForm property={property} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  )
}
