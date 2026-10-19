import { Box, Typography } from "@mui/material";
import { getMaskedEmail } from "../../../utils/maskUtils";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import OtpInput from "./OtpInput";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import TarangButton from "../../../components/common/TarangButton";
import AuthMessage from "./AuthMessage";

export default function LoginOtpStep({ setStep, formData, updateFormData, handleFinalSubmit, isLoading, error, setError, onResendOtp, resendTimer, success, setSuccess, maskedEmail, mfaType }) {

    useEffect(() => {
        if (!formData?.email || !formData?.sessionId) setStep(1);
    }, [formData, setStep]);

    const isTotp = mfaType === "totp";

    return (
        <Box sx={{ width: "var(--size-full)", display: "flex", flexDirection: "column", gap: 3 }}>
            <Box>
                <Typography variant="h5" sx={{ mb: 1, fontWeight: 800, color: "var(--color-slate-900)", letterSpacing: "-0.5px", fontSize: 'var(--font-2xl)' }}>
                    {isTotp ? "सुरक्षा कोड" : "अकाउंट वेरीफाई करें"}
                </Typography>
                <Typography variant="body2" sx={{ color: "var(--color-slate-500)", fontSize: 'var(--font-base)' }}>
                    {isTotp
                        ? "जारी रखने के लिए अपने ऑथेंटिकेटर ऐप से 6-अंकों का कोड डालें।"
                        : <>हमने <span style={{ color: "var(--color-slate-900)", fontWeight: 'var(--font-bold)' }}>{getMaskedEmail(maskedEmail || formData.email)}</span> पर एक वेरिफिकेशन कोड भेजा है</>
                    }
                </Typography>
            </Box>



            <Box>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 'var(--font-semibold)', color: "var(--color-slate-700)", fontSize: 'var(--font-sm)' }}>
                    {isTotp ? "ऑथेंटिकेटर कोड" : "वेरिफिकेशन कोड"}
                </Typography>
                <OtpInput
                    value={formData.otp}
                    onChange={(val) => {
                        updateFormData({ otp: val });
                        if (error) setError("");
                    }}
                    isLoading={isLoading}
                    error={!!error}
                />
            </Box>

            <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
                <TarangButton
                    variant="outlined"
                    disabled={isLoading}
                    onClick={() => {
                        setError("");
                        setSuccess("");
                        updateFormData({ otp: "", password: "" });
                        setStep(1);
                    }}
                    sx={{ flex: 1, height: 'var(--box-height)' }}
                >
                    वापस जाएं
                </TarangButton>

                <TarangButton
                    loading={isLoading}
                    disabled={isLoading || formData.otp.length < 6}
                    onClick={handleFinalSubmit}
                    sx={{ flex: 1, height: 'var(--box-height)' }}
                >
                    वेरीफाई करें
                </TarangButton>
            </Box>

            {!isTotp && (
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1, minHeight: "32px" }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <AnimatePresence mode="wait">
                            {(error || success) && (
                                <motion.div key={error ? "error" : "success"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: "center" }}>
                                    {error ? (
                                        <AuthMessage type="error" message={error} />
                                    ) : (
                                        <AuthMessage type="success" message={success} />
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Box>
                    <TarangButton
                        variant="text"
                        size="sm"
                        disabled={isLoading || resendTimer > 0}
                        onClick={() => {
                            if (resendTimer === 0 && !isLoading) {
                                onResendOtp();
                            }
                        }}
                        sx={{ color: resendTimer > 0 ? '#64748b !important' : '#0056b3 !important' }}
                    >
                        {resendTimer > 0 ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <AccessTimeIcon sx={{ fontSize: 'var(--font-lg)', position: 'relative', top: '-1px' }} />
                                <Box component="div" sx={{ fontSize: '14.5px', fontWeight: 'var(--font-semibold)' }}>
                                    {resendTimer.toString().padStart(2, '0')}s में एप्रकू फिर से भेजें
                                </Box>
                            </Box>
                        ) : "एप्रकू फिर से भेजें"}
                    </TarangButton>
                </Box>
            )}
        </Box>
    );
}