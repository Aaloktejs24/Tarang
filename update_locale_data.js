const fs = require('fs');

const latlonPath = './frontend/src/data/latlon.json';
const localePath = './frontend/src/data/localeData.json';

const latlon = JSON.parse(fs.readFileSync(latlonPath, 'utf8'));
const locale = JSON.parse(fs.readFileSync(localePath, 'utf8'));

const m = locale.indiaLocationLanguages;

// Default language assignments for missing states
const newStatesLangs = {
  'Arunachal Pradesh': 'en',
  'Bihar': 'hi',
  'Chhattisgarh': 'hi',
  'Himachal Pradesh': 'hi',
  'Jharkhand': 'hi',
  'Meghalaya': 'en',
  'Nagaland': 'en',
  'Rajasthan': 'hi',
  'Uttarakhand': 'hi',
  'Dadra and Nagar Haveli and Daman and Diu': 'gu',
  'Haryana': 'hi',
  'Madhya Pradesh': 'hi',
  'Mizoram': 'lus',
  'Sikkim': 'ne',
  'Uttar Pradesh': 'hi'
};

const newStates = {};
const newDistricts = {};
const districtToState = {};

// Build the new states and districts objects from latlon.json
latlon.states.forEach(s => {
  const stateName = s.state;
  // Assign language: preserve old if exists, else use new mapping, else fallback to 'hi'
  newStates[stateName] = m.states[stateName] || newStatesLangs[stateName] || 'hi';
  
  s.districts.forEach(d => {
    const distName = d.name;
    districtToState[distName] = stateName;
    
    // First try: exact match from old districts
    if (m.districts[distName]) {
      newDistricts[distName] = m.districts[distName];
    } 
    // Second try: alias match (if the latlon.json uses an old/alternate name that we have an alias for)
    else if (m.districtAliases[distName] && m.districts[m.districtAliases[distName]]) {
      newDistricts[distName] = m.districts[m.districtAliases[distName]];
    }
    // Else: Assign the state's default language
    else {
      newDistricts[distName] = newStates[stateName];
    }
  });
});

// Update the district aliases: 
// 1. Remove aliases where the alias matches a new canonical key (no longer an alias)
// 2. Point existing aliases to the new canonical keys if they changed
const newDistrictAliases = {};
const oldAliases = Object.entries(m.districtAliases).filter(([k]) => k !== '_comment');

oldAliases.forEach(([alias, target]) => {
  if (newDistricts[alias]) {
    // This alias is now an official canonical name in latlon.json! No need to alias it.
    console.log(`Alias "${alias}" is now a canonical district. Removing from aliases.`);
    return;
  }
  
  // If the target still exists in the new districts, keep the alias
  if (newDistricts[target]) {
    newDistrictAliases[alias] = target;
  } 
  else {
    // The target no longer exists. Was it renamed in latlon.json?
    // Let's see if we can find a close match in the new districts, or just drop it.
    // E.g. target was "Mumbai City", latlon has "Mumbai" or "Mumbai City"?
    // We'll leave it out for now and let the manual rename logic handle it.
    console.log(`Alias "${alias}" -> "${target}" target no longer exists. Dropping.`);
  }
});

// Update state aliases
const newStateAliases = {};
const oldStateAliases = Object.entries(m.stateAliases).filter(([k]) => k !== '_comment');
oldStateAliases.forEach(([alias, target]) => {
  if (newStates[alias]) {
    console.log(`State Alias "${alias}" is now a canonical state. Removing from aliases.`);
    return;
  }
  if (newStates[target]) {
    newStateAliases[alias] = target;
  } else {
    // If target doesn't exist, drop it
    // Wait, e.g. "Dadra and Nagar Haveli" was the old target, new is "Dadra and Nagar Haveli and Daman and Diu"
    // Let's add specific re-mappings for states:
    if (target === 'Dadra and Nagar Haveli') {
       newStateAliases[alias] = 'Dadra and Nagar Haveli and Daman and Diu';
       newStateAliases['Dadra and Nagar Haveli'] = 'Dadra and Nagar Haveli and Daman and Diu';
       newStateAliases['Daman and Diu'] = 'Dadra and Nagar Haveli and Daman and Diu';
    } else {
      console.log(`State Alias "${alias}" -> "${target}" target no longer exists. Dropping.`);
    }
  }
});

m.states = newStates;
m.districts = newDistricts;

// Re-inject comment keys
m.stateAliases = { "_comment": m.stateAliases._comment, ...newStateAliases };
m.districtAliases = { "_comment": m.districtAliases._comment, ...newDistrictAliases };

fs.writeFileSync(localePath, JSON.stringify(locale, null, 2) + '\n', 'utf8');
console.log('Successfully updated localeData.json with keys from latlon.json.');
