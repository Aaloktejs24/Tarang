export const cleanupLegacyAuthStorage = () => {
  // Clean up any legacy orphaned storage keys to keep the user's browser clean
  const sessionStorageKeys = [
    "auth_mode",
    "auth_step",
    "auth_formData",
    "auth_maskedEmail",
    "auth_mfaType",
  ];

  const localStorageKeys = [
    "lastMaskedEmail",
    "lastOtpPurpose",
    "lastOtpTarget",
    "lastOtpTime",
  ];

  sessionStorageKeys.forEach((key) => sessionStorage.removeItem(key));
  localStorageKeys.forEach((key) => localStorage.removeItem(key));
};
