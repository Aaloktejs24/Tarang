import { Box, Typography }
    from "@mui/material";
import { CustomFloatingInput } from "../../../components/common/CustomFloatingFields";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import CustomCheckbox from "../../../components/common/CustomCheckbox";
import EmailIcon from "@mui/icons-material/Email";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LockIcon from "@mui/icons-material/Lock";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useTranslation } from "../../../hooks/useTranslation";
import { validateEmail, validateUsername, validatePassword } from "../../../utils/validationUtils";
import TarangButton from "../../../components/common/TarangButton";
import AuthMessage from "./AuthMessage";

export default function LoginStep({ setStep, setMode, formData, updateFormData, onLogin, isLoading, error, setError, success, setSuccess }) {
    const [showPassword, setShowPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const { t } = useTranslation();

    const validateFields = () => {
        const errors = {};
        const loginId = formData.email || "";

        if (!loginId) {
            errors.email = true;
        } else if (loginId.includes('@')) {
            const err = validateEmail(loginId);
            if (err) errors.email = err;
        } else {
            const err = validateUsername(loginId);
            if (err) errors.email = err;
        }

        if (!formData.password) {
            errors.password = true;
        } else {
            const passErr = validatePassword(formData.password);
            if (passErr) errors.password = passErr;
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    return (
        <Box sx={{ width: "var(--size-full)", display: "flex", flexDirection: "column", gap: 3 }}>
            <Box>
                <Typography variant="h5" sx={{ mb: 1, fontWeight: 800, color: "var(--color-slate-900)", letterSpacing: "-0.5px", fontSize: 'var(--font-2xl)' }}>
                    {t('auth.loginTitle')}
                </Typography>
                <Typography variant="body2" sx={{ color: "var(--color-slate-500)", fontSize: 'var(--font-base)', lineHeight: 1.5 }}>
                    {t('auth.loginSubtitle')}
                </Typography>
                <AnimatePresence mode="wait">
                    {(error || success) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            style={{ overflow: "hidden" }}
                        >
                            {error ? (
                                <AuthMessage type="error" message={error} />
                            ) : (
                                <AuthMessage type="success" message={success} />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box>
                    <CustomFloatingInput
                        label={t('auth.emailOrUsername')}

                        value={formData.email}
                        onChange={(e) => {
                            updateFormData({ email: e.target.value });
                            if (error) setError("");
                            if (success) setSuccess("");
                            if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: "" }));
                        }}
                        error={!!fieldErrors.email}
                        helperText={fieldErrors.email}
                        InputProps={{

                        }}
                        sx={{
                            "& .MuiOutlinedInput-input": { padding: "12px 14px", fontSize: 'var(--font-base)' },
                        }}
                    />
                </Box>

                <Box>
                    <CustomFloatingInput
                        label={t('auth.password')}

                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => {
                            updateFormData({ password: e.target.value });
                            if (error) setError("");
                            if (success) setSuccess("");
                            if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: "" }));
                        }}
                        error={!!fieldErrors.password}
                        helperText={fieldErrors.password}
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
                            "& .MuiOutlinedInput-input": { padding: "12px 14px", fontSize: 'var(--font-base)' },
                        }}
                    />
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <CustomCheckbox
                        checked={formData.rememberMe || false}
                        onChange={(e) => updateFormData({ rememberMe: e.target.checked })}
                        label={<Typography variant="body2" sx={{ color: "var(--color-slate-500)", fontSize: 13.5, fontWeight: 'var(--font-medium)' }}>{t('auth.rememberMe')}</Typography>}
                    />
                    <Typography
                        onClick={() => { setMode("forgot_password"); setStep(1); setError(""); }}
                        sx={{ fontSize: 13.5, color: "var(--color-primary)", fontWeight: 'var(--font-semibold)', cursor: "pointer", "&:hover": { textDecoration: "none" } }}
                    >
                        {t('auth.forgotPassword')}
                    </Typography>
                </Box>
            </Box>



            <TarangButton
                fullWidth
                loading={isLoading}
                disabled={isLoading}
                onClick={async () => {
                    setError("");
                    if (!validateFields()) return;
                    try {
                        await onLogin(formData.email, formData.password);
                    } catch {
                        // Error handled in LoginForm
                    }
                }}
                sx={{ height: 'var(--box-height)' }}
            >
                {t('auth.loginTitle')}
            </TarangButton>

            <Typography variant="body2" sx={{ textAlign: "center", color: "var(--color-slate-500)" }}>
                {t('auth.noAccount')} {" "}
                <Box
                    component="span"
                    sx={{ color: "var(--color-primary)", fontWeight: 'var(--font-semibold)', cursor: "pointer", "&:hover": { textDecoration: "none" } }}
                    onClick={() => { setMode("register"); setStep(1); }}
                >
                    {t('auth.registerHere')}
                </Box>
            </Typography>
        </Box>
    );
}
