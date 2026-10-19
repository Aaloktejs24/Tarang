import { Box, Typography }
    from "@mui/material";
import { CustomFloatingInput } from "../../../components/common/FloatingFields";
import { TextField, InputAdornment } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { validateEmail, validateUsername } from "../../../utils/validationUtils";
import TarangButton from "../../../components/common/TarangButton";
import { FormLoadingProvider } from '../../../contexts/FormLoadingContext';

export default function ForgotEmailStep({ setMode, onStartRecovery, isLoading, error, setError, success }) {
    const [target, setTarget] = useState("");
    const [fieldError, setFieldError] = useState("");

    return (
        <FormLoadingProvider isLoading={isLoading}>
        <Box sx={{ width: "var(--size-full)", display: "flex", flexDirection: "column", gap: 3 }}>
            <Box>
                <Typography variant="h5" sx={{ mb: 1, fontWeight: 800, color: "var(--color-slate-900)", letterSpacing: "-0.5px", fontSize: 'var(--font-2xl)' }}>
                    पासवर्ड भूल गए?
                </Typography>
                <Typography variant="body2" sx={{ color: "var(--color-slate-500)", fontSize: 'var(--font-base)', lineHeight: 1.5 }}>
                    पंजीकृत ईमेल दर्ज करें। OTP भेजा जाएगा।
                </Typography>
                
            </Box>

            <Box sx={{ mb: 1 }}>
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                    <CustomFloatingInput
                        label="ईमेल पता"

                        value={target}
                        onChange={(e) => {
                            setTarget(e.target.value);
                            if (error) setError("");
                            if (fieldError) setFieldError("");
                        }}
                        error={!!fieldError}
                        helperText={fieldError}

                        InputProps={{

                        }}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                "& input": { color: "var(--color-slate-900)" }
                            },
                            "& .MuiOutlinedInput-input": { padding: "12px 14px", fontSize: 'var(--font-base)' },
                        }}
                    />
                    <TarangButton
                        loading={isLoading}
                        disabled={isLoading || !target}
                        onClick={() => {
                            const err = validateEmail(target);
                            if (err) { setFieldError(err); return; }
                            onStartRecovery(target);
                        }}
                        sx={{ height: 'var(--box-height)', px: 3, whiteSpace: 'nowrap' }}
                    >
                        {"OTP भेजें"}
                    </TarangButton>
                </Box>
            </Box>



            <Typography variant="body2" sx={{ textAlign: "center", color: "var(--color-slate-500)", mt: 1 }}>
                क्या आपको अपना पासवर्ड याद है?{" "}
                <Box
                    component="span"
                    sx={{ color: "var(--color-primary)", fontWeight: 'var(--font-semibold)', cursor: "pointer", ml: 0.5, "&:hover": { textDecoration: "none" } }}
                    onClick={() => { setMode("login"); setError(""); }}
                >
                    लॉगिन पर वापस जाएं
                </Box>
            </Typography>
        </Box>
        </FormLoadingProvider>
    );
}
