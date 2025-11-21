import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/context/AuthContext'
import { useInterest } from '@/lib/context/InterestContext'
import { Property, Buyer } from '@/lib/types'
import { getMatchingDetails } from '@/lib/matching/matchingEngine'
import { supabase } from '@/lib/supabase'

interface InterestButtonProps {
  property: Property
}

export default function InterestButton({ property }: InterestButtonProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addInterest, isInterested } = useInterest()
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const alreadyInterested = isInterested(property.id)

  const handleInterestClick = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    if (user.userType !== 'buyer') {
      setMessage({
        type: 'error',
        text: 'Only buyers can express interest in properties'
      })
      setTimeout(() => setMessage(null), 5000)
      return
    }

    if (alreadyInterested) {
      setMessage({
        type: 'error',
        text: 'You have already expressed interest in this property'
      })
      setTimeout(() => setMessage(null), 5000)
      return
    }

    setIsProcessing(true)

    const buyer = user as Buyer
    const matchResult = getMatchingDetails(buyer, property)

    console.log('Matching result:', matchResult)

    if (!matchResult.matches) {
      setMessage({
        type: 'error',
        text: `This property doesn't match your preferences: ${matchResult.reasons.join(', ')}`
      })
      setIsProcessing(false)
      setTimeout(() => setMessage(null), 7000)
      return
    }

    try {
      const { data, error } = await supabase
        .from('leads')
        .insert({
          buyer_id: buyer.id,
          marketer_id: property.marketerId,
          property_id: property.id,
          buyer_score: buyer.score,
          buyer_score_tier: buyer.scoreTier,
          buyer_name: buyer.fullName,
          buyer_phone: buyer.phone,
          buyer_email: buyer.email,
          buyer_budget: buyer.budget,
          buyer_locations: buyer.locations,
          buyer_property_types: buyer.propertyTypes,
          status: 'New'
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating lead:', error)
        setMessage({
          type: 'error',
          text: 'Failed to record your interest. Please try again.'
        })
        setIsProcessing(false)
        setTimeout(() => setMessage(null), 5000)
        return
      }

      addInterest(property.id)

      setMessage({
        type: 'success',
        text: 'Success! Your interest has been recorded and the marketer will contact you soon.'
      })
      setIsProcessing(false)
      setTimeout(() => setMessage(null), 5000)
    } catch (error) {
      console.error('Error creating lead:', error)
      setMessage({
        type: 'error',
        text: 'An error occurred. Please try again.'
      })
      setIsProcessing(false)
      setTimeout(() => setMessage(null), 5000)
    }
  }

  return (
    <div>
      <button
        onClick={handleInterestClick}
        disabled={isProcessing || alreadyInterested}
        className={`w-full md:w-auto px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 ${
          alreadyInterested
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : 'bg-primary-blue text-white hover:scale-105'
        } ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}
      >
        {isProcessing ? 'Processing...' : alreadyInterested ? 'Already Interested' : "I'm Interested"}
      </button>

      {message && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  )
}
