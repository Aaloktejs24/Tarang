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
// ---------------------------------------------------------------------------
import gazeteer from '../data/formated/gazeteer.json';

const india = gazeteer.Countries.find(c => c.code === 'IN') || { states: [] };

const stateNames = india.states.map(s => s.name);
const districtNames = [];
india.states.forEach(s => {
  if (s.districts) {
    s.districts.forEach(d => districtNames.push(d.name));
  }
});

const stateAliases = {
  "Orissa": "Odisha",
  "Pondicherry": "Puducherry (UT)",
  "Andaman & Nicobar": "Andaman and Nicobar Islands",
  "Dadra and Nagar Haveli and Daman and Diu": "Dadra and Nagar Haveli (UT)",
  "NCT of Delhi": "Delhi (NCT)",
  "Jammu & Kashmir": "Jammu and Kashmir",
  // Nominatim returns "Kerala" but gazeteer stores native name "Keralam"
  "Kerala": "Keralam"
};

const districtAliases = {
  "Allahabad": "Prayagraj",
  "Faizabad": "Ayodhya",
  "Gurgaon": "Gurugram",
  "Osmanabad": "Dharashiv",
  "Bellary": "Ballari (Bellary)",
  "Gulbarga": "Kalaburagi (Gulbarga)",
  "Mysore": "Mysuru (Mysore)",
  "Bangalore Urban": "Bengaluru (Bangalore) Urban",
  "Bangalore Rural": "Bengaluru (Bangalore) Rural",
  "Bengalore Urban": "Bengaluru (Bangalore) Urban",
  "Kanpur": "Kanpur Nagar",
  "Trivandrum": "Thiruvananthapuram",
  "Calicut": "Kozhikode",
  "Trichur": "Thrissur",
  "Quilon": "Kollam",
  "Cochin": "Ernakulam",
  "Poona": "Pune",
  "Madras": "Chennai",
  "Calcutta": "Kolkata",
  "Ahmednagar": "Ahilyanagar",
  "Mohali": "Sahibzada Ajit Singh Nagar (Mohali)",
  "Cuddapah": "YSR Kadapa",
  "Kadapa": "YSR Kadapa",
  "Bombay": "Mumbai City"
};

const stateMatcher = new LocationMatcher(stateNames, stateAliases);
const districtMatcher = new LocationMatcher(districtNames, districtAliases, 0.80);

// Helper to look up language codes from the new gazeteer structure
function lookupStateLang(canonicalState) {
  const s = india.states.find(x => x.name === canonicalState);
  return s ? s.state_lang : null;
}

function lookupDistrictLang(canonicalDistrict) {
  for (const s of india.states) {
    if (s.districts) {
      const d = s.districts.find(x => x.name === canonicalDistrict);
      if (d && d.local_lang) return d.local_lang;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Look up a Nominatim place name to find its language code.
 * Pass type = 'states' or 'districts'.
 */
export function lookupMapping(name, type) {
  if (!name) return null;
  const isStates = type === 'states' || type === 'state';
  const isDistricts = type === 'districts' || type === 'district';
  
  const matcher = isStates ? stateMatcher : isDistricts ? districtMatcher : null;

  if (matcher) {
    const key = matcher.resolve(name);
    if (!key) return null;
    return isStates ? lookupStateLang(key) : lookupDistrictLang(key);
  }
  return null;
}

/**
 * Returns the canonical key from our mapping (e.g. "Prayagraj" for "Allahabad"),
 * or null if no match. Useful when you need the display name.
 */
export function resolveCanonicalName(name, type) {
  if (!name) return null;
  const isStates = type === 'states' || type === 'state';
  const isDistricts = type === 'districts' || type === 'district';
  
  const matcher = isStates ? stateMatcher : isDistricts ? districtMatcher : null;
  if (matcher) return matcher.resolve(name);
  return null;
}

/**
 * Haversine formula to calculate distance between two coordinates in km
 */
export function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dlat = (lat2 - lat1) * Math.PI / 180;
  const dlon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dlat / 2) ** 2 + 
            Math.cos(lat1 * Math.PI / 180) * 
            Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dlon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Sorts locations by minimum distance to the given user coordinates.
 * type: 'countries' | 'states' | 'districts'
 */
export function sortLocationsByDistance(items, userLat, userLon, type) {
  if (!items || !Array.isArray(items)) return [];
  if (!userLat || !userLon) {
    return [...items].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }

  const itemsWithDist = items.map(item => {
    let minDist = Infinity;
    if (type === 'districts') {
       // Expects item to have lat/lon directly (we'll pass raw district objects)
       if (item.lat && item.lon) minDist = haversine(userLat, userLon, item.lat, item.lon);
    } else if (type === 'states') {
       if (item.districts) {
          item.districts.forEach(d => {
            if (d.lat && d.lon) {
              const dist = haversine(userLat, userLon, d.lat, d.lon);
              if (dist < minDist) minDist = dist;
            }
          });
       }
    } else if (type === 'countries') {
       if (item.lat && item.lon) {
         minDist = haversine(userLat, userLon, item.lat, item.lon);
       }
       if (item.states) {
         item.states.forEach(s => {
           if (s.districts) {
             s.districts.forEach(d => {
               if (d.lat && d.lon) {
                 const dist = haversine(userLat, userLon, d.lat, d.lon);
                 if (dist < minDist) minDist = dist;
               }
             });
           }
         });
       }
    }
    return { ...item, _dist: minDist };
  });

  return itemsWithDist.sort((a, b) => {
    if (a._dist !== b._dist) return a._dist - b._dist;
    return (a.name || "").localeCompare(b.name || "");
  });
}


/**
 * Returns a Map of { langCode: minDistanceInKm } based on user coordinates
 */
export function getSortedLanguagesByLocation(userLat, userLon) {
  const langData = new Map();
  if (!userLat || !userLon) return langData;

  let closestDistrict = null;
  let closestState = null;
  let closestCountry = null;
  let minDist = Infinity;

  // 1. First pass: Calculate min distance for EVERY language and find the closest location
  for (const country of gazeteer.Countries) {
    if (country.lat && country.lon) {
      const dist = haversine(userLat, userLon, country.lat, country.lon);
      if (country.officialLang) {
        const codes = Array.isArray(country.officialLang) ? country.officialLang : String(country.officialLang).split(',');
        codes.forEach(l => {
          const code = l.trim();
          const currentData = langData.get(code) || { priority: Infinity, distance: Infinity };
          if (dist < currentData.distance) {
            currentData.distance = dist;
            langData.set(code, currentData);
          }
        });
      }
      if (dist < minDist) {
        minDist = dist;
        closestCountry = country;
        closestState = null;
        closestDistrict = null;
      }
    }

    if (country.states) {
      for (const state of country.states) {
        if (state.districts) {
          for (const district of state.districts) {
            if (district.lat && district.lon) {
              const dist = haversine(userLat, userLon, district.lat, district.lon);
              
              // Record distance for the local language(s)
              if (district.local_lang) {
                const codes = Array.isArray(district.local_lang) ? district.local_lang : String(district.local_lang).split(',');
                codes.forEach(l => {
                  const code = l.trim();
                  const currentData = langData.get(code) || { priority: Infinity, distance: Infinity };
                  if (dist < currentData.distance) {
                    currentData.distance = dist;
                    langData.set(code, currentData);
                  }
                });
              }

              // Track absolute closest district for priority assignments
              if (dist < minDist) {
                minDist = dist;
                closestDistrict = district;
                closestState = state;
                closestCountry = country;
              }
            }
          }
        }
      }
    }
  }

  // 2. Second pass: Assign strict priorities (1 to N) based on the closest location
  if (closestDistrict) {
    let p = 1; // Priority rank, lower is better (top of the list)
    
    const setPriority = (codeStr) => {
      if (!codeStr) return;
      const codes = Array.isArray(codeStr) ? codeStr : String(codeStr).split(',');
      codes.forEach(l => {
        const code = l.trim();
        const currentData = langData.get(code) || { priority: Infinity, distance: Infinity };
        if (currentData.priority === Infinity) {
          currentData.priority = p++;
          langData.set(code, currentData);
        }
      });
    };

    setPriority(closestDistrict.local_lang);
    if (closestState) setPriority(closestState.state_lang);
    if (closestCountry) setPriority(closestCountry.officialLang);
    setPriority('en');
  }

  return langData;
}
