'use client'

import { X, ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  isLoggedIn: boolean
  onAuthClick: () => void
}

export function MobileMenu({ isOpen, onClose, isLoggedIn, onAuthClick }: MobileMenuProps) {
  const [isSalariesOpen, setIsSalariesOpen] = useState(false)
  useEffect(() => {
    if (!isOpen) return

    // Lock body scroll
    document.body.style.overflow = 'hidden'

    // Trap focus
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-40 bg-white"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation menu"
    >
      <div className="flex flex-col h-full">
        {/* Header with close button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <Link href="/" onClick={onClose}>
            <img
              src="/transpayra_main.png"
              alt="Transpayra"
              className="h-8 w-auto"
            />
          </Link>
          <button
            onClick={onClose}
            className="text-brand-secondary hover:text-brand-accent p-2"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto px-6 py-8">
          <ul className="space-y-4">
            <li>
              <Link
                href="/"
                onClick={onClose}
                className="block text-2xl font-medium text-brand-secondary hover:text-brand-accent py-3 transition-colors"
              >
                Home
              </Link>
            </li>
            <li>
              {/* Salaries with dropdown */}
              <button
                onClick={() => setIsSalariesOpen(!isSalariesOpen)}
                className="w-full flex items-center justify-between text-2xl font-medium text-brand-secondary hover:text-brand-accent py-3 transition-colors"
              >
                Salaries
                <ChevronDown
                  className={`w-6 h-6 transition-transform ${
                    isSalariesOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isSalariesOpen && (
                <ul className="mt-2 ml-4 space-y-2">
                  <li>
                    <Link
                      href="/salaries/by-location"
                      onClick={onClose}
                      className="block text-lg font-medium text-brand-secondary hover:text-brand-accent py-2 transition-colors"
                    >
                      By Location
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/salaries/by-company"
                      onClick={onClose}
                      className="block text-lg font-medium text-brand-secondary hover:text-brand-accent py-2 transition-colors"
                    >
                      By Company
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/salaries/by-industry"
                      onClick={onClose}
                      className="block text-lg font-medium text-brand-secondary hover:text-brand-accent py-2 transition-colors"
                    >
                      By Industry
                    </Link>
                  </li>
                </ul>
              )}
            </li>
            <li>
              <Link
                href="/contribute"
                onClick={onClose}
                className="block text-2xl font-medium text-brand-secondary hover:text-brand-accent py-3 transition-colors"
              >
                Contribute
              </Link>
            </li>
            <li>
              <Link
                href="/companies"
                onClick={onClose}
                className="block text-2xl font-medium text-brand-secondary hover:text-brand-accent py-3 transition-colors"
              >
                Companies
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                onClick={onClose}
                className="block text-2xl font-medium text-brand-secondary hover:text-brand-accent py-3 transition-colors"
              >
                About
              </Link>
            </li>
          </ul>
        </nav>

        {/* Bottom action - Auth or Dashboard */}
        <div className="px-6 py-6 border-t border-gray-200">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              onClick={onClose}
              className="block w-full text-center px-6 py-4 bg-brand-secondary text-white font-medium text-lg rounded-lg hover:bg-brand-accent transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <button
              onClick={() => {
                onClose()
                onAuthClick()
              }}
              className="w-full px-6 py-4 bg-brand-secondary text-white font-medium text-lg rounded-lg hover:bg-brand-accent transition-colors"
            >
              Register / Sign in
            </button>
          )}
        </div>
      </div>
    </div>
  )
}