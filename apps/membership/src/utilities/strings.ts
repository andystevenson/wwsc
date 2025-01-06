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
