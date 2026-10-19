/**
 * Centralized language list builder.
 * Uses the EXACT same logic as AccessibilityMenu.jsx:
 *  - Builds language list by traversing scriptLanguages tree (correct script per language)
 *  - Sorts by geo-distance/priority via getSortedLanguagesByLocation
 *  - Fallback: hi (Hindi) first, then en, then alphabetical
 */

import langFeture from '../data/formated/langFeture.json';
import { getSortedLanguagesByLocation } from './geoNormalize';

const STRUCTURAL_NODES = new Set([
  'Logographic', 'Chinese', 'Japanese', 'Independent Scripts',
  'Alphabetic and Abugida', 'Proto-Sinaitic', 'Phoenician', 'Greek',
  'Germanic', 'Romance', 'Other', 'East Slavic', 'South Slavic',
  'Aramaic', 'Brahmi', 'Northern', 'Southern', 'Southeast Asian'
]);

/**
 * Traverses the scriptLanguages tree to produce a flat list of
 * { code, nativeName, script } — exactly as AccessibilityMenu does.
 */
function buildRawLanguageList() {
  const tree = langFeture.scriptLanguages?.WRITING_SYSTEMS;
  const langNames = langFeture.languageNames || {};
  const langScripts = langFeture.languageScripts || {};
  const langs = [];
  const seen = new Set();

  function traverse(node, currentScript) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(code => {
        if (!seen.has(code)) {
          seen.add(code);
          const finalScript = langScripts[code] || currentScript;
          langs.push({
            code,
            nativeName: langNames[code] || code,
            script: finalScript,
          });
        }
      });
    } else {
      for (const key in node) {
        const nextScript = STRUCTURAL_NODES.has(key) ? currentScript : key;
        traverse(node[key], nextScript);
      }
    }
  }

  traverse(tree, '');
  return langs;
}

/**
 * Returns a sorted + labelled language list.
 * Sorting: geo-priority > geo-distance > alphabetical (same as AccessibilityMenu)
 * Label format: "नाम (Script)" — or just "नाम" if script is Latin/empty
 *
 * @param {object|null} userLocation - { lat, lon } from useAccessibility()
 * @returns {{ value: string, label: string, code: string }[]}
 */
export function buildSortedLanguages(userLocation) {
  const langs = buildRawLanguageList();

  let lat = userLocation?.lat;
  let lon = userLocation?.lon;

  // Fallback to centre of India (same as AccessibilityMenu)
  if (!lat || !lon) {
    lat = 22.9074872;
    lon = 79.1322059;
  }

  const langDataMap = getSortedLanguagesByLocation(lat, lon);

  // If no real location, pin hi & en to top (same as AccessibilityMenu)
  if (!userLocation) {
    langDataMap.set('hi', { priority: 1, distance: Infinity });
    langDataMap.set('en', { priority: 2, distance: Infinity });
  }

  langs.forEach(l => {
    const data = langDataMap.get(l.code) || { priority: Infinity, distance: Infinity };
    l.priority = data.priority;
    l.distance = data.distance;
  });

  langs.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    if (a.distance !== b.distance) return a.distance - b.distance;
    return a.nativeName.localeCompare(b.nativeName, 'hi');
  });

  return langs.map(lang => ({
    code: lang.code,
    value: lang.nativeName,
    label: lang.nativeName,
    searchStr: `${lang.code} ${lang.nativeName} ${lang.script}`.toLowerCase(),
  }));
}
