import { Buyer } from '@/lib/types'

export function calculateLeadScore(buyer: Partial<Buyer>): { score: number; tier: 'Hot' | 'Warm' | 'Cold' } {
  let score = 0

  if (buyer.budget && buyer.budget > 0) {
    score += 30
  }

  if (buyer.locations && buyer.locations.length > 0) {
    score += 20
  }

  if (buyer.propertyTypes && buyer.propertyTypes.length > 0) {
    score += 20
  }

  if (buyer.buyingIntent) {
    score += 10
  }

  const validPhone = buyer.phone ? /^01[0-9]{9}$/.test(buyer.phone) : false
  const validEmail = buyer.email ? (buyer.email.includes('@') && buyer.email.includes('.')) : false
  if (validPhone && validEmail) {
    score += 10
  }

  const allFieldsComplete = !!(
    buyer.fullName &&
    buyer.email &&
    buyer.phone &&
    buyer.password &&
    buyer.budget &&
    buyer.locations?.length &&
    buyer.propertyTypes?.length &&
    buyer.buyingIntent
  )
  if (allFieldsComplete) {
    score += 10
  }

  let tier: 'Hot' | 'Warm' | 'Cold' = 'Cold'
  if (score >= 90) {
    tier = 'Hot'
  } else if (score >= 70) {
    tier = 'Warm'
  }

  return { score, tier }
}
