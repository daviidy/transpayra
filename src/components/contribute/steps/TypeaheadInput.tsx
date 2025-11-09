'use client'

import { useState, useEffect, useRef } from 'react'

interface TypeaheadInputProps {
  label: string
  placeholder: string
  value: string
  onChange: (value: string, id?: number) => void
  onSearch: (query: string) => Promise<Array<{ id: number; label: string; value: string }>>
  error?: string
  required?: boolean
  helperText?: string
  disabled?: boolean
}

export function TypeaheadInput({
  label,
  placeholder,
  value,
  onChange,
  onSearch,
  error,
  required = false,
  helperText,
  disabled = false,
}: TypeaheadInputProps) {
  const [inputValue, setInputValue] = useState(value)
  const [suggestions, setSuggestions] = useState<Array<{ id: number; label: string; value: string }>>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = async (val: string) => {
    setInputValue(val)

    if (disabled) return

    setShowSuggestions(true)

    if (val.length >= 2) {
      setLoading(true)
      try {
        const results = await onSearch(val)
        setSuggestions(results)
      } catch (error) {
        console.error('Search error:', error)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    } else {
      setSuggestions([])
    }
  }

  const handleSelectSuggestion = (suggestion: { id: number; label: string; value: string }) => {
    setInputValue(suggestion.label)
    onChange(suggestion.value, suggestion.id)
    setShowSuggestions(false)
    setSuggestions([])
  }

  const handleBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => {
      setShowSuggestions(false)
    }, 200)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-base font-semibold text-gray-800 mb-3">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {helperText && <p className="text-sm text-gray-500 mb-2">{helperText}</p>}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onBlur={handleBlur}
        onFocus={() => {
          if (suggestions.length > 0 && !disabled) setShowSuggestions(true)
        }}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition-all ${
          error ? 'border-red-500' : 'border-gray-200'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      />
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

      {/* Suggestions dropdown */}
      {showSuggestions && inputValue.length >= 2 && !disabled && (
        <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-3 text-gray-500">Loading...</div>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full text-left px-4 py-3 text-gray-900 hover:bg-gray-100 transition-colors first:rounded-t-xl last:rounded-b-xl"
              >
                {suggestion.label}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-gray-500">No matches found. Try a different search.</div>
          )}
        </div>
      )}
    </div>
  )
}
