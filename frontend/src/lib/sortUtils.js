/**
 * Sorts an array of strings alphabetically based on locale.
 * @param {string[]} array - The array of strings to sort.
 * @returns {string[]} A new sorted array.
 */
export const sortStringsAlphabetically = (array) => {
  return [...array].sort((a, b) => a.localeCompare(b));
};
