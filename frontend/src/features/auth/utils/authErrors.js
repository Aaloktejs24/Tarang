export const AUTH_ERROR_MAP = {
  "email already registered": "यह ईमेल पहले से ही पंजीकृत है। कृपया लॉगिन करें या दूसरा ईमेल उपयोग करें।",
  "username already taken": "यह उपयोगकर्ता नाम (username) पहले ही लिया जा चुका है।",
  "user not found": "उपयोगकर्ता नहीं मिला। कृपया अपना ईमेल या यूजरनेम जांचें।",
  "invalid or expired otp": "अमान्य या समाप्त हो चुका OTP। कृपया फिर से प्रयास करें।",
  "too many login attempts": "लॉगिन के बहुत अधिक प्रयास किए गए हैं। आपके अकाउंट की सुरक्षा के लिए, कृपया 10 मिनट बाद फिर से प्रयास करें।",
  "token revoked": "आपका सेशन समाप्त हो गया है। कृपया फिर से लॉगिन करें।",
  "please wait 30 seconds before requesting another OTP": "कृपया दूसरा OTP मांगने से पहले 30 सेकंड प्रतीक्षा करें।",
  "maximum OTP attempts reached. please try again in 5 minutes": "अधिकतम OTP प्रयास पूरे हुए। सुरक्षा कारणों से, कृपया 5 मिनट बाद फिर से प्रयास करें।",
  "otp expired": "यह OTP अब मान्य नहीं है। कृपया नया कोड मंगाएं।",
  "otp expired or already verified": "OTP समाप्त हो गया है या पहले ही सत्यापित किया जा चुका है।",
  "invalid email otp": "ईमेल वेरिफिकेशन कोड गलत है।",
  "invalid phone otp": "फ़ोन वेरिफिकेशन कोड गलत है।",
  "invalid password": "गलत पासवर्ड। कृपया फिर से प्रयास करें।",
  "password must be at least 8 characters": "पासवर्ड कम से कम 8 अक्षरों का होना चाहिए।",
  "phone number does not match linked account": "यह फ़ोन नंबर आपके खाते से मेल नहीं खाता।",
  "no phone number linked to this account": "इस खाते से कोई फ़ोन नंबर लिंक नहीं है।",
  "email, username, otp and password required": "ईमेल, यूजरनेम, OTP और पासवर्ड सभी आवश्यक हैं।",
  "registration succeeded but token generation failed": "पंजीकरण सफल रहा, लेकिन लॉगिन टोकन बनाने में समस्या आई। कृपया लॉगिन करें।",
  "invalid payload": "अमान्य जानकारी भेजी गई।",
  "email required": "ईमेल आवश्यक है।",
  "target required": "लक्ष्य (email/phone) आवश्यक है।"
};

export const translateError = (errorStr) => {
  if (!errorStr) return "";
  
  // Clean the error string (sometimes they come with extra info or in different casing)
  const cleanStr = String(errorStr).toLowerCase().trim();
  
  // Direct match
  if (AUTH_ERROR_MAP[cleanStr]) {
    return AUTH_ERROR_MAP[cleanStr];
  }
  
  // Partial match for dynamic errors like "unexpected signing method: HS256"
  if (cleanStr.includes("unexpected signing method")) {
    return "सर्वर एरर: अमान्य सुरक्षा विधि।";
  }
  
  if (cleanStr.includes("duplicate key value")) {
    return "यह जानकारी पहले से ही हमारे सिस्टम में मौजूद है।";
  }

  // Fallback for network issues or generic messages
  if (cleanStr.includes("network error") || cleanStr.includes("timeout")) {
    return "नेटवर्क की समस्या। कृपया अपना इंटरनेट कनेक्शन जांचें।";
  }

  return errorStr; // Return original if no translation found
};
