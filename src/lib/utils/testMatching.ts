import { Buyer, Property } from '@/lib/types'
import { shouldCreateLead, getMatchingDetails } from '@/lib/matching/matchingEngine'

export function testMatchingScenarios() {
  console.log('=== TESTING MATCHING ENGINE ===\n')

  const testBuyer: Buyer = {
    id: 'test-buyer-1',
    fullName: 'Test Buyer',
    email: 'buyer@test.com',
    phone: '0123456789',
    password: 'password',
    budget: 2000000,
    locations: ['New Cairo'],
    propertyTypes: ['Apartment'],
    buyingIntent: 'Cash',
    score: 100,
    scoreTier: 'Hot',
    createdAt: new Date()
  }

  const matchingProperty: Property = {
    id: '1',
    marketerId: 'marketer-1',
    title: 'Test Apartment in New Cairo',
    type: 'Apartment',
    location: 'New Cairo',
    price: 1800000,
    area: 150,
    bedrooms: 3,
    bathrooms: 2,
    deliveryDate: new Date('2025-12-01'),
    paymentPlan: '20% down, 80% over 5 years',
    images: [],
    description: 'Test property',
    status: 'Available',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  console.log('TEST 1: Budget Match (2M buyer, 1.8M property)')
  console.log('Budget range: 1.64M - 2.36M')
  const result1 = getMatchingDetails(testBuyer, matchingProperty)
  console.log('Result:', result1.matches ? 'MATCH ✓' : 'NO MATCH ✗')
  if (!result1.matches) console.log('Reasons:', result1.reasons)
  console.log('')

  const budgetMismatchProperty: Property = {
    ...matchingProperty,
    price: 3000000
  }

  console.log('TEST 2: Budget Mismatch (2M buyer, 3M property)')
  const result2 = getMatchingDetails(testBuyer, budgetMismatchProperty)
  console.log('Result:', result2.matches ? 'MATCH ✓' : 'NO MATCH ✗')
  if (!result2.matches) console.log('Reasons:', result2.reasons)
  console.log('')

  const adjacentLocationProperty: Property = {
    ...matchingProperty,
    location: 'Rehab'
  }

  console.log('TEST 3: Adjacent Location Match (New Cairo buyer, Rehab property)')
  const result3 = getMatchingDetails(testBuyer, adjacentLocationProperty)
  console.log('Result:', result3.matches ? 'MATCH ✓' : 'NO MATCH ✗')
  if (!result3.matches) console.log('Reasons:', result3.reasons)
  console.log('')

  const wrongLocationProperty: Property = {
    ...matchingProperty,
    location: 'North Coast'
  }

  console.log('TEST 4: Wrong Location (New Cairo buyer, North Coast property)')
  const result4 = getMatchingDetails(testBuyer, wrongLocationProperty)
  console.log('Result:', result4.matches ? 'MATCH ✓' : 'NO MATCH ✗')
  if (!result4.matches) console.log('Reasons:', result4.reasons)
  console.log('')

  const wrongTypeProperty: Property = {
    ...matchingProperty,
    type: 'Villa'
  }

  console.log('TEST 5: Type Mismatch (Apartment buyer, Villa property)')
  const result5 = getMatchingDetails(testBuyer, wrongTypeProperty)
  console.log('Result:', result5.matches ? 'MATCH ✓' : 'NO MATCH ✗')
  if (!result5.matches) console.log('Reasons:', result5.reasons)
  console.log('')

  const unavailableProperty: Property = {
    ...matchingProperty,
    status: 'Sold Out'
  }

  console.log('TEST 6: Unavailable Property (Sold Out)')
  const result6 = getMatchingDetails(testBuyer, unavailableProperty)
  console.log('Result:', result6.matches ? 'MATCH ✓' : 'NO MATCH ✗')
  if (!result6.matches) console.log('Reasons:', result6.reasons)
  console.log('')

  console.log('=== TESTING COMPLETE ===')

  return {
    test1: result1.matches,
    test2: !result2.matches,
    test3: result3.matches,
    test4: !result4.matches,
    test5: !result5.matches,
    test6: !result6.matches
  }
}
