'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { getLocationsWithSubmissions } from '@/app/actions/directories'
import type { LocationWithSubmissions } from '@/app/actions/directories'

interface Location extends LocationWithSubmissions {
  flag: string
}

const countryFlags: Record<string, string> = {
  'United States': '🇺🇸',
  'Canada': '🇨🇦',
  'United Kingdom': '🇬🇧',
  'Germany': '🇩🇪',
  'France': '🇫🇷',
  'Netherlands': '🇳🇱',
  'Spain': '🇪🇸',
  'Italy': '🇮🇹',
  'Japan': '🇯🇵',
  'Singapore': '🇸🇬',
  'Australia': '🇦🇺',
  'South Korea': '🇰🇷',
  'India': '🇮🇳',
  'China': '🇨🇳',
  'Nigeria': '🇳🇬',
  'Kenya': '🇰🇪',
  'South Africa': '🇿🇦',
  'Egypt': '🇪🇬',
}

export function LocationDirectory() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('Software Engineer')
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLocations() {
      setLoading(true)
      const data = await getLocationsWithSubmissions()
      const locationsWithFlags = data.map((loc) => ({
        ...loc,
        flag: countryFlags[loc.country] || '🌍',
      }))
      setLocations(locationsWithFlags)
      setLoading(false)
    }

    fetchLocations()
  }, [])

  const filteredLocations = locations.filter((loc) =>
    `${loc.city} ${loc.state || ''} ${loc.country}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  )

  const groupedLocations = filteredLocations.reduce((acc, loc) => {
    const region = loc.region || 'Other'
    if (!acc[region]) acc[region] = []
    acc[region].push(loc)
    return acc
  }, {} as Record<string, Location[]>)

  const displayLocation = (loc: Location) => {
    if (loc.state) {
      return `${loc.city}, ${loc.state}`
    }
    return loc.city
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Location Directory</h1>
        <p className="text-gray-600 text-lg">
          Popular locations are listed below. Use the Search bar to search all locations.
        </p>
      </div>

      {/* Search & Filters Row */}
      <div className="flex flex-col md:flex-row gap-4 mb-12 items-center">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-2xl w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search over 1,000 locations across metros, countries, and more"
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Role Dropdown */}
        <div className="w-full md:w-auto">
          <select
            className="px-6 py-4 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent shadow-sm min-w-48"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option>Software Engineer</option>
            <option>Product Manager</option>
            <option>Data Scientist</option>
            <option>UI/UX Designer</option>
            <option>DevOps Engineer</option>
          </select>
        </div>
      </div>

      {/* Location Sections */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading locations...</div>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedLocations).map(([region, locs]) => (
            <div key={region}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{region}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {locs.map((loc) => (
                  <Link
                    key={loc.locationId}
                    href={`/salaries/location/${loc.slug}`}
                    className="bg-gray-100 hover:bg-gray-200 rounded-xl p-4 flex items-center space-x-3 transition-colors duration-200 hover:shadow-md"
                  >
                    <span className="text-2xl">{loc.flag}</span>
                    <span className="text-brand-secondary hover:underline font-medium">
                      {displayLocation(loc)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
