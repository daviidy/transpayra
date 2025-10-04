'use client'

import { useState } from 'react'
import { Menu, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { AuthModal } from './AuthModal'
import { MobileMenu } from './MobileMenu'
import { SearchAutocomplete } from '@/components/search/SearchAutocomplete'
import { useAuth } from '@/contexts/AuthContext'

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isSalariesDropdownOpen, setIsSalariesDropdownOpen] = useState(false)
  const { user } = useAuth()

  const handleAuthClick = () => {
    setIsAuthModalOpen(true)
  }

  return (
    <>
      <nav className="relative bg-brand-primary shadow-sm">
        <div className="container px-6 py-4 mx-auto">
          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/transpayra_main.png"
                alt="Transpayra"
                width={200}
                height={40}
                className="h-8 w-auto"
                priority
              />
            </Link>

            {/* Expanded Search Bar */}
            <div className="flex-1 max-w-2xl">
              <SearchAutocomplete placeholder="Search by company, title, or location..." />
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-4 ml-auto">
              {/* Salaries Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsSalariesDropdownOpen(!isSalariesDropdownOpen)}
                  onBlur={() => setTimeout(() => setIsSalariesDropdownOpen(false), 200)}
                  className="text-sm font-medium text-brand-secondary hover:text-brand-accent transition-colors px-3 py-2 flex items-center gap-1"
                >
                  Salaries
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isSalariesDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isSalariesDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                    <Link
                      href="/salaries/by-location"
                      className="block px-4 py-2 text-sm text-brand-secondary hover:bg-brand-primary transition-colors first:rounded-t-lg"
                      onClick={() => setIsSalariesDropdownOpen(false)}
                    >
                      By Location
                    </Link>
                    <Link
                      href="/salaries/by-company"
                      className="block px-4 py-2 text-sm text-brand-secondary hover:bg-brand-primary transition-colors"
                      onClick={() => setIsSalariesDropdownOpen(false)}
                    >
                      By Company
                    </Link>
                    <Link
                      href="/salaries/by-industry"
                      className="block px-4 py-2 text-sm text-brand-secondary hover:bg-brand-primary transition-colors last:rounded-b-lg"
                      onClick={() => setIsSalariesDropdownOpen(false)}
                    >
                      By Industry
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/contribute"
                className="text-sm font-medium text-brand-secondary hover:text-brand-accent transition-colors px-3 py-2"
              >
                Contribute
              </Link>

              {user ? (
                <Link
                  href="/dashboard"
                  className="p-2 text-brand-secondary hover:text-brand-accent transition-colors"
                  aria-label="Go to dashboard"
                >
                  <User className="w-6 h-6" />
                </Link>
              ) : (
                <button
                  onClick={handleAuthClick}
                  className="px-5 py-2 text-sm font-medium text-white bg-brand-secondary rounded-lg hover:bg-brand-accent transition-colors"
                >
                  Register / Sign in
                </button>
              )}
            </div>
          </div>

          {/* Mobile/Tablet Layout */}
          <div className="flex lg:hidden items-center justify-between">
            {/* Logo */}
            <Link href="/">
              <Image
                src="/transpayra_main.png"
                alt="Transpayra"
                width={200}
                height={40}
                className="h-8 w-auto"
                priority
              />
            </Link>

            {/* Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-brand-secondary hover:text-brand-accent transition-colors"
              aria-label="Open menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isLoggedIn={!!user}
        onAuthClick={handleAuthClick}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  )
}