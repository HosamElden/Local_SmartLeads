import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import { supabase } from '@/lib/supabase'

interface Lead {
  id: string
  buyerName: string
  buyerPhone: string
  buyerEmail: string
  buyerScore: number
  buyerScoreTier: string
  buyerBudget: number
  buyerLocations: string[]
  buyerPropertyTypes: string[]
  status: string
  createdAt: Date
  property: {
    title: string
    location: string
    price: number
  }
}

export default function Leads() {
  const { user } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'Hot' | 'Warm' | 'Cold'>('all')

  useEffect(() => {
    if (user && user.userType === 'marketer') {
      fetchLeads()
    }
  }, [user])

  const fetchLeads = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('leads')
        .select(`
          id,
          buyer_name,
          buyer_phone,
          buyer_email,
          buyer_score,
          buyer_score_tier,
          buyer_budget,
          buyer_locations,
          buyer_property_types,
          status,
          created_at,
          properties (
            title,
            location,
            price
          )
        `)
        .eq('marketer_id', user.id)
        .order('buyer_score', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedLeads = data?.map(lead => ({
        id: lead.id,
        buyerName: lead.buyer_name,
        buyerPhone: lead.buyer_phone,
        buyerEmail: lead.buyer_email,
        buyerScore: lead.buyer_score,
        buyerScoreTier: lead.buyer_score_tier,
        buyerBudget: lead.buyer_budget,
        buyerLocations: lead.buyer_locations,
        buyerPropertyTypes: lead.buyer_property_types,
        status: lead.status,
        createdAt: new Date(lead.created_at),
        property: (lead as any).properties
      })) || []

      setLeads(formattedLeads)
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId)

      if (error) throw error

      setLeads(leads.map(lead =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ))
    } catch (error) {
      console.error('Error updating lead status:', error)
    }
  }

  const getScoreBadgeColor = (tier: string) => {
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 0
    }).format(price)
  }

  const filteredLeads = filter === 'all'
    ? leads
    : leads.filter(lead => lead.buyerScoreTier === filter)

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Leads</h1>
          <p className="text-gray-600">Manage your property leads and inquiries</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
          <p className="text-gray-600 mt-4">Loading leads...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Leads</h1>
        <p className="text-gray-600">Manage your property leads and inquiries</p>
      </div>

      {leads.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Leads Yet</h3>
          <p className="text-gray-600 mb-6">
            When buyers express interest in your properties, they will appear here.
          </p>
        </div>
      ) : (
        <div>
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary-blue text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All ({leads.length})
            </button>
            <button
              onClick={() => setFilter('Hot')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'Hot'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              🔥 Hot ({leads.filter(l => l.buyerScoreTier === 'Hot').length})
            </button>
            <button
              onClick={() => setFilter('Warm')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'Warm'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              ⚡ Warm ({leads.filter(l => l.buyerScoreTier === 'Warm').length})
            </button>
            <button
              onClick={() => setFilter('Cold')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'Cold'
                  ? 'bg-gray-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              ❄️ Cold ({leads.filter(l => l.buyerScoreTier === 'Cold').length})
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Buyer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{lead.buyerName}</div>
                          <div className="text-sm text-gray-500">{lead.buyerPhone}</div>
                          <div className="text-sm text-gray-500">{lead.buyerEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreBadgeColor(lead.buyerScoreTier)}`}>
                          {getScoreEmoji(lead.buyerScoreTier)} {lead.buyerScoreTier} • {lead.buyerScore}/100
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{lead.property.title}</div>
                        <div className="text-sm text-gray-500">{lead.property.location}</div>
                        <div className="text-sm text-gray-500">{formatPrice(lead.property.price)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatPrice(lead.buyerBudget)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Deal">Deal</option>
                          <option value="Lost">Lost</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <a
                          href={`tel:+20${lead.buyerPhone.replace(/^0/, '')}`}
                          className="text-primary-blue hover:text-blue-800 font-medium mr-3"
                        >
                          Call
                        </a>
                        <a
                          href={`mailto:${lead.buyerEmail}`}
                          className="text-primary-blue hover:text-blue-800 font-medium"
                        >
                          Email
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
