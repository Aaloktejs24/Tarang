import { Box, Typography, Button } from "@mui/material";
import OtpInput from "./OtpInput";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import Loader from "../../../components/common/Loader";
import { useEffect } from "react";

export default function RegisterOtpStep({ setStep, formData, updateFormData, error, setError, isLoading, onResendOtp, onVerifyOtp, resendTimer, success, setSuccess, maskedEmail }) {

  useEffect(() => {
    if (!formData?.email) setStep(1);
  }, [formData, setStep]);

  const handleResend = async () => {
    if (onResendOtp) {
      onResendOtp();
    }
  };

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>

      <Box>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 800, color: "#0f172a", letterSpacing: "-1px" }}>
          ईमेल वेरीफाई करें
        </Typography>

        <Typography variant="body2" sx={{ color: "#64748b", mb: 3, fontSize: "15px" }}>
          हमने <span style={{ color: "#0f172a", fontWeight: 700 }}>{maskedEmail || formData.email}</span> पर एक वेरिफिकेशन कोड भेजा है
        </Typography>
      </Box>



      {/* Message Area with Fixed Height to prevent layout shifts */}
      <Box sx={{ minHeight: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
          ईमेल वेरिफिकेशन कोड
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

      {formData.verifyPhone && formData.phone && (
        <Box>
          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600, color: "#334155", fontSize: "14px" }}>
            फ़ोन वेरिफिकेशन कोड
          </Typography>
          <OtpInput
            value={formData.phoneOtp || ""}
            onChange={(val) => {
              updateFormData({ phoneOtp: val });
              if (error) setError("");
            }}
            isLoading={isLoading}
            error={!!error}
          />
        </Box>
      )}

      <Button
        fullWidth
        variant="contained" disableElevation
        disabled={isLoading || formData.otp.length < 6 || (formData.verifyPhone && (formData.phoneOtp || "").length < 6)}
        onClick={async () => {
          if (onVerifyOtp) {
            await onVerifyOtp();
          } else {
            setError(""); setSuccess(""); setStep(3);
          }
        }}
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
        {isLoading ? <Loader mini /> : "कोड वेरीफाई करें"}
      </Button>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
        <Button
          variant="text"
          disabled={isLoading}
          onClick={() => { updateFormData({ otp: "", password: "", confirmPassword: "", phoneOtp: "" }); setError(""); setSuccess(""); setStep(1); }}
          sx={{ textTransform: "none", color: "#64748b", fontWeight: 600, fontSize: "14px" }}
        >
          ← ईमेल बदलें
        </Button>

        <Button
          variant="text"
          disabled={isLoading || resendTimer > 0}
          onClick={handleResend}
          sx={{
            textTransform: "none",
            color: (resendTimer > 0) ? "#94a3b8" : "#0056b3",
            fontWeight: 700,
            fontSize: "14px",
            "&:hover": { textDecoration: (resendTimer > 0) ? "none" : "underline" }
          }}
        >
          {resendTimer > 0 ? `कोड फिर से भेजें (${resendTimer}s)` : "कोड फिर से भेजें"}
        </Button>
      </Box>

    </Box>
  );
}