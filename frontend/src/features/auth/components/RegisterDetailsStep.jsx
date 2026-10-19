import { Box, Typography, TextField, Button, InputAdornment, IconButton, Select, MenuItem, FormControl, ListItemButton, Tooltip } from "@mui/material";
import { motion as Motion, AnimatePresence } from "framer-motion";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import CheckIcon from "@mui/icons-material/Check";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import { useState, useEffect } from "react";
import { checkUsername } from "../authService";
import Loader from "../../../components/common/Loader";

const RULES = [
  { id: "len",     label: "कम से कम 8 अक्षर",             test: (p) => p.length >= 8 },
  { id: "upper",   label: "एक बड़ा अक्षर (A–Z)",         test: (p) => /[A-Z]/.test(p) },
  { id: "lower",   label: "एक छोटा अक्षर (a–z)",         test: (p) => /[a-z]/.test(p) },
  { id: "number",  label: "एक नंबर (0–9)",                   test: (p) => /\d/.test(p) },
  { id: "special", label: "एक विशेष अक्षर (@$!%*?&)",    test: (p) => /[@$!%*?&]/.test(p) },
];

const RuleRow = ({ passed, label, color, isIncorrect }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
    <Box sx={{
      width: 14, height: 14, borderRadius: "50%",
      bgcolor: passed ? "#28a745" : (isIncorrect ? "#ef4444" : "#e2e8f0"),
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, transition: "background-color 0.2s ease"
    }}>
      {passed && <CheckIcon sx={{ color: "white", fontSize: 10, strokeWidth: 4 }} />}
      {isIncorrect && <ErrorIcon sx={{ color: "white", fontSize: 10, strokeWidth: 4 }} />}
    </Box>
    <Typography sx={{
      fontSize: "12px",
      color: passed ? "#28a745" : (isIncorrect ? "#ef4444" : "#94a3b8"),
      fontWeight: passed ? 600 : 500,
      transition: "color 0.2s ease"
    }}>
      {label}
    </Typography>
  </Box>
);

function getStrength(password) {
  const passed = RULES.filter((r) => r.test(password)).length;
  if (passed === 0) return { score: 0, label: "", color: "#e2e8f0" };
  if (passed <= 2)  return { score: passed, label: "कमज़ोर",   color: "#ef4444" };
  if (passed <= 3)  return { score: passed, label: "ठीक है",   color: "#ffc107" };
  if (passed === 4) return { score: passed, label: "अच्छा",   color: "#0056b3" };
  return { score: 5, label: "मज़बूत", color: "#28a745" };
}

const fieldSx = {
  "& .MuiOutlinedInput-root": {
      backgroundColor: "#f8fafc",
      borderRadius: "8px",
      transition: "all 0.2s ease",
      "& fieldset": { borderColor: "#e2e8f0" },
      "&:hover fieldset": { borderColor: "#cbd5e1" },
      "&.Mui-focused fieldset": { borderColor: "#0056b3", borderWidth: "1.5px" },
      "&.Mui-error fieldset": { borderColor: "#ef4444" },
      "&.Mui-error:hover fieldset": { borderColor: "#ef4444" },
      "&.Mui-error.Mui-focused fieldset": { borderColor: "#ef4444" },
      "& input": { color: "#0f172a", fontSize: "15px" },
  },
  "& .MuiOutlinedInput-input": { padding: "12px 14px" },
  "& .MuiFormHelperText-root": { color: "#ef4444", fontSize: "12px", mt: 0.5 },
};

export default function RegisterDetailsStep({ setStep, formData, updateFormData, handleFinalRegister, isLoading, error }) {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null);
  const strength = getStrength(formData.password || "");

  useEffect(() => {
    if (!formData?.email) setStep(1);
  }, [formData, setStep]);

  useEffect(() => {
    const username = formData.username;
    if (!username || username.length < 3) {
      setUsernameStatus(null);
      setIsCheckingUsername(false);
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      setUsernameStatus("error");
      setIsCheckingUsername(false);
      setErrors(prev => ({ ...prev, username: "यूज़रनेम में केवल अक्षर, अंक, और अंडरस्कोर (_) हो सकते हैं" }));
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

    if (!formData.full_name || formData.full_name.trim().length < 2) {
      newErrors.full_name = "कृपया अपना पूरा नाम लिखें";
    }

    if (!formData.role || formData.role === "none") {
      newErrors.role = "कृपया अपनी भूमिका (Role) चुनें";
    }

    if (!formData.username || formData.username.length < 3) {
      newErrors.username = "यूज़रनेम कम से कम 3 अक्षरों का होना चाहिए";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "यूज़रनेम में केवल अक्षर, अंक, और अंडरस्कोर (_) हो सकते हैं";
    } else if (usernameStatus === "taken") {
      newErrors.username = "यह यूज़रनेम पहले से लिया जा चुका है";
    } else if (usernameStatus === "error") {
      newErrors.username = "यूज़रनेम की जाँच विफल रही।";
    }

    const allRulesPassed = RULES.every((r) => r.test(formData.password || ""));
    if (!allRulesPassed) {
      newErrors.password = "पासवर्ड सभी आवश्यकताओं को पूरा नहीं करता है";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "पासवर्ड मेल नहीं खाते";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (validate() && usernameStatus === "available") {
      try {
        await handleFinalRegister({ shouldStayInFlow: true });
      } catch {
        // Handle error
      }
    }
  };

  const passwordFilled = (formData.password || "").length > 0;
  
  const isFormValid = formData.full_name?.trim().length >= 2 &&
                      formData.role && formData.role !== "none" &&
                      formData.username?.length >= 3 && /^[a-zA-Z0-9_]+$/.test(formData.username) &&
                      usernameStatus === "available" &&
                      RULES.every(r => r.test(formData.password || "")) &&
                      formData.password === formData.confirmPassword;

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1.25 }}>
      <Box sx={{ mb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px", fontSize: "28px", mb: 1 }}>
          प्रोफ़ाइल विवरण
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", fontSize: "15px", lineHeight: 1.5 }}>
          अपनी प्रोफ़ाइल पूरी करें।
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Compact Name & Username Row */}
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Box sx={{ flex: 1.2 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#334155", fontSize: "14px" }}>
                  पूरा नाम
              </Typography>
              <TextField
                  fullWidth
                  value={formData.full_name || ""}
                  onChange={(e) => {
                      updateFormData({ full_name: e.target.value });
                      if (errors.full_name) setErrors(p => { const e = { ...p }; delete e.full_name; return e; });
                  }}
                  placeholder="नाम"
                  error={!!errors.full_name}
                  helperText={errors.full_name}
                  InputProps={{
                      startAdornment: (
                          <InputAdornment position="start">
                              <Box sx={{ mr: 0.5, color: "#94a3b8", display: "flex", alignItems: "center", flexShrink: 0 }}>
                                  <PersonIcon sx={{ fontSize: 18 }} />
                              </Box>
                          </InputAdornment>
                      ),
                  }}
                  sx={fieldSx}
              />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#334155", fontSize: "14px" }}>
              यूज़रनेम
            </Typography>
            <Tooltip
              placement="top"
              arrow
              PopperProps={{ sx: { zIndex: 99999 } }}
              disableHoverListener={!(!!formData.username && !/^[a-zA-Z0-9_]+$/.test(formData.username))}
              disableFocusListener={!(!!formData.username && !/^[a-zA-Z0-9_]+$/.test(formData.username))}
              disableTouchListener={!(!!formData.username && !/^[a-zA-Z0-9_]+$/.test(formData.username))}
              slotProps={{
                tooltip: { sx: { bgcolor: "white", color: "#ef4444", boxShadow: "none", border: "1px solid #E2E8F0" } },
                arrow: { sx: { color: "white" } }
              }}
              title={
                <Typography sx={{ fontSize: "12px", fontWeight: 600 }}>यूज़रनेम में केवल अक्षर, अंक, और अंडरस्कोर (_) हो सकते हैं</Typography>
              }
            >
              <Box sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  value={formData.username}
                  onChange={(e) => {
                    updateFormData({ username: e.target.value });
                    if (errors.username) setErrors(p => { const e = { ...p }; delete e.username; return e; });
                  }}
                  placeholder="यूज़रनेम"
                  error={!!errors.username || (!!formData.username && !/^[a-zA-Z0-9_]+$/.test(formData.username))}
                  helperText={(errors.username && errors.username !== "यूज़रनेम में केवल अक्षर, अंक, और अंडरस्कोर (_) हो सकते हैं") ? errors.username : null}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box sx={{ mr: 0.5, color: "#94a3b8", display: "flex", alignItems: "center", flexShrink: 0 }}>
                          <PersonIcon sx={{ fontSize: 18 }} />
                        </Box>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        {isCheckingUsername && <Loader mini />}
                        {!isCheckingUsername && usernameStatus === "available" && <CheckCircleIcon sx={{ color: "#28a745", fontSize: 18 }} />}
                        {!isCheckingUsername && usernameStatus === "taken" && <ErrorIcon sx={{ color: "#ef4444", fontSize: 18 }} />}
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    ...fieldSx,
                    "& .MuiFormHelperText-root": {
                        color: errors.username ? "#ef4444" : "#94a3b8",
                    }
                  }}
                />
              </Box>
            </Tooltip>
          </Box>
        </Box>

        {/* Custom Hand-Crafted Role Dropdown - Consistent Layout */}
        <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#334155", fontSize: "14px" }}>
                भूमिका
            </Typography>
            
            <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {/* Primary Role Tabs */}
                <Box sx={{ display: "flex", gap: "8px", width: "100%" }}>
                    {[
                        { id: "organisation", label: "संस्थागत" },
                        { id: "individual", label: "व्यक्तिगत" }
                    ].map((item) => {
                        const isCurrent = (item.id === "organisation" && formData.role === "organisation") || 
                                          (item.id === "individual" && (formData.role === "teacher" || formData.role === "student"));
                        return (
                            <Box
                                key={item.id}
                                onClick={() => {
                                    updateFormData({ role: item.id === "individual" ? "teacher" : "organisation" });
                                    if (errors.role) setErrors(p => { const e = { ...p }; delete e.role; return e; });
                                }}
                                sx={{
                                    flex: 1, height: "45px", display: "flex", alignItems: "center", justifyContent: "center",
                                    borderRadius: "8px", border: "1.5px solid",
                                    borderColor: isCurrent ? "#0056b3" : "#e2e8f0",
                                    bgcolor: isCurrent ? "rgba(0, 86, 179, 0.04)" : "#f8fafc",
                                    cursor: "pointer", transition: "all 0.2s ease",
                                    "&:hover": { borderColor: isCurrent ? "#0056b3" : "#cbd5e1" }
                                }}
                            >
                                <Typography sx={{ 
                                    fontWeight: 700, 
                                    color: isCurrent ? "#0056b3" : "#64748b", 
                                    fontSize: "13.5px", 
                                    transition: "color 0.2s ease" 
                                }}>
                                    {item.label}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>

                {/* Sub-role Tabs */}
                <AnimatePresence mode="wait">
                    {(formData.role === "teacher" || formData.role === "student") && (
                        <Motion.div 
                            key="sub-roles"
                            initial={{ opacity: 0, height: 0, overflow: "hidden" }} 
                            animate={{ opacity: 1, height: "auto", overflow: "visible" }} 
                            exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                            transition={{ duration: 0.2 }}
                            style={{ width: "100%" }}
                        >
                            <Box sx={{ display: "flex", gap: "8px", width: "100%" }}>
                                {[
                                    { id: "teacher", label: "शिक्षक" },
                                    { id: "student", label: "विद्यार्थी" }
                                ].map((item) => {
                                    const isCurrent = formData.role === item.id;
                                    return (
                                        <Box
                                            key={item.id}
                                            onClick={() => updateFormData({ role: item.id })}
                                            sx={{
                                                flex: 1, height: "45px", display: "flex", alignItems: "center", justifyContent: "center",
                                                borderRadius: "8px", border: "1.5px solid",
                                                borderColor: isCurrent ? "#28a745" : "#e2e8f0",
                                                bgcolor: isCurrent ? "rgba(40, 167, 69, 0.04)" : "#f8fafc",
                                                cursor: "pointer", transition: "all 0.2s ease",
                                                "&:hover": { borderColor: isCurrent ? "#28a745" : "#cbd5e1" }
                                            }}
                                        >
                                            <Typography sx={{ 
                                                fontWeight: 700, 
                                                color: isCurrent ? "#28a745" : "#64748b", 
                                                fontSize: "13.5px",
                                                transition: "color 0.2s ease" 
                                            }}>
                                                {item.label}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Motion.div>
                    )}
                </AnimatePresence>
            </Box>
        </Box>
        {errors.role && <Typography sx={{ color: "#ef4444", fontSize: "11px", mt: -0.5 }}>{errors.role}</Typography>}

        {/* Password Section */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", mt: 0 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#334155", fontSize: "14px" }}>
                पासवर्ड
            </Typography>
            <Tooltip
              placement="top"
              arrow
              PopperProps={{ sx: { zIndex: 99999 } }}
              slotProps={{
                tooltip: { sx: { bgcolor: "white", color: "#334155", boxShadow: "none", border: "1px solid #E2E8F0" } },
                arrow: { sx: { color: "white" } }
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
              <Box sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  type="password"
                  value={formData.password}
                  onChange={(e) => {
                      updateFormData({ password: e.target.value });
                      if (errors.password) setErrors(p => { const e = { ...p }; delete e.password; return e; });
                  }}
                  placeholder="पासवर्ड"
                  error={!!errors.password}
                  InputProps={{
                      startAdornment: (
                          <InputAdornment position="start">
                              <Box sx={{ mr: 0.5, color: "#94a3b8", display: "flex", alignItems: "center", flexShrink: 0 }}>
                                  <LockIcon sx={{ fontSize: 18 }} />
                              </Box>
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
            </Tooltip>
          </Box>

          <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#334155", fontSize: "14px" }}>
                  पुष्टि करें
              </Typography>
              <TextField
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => {
                      updateFormData({ confirmPassword: e.target.value });
                      if (errors.confirmPassword) setErrors(p => { const e = { ...p }; delete e.confirmPassword; return e; });
                  }}
                  placeholder="पुष्टि करें"
                  error={!!errors.confirmPassword}
                  InputProps={{
                  startAdornment: (
                      <InputAdornment position="start">
                          <Box sx={{ mr: 0.5, color: "#94a3b8", display: "flex", alignItems: "center", flexShrink: 0 }}>
                              <LockIcon sx={{ fontSize: 18 }} />
                          </Box>
                      </InputAdornment>
                  ),
                  endAdornment: (
                      <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                              {showPassword ? <VisibilityOff sx={{ fontSize: 18, color: "#94a3b8" }} /> : <Visibility sx={{ fontSize: 18, color: "#94a3b8" }} />}
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
                           "& fieldset": { borderColor: "#28a745" },
                           "&:hover fieldset": { borderColor: "#28a745" },
                           "&.Mui-focused fieldset": { borderColor: "#28a745", borderWidth: "1.5px" },
                         } : {
                           "& fieldset": { borderColor: "#ef4444" },
                           "&:hover fieldset": { borderColor: "#ef4444" },
                           "&.Mui-focused fieldset": { borderColor: "#ef4444", borderWidth: "1.5px" },
                         }
                      ) : {})
                  }
              }}
              />
          </Box>
        </Box>


        {/* End Password Section */}
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "24px", mt: 1 }}>
        <AnimatePresence mode="wait">
          {error && (
            <Motion.div
              key="error"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
            >
              <Typography variant="body2" sx={{ color: "#ef4444 !important", fontSize: "13px", fontWeight: 600 }}>
                {error}
              </Typography>
            </Motion.div>
          )}
        </AnimatePresence>
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
        <Button
            variant="outlined"
            disabled={isLoading}
            onClick={() => setStep(2)}
            sx={{ 
                flex: 1,
                height: "48px",
                borderRadius: "8px",
                textTransform: "none", 
                color: "#475569", 
                bgcolor: "#f8fafc",
                borderColor: "#e2e8f0", 
                fontWeight: 600, 
                fontSize: "16px", 
                "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f1f5f9" } 
            }}
        >
            वापस जाएं
        </Button>
        <Button
            variant="contained" disableElevation
            disabled={isLoading || isCheckingUsername || usernameStatus === "taken" || !isFormValid}
            onClick={handleContinue}
            sx={{
                flex: 1,
                height: "48px",
                borderRadius: "8px",
                textTransform: "none",
                fontSize: "16px",
                fontWeight: 700,
                background: "linear-gradient(135deg, #0056b3 0%, #28a745 100%)",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                    background: "linear-gradient(135deg, #004494 0%, #218838 100%)",
                },
                "&.Mui-disabled": { background: "#e2e8f0", color: "#94a3b8" },
            }}
        >
            {isLoading ? <Loader mini /> : "सबमिट करें"}
        </Button>
      </Box>
    </Box>
  );
}
