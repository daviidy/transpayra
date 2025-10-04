'use client'

import { useState } from 'react'
import Image from 'next/image'

interface CompanyLogoProps {
  companyName: string
  logoUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function CompanyLogo({
  companyName,
  logoUrl,
  size = 'md',
  className = '',
}: CompanyLogoProps) {
  const [imageError, setImageError] = useState(false)

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base',
  }

  // Generate initials from company name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Generate consistent color from company name
  const getColorFromName = (name: string) => {
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }

    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-red-500',
    ]

    return colors[Math.abs(hash) % colors.length]
  }

  const initials = getInitials(companyName)
  const bgColor = getColorFromName(companyName)

  // Show initials fallback if no logo URL or image failed to load
  if (!logoUrl || imageError) {
    return (
      <div
        className={`${sizeClasses[size]} ${bgColor} rounded-md flex items-center justify-center text-white font-semibold ${className}`}
        title={companyName}
      >
        {initials}
      </div>
    )
  }

  return (
    <div className={`${sizeClasses[size]} rounded-md overflow-hidden bg-gray-100 ${className}`}>
      <Image
        src={logoUrl}
        alt={`${companyName} logo`}
        width={size === 'sm' ? 24 : size === 'md' ? 32 : 48}
        height={size === 'sm' ? 24 : size === 'md' ? 32 : 48}
        className="object-cover w-full h-full"
        onError={() => setImageError(true)}
      />
    </div>
  )
}