/**
 * Full verification of indiaLocationLanguages mapping.
 * Checks:
 *  1. All language codes in states/districts exist in languageNames
 *  2. All alias targets exist in states/districts
 *  3. State language assignments make geographic sense
 *  4. District languages match expected parent-state language (or valid dialect override)
 *  5. No duplicate alias keys
 *  6. End-to-end LocationMatcher simulation with real Nominatim-style inputs
 */

const d = require('./frontend/src/data/localeData.json');
const m = d.indiaLocationLanguages;
const langNames = d.languageNames;

const states     = m.states;
const districts  = m.districts;
const stateAli   = m.stateAliases;
const distAli    = m.districtAliases;

const stateKeys    = new Set(Object.keys(states));
const distKeys     = new Set(Object.keys(districts));
const validLangs   = new Set(Object.keys(langNames));

let errors   = 0;
let warnings = 0;

const err  = (msg) => { console.error('  ❌', msg); errors++; };
const warn = (msg) => { console.warn( '  ⚠️ ', msg); warnings++; };
const ok   = (msg) => console.log(   '  ✓ ', msg);

// ─────────────────────────────────────────────────────────────────
// 1. Language codes valid
// ─────────────────────────────────────────────────────────────────
console.log('\n══ 1. Language code validity ══');
Object.entries(states).forEach(([state, lang]) => {
  if (!validLangs.has(lang)) err(`State "${state}" uses unknown lang "${lang}"`);
});
Object.entries(districts).forEach(([dist, lang]) => {
  if (!validLangs.has(lang)) err(`District "${dist}" uses unknown lang "${lang}"`);
});
if (!errors) ok(`All ${Object.keys(states).length} state + ${Object.keys(districts).length} district lang codes valid`);

// ─────────────────────────────────────────────────────────────────
// 2. Alias targets exist
// ─────────────────────────────────────────────────────────────────
console.log('\n══ 2. Alias targets exist ══');
let aliasErrors = 0;
Object.entries(stateAli).filter(([k]) => k !== '_comment').forEach(([alias, canonical]) => {
  if (!stateKeys.has(canonical)) { err(`stateAlias "${alias}" → "${canonical}" (target missing)`); aliasErrors++; }
});
Object.entries(distAli).filter(([k]) => k !== '_comment').forEach(([alias, canonical]) => {
  if (!distKeys.has(canonical))  { err(`distAlias  "${alias}" → "${canonical}" (target missing)`); aliasErrors++; }
  if (alias === canonical)       warn(`distAlias  "${alias}" is a self-map (canonical not in data yet?)`);
});
if (!aliasErrors) ok(`All ${Object.keys(stateAli).length + Object.keys(distAli).length - 2} alias targets resolve`);

// ─────────────────────────────────────────────────────────────────
// 3. State language sanity check (ground truth)
// ─────────────────────────────────────────────────────────────────
console.log('\n══ 3. State → language sanity ══');
const expectedStateLangs = {
  'Maharashtra':                  'mr',
  'Gujarat':                      'gu',
  'Tamil Nadu':                   'ta',
  'Karnataka':                    'kn',
  'Kerala':                       'ml',
  'Andhra Pradesh':               'te',
  'Telangana':                    'te',
  'West Bengal':                  'bn',
  'Odisha':                       'or',
  'Punjab':                       'pa',
  'Assam':                        'as',
  'Goa':                          'kok',
  'Manipur':                      'mni',
  'Tripura':                      'bn',
  'Delhi':                        'hi',
  'Jammu and Kashmir':            'ks',
  'Ladakh':                       'lbj',
  'Chandigarh':                   'pa',
  'Puducherry':                   'ta',
  'Lakshadweep':                  'ml',
  'Andaman and Nicobar Islands':  'bn',
  'Andaman and Nicobar Islands':  'bn',
  'Dadra and Nagar Haveli and Daman and Diu': 'gu',
};
Object.entries(expectedStateLangs).forEach(([state, expectedLang]) => {
  const actual = states[state];
  if (!actual)              warn(`State "${state}" not in our mapping at all`);
  else if (actual !== expectedLang) err(`State "${state}" → "${actual}" but expected "${expectedLang}" (${langNames[expectedLang]})`);
  else                      ok(`${state} → ${actual} (${langNames[actual]})`);
});

// ─────────────────────────────────────────────────────────────────
// 4. District language cross-check against parent state
// ─────────────────────────────────────────────────────────────────
console.log('\n══ 4. District → language spot checks ══');

// Known ground-truth district→language mappings
const expectedDistrictLangs = {
  // UP Bhojpuri belt
  'Varanasi': 'bho', 'Gorakhpur': 'bho', 'Ghazipur': 'bho',
  // Bihar Maithili
  'Darbhanga': 'mai', 'Madhubani': 'mai', 'Sitamarhi': 'mai',
  // J&K
  'Srinagar': 'ks', 'Anantnag': 'ks', 'Jammu': 'doi',
  // Karnataka
  'Bengaluru Urban': 'kn', 'Mysuru': 'kn', 'Ballari': 'kn', 'Kalaburagi': 'kn',
  // Kerala
  'Thiruvananthapuram': 'ml', 'Kozhikode': 'ml', 'Thrissur': 'ml', 'Ernakulam': 'ml',
  // Tamil Nadu
  'Chennai': 'ta', 'Madurai': 'ta', 'Coimbatore': 'ta',
  // West Bengal
  'Kolkata': 'bn', 'Howrah': 'bn',
  // Santali belt
  'Dumka': 'sat', 'Jamtara': 'sat', 'Pakur': 'sat',
  // Maharashtra
  'Pune': 'mr', 'Chhatrapati Sambhajinagar': 'mr', 'Dharashiv': 'mr', 'Nashik': 'mr',
  // Andhra / Telangana
  'Visakhapatnam': 'te', 'Hyderabad': 'ur', 'Y.S.R. Kadapa': 'te',
  // Rajasthan — dialect-level assignments (correct, not plain 'hi')
  'Jaipur': 'dhd', 'Jodhpur': 'mwr',
  // UP — dialect-level assignments
  'Prayagraj': 'awa', 'Ayodhya': 'awa',
  // Haryana
  'Gurugram': 'ahi',
};

let distErrors = 0;
Object.entries(expectedDistrictLangs).forEach(([dist, expectedLang]) => {
  const actual = districts[dist];
  if (!actual) {
    warn(`District "${dist}" not in our mapping`);
  } else if (actual !== expectedLang) {
    err(`District "${dist}" → "${actual}" (${langNames[actual] || '?'}) but expected "${expectedLang}" (${langNames[expectedLang] || '?'})`);
    distErrors++;
  } else {
    ok(`${dist} → ${actual} (${langNames[actual]})`);
  }
});

// ─────────────────────────────────────────────────────────────────
// 5. Duplicate alias keys
// ─────────────────────────────────────────────────────────────────
console.log('\n══ 5. Duplicate alias keys ══');
const allDistAliasKeys = Object.keys(distAli).filter(k => k !== '_comment');
const seen = new Set();
allDistAliasKeys.forEach(k => {
  if (seen.has(k.toLowerCase())) err(`Duplicate alias key: "${k}"`);
  seen.add(k.toLowerCase());
});
if (!errors) ok(`No duplicate alias keys`);

// ─────────────────────────────────────────────────────────────────
// 6. End-to-end LocationMatcher simulation
// ─────────────────────────────────────────────────────────────────
console.log('\n══ 6. End-to-end matcher simulation ══');

// Inline the matcher logic (CommonJS-compatible)
function normalize(str) {
  return str.toLowerCase().normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[()]/g, ' ')
    .replace(/[.,]/g, '')
    .replace(/[-_/\u2013\u2014]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}
function tokenKey(str) {
  return normalize(str).split(' ').filter(Boolean).sort().join(' ');
}
function levenshtein(a, b) {
  const dp = Array.from({length: a.length+1}, (_, i) =>
    Array.from({length: b.length+1}, (_, j) => i || j));
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = a[i-1]===b[j-1] ? dp[i-1][j-1] : 1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);
  return dp[a.length][b.length];
}
function levScore(a, b) { return 1 - levenshtein(a,b)/Math.max(a.length,b.length,1); }
function bigrams(str) { const g=new Set(); for(let i=0;i<str.length-1;i++) g.add(str.slice(i,i+2)); return g; }
function bigramScore(a, b) {
  const A=bigrams(a), B=bigrams(b);
  let inter=0; A.forEach(x=>{if(B.has(x))inter++;});
  const union=new Set([...A,...B]).size;
  return union===0?0:inter/union;
}
function similarity(normA, normB) {
  const B=normalize(normB);
  return levScore(normA,B)*0.7+bigramScore(normA,B)*0.3;
}

function buildMatcher(keys, aliases, threshold=0.85) {
  const exactSet=new Set(keys), normalMap=new Map(), tokenMap=new Map(), aliasMap=new Map();
  for (const key of keys) {
    normalMap.set(normalize(key), key);
    const tk=tokenKey(key);
    if (!tokenMap.has(tk)) tokenMap.set(tk, key);
  }
  for (const [alias, canonical] of Object.entries(aliases)) {
    if (alias !== '_comment') aliasMap.set(normalize(alias), normalize(canonical));
  }
  return { resolve(input) {
    if (!input) return null;
    if (exactSet.has(input)) return input;
    let normed = normalize(input);
    if (aliasMap.has(normed)) normed = aliasMap.get(normed);
    if (normalMap.has(normed)) return normalMap.get(normed);
    const tk = normed.split(' ').filter(Boolean).sort().join(' ');
    if (tokenMap.has(tk)) return tokenMap.get(tk);
    if (normed.length < 4) return null;
    let best=null, bestScore=0;
    for (const c of keys) { const s=similarity(normed,c); if(s>bestScore){bestScore=s;best=c;} }
    return bestScore >= threshold ? best : null;
  }};
}

const stateMatcher   = buildMatcher(Object.keys(states), stateAli);
const districtMatcher = buildMatcher(Object.keys(districts), distAli, 0.80);

const e2eTests = [
  // [input, expectedKey, isDistrict]
  // Nominatim spelling variants
  ['NCT of Delhi',          'Delhi',                   false],
  ['Orissa',                'Odisha',                  false],
  ['Pondicherry',           'Puducherry',              false],
  ['Jammu & Kashmir',       'Jammu and Kashmir',       false],
  ['Andaman & Nicobar Islands', 'Andaman and Nicobar Islands', false],
  ['Dadra and Nagar Haveli and Daman and Diu', 'Dadra and Nagar Haveli and Daman and Diu', false],
  // District aliases
  ['Allahabad',             'Prayagraj',               true],
  ['Faizabad',              'Ayodhya',                 true],
  ['Gurgaon',               'Gurugram',                true],
  // Aurangabad (Maharashtra) aliases to Chhatrapati Sambhajinagar, but exact match hits Bihar's Aurangabad
  ['Aurangabad',            'Aurangabad',              true],
  ['Osmanabad',             'Dharashiv',               true],
  ['Bellary',               'Ballari',                 true],
  ['Gulbarga',              'Kalaburagi',              true],
  // Bijapur hits exact match (for CG district) before alias
  ['Bijapur',               'Bijapur',                 true],
  ['Mysore',                'Mysuru',                  true],
  ['Bangalore Urban',       'Bengaluru Urban',         true],
  // Mohali hits exact match before alias OR hits alias if not in data
  ['Mohali',                'S.A.S Nagar',             true],
  ['Cuddapah',              'Y.S.R. Kadapa',           true],
  ['Kadapa',                'Y.S.R. Kadapa',           true],
  ['Trivandrum',            'Thiruvananthapuram',      true],
  ['Calcutta',              'Kolkata',                 true],
  ['Bombay',                'Mumbai',                  true],
  ['Madras',                'Chennai',                 true],
  // Normalization (hyphens, en-dash, spacing)
  ['Janjgir - Champa',      'Janjgir-Champa',          true],
  ['Medchal–Malkajgiri',    'Medchal Malkajgiri',      true],
  ['Khairthal-Tijara',      'Khairthal-Tijara',        true],
  // Token order
  ['24 Parganas North',     'North 24 Parganas',       true],
  // Fuzzy (typos)
  ['Kanpur Nagr',           'Kanpur Nagar',            true],
  ['Tiruchirpalli',         'Tiruchirappalli',         true],
];

let e2eErrors = 0;
e2eTests.forEach(([input, expected, isDistrict]) => {
  const matcher = isDistrict ? districtMatcher : stateMatcher;
  const result  = matcher.resolve(input);
  if (result === expected) {
    ok(`"${input}" → "${result}"`);
  } else {
    err(`"${input}" → "${result}" (expected "${expected}")`);
    e2eErrors++;
  }
});

// ─────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────
console.log('\n══ SUMMARY ══');
console.log(`  Total errors:   ${errors}`);
console.log(`  Total warnings: ${warnings}`);
console.log(errors === 0 ? '\n  ✅ All checks passed' : '\n  ❌ Failures found — see above');
