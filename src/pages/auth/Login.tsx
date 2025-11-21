import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema)
  })

  const [validationError, setValidationError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (data: LoginInput) => {
    console.log('Login form submitted:', data)
    setValidationError('')
    setIsSubmitting(true)

    try {
      const isEmail = data.emailOrPhone.includes('@')

      const { data: buyer } = await supabase
        .from('buyers')
        .select('*')
        .eq(isEmail ? 'email' : 'phone', data.emailOrPhone)
        .eq('password', data.password)
        .maybeSingle()

      if (buyer) {
        console.log('Buyer found, logging in...')
        login({
          id: buyer.id,
          userType: 'buyer',
          fullName: buyer.full_name,
          email: buyer.email,
          phone: buyer.phone,
          password: buyer.password,
          budget: buyer.budget,
          locations: buyer.locations,
          propertyTypes: buyer.property_types,
          buyingIntent: buyer.buying_intent || undefined,
          score: buyer.score,
          scoreTier: buyer.score_tier as 'Hot' | 'Warm' | 'Cold',
          createdAt: new Date(buyer.created_at)
        })
        navigate('/properties')
        return
      }

      const { data: marketer } = await supabase
        .from('marketers')
        .select('*')
        .eq(isEmail ? 'email' : 'phone', data.emailOrPhone)
        .eq('password', data.password)
        .maybeSingle()

      if (marketer) {
        console.log('Marketer found, logging in...')
        login({
          id: marketer.id,
          userType: 'marketer',
          fullName: marketer.full_name,
          companyName: marketer.company_name || undefined,
          email: marketer.email,
          phone: marketer.phone,
          password: marketer.password,
          role: marketer.role as 'Marketer' | 'Developer',
          officeLocation: marketer.office_location,
          createdAt: new Date(marketer.created_at)
        })
        navigate('/dashboard/listings')
        return
      }

      setValidationError('Invalid email/phone or password')
      setIsSubmitting(false)
    } catch (err) {
      console.error('Login error:', err)
      setValidationError(`An error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back to SmartLead</h1>
      <p className="text-gray-600 mb-8">Log in to your account</p>

      {validationError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {validationError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit, (errors) => {
        console.log('Form validation errors:', errors)
        setValidationError('Please fill in all fields')
      })} className="space-y-6">
        <div>
          <label htmlFor="emailOrPhone" className="block text-sm font-semibold text-gray-700 mb-2">
            Email or Phone
          </label>
          <input
            {...register('emailOrPhone')}
            type="text"
            id="emailOrPhone"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            placeholder="your@email.com or 01xxxxxxxxx"
          />
          {errors.emailOrPhone && (
            <p className="text-red-600 text-sm mt-1">{errors.emailOrPhone.message}</p>
          )}
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
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-primary-blue text-white rounded-lg font-semibold hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Logging in...' : 'Log In'}
        </button>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/register/buyer" className="text-primary-blue font-semibold hover:underline">
              Register as Buyer
            </a>
            {' or '}
            <a href="/register/marketer" className="text-primary-blue font-semibold hover:underline">
              Register as Marketer
            </a>
          </p>
        </div>
      </form>
    </div>
  )
}
