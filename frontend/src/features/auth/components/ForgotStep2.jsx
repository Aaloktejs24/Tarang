import { Box, Typography } from "@mui/material";
import { getMaskedEmail } from "../../../utils/maskUtils";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import OtpInput from "./OtpInput";
import { motion, AnimatePresence } from "framer-motion";

import { useEffect } from "react";
import TarangButton from "../../../components/common/TarangButton";
import { FormLoadingProvider } from '../../../contexts/FormLoadingContext';

export default function ForgotStep2({ setStep, formData, updateFormData, isLoading, error, setError, onResendOtp, resendTimer, resetOtp, success, setSuccess, maskedEmail }) {
    useEffect(() => {
        if (!formData?.email) setStep(1);
    }, [formData, setStep]);

    const handleResendClick = () => {
        if (onResendOtp) {
            onResendOtp();
        }
    };

    return (
        <FormLoadingProvider isLoading={isLoading}>
        <Box sx={{ width: "var(--size-full)", display: "flex", flexDirection: "column", gap: 3 }}>
            <Box>
                <Typography variant="h5" sx={{ mb: 1, fontWeight: 800, color: "var(--color-slate-900)", letterSpacing: "-0.5px", fontSize: 'var(--font-2xl)' }}>
                    OTP वेरीफाई करें
                </Typography>
                <Typography variant="body2" sx={{ color: "var(--color-slate-500)", fontSize: 'var(--font-base)', lineHeight: 1.5 }}>
                    हमने <span style={{ color: "var(--color-slate-900)", fontWeight: 'var(--font-bold)' }}>{getMaskedEmail(maskedEmail || formData.email)}</span> पर एक वेरिफिकेशन कोड भेजा है
                </Typography>
            </Box>

            

            <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'var(--font-semibold)', color: "var(--color-slate-900)", fontSize: 'var(--font-sm)' }}>
                    वेरिफिकेशन कोड
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <OtpInput
                        value={formData.otp}
                        onChange={(val) => {
                            updateFormData({ otp: val });
                            if (error) setError("");
                        }}
                        isLoading={isLoading}
                        error={!!error}
                    />
                    <TarangButton
                        variant="text"
                        size="sm"
                        disabled={isLoading || resendTimer > 0}
                        onClick={() => {
                            if (resendTimer === 0 && !isLoading) {
                                handleResendClick();
                            }
                        }}
                        sx={{ color: 'var(--color-primary)', p: 0, minWidth: 'auto', minHeight: 'auto', '&.Mui-disabled': { color: 'var(--color-primary)', opacity: 0.8 }, '&:hover': { background: 'transparent', textDecoration: 'underline' }, whiteSpace: 'nowrap' }}
                    >
                        {resendTimer > 0 ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <AccessTimeIcon sx={{ fontSize: 'var(--font-sm)' }} />
                                <Box component="div" sx={{ fontSize: '13px', fontWeight: 'var(--font-semibold)' }}>
                                    {resendTimer.toString().padStart(2, '0')}s फिर से भेजें
                                </Box>
                            </Box>
                        ) : "फिर से भेजें"}
                    </TarangButton>
                </Box>
            </Box>



            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.5 }}>
                <TarangButton
                    variant="outlined"
                    disabled={isLoading}
                    onClick={() => { resetOtp(); setError(""); setSuccess(""); setStep(1); }}
                    sx={{ flex: 1, height: 'var(--box-height)' }}
                >
                    वापस जाएं
                </TarangButton>

                <TarangButton
                    loading={isLoading}
                    disabled={isLoading || formData.otp.length < 6}
                    onClick={() => { setError(""); setSuccess(""); setStep(3); }}
                    sx={{ flex: 1, height: 'var(--box-height)' }}
                >
                    {"वेरीफाई करें और जारी रखें"}
                </TarangButton>
            </Box>


        </Box>
        </FormLoadingProvider>
    );
}
