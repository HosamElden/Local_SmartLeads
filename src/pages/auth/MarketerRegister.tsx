import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { marketerRegistrationSchema, type MarketerRegistrationInput } from '@/lib/validations/auth'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/context/AuthContext'

export default function MarketerRegister() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<MarketerRegistrationInput>({
    resolver: zodResolver(marketerRegistrationSchema)
  })

  const [validationError, setValidationError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (data: MarketerRegistrationInput) => {
    console.log('Marketer form submitted:', data)
    setValidationError('')
    setIsSubmitting(true)

    try {
      const { data: existingEmail } = await supabase
        .from('marketers')
        .select('id')
        .eq('email', data.email)
        .maybeSingle()

      if (existingEmail) {
        setValidationError('Email already exists')
        setIsSubmitting(false)
        return
      }

      const { data: existingPhone } = await supabase
        .from('marketers')
        .select('id')
        .eq('phone', data.phone)
        .maybeSingle()

      if (existingPhone) {
        setValidationError('Phone number already exists')
        setIsSubmitting(false)
        return
      }

      console.log('Inserting marketer into database...')

      const { data: newMarketer, error } = await supabase
        .from('marketers')
        .insert([{
          full_name: data.fullName,
          company_name: data.companyName || null,
          email: data.email,
          phone: data.phone,
          password: data.password,
          role: data.role,
          office_location: data.officeLocation
        }])
        .select()
        .single()

      console.log('Insert result:', { newMarketer, error })

      if (error) {
        console.error('Database error:', error)
        setValidationError(`Registration failed: ${error.message}`)
        setIsSubmitting(false)
        return
      }

      console.log('Login marketer and navigate...')

      login({
        id: newMarketer.id,
        userType: 'marketer',
        fullName: newMarketer.full_name,
        companyName: newMarketer.company_name || undefined,
        email: newMarketer.email,
        phone: newMarketer.phone,
        password: newMarketer.password,
        role: newMarketer.role as 'Marketer' | 'Developer',
        officeLocation: newMarketer.office_location,
        createdAt: new Date(newMarketer.created_at)
      })

      navigate('/dashboard/listings')
    } catch (err) {
      console.error('Caught error:', err)
      setValidationError(`An error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Join SmartLead as a Marketer</h1>
      <p className="text-gray-600 mb-8">Create your account to start listing properties</p>

      {validationError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {validationError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit, (errors) => {
        console.log('Form validation errors:', errors)
        setValidationError('Please fill in all required fields correctly')
      })} className="space-y-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            {...register('fullName')}
            type="text"
            id="fullName"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            placeholder="Enter your full name"
          />
          {errors.fullName && (
            <p className="text-red-600 text-sm mt-1">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="companyName" className="block text-sm font-semibold text-gray-700 mb-2">
            Company Name (optional)
          </label>
          <input
            {...register('companyName')}
            type="text"
            id="companyName"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            placeholder="Your company name"
          />
          {errors.companyName && (
            <p className="text-red-600 text-sm mt-1">{errors.companyName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
            Email *
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
            Phone *
          </label>
          <input
            {...register('phone')}
            type="text"
            id="phone"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            placeholder="01xxxxxxxxx"
          />
          {errors.phone && (
            <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
            Password *
          </label>
          <input
            {...register('password')}
            type="password"
            id="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            placeholder="Min 8 characters"
          />
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Role *
          </label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                {...register('role')}
                type="radio"
                value="Marketer"
                className="w-4 h-4 text-primary-blue border-gray-300 focus:ring-primary-blue"
              />
              <span className="text-sm text-gray-700">Marketer</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                {...register('role')}
                type="radio"
                value="Developer"
                className="w-4 h-4 text-primary-blue border-gray-300 focus:ring-primary-blue"
              />
              <span className="text-sm text-gray-700">Developer</span>
            </label>
          </div>
          {errors.role && (
            <p className="text-red-600 text-sm mt-1">{errors.role.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="officeLocation" className="block text-sm font-semibold text-gray-700 mb-2">
            Office Location *
          </label>
          <input
            {...register('officeLocation')}
            type="text"
            id="officeLocation"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            placeholder="Enter your office location"
          />
          {errors.officeLocation && (
            <p className="text-red-600 text-sm mt-1">{errors.officeLocation.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-primary-blue text-white rounded-lg font-semibold hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-primary-blue font-semibold hover:underline">
            Log in
          </a>
        </p>
      </form>
    </div>
  )
}
