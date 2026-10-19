/**
 * All dropdown/select options used in forms across the app.
 * Sourced from data/formated/ JSON files — nothing is hardcoded here.
 */
import genderData    from '../data/formated/gender.json';
import casteData     from '../data/formated/caste.json';
import addressData   from '../data/formated/addressOptions.json';
import formData      from '../data/formated/formOptions.json';

// ── Gender ───────────────────────────────────────────────────────────────────
export const GENDER_OPTIONS = genderData.options.map(v => ({ value: v, label: v }));

// ── Caste (India) ─────────────────────────────────────────────────────────────
export const CASTE_OPTIONS = casteData.categories.map(v => ({ value: v, label: v }));

// ── Sub-caste from Gazeteer (state-aware) ─────────────────────────────────────
import gazeteer from '../data/formated/gazeteer.json';
import { sortLocationsByDistance } from './geoNormalize';

const _indiaStates = gazeteer.Countries.find(c => c.name === 'India')?.states || [];

/**
 * Returns sub-caste options for a given caste category and (optional) state name.
 * Falls back to merging all states if no state given.
 * Filters out placeholder values like "NA".
 * @param {string} caste  - e.g. "OBC", "SC", "ST", "General"
 * @param {number} [userLat] - user latitude
 * @param {number} [userLon] - user longitude
 * @returns {{ value: string, label: string }[]}
 */
export function getSubcasteOptions(caste, stateName, userLat, userLon) {
  if (!caste) return [];
  let stateList = _indiaStates;
  
  if (stateName) {
    stateList = _indiaStates.filter(s => s.name === stateName);
  } else if (userLat !== undefined && userLon !== undefined) {
    // Sort states by distance to prioritize local subcastes when no state is selected
    stateList = sortLocationsByDistance(_indiaStates, userLat, userLon, 'states');
  }

  const raw = new Set();
  stateList.forEach(s => {
    const subcastes = s.caste_data?.[caste] || [];
    // Sort alphabetically within each state's list before adding to the Set
    const sortedSubcastes = [...subcastes].sort((a, b) => a.localeCompare(b));
    sortedSubcastes.forEach(sub => {
      if (sub && sub !== 'NA') raw.add(sub);
    });
  });
  // Set preserves insertion order: closer states' subcastes appear first, 
  // and within a state they are alphabetical.
  return [...raw].map(v => ({ value: v, label: v }));
}

// ── Address: Area Type ────────────────────────────────────────────────────────
export const AREA_TYPE_OPTIONS = addressData.areaTypes.map(v => ({ value: v, label: v }));

// ── Address: Local Body Types ─────────────────────────────────────────────────
export const RURAL_LOCAL_BODY_OPTIONS  = addressData.ruralLocalBodyTypes.map(v => ({ value: v, label: v }));
export const URBAN_LOCAL_BODY_OPTIONS  = addressData.urbanLocalBodyTypes.map(v => ({ value: v, label: v }));

// ── Achievement Types ─────────────────────────────────────────────────────────
export const ACHIEVEMENT_TYPE_OPTIONS = formData.achievementTypes.map(v => ({ value: v, label: v }));

// ── ID Document Types ─────────────────────────────────────────────────────────
export const ID_DOCUMENT_OPTIONS = formData.idDocumentTypes.map(v => ({ value: v, label: v }));

// ── Guardian Relation ─────────────────────────────────────────────────────────
export const GUARDIAN_RELATION_OPTIONS = formData.guardianRelations.map(v => ({ value: v, label: v }));

// ── Sibling Relation ──────────────────────────────────────────────────────────
export const SIBLING_RELATION_OPTIONS = formData.siblingRelations.map(v => ({ value: v, label: v }));

// ── Yes / No ──────────────────────────────────────────────────────────────────
export const YES_NO_OPTIONS = formData.yesNo.map(v => ({ value: v, label: v }));
