/**
 * Production-grade location matcher for Nominatim → our locale mapping.
 *
 * Match pipeline (in order):
 *   1. Exact match
 *   2. Alias lookup (historical names, merged UTs, alternate spellings)
 *   3. Normalized exact match (case, diacritics, punctuation, dashes)
 *   4. Token-order match ("24 Parganas North" → "North 24 Parganas")
 *   5. Fuzzy similarity (Levenshtein 70% + bigram Jaccard 30%), threshold 0.85
 *
 * Instantiate ONCE per mapping object (matchers are pre-built at module load).
 * Fuzzy is O(n) over candidate list — fine for 716 districts at ~1 call/session.
 */

// ---------------------------------------------------------------------------
// Core normalize — collapses diacritics, dashes, punctuation, case
// Hyphens → spaces so "Janjgir-Champa" and "Janjgir Champa" normalize the same.
// ---------------------------------------------------------------------------
function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')   // strip diacritics
    .replace(/&/g, ' and ')
    .replace(/[()]/g, ' ')
    .replace(/[.,\'']/g, '')
    .replace(/[-_/\u2013\u2014]/g, ' ') // hyphens, en-dash, em-dash → space
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenKey(str) {
  return normalize(str).split(' ').filter(Boolean).sort().join(' ');
}

// ---------------------------------------------------------------------------
// Levenshtein + bigram Jaccard similarity
// ---------------------------------------------------------------------------
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => i || j));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

function levScore(a, b) {
  const d = levenshtein(a, b);
  return 1 - d / Math.max(a.length, b.length, 1);
}

function bigrams(str) {
  const g = new Set();
  for (let i = 0; i < str.length - 1; i++) g.add(str.slice(i, i + 2));
  return g;
}

function bigramScore(a, b) {
  const A = bigrams(a), B = bigrams(b);
  let inter = 0;
  A.forEach(x => { if (B.has(x)) inter++; });
  const union = new Set([...A, ...B]).size;
  return union === 0 ? 0 : inter / union;
}

function similarity(normA, normB) {
  // normA is already normalized; normalize normB here
  const B = normalize(normB);
  return levScore(normA, B) * 0.7 + bigramScore(normA, B) * 0.3;
}

// ---------------------------------------------------------------------------
// LocationMatcher — build once per mapping object, reuse for all queries
// ---------------------------------------------------------------------------
class LocationMatcher {
  /**
   * @param {string[]} keys        - canonical keys from our mapping (e.g. district names)
   * @param {Object}   aliasesRaw  - { [alias]: canonicalKey } plain strings (not pre-normalized)
   * @param {number}   threshold   - minimum fuzzy similarity to accept (default 0.85)
   */
  constructor(keys, aliasesRaw = {}, threshold = 0.85) {
    this.keys = keys;
    this.threshold = threshold;

    this.exactSet    = new Set(keys);
    this.normalMap   = new Map();   // normalize(key) → key
    this.tokenMap    = new Map();   // tokenKey(key)  → key
    this.aliasMap    = new Map();   // normalize(alias) → normalize(canonical)

    for (const key of keys) {
      this.normalMap.set(normalize(key), key);
      // Don't overwrite if tokenKey collision — first inserted wins
      const tk = tokenKey(key);
      if (!this.tokenMap.has(tk)) this.tokenMap.set(tk, key);
    }

    for (const [alias, canonical] of Object.entries(aliasesRaw)) {
      // Store normalized alias → normalized canonical
      // (we'll resolve normalized canonical against normalMap in match())
      this.aliasMap.set(normalize(alias), normalize(canonical));
    }
  }

  /**
   * Match an input string to one of our canonical keys.
   * Returns { match: string, confidence: number, method: string } or null.
   */
  match(input) {
    if (!input || typeof input !== 'string') return null;

    // 1. Exact
    if (this.exactSet.has(input)) {
      return { match: input, confidence: 1, method: 'exact' };
    }

    let normed = normalize(input);

    // 2. Alias → resolve normalized canonical
    if (this.aliasMap.has(normed)) {
      normed = this.aliasMap.get(normed);
    }

    // 3. Normalized exact
    if (this.normalMap.has(normed)) {
      return { match: this.normalMap.get(normed), confidence: 1, method: 'normalized' };
    }

    // 4. Token-order match
    const tk = normed.split(' ').filter(Boolean).sort().join(' ');
    if (this.tokenMap.has(tk)) {
      return { match: this.tokenMap.get(tk), confidence: 0.99, method: 'token' };
    }

    // 5. Fuzzy — only if input is long enough to be meaningful (avoid 3-char mismatches)
    if (normed.length < 4) return null;

    let bestMatch = null;
    let bestScore = 0;
    for (const candidate of this.keys) {
      const score = similarity(normed, candidate);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = candidate;
      }
    }

    if (bestScore >= this.threshold) {
      return { match: bestMatch, confidence: +bestScore.toFixed(4), method: 'fuzzy' };
    }

    return null;
  }

  /** Convenience: return just the canonical key string, or null */
  resolve(input) {
    return this.match(input)?.match ?? null;
  }
}

// ---------------------------------------------------------------------------
// Pre-built singleton matchers (instantiated once at module load)
// Aliases are loaded from localeData.json → indiaLocationLanguages.stateAliases
// and indiaLocationLanguages.districtAliases — edit that file to add new ones.
// ---------------------------------------------------------------------------
import localeData from '../data/localeData.json';

const { indiaLocationLanguages: locationMappings } = localeData;

const stateMatcher = new LocationMatcher(
  Object.keys(locationMappings.states),
  locationMappings.stateAliases
);

const districtMatcher = new LocationMatcher(
  Object.keys(locationMappings.districts),
  locationMappings.districtAliases,
  0.80
  // threshold 0.80 — safe because:
  //   "Kanpur Nagr"       → "Kanpur Nagar"    0.867 ✓
  //   "Tiruchirpalli"     → "Tiruchirappalli"  0.821 ✓
  //   "Thiruchirappalli"  → "Tiruchirappalli"  0.913 ✓
  //   short-name collisions top out at ~0.78   ✓ (won't false-fire)
);

// ---------------------------------------------------------------------------
// Public API (drop-in replacement for old geoNormalize.js exports)
// ---------------------------------------------------------------------------

/**
 * Look up a Nominatim place name in a mapping object.
 * Returns the *value* (language code) or null.
 */
export function lookupMapping(name, mapping) {
  if (!name || !mapping) return null;
  const isStates    = mapping === locationMappings.states;
  const isDistricts = mapping === locationMappings.districts;
  const matcher     = isStates ? stateMatcher : isDistricts ? districtMatcher : null;

  if (matcher) {
    const key = matcher.resolve(name);
    return key ? mapping[key] : null;
  }

  // Fallback for any other mapping objects passed directly
  const fallback = new LocationMatcher(Object.keys(mapping), {});
  const key = fallback.resolve(name);
  return key ? mapping[key] : null;
}

/**
 * Returns the canonical key from our mapping (e.g. "Prayagraj" for "Allahabad"),
 * or null if no match. Useful when you need the display name.
 */
export function resolveCanonicalName(name, mapping) {
  if (!name || !mapping) return null;
  const isStates    = mapping === locationMappings.states;
  const isDistricts = mapping === locationMappings.districts;
  const matcher     = isStates ? stateMatcher : isDistricts ? districtMatcher : null;

  if (matcher) return matcher.resolve(name);

  const fallback = new LocationMatcher(Object.keys(mapping), {});
  return fallback.resolve(name);
}
