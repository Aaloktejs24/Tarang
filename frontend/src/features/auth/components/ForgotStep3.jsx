import { Box, Typography }
    from "@mui/material";
import { CustomFloatingInput } from "../../../components/common/CustomFloatingFields";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import { motion as Motion, AnimatePresence } from "framer-motion";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LockIcon from "@mui/icons-material/Lock";
import CheckIcon from "@mui/icons-material/Check";
import { useState, useEffect } from "react";
import { getPasswordStrength, RULES } from "../../../utils/validationUtils";
import { RuleRow, PasswordStrengthBars } from "../../../components/common/PasswordStrength";
import TarangButton from "../../../components/common/TarangButton";
import AuthMessage from "./AuthMessage";





export default function ForgotStep3({ formData, onResetPassword, isLoading, error, success, clearAlerts, setMode, setStep }) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Clear any stale success/error from previous steps on mount
    useEffect(() => {
        if (clearAlerts) clearAlerts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Flow Guard: Check if OTP is still present
    useEffect(() => {
        if (!formData?.otp) {
            setStep(2);
        }
    }, [formData, setStep]);

    const strength = getPasswordStrength(password || "");
    const allRulesPassed = RULES.every((r) => r.test(password || ""));
    const isInvalid = !allRulesPassed || password !== confirmPassword || password === "";

    if (success) {
        return (
            <Box sx={{ width: "var(--size-full)", display: "flex", flexDirection: "column", gap: 2, textAlign: "center", py: 4 }}>
                <Box sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 'var(--radius-full)',
                    bgcolor: "rgba(16, 185, 129, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    mb: 1,
                    border: "var(--border-thick) solid rgba(16, 185, 129, 0.2)",
                }}>
                    <CheckCircleIcon sx={{ fontSize: 48, color: "rgba(16, 185, 129, 0.9)" }} />
                </Box>
                <Box>
                    <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 'var(--font-extrabold)', color: "var(--color-slate-900)", letterSpacing: "-0.5px", fontSize: 'var(--font-2xl)' }}>
                        सब तैयार है!
                    </Typography>
                    <Typography variant="body2" sx={{ color: "var(--color-slate-500)", fontSize: 'var(--font-base)', mb: 2, lineHeight: 1.5 }}>
                        आपका पासवर्ड सफलतापूर्वक रीसेट कर दिया गया है।
                    </Typography>
                </Box>
                <TarangButton
                    fullWidth
                    variant="success"
                    onClick={() => { setMode("login"); setStep(1); }}
                    sx={{ height: 'var(--box-height)' }}
                >
                    लॉगिन पर वापस जाएं
                </TarangButton>
            </Box>
        );
    }

    return (
        <Box sx={{ width: "var(--size-full)", display: "flex", flexDirection: "column", gap: 3 }}>
            <Box>
                <Typography variant="h5" sx={{ mb: 1, fontWeight: 'var(--font-extrabold)', color: "var(--color-slate-900)", letterSpacing: "-0.5px", fontSize: 'var(--font-2xl)' }}>
                    पासवर्ड रीसेट करें
                </Typography>
                <Typography variant="body2" sx={{ color: "var(--color-slate-500)", fontSize: 'var(--font-base)', lineHeight: 1.5 }}>
                    अपने अकाउंट के लिए एक मज़बूत नया पासवर्ड चुनें।
                </Typography>
                <AnimatePresence mode="wait">
                    {(error || success) && (
                        <Motion.div key={error ? "error" : "success"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: "center" }}>
                            {error ? (
                                <AuthMessage type="error" message={error} />
                            ) : (
                                <AuthMessage type="success" message={success} />
                            )}
                        </Motion.div>
                    )}
                </AnimatePresence>
            </Box>

            <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                <Box sx={{ flex: 1 }}>
                    <CustomFloatingInput
                        label="नया पासवर्ड"

                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}

                        InputProps={{

                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <VisibilityOff sx={{ fontSize: 20, color: "var(--color-slate-500)" }} /> : <Visibility sx={{ fontSize: 20, color: "var(--color-slate-500)" }} />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                "& input": { color: "var(--color-slate-900)" }
                            },
                            "& .MuiOutlinedInput-input": { padding: "12px 14px", fontSize: 'var(--font-base)' },
                        }}
                    />
                </Box>
            </Box>

            {/* Validation Indicators */}
            <AnimatePresence>
                {password.length > 0 && (
                    <Motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} style={{ overflow: "hidden" }}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            <PasswordStrengthBars password={password} />
                            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px" }}>
                                {RULES.map((rule) => (
                                    <RuleRow
                                        key={rule.id}
                                        passed={rule.test(password || "")}
                                        label={rule.label}
                                    />
                                ))}
                                <RuleRow
                                    passed={confirmPassword ? password === confirmPassword : false}
                                    label={confirmPassword
                                        ? (password === confirmPassword ? "पासवर्ड मेल खाते हैं" : "पासवर्ड मेल नहीं खाते")
                                        : "पासवर्ड की पुष्टि करें"}
                                    color={confirmPassword
                                        ? (password === confirmPassword ? "var(--color-success)" : "var(--color-error)")
                                        : undefined}
                                />
                            </Box>
                        </Box>
                    </Motion.div>
                )}
            </AnimatePresence>



            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, mt: 1 }}>
                <TarangButton
                    variant="outlined"
                    disabled={isLoading}
                    onClick={() => setStep(2)}
                    sx={{ flex: 1, height: 'var(--box-height)' }}
                >
                    वापस जाएं
                </TarangButton>

                <TarangButton
                    loading={isLoading}
                    disabled={isLoading || isInvalid}
                    onClick={() => onResetPassword(password)}
                    sx={{ flex: 1, height: 'var(--box-height)' }}
                >
                    {"पासवर्ड रीसेट करें"}
                </TarangButton>
            </Box>

            <TarangButton variant="text" fullWidth onClick={() => { setMode("login"); setStep(1); }} sx={{ color: 'var(--color-slate-500)', mt: 0.5, height: 'var(--box-height)' }}>
                रद्द करें और लॉगिन करें
            </TarangButton>
        </Box>
    );
}
