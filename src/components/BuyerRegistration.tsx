import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { BuyerFormData } from '../types'
import { calculateLeadScore } from '../lib/scoring/calculateScore'
import { supabase } from '../lib/supabase'
import { cn } from '../lib/utils'
import { useAuth } from '../context/AuthContext'

const buyerSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phone: z.string().regex(/^01[0-9]{9}$/, "Invalid Egyptian phone (01xxxxxxxxx)"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  budget: z.number().positive("Budget must be greater than 0"),
  locations: z.array(z.string()).min(1, "Select at least one location"),
  property_types: z.array(z.string()).min(1, "Select at least one property type"),
  buying_intent: z.enum(['Cash', 'Installment', 'Mortgage']).optional()
})

const LOCATIONS = [
  'New Cairo',
  'NAC',
  '6th October',
  'Sheikh Zayed',
  'North Coast',
  'Rehab',
  'Madinaty',
  'Beverly Hills',
  'Sidi Abdel Rahman',
  'Hacienda'
]

const PROPERTY_TYPES = [
  'Apartment',
  'Villa',
  'Townhouse',
  'Duplex',
  'Commercial'
]

export default function BuyerRegistration() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<{ score: number; tier: string } | null>(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<BuyerFormData>({
    resolver: zodResolver(buyerSchema),
    defaultValues: {
      locations: [],
      property_types: []
    }
  })

  const selectedLocations = watch('locations') || []
  const selectedPropertyTypes = watch('property_types') || []

  const toggleLocation = (location: string) => {
    const current = selectedLocations
    if (current.includes(location)) {
      setValue('locations', current.filter(l => l !== location))
    } else {
      setValue('locations', [...current, location])
    }
  }

  const togglePropertyType = (type: string) => {
    const current = selectedPropertyTypes
    if (current.includes(type)) {
      setValue('property_types', current.filter(t => t !== type))
    } else {
      setValue('property_types', [...current, type])
    }
  }

  const onSubmit = async (data: BuyerFormData) => {
    try {
      setIsLoading(true)
      setError(null)

      const { score, tier } = calculateLeadScore(data)

      const { data: existingBuyer, error: checkError } = await supabase
        .from('buyers')
        .select('id')
        .or(`email.eq.${data.email},phone.eq.${data.phone}`)
        .maybeSingle()

      if (checkError) {
        throw new Error('Error checking existing user')
      }

      if (existingBuyer) {
        throw new Error('Email or phone already registered')
      }

      const { data: newBuyer, error: insertError } = await supabase
        .from('buyers')
        .insert({
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          password: data.password,
          budget: data.budget,
          locations: data.locations,
          property_types: data.property_types,
          buying_intent: data.buying_intent,
          score,
          score_tier: tier
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      setSuccessData({ score, tier })

      login({
        ...newBuyer,
        userType: 'buyer'
      })

      setTimeout(() => {
        navigate('/properties')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (successData) {
    const tierColors = {
      Hot: 'bg-green-100 text-green-800',
      Warm: 'bg-yellow-100 text-yellow-800',
      Cold: 'bg-gray-100 text-gray-600'
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful</h2>
          <p className="text-gray-600 mb-4">Your account has been created successfully!</p>
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Your Lead Score:</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-bold text-gray-900">{successData.score}/100</span>
              <span className={cn(
                "px-3 py-1 rounded-full text-sm font-semibold",
                tierColors[successData.tier as keyof typeof tierColors]
              )}>
                {successData.tier} Lead
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-500">Redirecting to properties...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Buyer Registration</h1>
          <p className="text-gray-600 mb-8">Create your account to start browsing properties</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="full_name" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                {...register('full_name')}
                type="text"
                id="full_name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                placeholder="Enter your full name"
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  {...register('phone')}
                  type="text"
                  id="phone"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  placeholder="01xxxxxxxxx"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  {...register('password')}
                  type="password"
                  id="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  placeholder="Min 8 characters"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="budget" className="block text-sm font-semibold text-gray-700 mb-2">
                  Budget (SAR)
                </label>
                <input
                  {...register('budget', { valueAsNumber: true })}
                  type="number"
                  id="budget"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  placeholder="e.g., 500000"
                />
                {errors.budget && (
                  <p className="mt-1 text-sm text-red-600">{errors.budget.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Preferred Locations
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {LOCATIONS.map(location => (
                  <button
                    key={location}
                    type="button"
                    onClick={() => toggleLocation(location)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      selectedLocations.includes(location)
                        ? "bg-primary-blue text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                  >
                    {location}
                  </button>
                ))}
              </div>
              {errors.locations && (
                <p className="mt-1 text-sm text-red-600">{errors.locations.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Property Types
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {PROPERTY_TYPES.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => togglePropertyType(type)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      selectedPropertyTypes.includes(type)
                        ? "bg-primary-blue text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {errors.property_types && (
                <p className="mt-1 text-sm text-red-600">{errors.property_types.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="buying_intent" className="block text-sm font-semibold text-gray-700 mb-2">
                Buying Intent (Optional)
              </label>
              <select
                {...register('buying_intent')}
                id="buying_intent"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              >
                <option value="">Select an option</option>
                <option value="Cash">Cash</option>
                <option value="Installment">Installment</option>
                <option value="Mortgage">Mortgage</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-primary-blue text-white rounded-lg font-semibold hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="text-primary-blue font-semibold hover:underline">
                Log in
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
