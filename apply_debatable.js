const fs = require('fs');

const localePath = './frontend/src/data/localeData.json';
const locale = JSON.parse(fs.readFileSync(localePath, 'utf8'));

// 1. Add missing languages for the debatable corrections
const newLanguages = {
  'kha': 'Khasi',
  'grt': 'Garo',
  'pbv': 'Pnar',
  'srb': 'Sora',
  'anp': 'Angika',
  'ur': 'Urdu'
};
Object.assign(locale.languageNames, newLanguages);

// 2. Apply "Deep Indigenous Language" strategy
const updates = {
  'Gomati': 'trp',
  'Ratnagiri': 'mr',
  'Hyderabad': 'ur',
  'Gajapati': 'srb',
  'Udalguri': 'brx',
  'Godda': 'anp',
  'Latehar': 'sck',
  
  // Khasi districts
  'East Khasi Hills': 'kha',
  'Eastern West Khasi Hills': 'kha',
  'South West Khasi Hills': 'kha',
  'West Khasi Hills': 'kha',
  'Ri Bhoi': 'kha',
  
  // Garo districts
  'East Garo Hills': 'grt',
  'North Garo Hills': 'grt',
  'South Garo Hills': 'grt',
  'South West Garo Hills': 'grt',
  'West Garo Hills': 'grt',
  
  // Jaintia districts
  'East Jaintia Hills': 'pbv',
  'West Jaintia Hills': 'pbv'
};

let applied = 0;
for (const [dist, lang] of Object.entries(updates)) {
  if (locale.indiaLocationLanguages.districts[dist]) {
    locale.indiaLocationLanguages.districts[dist] = lang;
    applied++;
  } else {
    console.log(`Warning: District not found for ${dist}`);
  }
}

fs.writeFileSync(localePath, JSON.stringify(locale, null, 2) + '\n', 'utf8');
console.log(`Applied ${applied} strategic language updates.`);
