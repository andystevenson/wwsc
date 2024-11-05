/**
 * Removes all whitespace from a string.
 * @param s The string to strip whitespace from.
 * @returns The string with all whitespace removed.
 */
export function stripWhitespace(s: string) {
  return s.replace(/\s/g, "");
}
