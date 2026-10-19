
import geoData from '../data/geoData.json';
import localeData from '../data/localeData.json';
const { countriesHindi: countriesHindi } = geoData;
const { indianStatesHindi: indianStatesHindi } = geoData;
const { indianDistrictsHindi: indianDistrictsHindi } = geoData;
const { languagesHindiMap: languagesHindiMap } = localeData;
export const COUNTRIES_HINDI = countriesHindi;
export const INDIAN_STATES_HINDI = indianStatesHindi;
export const INDIAN_DISTRICTS_HINDI = indianDistrictsHindi;
export const LANGUAGES_HINDI_MAP = languagesHindiMap;

export const transliterateToHindi = (text) => {
    if (!text) return "";
    let t = text.toLowerCase();
    
    t = t.replace(/sh/g, "श").replace(/ch/g, "च").replace(/th/g, "थ")
         .replace(/ph/g, "फ").replace(/bh/g, "भ").replace(/dh/g, "ध")
         .replace(/kh/g, "ख").replace(/gh/g, "घ").replace(/zh/g, "झ");
         
    t = t.replace(/au/g, "औ").replace(/ai/g, "ऐ").replace(/aa/g, "आ")
         .replace(/ee/g, "ई").replace(/oo/g, "ऊ");
         
    const mapMatch = {
        'a': 'ा', 'b': 'ब', 'c': 'क', 'd': 'ड', 'e': 'े', 'f': 'फ', 'g': 'ग', 'h': 'ह', 
        'i': 'ि', 'j': 'ज', 'k': 'क', 'l': 'ल', 'm': 'म', 'n': 'न', 'o': 'ो', 'p': 'प', 
        'q': 'क', 'r': 'र', 's': 'स', 't': 'ट', 'u': 'ु', 'v': 'व', 'w': 'व', 'x': 'क्स', 
        'y': 'य', 'z': 'ज़'
    };
    
    let result = "";
    let isFirst = true;
    for (let i = 0; i < t.length; i++) {
        let char = t.charAt(i);
        if (char === ' ' || char === '-') {
            result += char;
            isFirst = true;
            continue;
        }
        if (Reflect.get(mapMatch, char)) {
            let ch = Reflect.get(mapMatch, char);
            if (isFirst) {
                if (char === 'a') ch = 'अ';
                else if (char === 'e') ch = 'ए';
                else if (char === 'i') ch = 'इ';
                else if (char === 'o') ch = 'ओ';
                else if (char === 'u') ch = 'उ';
            }
            result += ch;
            isFirst = false;
        } else {
            result += char;
            isFirst = false;
        }
    }
    
    return result.replace(/अा/g, "आ").replace(/ाा/g, "ा").replace(/ाि/g, "ै");
};
