import { Box, Typography, TextField, Button, InputAdornment, IconButton, Select, MenuItem, FormControl, ListItemButton } from "@mui/material";
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

const RuleRow = ({ passed, label, color }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
    <Box sx={{
      width: 16, height: 16, borderRadius: "50%",
      bgcolor: passed ? (color || "#28a745") : "#e2e8f0",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, transition: "background-color 0.2s ease"
    }}>
      {passed && <CheckIcon sx={{ color: "white", fontSize: 11, strokeWidth: 4 }} />}
    </Box>
    <Typography sx={{
      fontSize: "12px",
      color: passed ? (color || "#28a745") : "#94a3b8",
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
  if (passed <= 3)  return { score: passed, label: "ठीक है",   color: "#f59e0b" };
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
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
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

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1.25 }}>
      <Box sx={{ mb: -0.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px", fontSize: "20px" }}>
          प्रोफ़ाइल विवरण
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", mt: 0, fontSize: "13px" }}>
          अपनी प्रोफ़ाइल पूरी करें।
        </Typography>
      </Box>

      <AnimatePresence mode="wait">
        {error && (
          <Motion.div key="server-err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Box sx={{ p: 1, borderRadius: "8px", bgcolor: "#fef2f2", border: "1px solid #fecaca" }}>
              <Typography sx={{ color: "#ef4444", fontSize: "12.5px", fontWeight: 600 }}>{error}</Typography>
            </Box>
          </Motion.div>
        )}
      </AnimatePresence>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {/* Compact Name & Username Row */}
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Box sx={{ flex: 1.2 }}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600, color: "#334155", fontSize: "13px" }}>
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
            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600, color: "#334155", fontSize: "13px" }}>
              यूज़रनेम
            </Typography>
            <TextField
              fullWidth
              value={formData.username}
              onChange={(e) => {
                updateFormData({ username: e.target.value });
                if (errors.username) setErrors(p => { const e = { ...p }; delete e.username; return e; });
              }}
              placeholder="यूज़रनेम"
              error={!!errors.username}
              helperText={errors.username}
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
        </Box>

        {/* Custom Hand-Crafted Role Dropdown - Consistent Layout */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155", fontSize: "13px" }}>
                भूमिका:
            </Typography>
            
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                {/* Primary Role Dropdown */}
                <Box sx={{ position: "relative", flex: 1.1 }}>
                    <Box 
                        onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                        sx={{
                            height: "45px", display: "flex", alignItems: "center", justifyContent: "space-between",
                            px: 1.75, borderRadius: "8px", bgcolor: "#f8fafc", border: "1.5px solid",
                            borderColor: isRoleMenuOpen ? "#0056b3" : "#e2e8f0",
                            cursor: "pointer", transition: "all 0.2s ease",
                            "&:hover": { borderColor: isRoleMenuOpen ? "#0056b3" : "#cbd5e1" },
                            boxShadow: isRoleMenuOpen ? "0 0 0 1px rgba(0, 86, 179, 0.1)" : "none"
                        }}
                    >
                        <Typography sx={{ fontSize: "14px", color: (formData.role === "none" || !formData.role) ? "#94a3b8" : "#0f172a", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden" }}>
                            {formData.role === "organisation" ? "संस्थागत" : 
                             (formData.role === "teacher" || formData.role === "student") ? "व्यक्तिगत" : "चुनें"}
                        </Typography>
                        <Box sx={{ 
                            width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent",
                            borderTop: "5px solid #94a3b8", transition: "transform 0.3s ease",
                            transform: isRoleMenuOpen ? "rotate(180deg)" : "rotate(0)", ml: 0.5
                        }} />
                    </Box>

                    <AnimatePresence>
                        {isRoleMenuOpen && (
                            <>
                                <Box onClick={() => setIsRoleMenuOpen(false)} sx={{ position: "fixed", inset: 0, zIndex: 9998 }} />
                                <Motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 4 }}
                                    exit={{ opacity: 0, y: -5, transition: { duration: 0.1 } }}
                                    style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10000 }}
                                >
                                    <Box sx={{
                                        bgcolor: "rgba(255, 255, 255, 0.98)", backdropFilter: "blur(12px)",
                                        borderRadius: "12px", border: "1px solid rgba(0, 86, 179, 0.15)",
                                        boxShadow: "0 10px 30px rgba(0,0,0,0.12)", p: 0.75
                                    }}>
                                        {[
                                            { id: "organisation", label: "संस्थागत (Organisation)" },
                                            { id: "individual", label: "व्यक्तिगत (Individual)" }
                                        ].map((item) => {
                                            const isCurrent = (item.id === "organisation" && formData.role === "organisation") || 
                                                              (item.id === "individual" && (formData.role === "teacher" || formData.role === "student"));
                                            return (
                                                <ListItemButton
                                                    key={item.id}
                                                    selected={isCurrent}
                                                    onClick={() => {
                                                        updateFormData({ role: item.id === "individual" ? "teacher" : "organisation" });
                                                        setIsRoleMenuOpen(false);
                                                        if (errors.role) setErrors(p => { const e = { ...p }; delete e.role; return e; });
                                                    }}
                                                >
                                                    <Typography sx={{ fontSize: "inherit", fontWeight: "inherit", lineHeight: "inherit", color: "inherit" }}>{item.label}</Typography>
                                                </ListItemButton>
                                            );
                                        })}
                                    </Box>
                                </Motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </Box>

                {/* Sub-role Buttons on the same line */}
                <AnimatePresence mode="wait">
                    {(formData.role === "teacher" || formData.role === "student") && (
                        <Motion.div 
                            key="sub-roles"
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            style={{ flex: 1.9, display: "flex", gap: "8px" }}
                        >
                            {[
                                { id: "teacher", label: "शिक्षक" },
                                { id: "student", label: "विद्यार्थी" }
                            ].map((item) => (
                                <Box
                                    key={item.id}
                                    onClick={() => updateFormData({ role: item.id })}
                                    sx={{
                                        flex: 1, height: "45px", display: "flex", alignItems: "center", justifyContent: "center",
                                        borderRadius: "8px", border: "1.5px solid",
                                        borderColor: formData.role === item.id ? "#28a745" : "#e2e8f0",
                                        bgcolor: formData.role === item.id ? "rgba(40, 167, 69, 0.04)" : "#f8fafc",
                                        cursor: "pointer", transition: "all 0.2s ease",
                                        "&:hover": { borderColor: formData.role === item.id ? "#28a745" : "#cbd5e1" }
                                    }}
                                >
                                    <Typography sx={{ fontWeight: 800, color: formData.role === item.id ? "#28a745" : "#64748b", fontSize: "13px" }}>
                                        {item.label}
                                    </Typography>
                                </Box>
                            ))}
                        </Motion.div>
                    )}
                </AnimatePresence>
            </Box>
        </Box>
        {errors.role && <Typography sx={{ color: "#ef4444", fontSize: "11px", mt: -0.5 }}>{errors.role}</Typography>}

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", mt: 0 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600, color: "#334155", fontSize: "13px" }}>
                पासवर्ड
            </Typography>
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
                }
              }}
            />
          </Box>

          <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600, color: "#334155", fontSize: "13px" }}>
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
              sx={fieldSx}
              />
          </Box>
        </Box>

        {/* Validation Indicators moved below the row */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <AnimatePresence>
            {passwordFilled && (
              <Motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <Box sx={{ display: "flex", gap: 0.5, flex: 1 }}>
                        {RULES.map((_, i) => (
                          <Box key={i} sx={{ flex: 1, height: 2.5, borderRadius: "99px", bgcolor: i < strength.score ? strength.color : "#e2e8f0", transition: "background-color 0.3s ease" }} />
                        ))}
                    </Box>
                    {strength.label && (
                        <Typography sx={{ fontSize: "10px", fontWeight: 700, color: strength.color, whiteSpace: "nowrap" }}>
                            {strength.label}
                        </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 8px" }}>
                      {RULES.map((rule) => (
                          <RuleRow
                              key={rule.id}
                              passed={rule.test(formData.password || "")}
                              label={rule.label}
                          />
                      ))}
                      <RuleRow
                          passed={formData.confirmPassword ? formData.password === formData.confirmPassword : false}
                          label={formData.confirmPassword
                              ? (formData.password === formData.confirmPassword ? "पासवर्ड मेल खाते हैं" : "पासवर्ड मेल नहीं खाते")
                              : "कंफर्म करें"}
                          color={formData.confirmPassword
                              ? (formData.password === formData.confirmPassword ? "#28a745" : "#ef4444")
                              : undefined}
                      />
                  </Box>
                </Box>
              </Motion.div>
            )}
          </AnimatePresence>

          {errors.confirmPassword && (
             <Typography sx={{ color: "#ef4444", fontSize: "11px", mt: 0.25 }}>{errors.confirmPassword}</Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      <Button
          fullWidth
          variant="contained" disableElevation
          disabled={isLoading || isCheckingUsername || usernameStatus === "taken"}
          onClick={handleContinue}
          sx={{
              py: 1.25,
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

      <Button
          variant="text"
          fullWidth
          disabled={isLoading}
          onClick={() => setStep(2)}
          sx={{ textTransform: "none", color: "#64748b", fontWeight: 600, fontSize: "14px" }}
      >
          ← वेरिफिकेशन पर वापस जाएं
      </Button>
    </Box>
  );
}
