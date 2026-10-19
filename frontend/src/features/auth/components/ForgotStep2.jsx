import { Box, Typography, Button } from "@mui/material";
import OtpInput from "./OtpInput";
import { motion as Motion, AnimatePresence } from "framer-motion";
import Loader from "../../../components/common/Loader";

import { useEffect } from "react";

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
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 800, color: "#0f172a", letterSpacing: "-1px" }}>
                    OTP वेरीफाई करें
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b", mb: 3, fontSize: "15px" }}>
                    हमने <span style={{ color: "#0f172a", fontWeight: 700 }}>{maskedEmail || formData.email}</span> पर एक वेरिफिकेशन कोड भेजा है
                </Typography>
            </Box>

            <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#334155", fontSize: "14px" }}>
                    वेरिफिकेशन कोड
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

            {/* Message Area with Fixed Height to prevent layout shifts */}
            <Box sx={{ minHeight: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                    {!error && success && (
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

            <Button
                fullWidth
                variant="contained" disableElevation
                disabled={isLoading || formData.otp.length < 6}
                onClick={() => { setError(""); setSuccess(""); setStep(3); }}
                sx={{
                    py: 1.5,
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
                {isLoading ? <Loader mini /> : "वेरीफाई करें और जारी रखें"}
            </Button>

            <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" sx={{ color: "#64748b", fontSize: "14px" }}>
                    कोड नहीं मिला?{" "}
                    <Box
                        component="span"
                        sx={{
                            color: (resendTimer > 0 || isLoading) ? "#94a3b8" : "#0056b3",
                            fontWeight: 600,
                            cursor: (resendTimer > 0 || isLoading) ? "default" : "pointer",
                            ml: 0.5,
                            "&:hover": { textDecoration: (resendTimer > 0 || isLoading) ? "none" : "underline" }
                        }}
                        onClick={() => {
                            if (resendTimer === 0 && !isLoading) {
                                handleResendClick();
                            }
                        }}
                    >
                        {resendTimer > 0 ? `फिर से भेजें (${resendTimer}s)` : "फिर से भेजें"}
                    </Box>
                </Typography>
            </Box>

            <Button
                variant="text"
                fullWidth
                onClick={() => { resetOtp(); setError(""); setSuccess(""); setStep(1); }}
                sx={{ textTransform: "none", color: "#64748b", fontWeight: 600, fontSize: "14px", mt: 1 }}
            >
                ← रिकवरी पर वापस जाएं
            </Button>
        </Box>
    );
}
