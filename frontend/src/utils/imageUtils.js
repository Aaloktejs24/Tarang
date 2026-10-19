/**
 * Utility functions for handling images in Tarang.
 */

/**
 * Prevents image flickering when re-fetching data containing signed S3 URLs.
 * If the base URL (without query params) matches, it keeps the previous signed URL
 * to avoid forcing the browser to re-download the exact same image.
 * 
 * @param {Object} prev - The previous state object
 * @param {Object} next - The new state object from the API
 * @param {Array<string>} urlPaths - Array of object paths (e.g. ['profile_pic_url', 'institute_profile.logo_url'])
 * @returns {Object} - The modified next object
 */
export const preserveSignedUrls = (prev, next, urlPaths) => {
  if (!prev || !next) return next;
  
  const getBase = (url) => (url && typeof url === 'string') ? url.split('?')[0] : '';
  
  // Clone next to avoid mutating the original API response directly if not intended
  const result = { ...next };

  // Helper to safely get nested value
  const getNestedValue = (obj, path) => {
    if (!obj) return undefined;
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  // Helper to safely set nested value
  const setNestedValue = (obj, path, value) => {
    const parts = path.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
  };

  urlPaths.forEach(path => {
    const prevUrl = getNestedValue(prev, path);
    const nextUrl = getNestedValue(result, path);

    // If both exist, base URLs match, and it's not a local blob URL
    if (getBase(prevUrl) === getBase(nextUrl) && prevUrl && !prevUrl.startsWith('blob:')) {
      setNestedValue(result, path, prevUrl);
    }
  });

  return result;
};
