'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
  Currency,
  DEFAULT_CURRENCY,
  convertCurrency,
  formatCurrency as formatCurrencyUtil,
  isValidCurrency,
} from '@/lib/currency'

interface CurrencyContextType {
  selectedCurrency: Currency
  setSelectedCurrency: (currency: Currency) => void
  convertAmount: (amount: number, fromCurrency: Currency) => number
  formatAmount: (
    amount: number,
    fromCurrency: Currency,
    options?: {
      showSymbol?: boolean
      decimals?: number
      compact?: boolean
    }
  ) => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

const STORAGE_KEY = 'transpayra_currency'

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [selectedCurrency, setSelectedCurrencyState] = useState<Currency>(DEFAULT_CURRENCY)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load currency preference from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && isValidCurrency(stored)) {
      setSelectedCurrencyState(stored)
    }
    setIsInitialized(true)
  }, [])

  // Save currency preference to localStorage when changed
  const setSelectedCurrency = (currency: Currency) => {
    setSelectedCurrencyState(currency)
    localStorage.setItem(STORAGE_KEY, currency)
  }

  // Convert amount from source currency to selected display currency
  const convertAmount = (amount: number, fromCurrency: Currency): number => {
    return convertCurrency(amount, fromCurrency, selectedCurrency)
  }

  // Format amount with conversion to selected currency
  const formatAmount = (
    amount: number,
    fromCurrency: Currency,
    options?: {
      showSymbol?: boolean
      decimals?: number
      compact?: boolean
    }
  ): string => {
    const converted = convertAmount(amount, fromCurrency)
    return formatCurrencyUtil(converted, selectedCurrency, options)
  }

  // Don't render children until we've loaded the currency preference
  if (!isInitialized) {
    return null
  }

  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency,
        setSelectedCurrency,
        convertAmount,
        formatAmount,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
