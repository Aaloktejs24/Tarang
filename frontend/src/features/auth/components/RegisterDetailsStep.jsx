import { Box, Typography }
  from "@mui/material";
import { CustomFloatingInput, CustomFloatingDatePicker, CustomFloatingSelect, CustomFloatingPhoneInput } from "../../../components/common/CustomFloatingFields";
import { TextField, InputAdornment, IconButton, Select, MenuItem, FormControl, ListItemButton, Tooltip } from "@mui/material";
import CustomCheckbox from "../../../components/common/CustomCheckbox";
import { FormLoadingProvider } from '../../../contexts/FormLoadingContext';
import { motion, AnimatePresence } from "framer-motion";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import CheckIcon from "@mui/icons-material/Check";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import TarangButton from "../../../components/common/TarangButton";
import { useState, useEffect } from "react";
import { checkUsername, checkEmail } from "../authService";
import { validateEmail, validatePhone, validateUsername, validateName, validatePassword, getPasswordStrength, RULES } from "../../../utils/validationUtils";
import { RuleRow } from "../../../components/common/PasswordStrength";
import { CustomTooltip } from '../../../components/common/CustomTooltip';




const fieldSx = {
  "& .MuiOutlinedInput-root": {
    "&.Mui-error fieldset": { borderColor: "var(--color-error)" },
    "&.Mui-error:hover fieldset": { borderColor: "var(--color-error)" },
    "&.Mui-error.Mui-focused fieldset": { borderColor: "var(--color-error)" },
    "& input": { color: "var(--color-slate-900)", fontSize: 'var(--font-base)' },
  },
  "& .MuiOutlinedInput-input": { padding: "12px 14px" },
  "& .MuiFormHelperText-root": { color: "var(--color-error)", fontSize: 'var(--font-xs)', mt: 0.5 },
};

export default function RegisterDetailsStep({ setStep, setMode, formData, updateFormData, handleFinalRegister, onRegisterStart, isLoading, error, setError, success, setSuccess, onClose }) {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null); // null | 'available' | 'taken' | 'error'
  const strength = getPasswordStrength(formData.password || "");

  // Email live check
  useEffect(() => {
    const email = formData.email;
    if (!email || !email.includes('@') || email.length < 5) {
      setEmailStatus(null);
      setIsCheckingEmail(false);
      setErrors(prev => { const e = { ...prev }; delete e.emailTaken; return e; });
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsCheckingEmail(true);
      try {
        const res = await checkEmail(email.toLowerCase().trim());
        if (res.available) {
          setEmailStatus('available');
          setErrors(prev => { const e = { ...prev }; delete e.emailTaken; return e; });
        } else {
          setEmailStatus('taken');
          setErrors(prev => ({ ...prev, emailTaken: 'यह ईमेल पहले से पंजीकृत है' }));
        }
      } catch {
        setEmailStatus(null);
      } finally {
        setIsCheckingEmail(false);
      }
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [formData.email]);


  // Username live check
  useEffect(() => {
    const username = formData.username;
    if (!username || username.length < 3) {
      setUsernameStatus(null);
      setIsCheckingUsername(false);
      setErrors(prev => { const e = { ...prev }; delete e.username; return e; });
      return;
    }

    const usernameErr = validateUsername(username);

    if (usernameErr) {
      setUsernameStatus("error");
      setIsCheckingUsername(false);
      setErrors(prev => ({ ...prev, username: usernameErr }));
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const res = await checkUsername(encodeURIComponent(username));
        if (res.available) {
          setUsernameStatus("available");
          setErrors(prev => { const e = { ...prev }; delete e.username; return e; });
        } else {
          setUsernameStatus("taken");
          setErrors(prev => ({ ...prev, username: "यह यूज़रनेम पहले से लिया जा चुका है" }));
        }
      } catch {
        setUsernameStatus("error");
        setErrors(prev => ({ ...prev, username: "यूज़रनेम की जाँच विफल रही। कृपया पुनः प्रयास करें।" }));
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.username]);


  const validate = () => {
    const newErrors = {};

    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

    const nameErr = validateName(formData.full_name);
    if (nameErr) newErrors.full_name = nameErr;

    if (!formData.dob) {
      newErrors.dob = true;
    }

    if (!formData.role || formData.role === "none") {
      newErrors.role = true;
    }

    const phoneErr = validatePhone((formData.countryCode || "+91") + (formData.phone || ""));
    if (phoneErr) newErrors.phone = phoneErr;

    const usernameErr = validateUsername(formData.username);
    if (usernameErr) {
      newErrors.username = usernameErr;
    } else if (usernameStatus === "taken") {
      newErrors.username = "यह यूज़रनेम पहले से लिया जा चुका है";
    } else if (usernameStatus === "error") {
      newErrors.username = "यूज़रनेम की जाँच विफल रही।";
    }

    const passErr = validatePassword(formData.password);
    if (passErr) {
      newErrors.password = passErr;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = true;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "पासवर्ड मेल नहीं खाते";
    }

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (validate() && usernameStatus === "available" && emailStatus !== 'taken') {
      try {
        await onRegisterStart(formData.email);
      } catch {
        // Handle error
      }
    }
  };

  const passwordFilled = (formData.password || "").length > 0;

  const isFormValid = !validateName(formData.full_name) &&
    formData.role && formData.role !== "none" &&
    !validateUsername(formData.username) &&
    usernameStatus === "available" &&
    emailStatus !== 'taken' &&
    RULES.every(r => r.test(formData.password || "")) &&
    formData.password === formData.confirmPassword &&
    formData.termsAccepted;

  return (
    <FormLoadingProvider isLoading={isLoading}>
      <Box sx={{ width: "var(--size-full)", display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-slate-900)", letterSpacing: "-0.5px", fontSize: 'var(--font-2xl)', mb: 1 }}>
          नया अकाउंट बनाएँ
        </Typography>
        <Typography variant="body2" sx={{ color: "var(--color-slate-500)", fontSize: 'var(--font-base)', lineHeight: 1.5 }}>
          हमारी कम्युनिटी से जुड़ें और अपनी यात्रा शुरू करें।
        </Typography>
      </Box>

      

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>


        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Box sx={{ width: "calc(50% - 6px)" }}>
            <CustomFloatingInput
              label="पूरा नाम"
              required

              value={formData.full_name || ""}
              onChange={(e) => {
                updateFormData({ full_name: e.target.value });
                if (errors.full_name) setErrors(p => { const e = { ...p }; delete e.full_name; return e; });
              }}
              error={!!errors.full_name}
              helperText={errors.full_name}
              InputProps={{

              }}

            />
          </Box>
          <Box sx={{ width: "calc(50% - 6px)" }}>
            <CustomFloatingDatePicker
              label="जन्म तिथि"
              required
              value={formData.dob || ""}
              onChange={(e) => {
                updateFormData({ dob: e.target.value });
                if (errors.dob) setErrors(p => { const e = { ...p }; delete e.dob; return e; });
              }}
              error={!!errors.dob}
              helperText={errors.dob}
              disableFuture={true}
            />
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Box sx={{ width: "calc(50% - 6px)", position: 'relative' }}>
            <CustomFloatingInput
              label="ईमेल पता"
              required
              type="email"
              value={formData.email || ""}
              onChange={(e) => {
                updateFormData({ email: e.target.value });
                setEmailStatus(null);
                if (errors.email) setErrors(p => { const e = { ...p }; delete e.email; return e; });
                if (errors.emailTaken) setErrors(p => { const e = { ...p }; delete e.emailTaken; return e; });
              }}
              error={!!errors.email || emailStatus === 'taken'}
              helperText={errors.email || (emailStatus === 'taken' ? 'यह ईमेल पहले से पंजीकृत है' : '')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {isCheckingEmail && (
                      <Box sx={{ width: 18, height: 18, border: '2px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: 'var(--radius-full)', animation: 'spin 0.7s linear infinite', '@keyframes spin': { to: { transform: 'rotate(360deg)' } } }} />
                    )}
                    {!isCheckingEmail && emailStatus === 'available' && (
                      <CheckCircleIcon sx={{ color: '#22c55e', fontSize: 20 }} />
                    )}
                  </InputAdornment>
                )
              }}
            />
          </Box>
          <Box sx={{ width: "calc(50% - 6px)" }}>
            <CustomFloatingSelect
              label="भूमिका"
              required
              value={formData.role || ""}
              onChange={(e) => {
                updateFormData({ role: e.target.value });
                if (errors.role) setErrors(p => { const e = { ...p }; delete e.role; return e; });
              }}
              error={!!errors.role}
              helperText={errors.role}
              options={[
                { value: "student", label: "छात्र" },
                { value: "teacher", label: "शिक्षक" },
                { value: "admin", label: "प्रशासक" }
              ]}
            />
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Box sx={{ width: "calc(50% - 6px)" }}>
            <CustomFloatingPhoneInput
              label="फ़ोन नंबर"
              required
              countryCode={formData.countryCode || "+91"}
              onCountryCodeChange={(code) => updateFormData({ countryCode: code })}
              value={formData.phone || ""}
              onChange={(e) => {
                updateFormData({ phone: e.target.value });
                if (errors.phone) setErrors(p => { const e = { ...p }; delete e.phone; return e; });
              }}
              error={!!errors.phone}
              helperText={errors.phone}
            />
          </Box>
          <Box sx={{ width: "calc(50% - 6px)" }}>
            <Box sx={{ width: 'var(--size-full)' }}>
              <CustomFloatingInput
                label="यूज़रनेम"
                required

                value={formData.username}
                onChange={(e) => {
                  updateFormData({ username: e.target.value });
                  if (errors.username) setErrors(p => { const e = { ...p }; delete e.username; return e; });
                }}
                error={!!errors.username}
                helperText={errors.username}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {isCheckingUsername && (
                        <Box sx={{ width: 18, height: 18, border: '2px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: 'var(--radius-full)', animation: 'spin 0.7s linear infinite', '@keyframes spin': { to: { transform: 'rotate(360deg)' } } }} />
                      )}
                      {!isCheckingUsername && usernameStatus === "available" && <CheckCircleIcon sx={{ color: '#22c55e', fontSize: 20 }} />}
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", mt: 0 }}>
            <Box sx={{ width: "calc(50% - 6px)" }}>
              <CustomTooltip
                placement="top"
                arrow
                PopperProps={{ sx: { zIndex: 'var(--z-tooltip)' } }}
                slotProps={{
                  tooltip: { sx: { bgcolor: "var(--card-bg)", backdropFilter: "var(--card-blur)", color: "var(--color-slate-900)", border: "var(--border-thin) solid var(--color-slate-200)" } },
                  arrow: { sx: { color: "var(--card-bg)" } }
                }}
                title={
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, p: 0.5 }}>
                    {RULES.map((rule) => {
                      const passed = rule.test(formData.password || "");
                      const isIncorrect = passwordFilled && !passed;
                      return (
                        <RuleRow
                          key={rule.id}
                          passed={passed}
                          label={rule.label}
                          isIncorrect={isIncorrect}
                        />
                      );
                    })}

                  </Box>
                }
              >
                <Box sx={{ width: 'var(--size-full)' }}>
                  <CustomFloatingInput
                    label="पासवर्ड"
                    required

                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => {
                      updateFormData({ password: e.target.value });
                      if (errors.password) setErrors(p => { const e = { ...p }; delete e.password; return e; });
                    }}
                    error={!!errors.password}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <VisibilityOff sx={{ fontSize: 18, color: "var(--color-slate-500)" }} /> : <Visibility sx={{ fontSize: 18, color: "var(--color-slate-500)" }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      ...fieldSx,
                      "& .MuiOutlinedInput-root": {
                        ...fieldSx["& .MuiOutlinedInput-root"],
                        paddingRight: "14px",
                        ...(passwordFilled && !errors.password ? {
                          "& fieldset": { borderColor: strength.color },
                          "&:hover fieldset": { borderColor: strength.color },
                          "&.Mui-focused fieldset": { borderColor: strength.color, borderWidth: "1.5px" },
                        } : {})
                      }
                    }}
                  />
                </Box>
              </CustomTooltip>
            </Box>

            <Box sx={{ width: "calc(50% - 6px)" }}>
              <CustomFloatingInput
                label="पुष्टि करें"
                required

                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => {
                  updateFormData({ confirmPassword: e.target.value });
                  if (errors.confirmPassword) setErrors(p => { const e = { ...p }; delete e.confirmPassword; return e; });
                }}
                error={!!errors.confirmPassword}
                InputProps={{

                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOff sx={{ fontSize: 18, color: "var(--color-slate-500)" }} /> : <Visibility sx={{ fontSize: 18, color: "var(--color-slate-500)" }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  ...fieldSx,
                  "& .MuiOutlinedInput-root": {
                    ...fieldSx["& .MuiOutlinedInput-root"],
                    ...(formData.confirmPassword ? (
                      formData.password === formData.confirmPassword ? {
                        "& fieldset": { borderColor: "var(--color-success)" },
                        "&:hover fieldset": { borderColor: "var(--color-success)" },
                        "&.Mui-focused fieldset": { borderColor: "var(--color-success)", borderWidth: "1.5px" },
                      } : {
                        "& fieldset": { borderColor: "var(--color-error)" },
                        "&:hover fieldset": { borderColor: "var(--color-error)" },
                        "&.Mui-focused fieldset": { borderColor: "var(--color-error)", borderWidth: "1.5px" },
                      }
                    ) : {})
                  }
                }}
              />
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5 }}>
          <CustomCheckbox
              checked={formData.termsAccepted || false}
              onChange={(e) => {
                updateFormData({ termsAccepted: e.target.checked });
                if (errors.termsAccepted) setErrors(p => { const e = { ...p }; delete e.termsAccepted; return e; });
              }}
              error={!!errors.termsAccepted}
              label="मैंने नियम और शर्तें पढ़ ली हैं और मैं सहमत हूँ"
            />
            <CustomCheckbox
              checked={formData.twoFactorEnabled || false}
              onChange={(e) => updateFormData({ twoFactorEnabled: e.target.checked })}
              label="2-स्टेप वेरिफिकेशन (2FA) चालू करें"
            />
        </Box>
      </Box>



      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          {onClose && (
            <TarangButton
              variant="outlined"
              onClick={onClose}
              sx={{ flex: 1, height: 'var(--box-height)' }}
              disabled={isLoading}
            >
              बंद करें
            </TarangButton>
          )}
          <TarangButton
            loading={isLoading}
            disabled={isLoading || isCheckingUsername || usernameStatus === "taken" || isCheckingEmail || emailStatus === "taken"}
            onClick={handleContinue}
            sx={{ flex: 1, height: 'var(--box-height)' }}
          >
            {"OTP भेजें"}
          </TarangButton>
        </Box>
        <Typography variant="body2" sx={{ textAlign: "center", color: "var(--color-slate-500)" }}>
          क्या आपका पहले से अकाउंट है?{" "}
          <Box
            component="span"
            sx={{ color: "var(--color-primary)", fontWeight: 'var(--font-semibold)', cursor: "pointer", ml: 0.5, "&:hover": { textDecoration: "none" } }}
            onClick={() => { setMode("login"); setStep(1); }}
          >
            अभी लॉगिन करें
          </Box>
        </Typography>
      </Box>
    </Box>
    </FormLoadingProvider>
  );
}
