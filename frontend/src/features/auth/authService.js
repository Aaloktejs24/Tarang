import { apiClient } from "../../lib/apiClient";
import { setToken, removeToken, removeTempToken } from "../../lib/auth";

export const onRegisterStart = async (email) => {
  const response = await apiClient.post("/auth/registration-sessions", { email });
  return response.data;
}; // returns { session_id, expires_at }

export const checkEmail = async (email) => {
  const response = await apiClient.get(`/auth/check-email/${encodeURIComponent(email)}`);
  return response.data;
};

export const sendRegistrationEmailOtp = async (sessionId) => {
  const response = await apiClient.post(`/auth/registration-sessions/${sessionId}/send-email-otp`);
  return response.data;
};

export const verifyRegistrationEmailOtp = async (sessionId, otp) => {
  const response = await apiClient.post(`/auth/registration-sessions/${sessionId}/verify-email-otp`, { otp });
  return response.data;
};

export const setupRegistrationTotp = async (sessionId) => {
  const response = await apiClient.post(`/auth/registration-sessions/${sessionId}/totp-setup`);
  return response.data;
};

export const completeRegistrationSession = async (sessionId, username, password, fullName, role, phone, dob, gender, totpCode = null) => {
  const payload = {
    username,
    password,
    full_name: fullName,
    role,
    phone,
    dob,
    gender
  };
  if (totpCode) {
    payload.totp_code = totpCode;
  }
  const response = await apiClient.post(`/auth/registration-sessions/${sessionId}/complete`, payload);
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

export const verifyLoginOtp = async (code, sessionId) => {
  const response = await apiClient.post("/auth/login/otp", { code, session_id: sessionId });
  const data = response.data;
  if (data.access_token) {
    setToken(data.access_token);
    removeTempToken(); // Optional: clean up old localstorage logic
  }
  return data;
};

export const verifyLoginTotp = async (code, sessionId) => {
  const response = await apiClient.post("/auth/login/totp", { code, session_id: sessionId });
  const data = response.data;
  if (data.access_token) {
    setToken(data.access_token);
    removeTempToken();
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

export const setupTotp = async (sessionId = null) => {
  // If we are setting up during login flow, send session_id
  const payload = sessionId ? { session_id: sessionId } : {};
  const response = await apiClient.post("/auth/totp/setup", payload);
  return response.data;
};

export const verifyTotp = async (code, sessionId = null) => {
  const payload = { code };
  if (sessionId) {
    payload.session_id = sessionId;
  }
  const response = await apiClient.post("/auth/totp/verify", payload);
  const data = response.data;
  if (data.access_token) {
    setToken(data.access_token);
    removeTempToken();
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

let refreshPromise = null;

export const refreshAuthToken = async () => {
  if (refreshPromise) return refreshPromise;
  refreshPromise = fetch("/api/auth/refresh", { method: "POST" })
    .then(async (res) => {
      try {
        const text = await res.text();
        return text ? JSON.parse(text) : { authenticated: false };
      } catch (e) {
        return { authenticated: false };
      }
    })
    .then(data => {
      if (data.authenticated === false) {
        throw new Error("Refresh failed");
      }
      setToken(data.access_token);
      return data;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
};

export const logoutUser = async () => {
  // Fire-and-forget — don't block on backend response
  apiClient.post("/auth/logout", {}, { timeout: 5000 }).catch(() => {});

  // Clear local state immediately
  removeToken();
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("auth_flow_in_progress");
    sessionStorage.removeItem("registration_token");
    sessionStorage.removeItem("auth_mode");
    sessionStorage.removeItem("auth_step");
  }
};
