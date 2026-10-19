"use client";

import React, { useState } from "react";
import { useAppRouter } from '../../hooks/useAppRouter';
import { Box, Paper, Typography, Button, IconButton, CircularProgress, Snackbar, Alert } from "@mui/material";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import BackdropBlur from "../../components/common/BackdropBlur";
import { cleanupLegacyAuthStorage } from "../../utils/storageUtils";
import {
  loginUser,
  onRegisterStart,
  sendRegistrationEmailOtp,
  verifyRegistrationEmailOtp,
  completeRegistrationSession,
  verifyLoginOtp,
  verifyLoginTotp,
  startForgotPassword,
  resetPassword,
  resendOtp,
  setupRegistrationTotp
} from "./authService";
import { translateAuthError, AUTH_ERRORS } from "../../constants/errors";
import {
  setAuthFlowInProgress,
  setToken,
  removeToken,
} from "../../lib/auth";

// Import step components
import LoginStep from "./components/LoginStep";
import LoginOtpStep from "./components/LoginOtpStep";
import RegisterEmailStep from "./components/RegisterEmailStep";
import RegisterOtpStep from "./components/RegisterOtpStep";
import RegisterDetailsStep from "./components/RegisterDetailsStep";
import RegisterSuccessStep from "./components/RegisterSuccessStep";
import Register2faStep from "./components/Register2faStep";
import RegisterPhoneOtpStep from "./components/RegisterPhoneOtpStep";
import ForgotStep1 from "./components/ForgotStep1";
import ForgotStep2 from "./components/ForgotStep2";
import ForgotStep3 from "./components/ForgotStep3";
import CloseIcon from '@mui/icons-material/Close';
import { AuthContext } from "../../contexts/AuthContext";
import { getMaskedEmail } from "../../utils/maskUtils";

export default function LoginForm({ onClose }) {
  const router = useAppRouter();
  const globalTheme = useTheme();

  const mergedTheme = React.useMemo(() => createTheme({
    ...globalTheme,
    typography: {
      ...globalTheme.typography,
    },
  }), [globalTheme]);

  const { checkAuth } = React.useContext(AuthContext);

  const [mode, setMode] = useState("login");
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: "",
    username: "",
    confirmPassword: "",
    phone: "",
    phoneOtp: "",
    verifyPhone: false,
    rememberMe: false,
  });
  const [resendTimer, setResendTimer] = useState(0);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [mfaType, setMfaType] = useState(""); // "email" or "totp"

  const updateFormData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const cleanupAuthContext = () => {
    setAuthFlowInProgress(false);
  };

  const [lastTarget, setLastTarget] = useState("");
  const [lastPurpose, setLastPurpose] = useState("");

  // Clean up any legacy orphaned storage keys to keep the user's browser clean
  React.useEffect(() => {
    cleanupLegacyAuthStorage();
  }, []);

  // Countdown timer for OTP resend
  React.useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Effect to clear alerts when step changes
  // Effect to clear alerts when step changes
  React.useEffect(() => {
    setError("");
    if (step === 1) {
      setSuccess("");
    }

  }, [step]);

  // Handle mode transitions and aggressive cleanup ONLY on fresh starts
  React.useEffect(() => {
    if (step === 1) {
      setIsRegistered(false);
      setSuccess("");
      setError("");
    }

    // Context-Aware Clean-up: If starting or resuming a registration,
    // clear any stale tokens from previous sessions to prevent interference.
    if (mode === "register") {
      removeToken();
      // However, DO NOT clear registrationToken if we are in Step 4 or 5
      if (step < 4) {
        sessionStorage.removeItem("registration_token");
      }
    }

    // Clear masked email when on step 1 of any flow to prevent stale data
    if (step === 1) {
      setMaskedEmail("");
      sessionStorage.removeItem("auth_maskedEmail");
    }

    if (mode === "register" && step === 1) {
      setFormData({
        email: "",
        password: "",
        otp: "",
        username: "",
        confirmPassword: "",
        phone: "",
        phoneOtp: "",
        verifyPhone: false,
        rememberMe: false,
      });
    }
  }, [mode, step]);

  const triggerOtpCooldown = (target, purpose, masked) => {
    if (target) setLastTarget(target);
    if (purpose) setLastPurpose(purpose);
    if (masked) {
      const properlyMasked = getMaskedEmail(masked);
      setMaskedEmail(properlyMasked);
    }
    setResendTimer(30);
  };

  // Effect to pre-fill "Remember Me" data
  React.useEffect(() => {
    const savedIdentifier = localStorage.getItem("rememberedIdentifier");
    const wasRemembered = localStorage.getItem("rememberMe") === "true";
    if (wasRemembered && savedIdentifier) {
      setFormData((prev) => ({
        ...prev,
        email: savedIdentifier,
        rememberMe: true,
      }));
    }
  }, []);

  const persistRememberMe = (identifier) => {
    if (formData.rememberMe) {
      localStorage.setItem("rememberedIdentifier", identifier);
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("rememberedIdentifier");
      localStorage.removeItem("rememberMe");
    }
  };

  const handleFinalLogin = async (identifier, password) => {
    const sessionId = formData.sessionId;

    if (resendTimer > 0 && lastTarget === identifier && lastPurpose === "login" && sessionId) {
      setFormData(prev => ({ ...prev, otp: "" }));
      setStep(2);
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const data = await loginUser(identifier, password);

      if (data.requires_otp || data.requires_totp || data.requires_mfa || data.otp_sent) {
        persistRememberMe(identifier);
        setMfaType(data.requires_totp ? "totp" : "email");
        setMaskedEmail(getMaskedEmail(data.masked_email || identifier));
        setAuthFlowInProgress(true);
        setFormData(prev => ({ ...prev, otp: "", sessionId: data.session_id }));
        setStep(2);
        triggerOtpCooldown(identifier, "login", data.masked_email);
        return;
      }

      if (data.requires_setup) {
        // Bypass mandatory setup - go to dashboard if token exists
        if (data.access_token) {
          persistRememberMe(identifier);
          router.push("/dashboard/home/institute");
          return;
        }
        // If no full token, the backend might still return requires_setup but we handle it as success
        // since we enabled 2FA setup bypass.
        if (data.session_id && !data.access_token) {
          // This case shouldn't happen with our backend changes to requiresSetup = false
        }
      }

      if (data.access_token) {
        persistRememberMe(identifier);
        cleanupAuthContext();
        await checkAuth();
        router.push("/dashboard/home/institute");
      }
    } catch (err) {
      setError(translateAuthError(err.response?.data?.error || err.message || AUTH_ERRORS.GENERIC.LOGIN_FAILED));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyLoginOtp = async () => {
    setIsLoading(true);
    setError("");
    try {
      const sessionId = formData.sessionId;
      let data;
      if (mfaType === "totp") {
        data = await verifyLoginTotp(formData.otp, sessionId);
      } else {
        data = await verifyLoginOtp(formData.otp, sessionId);
      }

      if (data.access_token) {
        setToken(data.access_token);
        persistRememberMe(formData.email);
        cleanupAuthContext();
        await checkAuth();
        router.push("/dashboard/home/institute");
      }
    } catch (err) {
      setError(translateAuthError(err.response?.data?.error || err.message || String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterStart = async (email, phone) => {
    if (resendTimer > 0 && lastTarget === email && lastPurpose === "register" && formData.sessionId) {
      setStep(2);
      setSuccess("OTP सफलतापूर्वक भेजा गया!");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const data = await onRegisterStart(email);
      const sessionId = data.session_id;

      await sendRegistrationEmailOtp(sessionId);

      let totpData = null;
      if (formData.twoFactorEnabled) {
        totpData = await setupRegistrationTotp(sessionId);
      }

      setAuthFlowInProgress(true);
      setMaskedEmail(getMaskedEmail(data.masked_email || email));
      setFormData(prev => ({ ...prev, otp: "", sessionId, totpData }));
      setStep(2);
      setSuccess("OTP सफलतापूर्वक भेजा गया!");
      triggerOtpCooldown(email, "register", email);
    } catch (err) {
      console.error("Registration start failed:", err);
      const backendError = err.response?.data?.error || err.message;
      setError(translateAuthError(backendError || AUTH_ERRORS.GENERIC.OTP_SEND_FAILED));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyRegisterOtp = async () => {
    setIsLoading(true);
    setError("");
    try {
      if (!formData.sessionId) throw new Error("No session found");

      // If email OTP was already verified in a previous attempt, skip to final register
      if (!formData.isEmailVerified) {
        await verifyRegistrationEmailOtp(formData.sessionId, formData.otp);
        updateFormData({ isEmailVerified: true });
      }

      // Immediately finalize registration with collected details
      await handleFinalRegister();
    } catch (err) {
      const errMsg = err.response?.data?.error || "अमान्य या समाप्त OTP";
      if (errMsg.toLowerCase().includes("session expired") || errMsg.toLowerCase().includes("session not found")) {
        setMode("login");
        setStep(1);
        setError(AUTH_ERRORS.GENERIC.SESSION_EXPIRED);
      } else {
        setError(translateAuthError(errMsg));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalRegister = async (extraData = {}) => {
    if (isRegistered && extraData.shouldStayInFlow) {
      return { success: true };
    }

    setIsLoading(true);
    setError("");
    try {
      if (!formData.sessionId) throw new Error("No session found");
      const username = String(formData.username || "");
      const password = String(formData.password || "");
      const fullName = String(formData.full_name || "");
      const role = String(formData.role || "");
      const phone = formData.phone ? String((formData.countryCode || "+91") + formData.phone) : "";
      const dob = String(formData.dob || "");
      const gender = String(formData.gender || "");

      const data = await completeRegistrationSession(formData.sessionId, username, password, fullName, role, phone, dob, gender, formData.totpCode);
      setIsRegistered(true);

      // Since TOTP is already verified and setup during completion, we just go to success step
      setStep(4);
      return data;
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || String(err);
      if (errMsg.toLowerCase().includes("session expired") || errMsg.toLowerCase().includes("session not found")) {
        setMode("login");
        setStep(1);
        setError(AUTH_ERRORS.GENERIC.SESSION_EXPIRED);
      } else {
        setError(translateAuthError(errMsg));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistrationComplete = () => {
    cleanupAuthContext();
    setMode("login");
    setStep(1);
    setIsRegistered(false); // Reset isRegistered so fresh login can happen
    setSuccess("रजिस्ट्रेशन सफल! अब आप साइन इन कर सकते हैं।");
  };

  const handleStartRecovery = async (target) => {
    if (resendTimer > 0 && lastTarget === target && lastPurpose === "password_reset") {
      setFormData(prev => ({ ...prev, email: target, otp: "" }));
      setStep(2);
      setSuccess("OTP सफलतापूर्वक भेजा गया!");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const data = await startForgotPassword(target);
      setAuthFlowInProgress(true);
      setMaskedEmail(getMaskedEmail(data.masked_email || target));
      setFormData(prev => ({ ...prev, email: target, otp: "" }));
      setStep(2);
      setSuccess("OTP सफलतापूर्वक भेजा गया!");
      triggerOtpCooldown(target, "password_reset", data.masked_email);
    } catch (err) {
      setError(translateAuthError(err.response?.data?.error || String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (newPassword) => {
    setIsLoading(true);
    setError("");
    try {
      await resetPassword({
        target: formData.email,
        otp: formData.otp,
        newPassword
      });
      setSuccess("पासवर्ड सफलतापूर्वक रीसेट हो गया! कृपया साइन इन करें।");
      setMode("login");
      setStep(1);
    } catch (err) {
      setError(translateAuthError(err.response?.data?.error || String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      let purpose = "register";
      if (mode === "forgot_password") purpose = "password_reset";
      else if (mode === "login") purpose = "login";

      if (purpose === "register") {
        if (!formData.sessionId) throw new Error("No session found");
        await sendRegistrationEmailOtp(formData.sessionId);
        setFormData(prev => ({ ...prev, otp: "" }));
        setSuccess("OTP फिर से भेजा गया!");
        triggerOtpCooldown(formData.email, purpose, maskedEmail || getMaskedEmail(formData.email));
      } else {
        const data = await resendOtp(formData.email, purpose);
        if (data.masked_email) setMaskedEmail(getMaskedEmail(data.masked_email));
        setFormData(prev => ({ ...prev, otp: "" }));
        setSuccess("OTP फिर से भेजा गया!");
        triggerOtpCooldown(formData.email, purpose, data.masked_email);
      }
    } catch (err) {
      setError(translateAuthError(err.response?.data?.error || String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const resetOtp = () => setFormData(prev => ({ ...prev, otp: "" }));
  const clearAlerts = () => { setError(""); setSuccess(""); };

  const renderStep = () => {
    if (mode === "login") {
      switch (step) {
        case 1: return <LoginStep setStep={setStep} setMode={setMode} formData={formData} updateFormData={updateFormData} onLogin={handleFinalLogin} isLoading={isLoading} error={error} setError={setError} success={success} setSuccess={setSuccess} onClose={onClose} />;
        case 2: return <LoginOtpStep setStep={setStep} formData={formData} updateFormData={updateFormData} handleFinalSubmit={handleVerifyLoginOtp} isLoading={isLoading} error={error} setError={setError} onResendOtp={handleResendOtp} resendTimer={resendTimer} resetOtp={resetOtp} success={success} setSuccess={setSuccess} maskedEmail={maskedEmail || getMaskedEmail(formData?.email)} mfaType={mfaType} />;
        case 3: return <Register2faStep setStep={setStep} setMode={setMode} onFinish={() => { setSuccess("MFA सक्षम हो गया! कृपया साइन इन करें।"); setStep(1); }} handleFinalSubmit={async () => ({ success: true })} isLoading={isLoading} />;
        default: return null;
      }
    }
    if (mode === "register") {
      switch (step) {
        case 1: return <RegisterDetailsStep setStep={setStep} setMode={setMode} formData={formData} updateFormData={updateFormData} handleFinalRegister={handleFinalRegister} onRegisterStart={handleRegisterStart} isLoading={isLoading} error={error} setError={setError} success={success} setSuccess={setSuccess} onClose={onClose} />;
        case 2: return <RegisterOtpStep setStep={setStep} formData={formData} updateFormData={updateFormData} setError={setError} error={error} isLoading={isLoading} onResendOtp={handleResendOtp} onVerifyOtp={handleVerifyRegisterOtp} resendTimer={resendTimer} resetOtp={resetOtp} success={success} setSuccess={setSuccess} maskedEmail={maskedEmail || getMaskedEmail(formData?.email)} />;
        // case 3 removed as details are collected in step 1
        case 4: return <RegisterSuccessStep onProceedTo2fa={() => setStep(5)} onSkipToLogin={handleRegistrationComplete} />;
        case 5: return <Register2faStep setStep={setStep} setMode={setMode} onFinish={handleRegistrationComplete} handleFinalSubmit={handleFinalRegister} isLoading={isLoading} isRegistered={isRegistered} />;
        case 6: return <RegisterPhoneOtpStep setStep={setStep} setMode={setMode} formData={formData} isLoading={isLoading} setIsLoading={setIsLoading} setError={setError} setSuccess={setSuccess} isRegistered={isRegistered} />;
        default: return null;
      }
    }
    if (mode === "forgot_password") {
      switch (step) {
        case 1: return <ForgotStep1 setMode={setMode} onStartRecovery={handleStartRecovery} isLoading={isLoading} error={error} setError={setError} success={success} />;
        case 2: return <ForgotStep2 setStep={setStep} formData={formData} updateFormData={updateFormData} isLoading={isLoading} error={error} setError={setError} onResendOtp={handleResendOtp} resendTimer={resendTimer} resetOtp={resetOtp} success={success} setSuccess={setSuccess} maskedEmail={maskedEmail || getMaskedEmail(formData?.email)} />;
        case 3: return <ForgotStep3 formData={formData} onResetPassword={handleResetPassword} isLoading={isLoading} error={error} setError={setError} success={success} clearAlerts={clearAlerts} setMode={setMode} setStep={setStep} />;
        default: return null;
      }
    }
    return null;
  };

  const safeRenderStep = () => {
    try {
      return renderStep() || (
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "var(--color-error)" }}>An error occurred rendering this step.</Typography>
          <Button onClick={() => { setStep(1); setMode("login"); }} sx={{ mt: 2 }}>Back to Login</Button>
        </Box>
      );
    } catch (err) {
      console.error("Render Step Error:", err);
      return (
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "var(--color-error)" }}>Something went wrong.</Typography>
          <Button onClick={() => window.location.reload()} sx={{ mt: 2 }}>Reload Page</Button>
        </Box>
      );
    }
  };

  return (
    <ThemeProvider theme={mergedTheme}>
      <BackdropBlur zIndex={9999}>

        <Paper
          onClick={(e) => e.stopPropagation()}
          elevation={0}
          component={motion.div}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            width: { xs: "var(--size-screen-w)", sm: "640px" },
            minHeight: { xs: "var(--size-screen-h)", sm: "auto" },
            maxHeight: { xs: "100dvh", sm: "90vh" },
            borderRadius: { xs: 0, sm: "28px" },
            background: `
              radial-gradient(at 0% 0%, rgba(0, 86, 179, 0.45) 0, transparent 50%), 
              radial-gradient(at 100% 0%, rgba(40, 167, 69, 0.3) 0, transparent 50%), 
              radial-gradient(at 80% 90%, rgba(40, 167, 69, 0.2) 0, transparent 50%),
              radial-gradient(at 20% 80%, rgba(0, 86, 179, 0.15) 0, transparent 50%),
              #eef2f6
            `,
            backdropFilter: "blur(28px) saturate(200%)",
            border: "none",
            border: "none",
            position: "relative",
            zIndex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            px: { xs: 3, sm: 8 },
            py: { xs: 6, sm: 8 },
          }}
        >
          <Box sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box component="img" src="/logo.svg" alt="Tarang Logo" sx={{ width: 48, height: 48, objectFit: "contain" }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-slate-900)", letterSpacing: "-1px", fontSize: "26px" }}>Tarang</Typography>
            </Box>
            <Box sx={{ display: { xs: "block", sm: "none" } }}>
              {onClose && (
                <IconButton onClick={onClose} sx={{ color: "var(--color-slate-500)", bgcolor: "rgba(226, 232, 240, 0.5)", "&:hover": { bgcolor: "rgba(226, 232, 240, 0.8)" } }}>
                  <CloseIcon />
                </IconButton>
              )}
            </Box>
          </Box>


          <Box sx={{ width: "var(--size-full)", flex: 1, position: "relative", "& .MuiTypography-root": { color: "var(--color-slate-900)" }, "& .MuiTypography-body2": { color: "var(--color-slate-500)" }, "& span": { color: "var(--color-primary)" } }}>
            <Box style={{ width: "var(--size-full)", display: "flex", flexDirection: "column" }}>
              {safeRenderStep()}
            </Box>
          </Box>
        </Paper>
      </BackdropBlur>
    </ThemeProvider>
  );
}
