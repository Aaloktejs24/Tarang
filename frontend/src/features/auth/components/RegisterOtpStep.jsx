import { Box, Typography, Button } from "@mui/material";
import OtpInput from "./OtpInput";
 
import { motion, AnimatePresence } from "framer-motion";
import Loader from "../../../components/common/Loader";
import { useEffect } from "react";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { getMaskedEmail } from "../../../utils/maskUtils";

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
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px", fontSize: "28px" }}>
          ईमेल वेरीफाई करें
        </Typography>

        <Typography variant="body2" sx={{ color: "#64748b", mb: 3, fontSize: "15px", lineHeight: 1.5 }}>
          हमने <span style={{ color: "#0056b3", fontWeight: 700 }}>{getMaskedEmail(maskedEmail || formData?.email)}</span> पर एक वेरिफिकेशन कोड भेजा है
        </Typography>
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

      <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
        <Button
          variant="outlined"
          disabled={isLoading}
          onClick={() => { updateFormData({ otp: "", password: "", confirmPassword: "", phoneOtp: "" }); setError(""); setSuccess(""); setStep(1); }}
          sx={{ 
            flex: 1, 
            height: "48px", 
            borderRadius: "8px", 
            textTransform: "none", 
            color: "#475569", 
            bgcolor: "#f8fafc", 
            borderColor: "#e2e8f0", 
            fontWeight: 600, 
            fontSize: "16px", 
            "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f1f5f9" } 
          }}
        >
          ईमेल बदलें
        </Button>

        <Button
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
            flex: 1,
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
          {isLoading ? <Loader mini /> : "कोड वेरीफाई करें"}
        </Button>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1, minHeight: "32px" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
              >
                <Typography variant="body2" sx={{ color: "#ef4444 !important", fontSize: "13px", fontWeight: 600 }}>
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
                <Typography variant="body2" sx={{ color: "#28a745", fontSize: "13px", fontWeight: 600 }}>
                  {success}
                </Typography>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>

        <Button
          variant="text"
          disabled={isLoading || resendTimer > 0}
          onClick={handleResend}
          sx={{
            textTransform: "none",
            color: (resendTimer > 0) ? "#64748b !important" : "#0056b3 !important",
            fontWeight: 600,
            fontSize: "14.5px",
            p: 0,
            "&:hover": { textDecoration: "none", bgcolor: "transparent" },
            "&.Mui-disabled": { color: "#64748b !important" }
          }}
        >
          {resendTimer > 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748b !important' }}>
              <AccessTimeIcon sx={{ fontSize: '18px', color: '#64748b !important', position: 'relative', top: '-1px' }} />
              <Box component="div" sx={{ color: '#64748b !important', fontSize: '14.5px', fontWeight: 600 }}>
                {resendTimer.toString().padStart(2, '0')}s में OTP फिर से भेजें
              </Box>
            </Box>
          ) : (
            "कोड फिर से भेजें"
          )}
        </Button>
      </Box>

    </Box>
  );
}