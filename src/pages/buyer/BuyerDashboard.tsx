import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/context/AuthContext'
import { Buyer } from '@/lib/types'

export default function BuyerDashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const buyer = user as Buyer

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getScoreColor = (tier: string) => {
    switch (tier) {
      case 'Hot':
        return 'bg-green-100 text-green-800'
      case 'Warm':
        return 'bg-yellow-100 text-yellow-800'
      case 'Cold':
        return 'bg-gray-100 text-gray-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getScoreEmoji = (tier: string) => {
    switch (tier) {
      case 'Hot':
        return '🔥'
      case 'Warm':
        return '⚡'
      case 'Cold':
        return '❄️'
      default:
        return ''
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-2xl font-bold text-gray-900">
                Real Estate
              </Link>

              <nav className="hidden md:flex items-center space-x-6">
                <Link
                  to="/properties"
                  className="text-gray-700 hover:text-primary-blue font-medium transition-colors"
                >
                  Browse Properties
                </Link>
                <Link
                  to="/my-interests"
                  className="text-gray-700 hover:text-primary-blue font-medium transition-colors"
                >
                  My Interests
                </Link>
              </nav>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className={`px-4 py-2 rounded-full text-sm font-semibold ${getScoreColor(buyer?.scoreTier || 'Cold')}`}>
                {getScoreEmoji(buyer?.scoreTier || 'Cold')} {buyer?.scoreTier} • {buyer?.score}/100
              </div>
              <div className="text-sm text-gray-600">
                {buyer?.fullName}
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-4 py-4 space-y-3">
              <div className={`px-4 py-2 rounded-full text-sm font-semibold text-center ${getScoreColor(buyer?.scoreTier || 'Cold')}`}>
                {getScoreEmoji(buyer?.scoreTier || 'Cold')} {buyer?.scoreTier} Lead • {buyer?.score}/100
              </div>
              <Link
                to="/properties"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Browse Properties
              </Link>
              <Link
                to="/my-interests"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                My Interests
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </header>
    </div>
  )
}
