import { Lead } from '@/lib/types'

export const mockLeads: Lead[] = []

export function addLead(lead: Lead): void {
  mockLeads.push(lead)
  console.log('Lead added:', lead)
  console.log('Total leads:', mockLeads.length)
}

export function getLeadsByMarketer(marketerId: string): Lead[] {
  return mockLeads.filter(lead => lead.marketerId === marketerId)
}

export function getLeadsByBuyer(buyerId: string): Lead[] {
  return mockLeads.filter(lead => lead.buyerId === buyerId)
}

export function getAllLeads(): Lead[] {
  return mockLeads
}
