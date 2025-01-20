import { Stripe } from 'stripe'
/**
 * Removes all whitespace from a string.
 * @param s The string to strip whitespace from.
 * @returns The string with all whitespace removed.
 */
export function stripWhitespace(s: string) {
  return s.replace(/\s/g, '')
}

/**
 * Removes all non-numeric characters from a string.
 * @param s The string to strip non-numeric characters from.
 * @returns The string with all non-numeric characters removed.
 */
export function stripAlpha(s: string) {
  return s.replace(/[a-zA-Z]/g, '')
}

/**
 * Formats an address in Stripe's format to a human-readable string.
 * @param address The address to format.
 * @returns The formatted address comma-separated.
 */
export function formatStripeAddress(
  address: Stripe.Address | null | undefined
) {
  if (!address) return ''
  let { line1, line2, city, postal_code, country } = address
  let parts = [line1, line2, city, postal_code, country].filter((p) => p)
  return parts.join(', ')
}

/**
 * Formats a name in Stripe's format to a human-readable string.
 * @param name The name to format.
 * @returns @type {firstName: string, surname: string}.
 */
export function formatNameToFirstNameSurname(name: string) {
  let parts = name.split(' ').map((part) => part.trim())
  if (parts.length === 1) return { firstName: parts[0], surname: '' }
  return {
    firstName: parts.slice(0, -1).join(' '),
    surname: parts.slice(-1).join(' ')
  }
}
