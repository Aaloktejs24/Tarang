import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Paper, InputAdornment, CircularProgress } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import GppGoodOutlinedIcon from "@mui/icons-material/GppGoodOutlined";
import SmartphoneOutlinedIcon from "@mui/icons-material/SmartphoneOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import CustomDialog from "../../../components/common/CustomDialog";
import { startAadhaarOtp, verifyAadhaarOtp, startDigilocker, getProfile } from "../../auth/authService";
import TarangButton from "../../../components/common/TarangButton";

export default function KycVerificationModal({ open, onClose, userId, onSuccess }) {
  const [step, setStep] = useState("method_select"); // method_select, aadhaar_input, otp_input, digilocker_pending, success
  const [aadhaar, setAadhaar] = useState("");
  const [otp, setOtp] = useState("");
  const [refId, setRefId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setStep("method_select");
      setAadhaar("");
      setOtp("");
      setRefId("");
      setError("");
      setLoading(false);
    }
  }, [open]);

  const handleDigilocker = async () => {
    try {
      setLoading(true); setError("");
      const res = await startDigilocker(userId);
      if (res.authorization_url) {
        window.open(res.authorization_url, "DigiLocker Auth", "width=500,height=700");
        setStep("digilocker_pending");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error initializing DigiLocker");
    } finally {
      setLoading(false);
    }
  };

  const handleStartOtp = async () => {
    if (aadhaar.length !== 12) return setError("Please enter a valid 12-digit Aadhaar number");
    try {
      setLoading(true); setError("");
      const res = await startAadhaarOtp(userId, aadhaar);
      if (res.reference_id) { setRefId(res.reference_id); setStep("otp_input"); }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return setError("Please enter a valid OTP");
    try {
      setLoading(true); setError("");
      await verifyAadhaarOtp(userId, aadhaar, refId, otp);
      setStep("success");
      setTimeout(() => { onSuccess(); onClose(); }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  const checkDigilockerStatus = async () => {
    try {
      setLoading(true);
      const profile = await getProfile();
      if (profile.kyc_status === "verified") {
        setStep("success");
        setTimeout(() => { onSuccess(); onClose(); }, 2000);
      } else {
        setError("Verification not complete yet.");
      }
    } catch {
      setError("Failed to check status.");
    } finally {
      setLoading(false);
    }
  };

  const stepVariants = {
    initial: { y: 15, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.3 } },
    exit: { y: -15, opacity: 0, transition: { duration: 0.2 } }
  };

  const onBack = (step !== "method_select" && step !== "success") ? () => setStep("method_select") : undefined;

  return (
    <CustomDialog 
      open={open} 
      onClose={step !== "success" ? onClose : undefined} 
      onBack={onBack}
      innerBoxSx={{ pt: { xs: 4, sm: 6 } }}
    >
      <AnimatePresence mode="wait">
        
        {step === "method_select" && (
          <Box component={motion.div} key="method" variants={stepVariants} initial="initial" animate="animate" exit="exit" sx={{ textAlign: "center", pt: 4 }}>
            <Box sx={{ width: 80, height: 80, borderRadius: 'var(--radius-full)', bgcolor: "rgba(30, 79, 163, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3 }}>
              <VerifiedUserOutlinedIcon sx={{ fontSize: 40, color: "var(--color-primary)" }} />
            </Box>
            <Typography variant="h5" fontWeight={800} color="var(--color-slate-900)" mb={1}>अपना KYC पूरा करें</Typography>
            <Typography fontSize={15} color="var(--color-slate-500)" mb={5} px={2}>तरंग पर सभी प्रीमियम सुविधाओं और प्रमाणपत्रों को अनलॉक करने के लिए अपनी पहचान सत्यापित करें।</Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Paper elevation={0} onClick={!loading ? handleDigilocker : undefined} sx={{ p: 3, borderRadius: { xs: "16px", md: "20px" }, border: "var(--border-thick) solid #0056b3", cursor: "pointer", "&:hover": { bgcolor: "rgba(30, 79, 163, 0.05)" }}}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <Box sx={{ p: 1.5, borderRadius: 'var(--radius-lg)', bgcolor: "var(--color-primary)", color: "white" }}><GppGoodOutlinedIcon /></Box>
                  <Box sx={{ textAlign: "left" }}>
                    <Typography fontWeight={800} color="var(--color-slate-900)" fontSize={16}>तुरंत DigiLocker प्रमाणीकरण (Auth)</Typography>
                    <Typography fontSize={13} color="var(--color-success)" fontWeight={600}>अनुशंसित (Recommended) • 1 मिनट</Typography>
                  </Box>
                </Box>
              </Paper>

              <Paper elevation={0} onClick={!loading ? () => setStep("aadhaar_input") : undefined} sx={{ p: 3, borderRadius: { xs: "16px", md: "20px" }, border: "var(--border-thin) solid #e2e8f0", cursor: "pointer", "&:hover": { borderColor: "var(--color-slate-200)", bgcolor: "var(--color-slate-50)" }}}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <Box sx={{ p: 1.5, borderRadius: 'var(--radius-lg)', bgcolor: "var(--color-slate-50)", color: "var(--color-slate-500)" }}><SmartphoneOutlinedIcon /></Box>
                  <Box sx={{ textAlign: "left" }}>
                    <Typography fontWeight={700} color="var(--color-slate-700)" fontSize={16}>आधार OTP</Typography>
                    <Typography fontSize={13} color="var(--color-slate-500)">आधार से जुड़े मोबाइल नंबर से सत्यापित करें</Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
            {error && <Typography color="error" mt={3} fontSize={14}>{error}</Typography>}
          </Box>
        )}

        {step === "aadhaar_input" && (
          <Box component={motion.div} key="aadhaar" variants={stepVariants} initial="initial" animate="animate" exit="exit" sx={{ textAlign: "center", pt: 6 }}>
            <ShieldOutlinedIcon sx={{ fontSize: 50, color: "var(--color-primary)", mb: 2 }} />
            <Typography variant="h5" fontWeight={800} color="var(--color-slate-900)" mb={1}>आधार नंबर दर्ज करें</Typography>
            <Typography fontSize={14} color="var(--color-slate-500)" mb={4}>हम आपके पंजीकृत मोबाइल नंबर पर 6 अंकों का OTP भेजेंगे।</Typography>

            <TextField fullWidth placeholder="0000 0000 0000" value={aadhaar} onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))} disabled={loading} sx={{ mb: 3 }} InputProps={{ startAdornment: <InputAdornment position="start"><Typography fontWeight={600} color="var(--color-slate-500)">UIDAI</Typography></InputAdornment> }} />
            {error && <Typography color="error" mb={3} fontSize={13}>{error}</Typography>}

            <TarangButton fullWidth loading={loading} disabled={loading || aadhaar.length !== 12} onClick={handleStartOtp} sx={{ py: 1.5 }}>
              {"OTP भेजें (Request OTP)"}
            </TarangButton>
          </Box>
        )}

        {step === "otp_input" && (
          <Box component={motion.div} key="otp" variants={stepVariants} initial="initial" animate="animate" exit="exit" sx={{ textAlign: "center", pt: 6 }}>
            <SmartphoneOutlinedIcon sx={{ fontSize: 50, color: "var(--color-success)", mb: 2 }} />
            <Typography variant="h5" fontWeight={800} color="var(--color-slate-900)" mb={1}>OTP सत्यापित करें</Typography>
            <Typography fontSize={14} color="var(--color-slate-500)" mb={4}>अपने आधार से जुड़े मोबाइल नंबर पर भेजे गए OTP को दर्ज करें।</Typography>

            <TextField fullWidth placeholder="• • • • • •" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} disabled={loading} sx={{ mb: 3 }} inputProps={{ style: { textAlign: 'center', letterSpacing: '8px', fontSize: 'var(--font-lg)', fontWeight: 'var(--font-bold)' } }} />
            {error && <Typography color="error" mb={3} fontSize={13}>{error}</Typography>}

            <TarangButton fullWidth variant="success" loading={loading} disabled={loading || otp.length !== 6} onClick={handleVerifyOtp} sx={{ py: 1.5 }}>
              {"Verify Identity"}
            </TarangButton>
          </Box>
        )}

        {step === "digilocker_pending" && (
          <Box component={motion.div} key="digi_pending" variants={stepVariants} initial="initial" animate="animate" exit="exit" sx={{ textAlign: "center", pt: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>null</Box>
            <Typography variant="h5" fontWeight={800} color="var(--color-slate-900)" mb={2}>पॉपअप में पूरा करें</Typography>
            <Typography fontSize={15} color="var(--color-slate-500)" mb={5} px={2}>हमने DigiLocker के लिए एक सुरक्षित विंडो खोली है। कृपया वहां प्रमाणीकरण पूरा करें।</Typography>
            {error && <Typography color="error" mb={3} fontSize={14}>{error}</Typography>}

            <TarangButton fullWidth loading={loading} disabled={loading} onClick={checkDigilockerStatus} sx={{ py: 1.5 }}>
              {"I have completed Verification"}
            </TarangButton>
          </Box>
        )}

        {step === "success" && (
          <Box component={motion.div} key="success" variants={stepVariants} initial="initial" animate="animate" exit="exit" sx={{ textAlign: "center", pt: 8, pb: 4 }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <Box sx={{ width: 100, height: 100, borderRadius: 'var(--radius-full)', bgcolor: "var(--color-success)", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3 }}>
                <GppGoodOutlinedIcon sx={{ fontSize: 50, color: "white" }} />
              </Box>
            </motion.div>
            <Typography variant="h4" fontWeight={900} color="var(--color-slate-900)" mb={1}>सत्यापित! (Verified)</Typography>
            <Typography fontSize={16} color="var(--color-slate-500)">आपका KYC पूरा हो गया है।</Typography>
          </Box>
        )}
      </AnimatePresence>
    </CustomDialog>
  );
}
