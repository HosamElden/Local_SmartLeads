import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const loginSchema = z.object({
  identifier: z.string().min(1, "Email or phone is required"),
  password: z.string().min(1, "Password is required")
})

interface LoginFormData {
  identifier: string
  password: string
}

export default function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      setError(null)

      const isEmail = data.identifier.includes('@')
      const query = isEmail
        ? `email.eq.${data.identifier}`
        : `phone.eq.${data.identifier}`

      const { data: buyer, error: buyerError } = await supabase
        .from('buyers')
        .select('*')
        .or(query)
        .maybeSingle()

      if (buyer && buyer.password === data.password) {
        login({ ...buyer, userType: 'buyer' })
        navigate('/properties')
        return
      }

      const { data: marketer, error: marketerError } = await supabase
        .from('marketers')
        .select('*')
        .or(query)
        .maybeSingle()

      if (marketer && marketer.password === data.password) {
        login({ ...marketer, userType: 'marketer' })
        navigate('/dashboard/listings')
        return
      }

      throw new Error('Invalid credentials')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Log in to your account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="identifier" className="block text-sm font-semibold text-gray-700 mb-2">
              Email or Phone
            </label>
            <input
              {...register('identifier')}
              type="text"
              id="identifier"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              placeholder="your@email.com or 01xxxxxxxxx"
            />
            {errors.identifier && (
              <p className="mt-1 text-sm text-red-600">{errors.identifier.message}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <a href="#" className="text-sm text-primary-blue font-semibold hover:underline">
                Forgot Password?
              </a>
            </div>
            <input
              {...register('password')}
              type="password"
              id="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 bg-primary-blue text-white rounded-lg font-semibold hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>

          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              New buyer?{' '}
              <a href="/register/buyer" className="text-primary-blue font-semibold hover:underline">
                Create buyer account
              </a>
            </p>
            <p>
              New marketer?{' '}
              <a href="/register/marketer" className="text-primary-blue font-semibold hover:underline">
                Create marketer account
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
