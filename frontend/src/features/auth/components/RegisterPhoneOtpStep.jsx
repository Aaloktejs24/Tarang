import { Box, Typography, TextField } from "@mui/material";
import { CustomFloatingInput } from "../../../components/common/FloatingFields";
import { useState } from "react";
import { confirmPhoneVerification } from "../authService";
import { translateAuthError, AUTH_ERRORS } from "../../../constants/errors";
import TarangButton from "../../../components/common/TarangButton";
import { FormLoadingProvider } from '../../../contexts/FormLoadingContext';

const fieldSx = {
    "& .MuiOutlinedInput-root": {
        "& input": { color: "var(--color-slate-900)", fontSize: 'var(--font-base)', letterSpacing: "5px", textAlign: "center", fontWeight: "var(--font-bold)" },
    },
    "& .MuiOutlinedInput-input": { padding: "12px 14px" },
};

export default function RegisterPhoneOtpStep({ setStep, formData, isLoading, setIsLoading, setError, setSuccess /* setMode */ }) {
    const [localOtp, setLocalOtp] = useState("");

    const handleVerify = async () => {
        setIsLoading(true);
        setError("");
        try {
            await confirmPhoneVerification(formData.registeredUserId, formData.phone, localOtp);
            setSuccess("फ़ोन नंबर सफलतापूर्वक वेरीफाई हो गया!");
            
            setStep(4);
        } catch (err) {
            setError(translateAuthError(err.response?.data?.error) || AUTH_ERRORS.GENERIC.INVALID_OTP);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkip = () => {
        setStep(4);
    };

    return (
        <FormLoadingProvider isLoading={isLoading}>
        <Box sx={{ width: "var(--size-full)", display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box>
                <Typography variant="h5" sx={{ mb: 1, fontWeight: 800, color: "var(--color-slate-900)", letterSpacing: "-0.5px", fontSize: 'var(--font-2xl)' }}>
                    फ़ोन वेरीफाई करें
                </Typography>
                <Typography variant="body2" sx={{ color: "var(--color-slate-500)", mb: 3, fontSize: 'var(--font-base)', lineHeight: 1.5 }}>
                    हमने <span style={{ color: "var(--color-slate-900)", fontWeight: 'var(--font-bold)' }}>{formData.phone}</span> पर एक वेरिफिकेशन कोड भेजा है
                </Typography>
            </Box>

            <Box>
                <CustomFloatingInput
                    label="वेरिफिकेशन कोड"
                    
                    value={localOtp}
                    onChange={(e) => setLocalOtp(e.target.value)}
                    
                />
            </Box>

            <TarangButton
                fullWidth
                loading={isLoading}
                disabled={isLoading || localOtp.length < 6}
                onClick={handleVerify}
                sx={{ height: 'var(--box-height)', mt: 1 }}
            >
                {"फ़ोन वेरीफाई करें"}
            </TarangButton>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                <TarangButton
                    variant="text"
                    disabled={isLoading}
                    onClick={handleSkip}
                    sx={{ color: 'var(--color-slate-500)', height: 'var(--box-height)' }}
                >
                    अभी के लिए छोड़ें
                </TarangButton>
            </Box>
        </Box>
        </FormLoadingProvider>
    );
}
