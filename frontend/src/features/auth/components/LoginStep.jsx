import { Box, Typography, TextField, Button, InputAdornment, Checkbox, FormControlLabel, IconButton } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LockIcon from "@mui/icons-material/Lock";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Loader from "../../../components/common/Loader";
import { useTranslation } from "../../../hooks/useTranslation";

export default function LoginStep({ setStep, setMode, formData, updateFormData, onLogin, isLoading, error, setError, success, setSuccess }) {
    const [showPassword, setShowPassword] = useState(false);
    const { t } = useTranslation();

    return (
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 3 }}>
            <Box>
                <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px", fontSize: "28px" }}>
                    {t('auth.loginTitle')}
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b", fontSize: "15px", lineHeight: 1.5 }}>
                    {t('auth.loginSubtitle')}
                </Typography>
            </Box>

            <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#334155", fontSize: "14px" }}>
                    {t('auth.emailOrUsername')}
                </Typography>
                <TextField
                    fullWidth
                    value={formData.email}
                    onChange={(e) => {
                        updateFormData({ email: e.target.value });
                        if (error) setError("");
                        if (success) setSuccess("");
                    }}
                    placeholder={t('auth.emailPlaceholder')}
                    size="medium"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Box sx={{ mr: 1, color: "#94a3b8", display: "flex", alignItems: "center" }}>
                                    <EmailIcon sx={{ fontSize: 20 }} />
                                </Box>
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
                        },
                        "& .MuiOutlinedInput-input": { padding: "12px 14px", fontSize: "15px" },
                    }}
                />
            </Box>

            <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#334155", fontSize: "14px" }}>
                    {t('auth.password')}
                </Typography>
                <TextField
                    fullWidth
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => {
                        updateFormData({ password: e.target.value });
                        if (error) setError("");
                        if (success) setSuccess("");
                    }}
                    placeholder={t('auth.passwordPlaceholder')}
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
                        },
                        "& .MuiOutlinedInput-input": { padding: "12px 14px", fontSize: "15px" },
                    }}
                />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <FormControlLabel
                    control={
                        <Checkbox
                            size="small"
                            checked={formData.rememberMe || false}
                            onChange={(e) => updateFormData({ rememberMe: e.target.checked })}
                            sx={{ color: "#cbd5e1", "&.Mui-checked": { color: "#0056b3" }, p: 0.5 }}
                        />
                    }
                    label={<Typography variant="body2" sx={{ color: "#64748b", fontSize: 13.5, fontWeight: 500 }}>{t('auth.rememberMe')}</Typography>}
                    sx={{ m: 0, gap: 0.5 }}
                />
                <Typography
                    onClick={() => { setMode("forgot_password"); setStep(1); setError(""); }}
                    sx={{ fontSize: 13.5, color: "#0056b3", fontWeight: 600, cursor: "pointer", "&:hover": { textDecoration: "none" } }}
                >
                    {t('auth.forgotPassword')}
                </Typography>
            </Box>

            {/* Message Area with Fixed Height to prevent layout shifts */}
            {(error || (success && !error)) && (
                <Box sx={{ height: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                        {success && !error && (
                            <Motion.div
                                key="success"
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                            >
                                <Typography variant="body2" sx={{ color: "#28a745", fontSize: "14px", fontWeight: 600 }}>
                                    {success}
                                </Typography>
                            </Motion.div>
                        )}
                    </AnimatePresence>
                </Box>
            )}

            <Button
                fullWidth
                variant="contained" disableElevation
                disabled={isLoading}
                onClick={async () => {
                    setError("");
                    try {
                        await onLogin(formData.email, formData.password);
                    } catch {
                        // Error handled in LoginForm
                    }
                }}
                sx={{
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
                    
                    "&.Mui-disabled": { background: "#e2e8f0", color: "#94a3b8" }
                }}
            >
                {isLoading ? <Loader mini /> : t('auth.loginTitle')}
            </Button>

            <Typography variant="body2" sx={{ textAlign: "center", color: "#64748b" }}>
                {t('auth.noAccount')} {" "}
                <Box
                    component="span"
                    sx={{ color: "#0056b3", fontWeight: 600, cursor: "pointer", "&:hover": { textDecoration: "none" } }}
                    onClick={() => { setMode("register"); setStep(1); }}
                >
                    {t('auth.registerHere')}
                </Box>
            </Typography>
        </Box>
    );
}
