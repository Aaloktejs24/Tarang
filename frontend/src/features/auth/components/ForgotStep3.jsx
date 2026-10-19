import { Box, Typography, TextField, Button, InputAdornment, IconButton } from "@mui/material";
import { motion as Motion, AnimatePresence } from "framer-motion";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LockIcon from "@mui/icons-material/Lock";
import CheckIcon from "@mui/icons-material/Check";
import { useState, useEffect } from "react";
import Loader from "../../../components/common/Loader";

const RULES = [
    { id: "len", label: "कम से कम 8 अक्षर", test: (p) => p.length >= 8 },
    { id: "upper", label: "एक बड़ा अक्षर (A–Z)", test: (p) => /[A-Z]/.test(p) },
    { id: "lower", label: "एक छोटा अक्षर (a–z)", test: (p) => /[a-z]/.test(p) },
    { id: "number", label: "एक नंबर (0–9)", test: (p) => /\d/.test(p) },
    { id: "special", label: "एक विशेष अक्षर (@$!%*?&)", test: (p) => /[@$!%*?&]/.test(p) },
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
    if (passed <= 2) return { score: passed, label: "कमज़ोर", color: "#ef4444" };
    if (passed <= 3) return { score: passed, label: "ठीक है", color: "#ffc107" };
    if (passed === 4) return { score: passed, label: "अच्छा", color: "#0056b3" };
    return { score: 5, label: "मज़बूत", color: "#28a745" };
}

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

    const strength = getStrength(password || "");
    const allRulesPassed = RULES.every((r) => r.test(password || ""));
    const isInvalid = !allRulesPassed || password !== confirmPassword || password === "";

    if (success) {
        return (
            <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2, textAlign: "center", py: 4 }}>
                <Box sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    bgcolor: "rgba(16, 185, 129, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    mb: 1,
                    border: "2px solid rgba(16, 185, 129, 0.2)",
                }}>
                    <CheckCircleIcon sx={{ fontSize: 48, color: "rgba(16, 185, 129, 0.9)" }} />
                </Box>
                <Box>
                    <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px", fontSize: "28px" }}>
                        सब तैयार है!
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b", fontSize: "15px", mb: 2, lineHeight: 1.5 }}>
                        आपका पासवर्ड सफलतापूर्वक रीसेट कर दिया गया है।
                    </Typography>
                </Box>
                <Button
                    fullWidth
                    variant="contained" disableElevation
                    onClick={() => {
                        setMode("login");
                        setStep(1);
                    }}
                    sx={{
                        height: "48px",
                        borderRadius: "8px",
                        textTransform: "none",
                        fontSize: "16px",
                        fontWeight: 700,
                        background: "linear-gradient(135deg, #28a745 0%, #218838 100%)",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                            background: "linear-gradient(135deg, #218838 0%, #1e7e34 100%)",
                            },
                        }}
                >
                    लॉगिन पर वापस जाएं
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
                <Typography variant="h5" sx={{ mb: 1, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px", fontSize: "28px" }}>
                    पासवर्ड रीसेट करें
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b", mb: 1, fontSize: "15px", lineHeight: 1.5 }}>
                    अपने अकाउंट के लिए एक मज़बूत नया पासवर्ड चुनें।
                </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#334155", fontSize: "14px" }}>
                        नया पासवर्ड
                    </Typography>
                    <TextField
                        fullWidth
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="पासवर्ड"
                        size="medium"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Box sx={{ mr: 1, color: "#94a3b8", display: "flex", alignItems: "center" }}>
                                        <LockIcon sx={{ fontSize: 20 }} />
                                    </Box>
                                </InputAdornment>
                            )
                        }}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                backgroundColor: "#f8fafc",
                                borderRadius: "8px",
                                transition: "all 0.2s ease-in-out",
                                "& fieldset": { borderColor: "#e2e8f0" },
                                "&:hover fieldset": { borderColor: "#cbd5e1" },
                                "&.Mui-focused fieldset": { borderColor: "#0056b3", borderWidth: "1.5px" },
                                "& input": { color: "#0f172a" }
                            },
                            "& .MuiOutlinedInput-input": { padding: "12px 14px", fontSize: "15px" },
                        }}
                    />
                </Box>

                <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#334155", fontSize: "14px" }}>
                        पासवर्ड की पुष्टि करें
                    </Typography>
                    <TextField
                        fullWidth
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="पासवर्ड"
                        size="medium"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Box sx={{ mr: 1, color: "#94a3b8", display: "flex", alignItems: "center" }}>
                                        <LockIcon sx={{ fontSize: 20 }} />
                                    </Box>
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <VisibilityOff sx={{ fontSize: 20, color: "#94a3b8" }} /> : <Visibility sx={{ fontSize: 20, color: "#94a3b8" }} />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                backgroundColor: "#f8fafc",
                                borderRadius: "8px",
                                transition: "all 0.2s ease-in-out",
                                "& fieldset": { borderColor: "#e2e8f0" },
                                "&:hover fieldset": { borderColor: "#cbd5e1" },
                                "&.Mui-focused fieldset": { borderColor: "#0056b3", borderWidth: "1.5px" },
                                "& input": { color: "#0f172a" }
                            },
                            "& .MuiOutlinedInput-input": { padding: "12px 14px", fontSize: "15px" },
                        }}
                    />
                </Box>
            </Box>

            {/* Validation Indicators */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <AnimatePresence>
                    {password.length > 0 && (
                        <Motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
                            <Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
                                    <Box sx={{ display: "flex", gap: 0.5, flex: 1 }}>
                                        {RULES.map((_, i) => (
                                            <Box key={i} sx={{ flex: 1, height: 3, borderRadius: "99px", bgcolor: i < strength.score ? strength.color : "#e2e8f0", transition: "background-color 0.3s ease" }} />
                                        ))}
                                    </Box>
                                    {strength.label && (
                                        <Typography sx={{ fontSize: "11px", fontWeight: 700, color: strength.color, whiteSpace: "nowrap" }}>
                                            {strength.label}
                                        </Typography>
                                    )}
                                </Box>
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
                                            ? (password === confirmPassword ? "#28a745" : "#ef4444")
                                            : undefined}
                                    />
                                </Box>
                            </Box>
                        </Motion.div>
                    )}
                </AnimatePresence>
            </Box>

            {/* Message Area with Fixed Height to prevent layout shifts */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AnimatePresence mode="wait">
                    {error && (
                        <Motion.div
                            key="error"
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                        >
                            <Typography variant="body2" sx={{ color: "#ef4444 !important", fontSize: "14px", fontWeight: 600 }}>
                                {error}
                            </Typography>
                        </Motion.div>
                    )}
                </AnimatePresence>
            </Box>

            <Button
                fullWidth
                variant="contained" disableElevation
                disabled={isLoading || isInvalid}
                onClick={() => onResetPassword(password)}
                sx={{
                    height: "48px",
                    mt: 1,
                    borderRadius: "8px",
                    textTransform: "none",
                    fontSize: "16px",
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #0056b3 0%, #28a745 100%)",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                        background: "linear-gradient(135deg, #004494 0%, #218838 100%)",
                        },
                    
                    "&.Mui-disabled": { background: "#e2e8f0", color: "#94a3b8" }
                }}
            >
                {isLoading ? <Loader mini /> : "पासवर्ड रीसेट करें"}
            </Button>

            <Button
                variant="text"
                fullWidth
                disabled={isLoading}
                onClick={() => { setStep(2); }}
                sx={{ textTransform: "none", color: "#64748b", fontWeight: 600, fontSize: "14.5px", mt: 0.5, height: "44px" }}
            >
                ← वेरिफिकेशन पर वापस जाएं
            </Button>

            <Button
                variant="text"
                fullWidth
                onClick={() => { setMode("login"); setStep(1); }}
                sx={{ textTransform: "none", color: "#64748b", fontWeight: 600, fontSize: "14.5px", mt: 0.5, height: "44px" }}
            >
                रद्द करें और लॉगिन करें
            </Button>
        </Box>
    );
}
