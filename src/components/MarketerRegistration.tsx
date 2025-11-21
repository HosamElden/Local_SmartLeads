import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { MarketerFormData } from '../types'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const marketerSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  company_name: z.string().optional(),
  email: z.string().email("Invalid email format"),
  phone: z.string().regex(/^01[0-9]{9}$/, "Invalid Egyptian phone (01xxxxxxxxx)"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(['Marketer', 'Developer']),
  office_location: z.string().min(2, "Office location is required")
})

export default function MarketerRegistration() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<MarketerFormData>({
    resolver: zodResolver(marketerSchema)
  })

  const onSubmit = async (data: MarketerFormData) => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: existingMarketer, error: checkError } = await supabase
        .from('marketers')
        .select('id')
        .or(`email.eq.${data.email},phone.eq.${data.phone}`)
        .maybeSingle()

      if (checkError) {
        throw new Error('Error checking existing user')
      }

      if (existingMarketer) {
        throw new Error('Email or phone already registered')
      }

      const { data: newMarketer, error: insertError } = await supabase
        .from('marketers')
        .insert({
          full_name: data.full_name,
          company_name: data.company_name,
          email: data.email,
          phone: data.phone,
          password: data.password,
          role: data.role,
          office_location: data.office_location
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      setSuccess(true)

      login({
        ...newMarketer,
        userType: 'marketer'
      })

      setTimeout(() => {
        navigate('/dashboard/listings')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful</h2>
          <p className="text-gray-600 mb-4">Your marketer account has been created successfully!</p>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketer Registration</h1>
          <p className="text-gray-600 mb-8">Create your account to start listing properties</p>

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

            <div>
              <label htmlFor="company_name" className="block text-sm font-semibold text-gray-700 mb-2">
                Company Name (Optional)
              </label>
              <input
                {...register('company_name')}
                type="text"
                id="company_name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                placeholder="Your company name"
              />
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
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Role
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    {...register('role')}
                    type="radio"
                    value="Marketer"
                    className="w-4 h-4 text-primary-blue focus:ring-2 focus:ring-primary-blue"
                  />
                  <span className="ml-2 text-gray-700">Marketer</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    {...register('role')}
                    type="radio"
                    value="Developer"
                    className="w-4 h-4 text-primary-blue focus:ring-2 focus:ring-primary-blue"
                  />
                  <span className="ml-2 text-gray-700">Developer</span>
                </label>
              </div>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="office_location" className="block text-sm font-semibold text-gray-700 mb-2">
                Office Location
              </label>
              <input
                {...register('office_location')}
                type="text"
                id="office_location"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                placeholder="e.g., New Cairo"
              />
              {errors.office_location && (
                <p className="mt-1 text-sm text-red-600">{errors.office_location.message}</p>
              )}
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
