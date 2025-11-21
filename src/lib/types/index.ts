export interface Buyer {
  id: string
  fullName: string
  email: string
  phone: string
  password: string
  budget: number
  locations: string[]
  propertyTypes: string[]
  buyingIntent?: 'Cash' | 'Installment' | 'Mortgage'
  score: number
  scoreTier: 'Hot' | 'Warm' | 'Cold'
  createdAt: Date
}

export interface Marketer {
  id: string
  fullName: string
  companyName?: string
  email: string
  phone: string
  password: string
  role: 'Marketer' | 'Developer'
  officeLocation: string
  createdAt: Date
}

export interface Property {
  id: string
  marketerId: string
  title: string
  type: 'Apartment' | 'Villa' | 'Townhouse' | 'Duplex' | 'Commercial'
  location: string
  projectName?: string
  price: number
  area: number
  bedrooms: number
  bathrooms: number
  deliveryDate: Date
  paymentPlan: string
  images: string[]
  description: string
  status: 'Available' | 'Sold Out' | 'Reserved'
  createdAt: Date
  updatedAt: Date
}

export interface Lead {
  id: string
  buyerId: string
  marketerId: string
  propertyId: string
  buyerScore: number
  buyerScoreTier: 'Hot' | 'Warm' | 'Cold'
  buyerName: string
  buyerPhone: string
  buyerEmail: string
  buyerBudget: number
  buyerLocations: string[]
  buyerPropertyTypes: string[]
  status: 'New' | 'Contacted' | 'Deal' | 'Lost'
  createdAt: Date
}
