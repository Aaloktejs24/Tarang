export const AUTH_ERRORS = {
  // Backend translation mappings
  MAPPINGS: {
    "email already registered": "यह ईमेल पहले से ही पंजीकृत है। कृपया लॉगिन करें या दूसरा ईमेल उपयोग करें।",
    "username already taken": "यह उपयोगकर्ता नाम (username) पहले ही लिया जा चुका है।",
    "user not found": "ईमेल/यूज़रनेम या पासवर्ड गलत है। कृपया फिर से प्रयास करें।",
    "invalid or expired otp": "अमान्य या समाप्त हो चुका OTP। कृपया फिर से प्रयास करें।",
    "too many login attempts": "लॉगिन के बहुत अधिक प्रयास किए गए हैं। आपके अकाउंट की सुरक्षा के लिए, कृपया 10 मिनट बाद फिर से प्रयास करें।",
    "token revoked": "आपका सेशन समाप्त हो गया है। कृपया फिर से लॉगिन करें।",
    "please wait 30 seconds before requesting another OTP": "कृपया दूसरा OTP मांगने से पहले 30 सेकंड प्रतीक्षा करें।",
    "maximum OTP attempts reached. please try again in 5 minutes": "अधिकतम OTP प्रयास पूरे हुए। सुरक्षा कारणों से, कृपया 5 मिनट बाद फिर से प्रयास करें।",
    "otp expired": "यह OTP अब मान्य नहीं है। कृपया नया कोड मंगाएं।",
    "otp expired or already verified": "OTP समाप्त हो गया है या पहले ही सत्यापित किया जा चुका है।",
    "invalid email otp": "ईमेल वेरिफिकेशन कोड गलत है।",
    "invalid phone otp": "फ़ोन वेरिफिकेशन कोड गलत है।",
    "invalid password": "ईमेल/यूज़रनेम या पासवर्ड गलत है। कृपया फिर से प्रयास करें।",
    "incorrect password": "ईमेल/यूज़रनेम या पासवर्ड गलत है। कृपया फिर से प्रयास करें।",
    "incorrect credentials": "ईमेल/यूज़रनेम या पासवर्ड गलत है। कृपया फिर से प्रयास करें।",
    "password must be at least 8 characters": "पासवर्ड कम से कम 8 अक्षरों का होना चाहिए।",
    "phone number does not match linked account": "यह फ़ोन नंबर आपके खाते से मेल नहीं खाता।",
    "no phone number linked to this account": "इस खाते से कोई फ़ोन नंबर लिंक नहीं है।",
    "email, username, otp and password required": "ईमेल, यूजरनेम, OTP और पासवर्ड सभी आवश्यक हैं।",
    "registration succeeded but token generation failed": "पंजीकरण सफल रहा, लेकिन लॉगिन टोकन बनाने में समस्या आई। कृपया लॉगिन करें।",
    "invalid payload": "अमान्य जानकारी भेजी गई।",
    "email required": "ईमेल आवश्यक है।",
    "target required": "लक्ष्य (email/phone) आवश्यक है।"
  },
  
  // Generic Component Errors
  GENERIC: {
    LOGIN_FAILED: "लॉगिन विफल रहा",
    OTP_SEND_FAILED: "OTP भेजने में विफल",
    SESSION_EXPIRED: "पंजीकरण सत्र समाप्त हो गया है। कृपया पुनः लॉगिन करें।",
    INVALID_OTP: "अमान्य OTP",
    TFA_SETUP_FAILED: "2FA सेटअप शुरू करने में विफल",
    EMAIL_OTP_ENABLE_FAILED: "ईमेल OTP सक्षम करने में विफल",
    INVALID_VERIFICATION_CODE: "अमान्य वेरिफिकेशन कोड",
    REGISTRATION_FAILED: "रजिस्ट्रेशन पूरा करने में विफल",
    BIOMETRIC_FAILED: "An error occurred during biometric verification",
  }
};
