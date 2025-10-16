'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'
import { getSearchSuggestions, GroupedSuggestions, SearchSuggestion } from '@/app/actions/search'

interface SearchAutocompleteProps {
  placeholder?: string
  contextJobTitle?: string
  onSelect?: (suggestion: SearchSuggestion) => void
  className?: string
}

export function SearchAutocomplete({
  placeholder = 'Search by company, title, or location...',
  contextJobTitle,
  onSelect,
  className = '',
}: SearchAutocompleteProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<GroupedSuggestions>({
    jobTitles: [],
    companies: [],
    locations: [],
    industries: [],
    levels: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [cache, setCache] = useState<Map<string, GroupedSuggestions>>(new Map())

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const abortControllerRef = useRef<AbortController | undefined>(undefined)

  // Flatten suggestions for keyboard navigation
  const flatSuggestions = [
    ...suggestions.jobTitles,
    ...suggestions.companies,
    ...suggestions.locations,
    ...suggestions.industries,
    ...suggestions.levels,
  ]

  const fetchSuggestions = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setSuggestions({ jobTitles: [], companies: [], locations: [], industries: [], levels: [] })
        setIsOpen(false)
        return
      }

      // Check cache
      const cacheKey = `${searchQuery}-${contextJobTitle || ''}`
      if (cache.has(cacheKey)) {
        setSuggestions(cache.get(cacheKey)!)
        setIsOpen(true)
        setLoading(false)
        return
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      setLoading(true)
      setError(false)

      try {
        const results = await getSearchSuggestions(searchQuery, contextJobTitle)
        setSuggestions(results)
        setIsOpen(true)
        setHighlightedIndex(-1)

        // Cache the results
        setCache((prev) => {
          const newCache = new Map(prev)
          newCache.set(cacheKey, results)
          return newCache
        })
      } catch (err) {
        setError(true)
        console.error('Search error:', err)
      } finally {
        setLoading(false)
      }
    },
    [contextJobTitle, cache]
  )

  // Debounced search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (query.length >= 2) {
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(query)
      }, 300)
    } else {
      setIsOpen(false)
      setSuggestions({ jobTitles: [], companies: [], locations: [], industries: [], levels: [] })
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [query, fetchSuggestions])

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.name)
    setIsOpen(false)

    if (onSelect) {
      onSelect(suggestion)
    } else {
      // Default behavior: navigate to search results page
      router.push(`/salaries/search?type=${suggestion.type}&id=${suggestion.id}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev < flatSuggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && flatSuggestions[highlightedIndex]) {
          handleSelect(flatSuggestions[highlightedIndex])
        }
        break
      case 'Tab':
        if (highlightedIndex >= 0 && flatSuggestions[highlightedIndex]) {
          e.preventDefault()
          handleSelect(flatSuggestions[highlightedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        break
    }
  }

  const highlightMatch = (text: string, query: string) => {
    const index = text.toLowerCase().indexOf(query.toLowerCase())
    if (index === -1) return text

    return (
      <>
        {text.substring(0, index)}
        <strong className="font-semibold">{text.substring(index, index + query.length)}</strong>
        {text.substring(index + query.length)}
      </>
    )
  }

  const renderGroup = (
    title: string,
    items: SearchSuggestion[],
    typeLabel: string,
    startIndex: number
  ) => {
    if (items.length === 0) return null

    return (
      <div className="py-2">
        <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {title}
        </div>
        {items.map((item, index) => {
          const globalIndex = startIndex + index
          const isHighlighted = globalIndex === highlightedIndex

          return (
            <button
              key={`${item.type}-${item.id}`}
              onClick={() => handleSelect(item)}
              className={`w-full px-3 py-2 text-left flex items-center justify-between group transition-colors ${
                isHighlighted ? 'bg-brand-primary' : 'hover:bg-gray-50'
              }`}
              title={item.name}
            >
              <span className="flex-1 truncate text-sm text-black">
                {highlightMatch(item.name, query)}
              </span>
              <span className="ml-2 text-xs text-gray-500">{typeLabel}</span>
            </button>
          )
        })}
      </div>
    )
  }

  const totalResults =
    suggestions.jobTitles.length +
    suggestions.companies.length +
    suggestions.locations.length +
    suggestions.industries.length +
    suggestions.levels.length

  return (
    <div className="relative w-full">
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          {loading ? (
            <Loader2 className="w-5 h-5 text-brand-secondary animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-brand-secondary text-opacity-60" />
          )}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className={`w-full py-2.5 pl-10 pr-4 text-brand-secondary bg-white border border-gray-300 rounded-lg focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-opacity-20 placeholder-brand-secondary placeholder-opacity-60 ${className}`}
          placeholder={placeholder}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto"
        >
          {loading && totalResults === 0 && (
            <div className="px-3 py-4 text-sm text-gray-500 text-center">Searching...</div>
          )}

          {!loading && error && (
            <div className="px-3 py-4 text-sm text-gray-500 text-center">
              Couldn&apos;t load suggestions. Try again.
            </div>
          )}

          {!loading && !error && totalResults === 0 && query.length >= 2 && (
            <div className="px-3 py-4 text-sm text-gray-500 text-center">
              No suggestions found. Press Enter to search all.
            </div>
          )}

          {!loading && !error && totalResults > 0 && (
            <>
              {renderGroup('Job Titles', suggestions.jobTitles, 'Job', 0)}
              {renderGroup(
                'Companies',
                suggestions.companies,
                'Company',
                suggestions.jobTitles.length
              )}
              {renderGroup(
                'Locations',
                suggestions.locations,
                'Location',
                suggestions.jobTitles.length + suggestions.companies.length
              )}
              {renderGroup(
                'Industries',
                suggestions.industries,
                'Industry',
                suggestions.jobTitles.length +
                  suggestions.companies.length +
                  suggestions.locations.length
              )}
              {renderGroup(
                'Levels',
                suggestions.levels,
                'Level',
                suggestions.jobTitles.length +
                  suggestions.companies.length +
                  suggestions.locations.length +
                  suggestions.industries.length
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}