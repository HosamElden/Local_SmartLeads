import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/context/AuthContext'
import { supabase } from '@/lib/supabase'
import PropertyForm from '@/components/PropertyForm'

export default function AddProperty() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const imageUrls = data.images.split('\n').map((url: string) => url.trim()).filter((url: string) => url)

      const propertyData = {
        marketer_id: user?.id,
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
        status: data.status
      }

      const { data: newProperty, error } = await supabase
        .from('properties')
        .insert([propertyData])
        .select()
        .single()

      if (error) {
        throw error
      }

      console.log('Property added to database:', newProperty)
      setSuccessMessage('Property added successfully!')

      setTimeout(() => {
        navigate('/dashboard/listings')
      }, 1500)
    } catch (error: any) {
      console.error('Error adding property:', error)
      setErrorMessage(error.message || 'Failed to add property. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
        <p className="text-gray-600 mt-1">Fill in the details to list a new property</p>
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
        <PropertyForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  )
}
