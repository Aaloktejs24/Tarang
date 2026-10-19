export const validateEmail = (email) => {
  if (!email) return true;
  // Strictly English (ASCII) letters, numbers, and basic symbols for email
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!regex.test(email)) return "कृपया एक मान्य ईमेल पता डालें";
  return "";
};

export const validatePhone = (phone) => {
  if (!phone || phone.trim() === "+91") return "फ़ोन नंबर आवश्यक है";
  // International format: Optional +, followed by 6 to 15 digits
  const regex = /^\+?[1-9]\d{5,14}$/;
  if (!regex.test(phone)) return "कृपया एक मान्य फ़ोन नंबर डालें";
  return "";
};

export const validateUsername = (username) => {
  if (!username) return true;
  if (username.length < 3) return "यूज़रनेम कम से कम 3 अक्षरों का होना चाहिए";
  if (username.length > 30) return "यूज़रनेम अधिकतम 30 अक्षरों का हो सकता है";
  // Reject any uppercase or titlecase letters across all languages
  if (/[\p{Lu}\p{Lt}]/u.test(username)) {
    return "यूज़रनेम में केवल छोटे अक्षर (lowercase) होने चाहिए";
  }
  // Letters (any language, case checked above), combining marks, digits, and underscores only
  const regex = /^[\p{L}\p{M}\p{Nd}_]+$/u;
  if (!regex.test(username)) {
    return "यूज़रनेम में केवल अक्षर, नंबर और अंडरस्कोर (_) की अनुमति है";
  }
  return "";
};

export const validateName = (name) => {
  if (!name) return true;
  if (name.length < 2) return "नाम कम से कम 2 अक्षरों का होना चाहिए";
  // Letters (any language), combining marks, spaces, hyphens, and apostrophes
  const regex = /^[\p{L}\p{M}\s'-]+$/u;
  if (!regex.test(name)) return "नाम में केवल अक्षरों, स्पेस, हाइफ़न (-) और अपोस्ट्रोफी (') की अनुमति है";
  return "";
};

export const RULES = [
  { id: "len", label: "कम से कम 8 अक्षर", test: (p) => p.length >= 8 },
  { id: "upper", label: "एक बड़ा अक्षर (A-Z)", test: (p) => /[A-Z]/.test(p) },
  { id: "lower", label: "एक छोटा अक्षर (a-z)", test: (p) => /[a-z]/.test(p) },
  { id: "number", label: "एक नंबर (0-9)", test: (p) => /[0-9]/.test(p) },
  { id: "special", label: "एक विशेष अक्षर (@$!%*?&)", test: (p) => /[@$!%*?&#]/.test(p) },
];

export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "", color: "var(--color-slate-200)", passed: 0 };
  const passed = RULES.filter((r) => r.test(password)).length;
  if (passed === 0) return { score: 0, label: "", color: "var(--color-slate-200)", passed };
  if (passed <= 2) return { score: passed, label: "कमज़ोर", color: "var(--color-error)", passed };
  if (passed <= 3) return { score: passed, label: "ठीक है", color: "var(--color-warning)", passed };
  if (passed === 4) return { score: passed, label: "अच्छा", color: "var(--color-primary)", passed };
  return { score: 5, label: "मज़बूत", color: "var(--color-success)", passed };
};

export const validatePassword = (password) => {
  if (!password) return true;
  // Strictly enforce English (ASCII) characters only
  if (/[^\x20-\x7E]/.test(password)) return "पासवर्ड में केवल अंग्रेजी अक्षरों (A-Z, a-z), नंबरों और सिंबल्स की अनुमति है";
  if (password.length < 8) return "पासवर्ड कम से कम 8 अक्षरों का होना चाहिए";
  return "";
};

// ─── Institute / Profile validators ────────────────────────────────────────

/** Institution name: letters (any script), numbers, spaces, hyphens, dots, apostrophes */
export const validateInstitutionName = (name) => {
  if (!name || !name.trim()) return "संस्थान का नाम आवश्यक है";
  const trimmed = name.trim();
  if (trimmed.length < 3) return "संस्थान का नाम कम से कम 3 अक्षरों का होना चाहिए";
  if (trimmed.length > 150) return "संस्थान का नाम अधिकतम 150 अक्षरों का हो सकता है";
  // Allow letters (any language), digits, spaces, hyphens, apostrophes, dots, brackets
  const regex = /^[\p{L}\p{M}\p{Nd}\s'.\-()&,]+$/u;
  if (!regex.test(trimmed)) return "संस्थान के नाम में अमान्य अक्षर हैं";
  return "";
};

/** Registration/accreditation number: alphanumeric with optional hyphens/slashes */
export const validateRegistrationNumber = (reg) => {
  if (!reg || !reg.trim()) return "पंजीकरण संख्या आवश्यक है";
  const trimmed = reg.trim();
  if (trimmed.length < 3) return "पंजीकरण संख्या कम से कम 3 अक्षरों की होनी चाहिए";
  if (trimmed.length > 60) return "पंजीकरण संख्या अधिकतम 60 अक्षरों की हो सकती है";
  const regex = /^[A-Za-z0-9\-\/]+$/;
  if (!regex.test(trimmed)) return "पंजीकरण संख्या में केवल अक्षर (A-Z), नंबर, हाइफ़न (-) और स्लैश (/) की अनुमति है";
  return "";
};

/** URL: must start with http/https */
export const validateURL = (url) => {
  if (!url || !url.trim()) return "URL आवश्यक है";
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (!["http:", "https:"].includes(parsed.protocol)) return "URL को http:// या https:// से शुरू होना चाहिए";
    if (!parsed.hostname.includes(".")) return "कृपया एक मान्य URL डालें (जैसे: https://example.com)";
    return "";
  } catch {
    return "कृपया एक मान्य URL डालें (जैसे: https://example.com)";
  }
};

/** Pincode: 4–10 digits */
export const validatePincode = (pin) => {
  if (!pin || !pin.trim()) return "पिनकोड आवश्यक है";
  const trimmed = pin.trim();
  if (!/^\d{4,10}$/.test(trimmed)) return "पिनकोड में केवल 4 से 10 अंक होने चाहिए";
  return "";
};

/** Bio: minimum word count of 100 */
export const validateBio = (bio) => {
  if (!bio || !bio.trim()) return "संस्थान के बारे में जानकारी आवश्यक है";
  const wordCount = bio.trim().split(/\s+/).filter((w) => w.length > 0).length;
  if (wordCount < 100) return `कम से कम 100 शब्द लिखें (अभी: ${wordCount} शब्द)`;
  return "";
};

/** Phone for institute: strip non-digits and check length */
export const validateInstitutePhone = (phone) => {
  if (!phone || !phone.trim()) return "फ़ोन नंबर आवश्यक है";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 6 || digits.length > 15) return "फ़ोन नंबर 6 से 15 अंकों का होना चाहिए";
  return "";
};

/** Address line: letters, numbers, spaces, commas, hyphens, dots, slashes (optional field) */
export const validateAddressLine = (address) => {
  if (!address || !address.trim()) return ""; // optional
  const trimmed = address.trim();
  if (trimmed.length > 300) return "पता अधिकतम 300 अक्षरों का हो सकता है";
  const regex = /^[\p{L}\p{M}\p{Nd}\s,.\-/()#]+$/u;
  if (!regex.test(trimmed)) return "पते में अमान्य अक्षर हैं";
  return "";
};

/** Numeric count (student/faculty): positive integer, max 10 lakh (optional) */
export const validateCount = (val, label = "संख्या") => {
  if (val === "" || val === null || val === undefined) return ""; // optional
  const num = Number(val);
  if (isNaN(num) || !Number.isInteger(num) || num < 0) return `${label} एक धनात्मक पूर्णांक होना चाहिए`;
  if (num > 1000000) return `${label} 10 लाख से अधिक नहीं हो सकती`;
  return "";
};
