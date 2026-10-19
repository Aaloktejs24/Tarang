import { apiClient } from "../../lib/apiClient";
import { setToken } from "../../lib/auth";

export const onRegisterStart = async (email) => {
  const response = await apiClient.post("/auth/registration-sessions", { email });
  return response.data;
}; // returns { session_id, expires_at }

export const sendRegistrationEmailOtp = async (sessionId) => {
  const response = await apiClient.post(`/auth/registration-sessions/${sessionId}/send-email-otp`);
  return response.data;
};

export const verifyRegistrationEmailOtp = async (sessionId, otp) => {
  const response = await apiClient.post(`/auth/registration-sessions/${sessionId}/verify-email-otp`, { otp });
  return response.data;
};

export const completeRegistrationSession = async (sessionId, username, password, fullName, role) => {
  const response = await apiClient.post(`/auth/registration-sessions/${sessionId}/complete`, { username, password, full_name: fullName, role });
  if (response.data.access_token) {
    setToken(response.data.access_token);
  }
  return response.data;
};

export const checkUsername = async (username) => {
  const response = await apiClient.get(`/auth/check-username/${username}`);
  return response.data;
};

export const startPhoneVerification = async (userId, phone) => {
  const response = await apiClient.post("/auth/verify-phone/start", { user_id: userId, phone });
  return response.data;
};

export const confirmPhoneVerification = async (userId, phone, otp) => {
  const response = await apiClient.post("/auth/verify-phone/confirm", { user_id: userId, phone, otp });
  return response.data;
};

export const resendOtp = async (target, purpose = "register") => {
  const response = await apiClient.post("/auth/register/resend", { target, purpose });
  return response.data;
};

export const loginUser = async (identifier, password) => {
  const response = await apiClient.post("/auth/login", { identifier, password });
  const data = response.data;

  if (data.access_token) {
    setToken(data.access_token);
    // You might want to store refresh_token separately or handle it in generic way
  }

  return data;
};

export const verifyLoginOtp = async (code, tempToken) => {
  const config = tempToken ? { headers: { Authorization: `Bearer ${tempToken}` } } : {};
  const response = await apiClient.post("/auth/login/otp", { code }, config);
  const data = response.data;
  if (data.access_token) {
    setToken(data.access_token);
    localStorage.removeItem("temp_token");
  }
  return data;
};

export const verifyLoginTotp = async (code, tempToken) => {
  const config = tempToken ? { headers: { Authorization: `Bearer ${tempToken}` } } : {};
  const response = await apiClient.post("/auth/login/totp", { code }, config);
  const data = response.data;
  if (data.access_token) {
    setToken(data.access_token);
    localStorage.removeItem("temp_token");
  }
  return data;
};

export const startForgotPassword = async (target) => {
  const response = await apiClient.post("/auth/forgot-password", { target });
  return response.data;
};

export const resetPassword = async ({ target, otp, newPassword }) => {
  const response = await apiClient.post("/auth/reset-password", {
    target,
    otp,
    new_password: newPassword,
  });
  return response.data;
};

export const updateMfaPreference = async (preference, token = null) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await apiClient.post("/auth/settings/mfa", { preference }, config);
  return response.data;
};

export const setupTotp = async (token = null) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await apiClient.post("/auth/totp/setup", {}, config);
  return response.data;
};

export const verifyTotp = async (code, token = null) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await apiClient.post("/auth/totp/verify", { code }, config);
  const data = response.data;
  if (data.access_token) {
    setToken(data.access_token);
    localStorage.removeItem("temp_token");
  }
  return data;
};

export const getProfile = async () => {
  const response = await apiClient.get("/user/profile");
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await apiClient.post("/user/profile/update", profileData);
  return response.data;
};

// --- KYC / Verification ---
export const startAadhaarOtp = async (userId, aadhaar) => {
  const response = await apiClient.post("/kyc/aadhaar/otp/start", { user_id: userId, aadhaar });
  return response.data;
};

export const verifyAadhaarOtp = async (userId, aadhaar, referenceId, otp) => {
  const response = await apiClient.post("/kyc/aadhaar/otp/verify", {
    user_id: userId,
    aadhaar,
    reference_id: referenceId,
    otp,
  });
  return response.data;
};

export const startDigilocker = async (userId) => {
  const response = await apiClient.get(`/kyc/digilocker/start?user_id=${userId}`);
  return response.data;
};

export const refreshAuthToken = async () => {
    // We send an empty body because the backend now primarily looks for the cookie
    const response = await apiClient.post("/auth/refresh", {});
    const data = response.data;
    if (data.access_token) {
        setToken(data.access_token);
    }
    return data;
};

export const logoutUser = async () => {
  try {
    await apiClient.post("/auth/logout");
  } finally {
    localStorage.removeItem("token");
    sessionStorage.removeItem("auth_mode");
    sessionStorage.removeItem("auth_step");
    sessionStorage.removeItem("auth_formData");
    sessionStorage.removeItem("auth_maskedEmail");
    sessionStorage.removeItem("registration_token");
  }
};
