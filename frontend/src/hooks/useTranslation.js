import { useAccessibility } from '../contexts/AccessibilityContext';
import translations from '../data/translations.json';

export const useTranslation = () => {
  const { language } = useAccessibility();

  const t = (key) => {
    // key is a dot-separated string, e.g. "accessibilityMenu.title"
    const keys = key.split('.');
    let result = translations;
    
    // Traverse the JSON to find the translation key object
    for (const k of keys) {
      if (result && result[k]) {
        result = result[k];
      } else {
        return key; // Fallback to the key itself if not found
      }
    }

    // Now result should be an object with language keys, e.g. { "en": "...", "hi": "..." }
    if (result && typeof result === 'object') {
      // Return the string for the current language, or fallback to 'en'
      return result[language] || result['en'] || key;
    }

    return key; // Fallback
  };

  return { t, language };
};
