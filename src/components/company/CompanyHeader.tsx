import Link from 'next/link'
import { CompanyLogo } from '../CompanyLogo'
import { Building2, MapPin } from 'lucide-react'
import type { CompanyDetails } from '@/app/actions/companies'

interface CompanyHeaderProps {
  company: CompanyDetails
}

export function CompanyHeader({ company }: CompanyHeaderProps) {
  const metaInfo = [
    company.industry,
    company.headquarters,
  ].filter(Boolean).join(' · ')

  return (
    <div className="border-b border-gray-200">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          {/* Left: Logo and Company Info */}
          <div className="flex items-start gap-4">
            <CompanyLogo
              companyName={company.name}
              logoUrl={company.logoUrl}
              size="lg"
            />
            <div>
              <h1 className="text-3xl font-bold text-black">{company.name}</h1>
              {metaInfo && (
                <p className="text-gray-600 mt-2">{metaInfo}</p>
              )}
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/contribute"
              className="px-6 py-2.5 bg-brand-secondary text-white font-medium rounded-lg hover:bg-brand-accent transition-colors"
            >
              Add Salary
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
