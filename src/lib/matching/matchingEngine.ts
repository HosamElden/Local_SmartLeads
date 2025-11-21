import { Buyer, Property } from '@/lib/types'

const adjacentMap: Record<string, string[]> = {
  'New Cairo': ['Rehab', 'Madinaty'],
  'Rehab': ['New Cairo', 'Madinaty'],
  'Madinaty': ['New Cairo', 'Rehab'],
  '6th October': ['Sheikh Zayed', 'Beverly Hills'],
  'Sheikh Zayed': ['6th October', 'Beverly Hills'],
  'Beverly Hills': ['6th October', 'Sheikh Zayed'],
  'North Coast': ['Sidi Abdel Rahman', 'Hacienda'],
  'Sidi Abdel Rahman': ['North Coast', 'Hacienda'],
  'Hacienda': ['North Coast', 'Sidi Abdel Rahman'],
  'NAC': [],
  'Downtown': [],
  'Zamalek': [],
  'Heliopolis': []
}

export function shouldCreateLead(buyer: Buyer, property: Property): boolean {
  const budgetMin = buyer.budget * 0.82
  const budgetMax = buyer.budget * 1.18
  const budgetMatch = property.price >= budgetMin && property.price <= budgetMax

  const adjacentLocations = adjacentMap[property.location] || []
  const locationMatch =
    buyer.locations.includes(property.location) ||
    buyer.locations.some(loc => adjacentLocations.includes(loc))

  const typeMatch = buyer.propertyTypes.includes(property.type)

  const isAvailable = property.status === 'Available'

  return budgetMatch && locationMatch && typeMatch && isAvailable
}

export function getMatchingDetails(buyer: Buyer, property: Property): {
  matches: boolean
  reasons: string[]
} {
  const reasons: string[] = []

  const budgetMin = buyer.budget * 0.82
  const budgetMax = buyer.budget * 1.18
  const budgetMatch = property.price >= budgetMin && property.price <= budgetMax

  if (!budgetMatch) {
    reasons.push(`Price ${property.price.toLocaleString()} SAR is outside your budget range (${budgetMin.toLocaleString()} - ${budgetMax.toLocaleString()} SAR)`)
  }

  const adjacentLocations = adjacentMap[property.location] || []
  const locationMatch =
    buyer.locations.includes(property.location) ||
    buyer.locations.some(loc => adjacentLocations.includes(loc))

  if (!locationMatch) {
    reasons.push(`Location "${property.location}" doesn't match your preferred locations`)
  }

  const typeMatch = buyer.propertyTypes.includes(property.type)

  if (!typeMatch) {
    reasons.push(`Property type "${property.type}" doesn't match your preferences`)
  }

  const isAvailable = property.status === 'Available'

  if (!isAvailable) {
    reasons.push(`Property is currently ${property.status}`)
  }

  return {
    matches: budgetMatch && locationMatch && typeMatch && isAvailable,
    reasons
  }
}
