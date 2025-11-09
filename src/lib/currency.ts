/**
 * Currency utilities for multi-currency support
 * Default currency: XOF (West African CFA Franc)
 * Supported: XOF, EUR, USD
 */

export type Currency = 'XOF' | 'EUR' | 'USD'

export interface CurrencyInfo {
  code: Currency
  name: string
  symbol: string
  flag: string
}

// Exchange rates (base: XOF)
// These are fixed rates - can be updated to use a real-time API later
export const EXCHANGE_RATES: Record<Currency, number> = {
  XOF: 1, // Base currency
  EUR: 655.957, // 1 EUR = 655.957 XOF (fixed CFA rate)
  USD: 590.0, // 1 USD ≈ 590 XOF (approximate, can be updated)
}

export const CURRENCIES: Record<Currency, CurrencyInfo> = {
  XOF: {
    code: 'XOF',
    name: 'West African CFA Franc',
    symbol: 'F CFA',
    flag: '🇨🇮', // Côte d'Ivoire flag as representative
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    flag: '🇪🇺',
  },
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸',
  },
}

export const DEFAULT_CURRENCY: Currency = 'XOF'

/**
 * Convert amount from one currency to another
 * @param amount - Amount to convert
 * @param fromCurrency - Source currency
 * @param toCurrency - Target currency
 * @returns Converted amount
 */
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  if (fromCurrency === toCurrency) return amount

  // Convert to XOF first (base currency)
  const amountInXOF = amount * EXCHANGE_RATES[fromCurrency]

  // Then convert to target currency
  const convertedAmount = amountInXOF / EXCHANGE_RATES[toCurrency]

  return convertedAmount
}

/**
 * Format currency amount with proper symbol and formatting
 * @param amount - Amount to format
 * @param currency - Currency code
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: Currency = DEFAULT_CURRENCY,
  options: {
    showSymbol?: boolean
    decimals?: number
    compact?: boolean
  } = {}
): string {
  const { showSymbol = true, decimals = 0, compact = false } = options
  const currencyInfo = CURRENCIES[currency]

  // Round amount
  const roundedAmount = Math.round(amount)

  // Format with thousands separators
  let formatted: string

  if (compact && roundedAmount >= 1000) {
    // Compact format: 120K, 1.5M, etc.
    if (roundedAmount >= 1_000_000) {
      formatted = `${(roundedAmount / 1_000_000).toFixed(1)}M`
    } else {
      formatted = `${Math.round(roundedAmount / 1000)}K`
    }
  } else {
    // Full format with commas
    formatted = roundedAmount.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }

  // Add currency symbol
  if (showSymbol) {
    if (currency === 'XOF') {
      return `${formatted} ${currencyInfo.symbol}`
    } else {
      return `${currencyInfo.symbol}${formatted}`
    }
  }

  return formatted
}

/**
 * Get display name for currency
 */
export function getCurrencyDisplayName(currency: Currency): string {
  return CURRENCIES[currency].name
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: Currency): string {
  return CURRENCIES[currency].symbol
}

/**
 * Get currency flag emoji
 */
export function getCurrencyFlag(currency: Currency): string {
  return CURRENCIES[currency].flag
}

/**
 * Validate if a string is a valid currency code
 */
export function isValidCurrency(code: string): code is Currency {
  return code === 'XOF' || code === 'EUR' || code === 'USD'
}

/**
 * Get all supported currencies as array
 */
export function getSupportedCurrencies(): CurrencyInfo[] {
  return Object.values(CURRENCIES)
}
