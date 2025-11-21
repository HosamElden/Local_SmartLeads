import { Link } from 'react-router-dom'
import { Property } from '@/lib/types'

interface PropertyCardNewProps {
  property: Property
}

export default function PropertyCardNew({ property }: PropertyCardNewProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0
    }).format(price)
  }

  return (
    <Link
      to={`/properties/${property.id}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-md text-xs font-semibold ${
          property.status === 'Available' ? 'bg-white text-gray-800' :
          property.status === 'Reserved' ? 'bg-yellow-500 text-white' :
          'bg-red-500 text-white'
        }`}>
          {property.status}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-blue transition-colors">
          {property.title}
        </h3>

        <p className="text-sm text-gray-600 mb-4 flex items-center">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {property.location}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-primary-blue mb-1">SAR</div>
            <div className="text-3xl font-bold text-primary-blue">{formatPrice(property.price)}</div>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="font-semibold">{property.bedrooms} BR</span>
            <span className="text-gray-400">•</span>
            <span className="font-semibold">{property.area} m²</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
