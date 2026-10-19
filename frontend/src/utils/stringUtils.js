/**
 * Utility functions for string manipulation.
 * These can be used globally across the project to format text.
 */

/**
 * Makes the first letter of EVERY word capital and the rest lowercase (Title Case).
 * Example: "iNDian inStitUte" -> "Indian Institute"
 * 
 * @param {string} str - The string to be formatted.
 * @returns {string} The formatted string.
 */
export const capitalizeFirstLetter = (str) => {
  if (!str || typeof str !== 'string') return "";
  return str.split(' ')
    .map(word => {
      // If the word is entirely uppercase and has more than 1 character, assume it's an acronym and keep it as is.
      if (word === word.toUpperCase() && word.length > 1) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

/**
 * Makes all letters of a string capital.
 * Example: "hello" -> "HELLO"
 * 
 * @param {string} str - The string to be formatted.
 * @returns {string} The formatted string.
 */
export const capitalizeAll = (str) => {
  if (!str || typeof str !== 'string') return "";
  return str.toUpperCase();
};

/**
 * Creates an acronym from a given string (e.g., institute name) by taking the first letter of each word.
 * It ignores common stop words like "of", "and", "the", "for", "in", "at".
 * Example: "Indian Institute of Technology Kanpur" -> "IITK"
 * Example: "Delhi Technological University" -> "DTU"
 * 
 * @param {string} str - The string to be shortened.
 * @returns {string} The acronym.
 */
export const getAcronym = (str) => {
  if (!str || typeof str !== 'string') return "";
  
  // Words to ignore while generating the acronym
  const stopWords = new Set(["of", "and", "the", "for", "in", "at", "to", "a", "an"]);
  
  // Remove special characters like brackets and their contents (e.g., "(IIT)")
  const cleanedStr = str.replace(/\([^)]*\)/g, '');

  return cleanedStr
    .split(/\s+/) // Split by spaces
    .filter(word => word.trim().length > 0 && !stopWords.has(word.toLowerCase())) // Ignore empty spaces and stop words
    .map(word => word.charAt(0).toUpperCase()) // Take first letter and capitalize
    .join('');
};

/**
 * Formats a string for breadcrumb usage by converting it to an acronym.
 * It takes the primary string (like full_name) and returns its capitalized acronym.
 * 
 * @param {string} str - The string to format.
 * @returns {string} The acronym string.
 */
export const formatBreadcrumbName = (str) => {
  if (!str || typeof str !== 'string') return "";
  const trimmed = str.trim();
  // If it's a single word (no spaces), just uppercase it instead of returning a single letter
  if (!trimmed.includes(' ')) {
    return trimmed.toUpperCase();
  }
  return getAcronym(str);
};

export const getNoNamePlaceholder = (langCode) => {
  const translations = {
    en: "No Name",
    hi: "कोई नाम नहीं",
    bn: "কোন নাম নেই",
    te: "పేరు లేదు",
    mr: "नाव नाही",
    ta: "பெயர் இல்லை",
    ur: "کوئی نام نہیں",
    gu: "કોઈ નામ નથી",
    kn: "ಹೆಸರಿಲ್ಲ",
    or: "କୌଣସି ନାମ ନାହିଁ",
    ml: "പേരില്ല",
    es: "Sin Nombre",
    fr: "Sans Nom",
    ar: "بلا اسم",
  };
  return translations[langCode] || "No Name";
};
