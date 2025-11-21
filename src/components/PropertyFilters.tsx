import { useState } from 'react'

export interface FilterValues {
  minPrice: number
  maxPrice: number
  location: string
  bedrooms: string
  propertyType: string
  minArea: number
}

interface PropertyFiltersProps {
  onFilterChange: (filters: FilterValues) => void
}

const locationOptions = [
  'All Locations',
  'New Cairo',
  'NAC',
  '6th October',
  'Sheikh Zayed',
  'North Coast',
  'Madinaty',
  'Rehab',
  'Downtown',
  'Zamalek',
  'Heliopolis'
]

const propertyTypeOptions = [
  'All Types',
  'Apartment',
  'Villa',
  'Townhouse',
  'Duplex',
  'Commercial'
]

export default function PropertyFilters({ onFilterChange }: PropertyFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>({
    minPrice: 0,
    maxPrice: 10000000,
    location: 'All Locations',
    bedrooms: 'Any',
    propertyType: 'All Types',
    minArea: 0
  })

  const handleFilterChange = (newFilters: Partial<FilterValues>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFilterChange(updated)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <select
            value={filters.location}
            onChange={(e) => handleFilterChange({ location: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white"
          >
            {locationOptions.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Type
          </label>
          <select
            value={filters.propertyType}
            onChange={(e) => handleFilterChange({ propertyType: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white"
          >
            {propertyTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Min Price (SAR)
          </label>
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange({ minPrice: Number(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Price (SAR)
          </label>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange({ maxPrice: Number(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            placeholder="10000000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Min Bedrooms
          </label>
          <select
            value={filters.bedrooms}
            onChange={(e) => handleFilterChange({ bedrooms: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white"
          >
            <option value="Any">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Min Area (m²)
          </label>
          <input
            type="number"
            value={filters.minArea}
            onChange={(e) => handleFilterChange({ minArea: Number(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            placeholder="0"
          />
        </div>
      </div>
    </div>
  )
}
