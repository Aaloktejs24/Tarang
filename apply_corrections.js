const fs = require('fs');

const localePath = './frontend/src/data/localeData.json';
const locale = JSON.parse(fs.readFileSync(localePath, 'utf8'));

// 1. Add missing languages
const newLanguages = {
  'mag': 'Magahi',
  'kcm_bil': 'Bilaspuri/Kehluri',
  'bgi': 'Bagri',
  'bra': 'Braj',
  'mtr': 'Mewari',
  'har': 'Haryanvi',
  'bag': 'Bagheli',
  'kff': 'Koya',
  'doa': 'Doabi',
  'lep': 'Lepcha',
  'bun': 'Bundeli'
};
Object.assign(locale.languageNames, newLanguages);

// 2. Map corrections from user request
const corrections = {
  'Aurangabad': 'mag', // (Bihar)
  'Balodabazar-Bhatapara': 'hne',
  'Balrampur-Ramanujganj': 'sgj',
  'Gariyaband': 'hne',
  'Kabeerdham': 'hne',
  'Korea': 'sgj',
  'Dakshin Bastar Dantewada': 'gon',
  'Uttar Bastar Kanker': 'hlb',
  'Bilaspur': 'kcm_bil',
  'Dhanbad': 'koc',
  'East Singhbum': 'hoc', // Spelled without 'h' in our JSON
  'Saraikela Kharsawan': 'hoc',
  'Beawar': 'mwr',
  'Bikaner': 'bgi',
  'Dholpur': 'bra',
  'Didwana-Kuchaman': 'mwr',
  'Ganganagar': 'bgi',
  'Kotputli-Behror': 'dhd',
  'Salumbar': 'mtr',
  'Udham Singh Nagar': 'hi',
  'Alluri Sitharama Raju': 'te',
  'Dhubri': 'bn',
  'South Salmara Mancachar': 'bn',
  'Sribhumi': 'bn', // User called it Sribhumi (Karimganj)
  'Hansi': 'har',
  'Uttara Kannada': 'kn',
  'Khandwa': 'noe', // East Nimar
  'Khargone': 'noe', // West Nimar
  'Umaria': 'bag',
  'Malkangiri': 'kff',
  'Nabarangpur': 'dso',
  'Rayagada': 'dso',
  'Rupnagar': 'doa',
  'Mangan': 'lep',
  'Darjeeling': 'ne',
  'Kalimpong': 'ne',
  'Balrampur': 'awa',
  'Hamirpur': 'bun',
  'Pratapgarh': 'awa',
  'Bara Banki': 'awa',
  'Bhadohi': 'bho',
  'Kheri': 'awa',
  'Mahrajganj': 'bho',
  'Shrawasti': 'awa'
};

let applied = 0;
let missed = [];

for (const [dist, lang] of Object.entries(corrections)) {
  if (locale.indiaLocationLanguages.districts[dist]) {
    locale.indiaLocationLanguages.districts[dist] = lang;
    applied++;
  } else {
    // Check for alias match
    if (locale.indiaLocationLanguages.districtAliases[dist]) {
      const canonical = locale.indiaLocationLanguages.districtAliases[dist];
      locale.indiaLocationLanguages.districts[canonical] = lang;
      applied++;
    } else {
      missed.push(dist);
    }
  }
}

fs.writeFileSync(localePath, JSON.stringify(locale, null, 2) + '\n', 'utf8');

console.log(`Applied ${applied} district updates.`);
if (missed.length) {
  console.log('Missed updates (district not found):', missed);
}
