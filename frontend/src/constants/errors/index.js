import { AUTH_ERRORS } from './auth';

export const translateAuthError = (errorStr) => {
  if (!errorStr) return "";
  
  const cleanStr = String(errorStr).toLowerCase().trim();
  
  if (AUTH_ERRORS.MAPPINGS[cleanStr]) {
    return AUTH_ERRORS.MAPPINGS[cleanStr];
  }
  
  if (cleanStr.includes("unexpected signing method")) {
    return "सर्वर एरर: अमान्य सुरक्षा विधि।";
  }
  
  if (cleanStr.includes("duplicate key value")) {
    return "यह जानकारी पहले से ही हमारे सिस्टम में मौजूद है।";
  }

  if (cleanStr.includes("network error") || cleanStr.includes("timeout")) {
    return "नेटवर्क की समस्या। कृपया अपना इंटरनेट कनेक्शन जांचें।";
  }

  if (cleanStr.includes("channel/connection is not open")) {
    return "सर्वर के साथ संचार में समस्या हुई। कृपया पुनः प्रयास करें।";
  }

  return errorStr;
};

export { AUTH_ERRORS } from './auth';
export { VALIDATION_ERRORS } from './validation';
