import { Box, Typography, Button } from "@mui/material";
import OtpInput from "./OtpInput";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import Loader from "../../../components/common/Loader";
import { useEffect } from "react";

export default function LoginOtpStep({ setStep, formData, updateFormData, handleFinalSubmit, isLoading, error, setError, onResendOtp, resendTimer, success, setSuccess, maskedEmail, mfaType }) {

    useEffect(() => {
        if (!formData?.email || !localStorage.getItem("temp_token")) setStep(1);
    }, [formData, setStep]);

    const isTotp = mfaType === "totp";

    return (
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 800, color: "#0f172a", letterSpacing: "-1px" }}>
                    {isTotp ? "सुरक्षा कोड" : "OTP वेरीफाई करें"}
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b", mb: 0, fontSize: "15px" }}>
                    {isTotp
                        ? "जारी रखने के लिए अपने ऑथेंटिकेटर ऐप से 6-अंकों का कोड डालें।"
                        : <>हमने <span style={{ color: "#0f172a", fontWeight: 700 }}>{maskedEmail || formData.email}</span> पर एक वेरिफिकेशन कोड भेजा है</>
                    }
                </Typography>
            </Box>

            {/* Message Area with Fixed Height to prevent layout shifts */}
            <Box sx={{display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                        >
                            <Typography variant="body2" sx={{ color: "#ef4444 !important", fontSize: "14px", fontWeight: 600 }}>
                                {error}
                            </Typography>
                        </motion.div>
                    )}
                    {!error && success && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                        >
                            <Typography variant="body2" sx={{ color: "#28a745", fontSize: "14px", fontWeight: 600 }}>
                                {success}
                            </Typography>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Box>

            <Box>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600, color: "#334155", fontSize: "14px" }}>
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

            <Button
                fullWidth
                variant="contained" disableElevation
                disabled={isLoading || formData.otp.length < 6}
                onClick={handleFinalSubmit}
                sx={{
                    py: 1.5,
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
                {isLoading ? <Loader mini /> : (isTotp ? "वेरीफाई करें और साइन इन करें" : "वेरीफाई करें और साइन इन करें")}
            </Button>

            {!isTotp && (
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
                                    onResendOtp();
                                }
                            }}
                        >
                            {resendTimer > 0 ? `फिर से भेजें (${resendTimer}s)` : "फिर से भेजें"}
                        </Box>
                    </Typography>
                </Box>
            )}

            <Button
                variant="text"
                fullWidth
                onClick={() => {
                    setError("");
                    setSuccess("");
                    updateFormData({ otp: "", password: "" });
                    setStep(1);
                }}
                sx={{ textTransform: "none", color: "#64748b", fontWeight: 600, fontSize: "14px", mt: 1 }}
            >
                ← साइन इन पर वापस जाएं
            </Button>
        </Box>
    );
}