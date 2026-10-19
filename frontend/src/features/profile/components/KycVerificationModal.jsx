import React, { useState, useEffect } from "react";
import { 
  Box, Typography, Button, IconButton, 
  TextField, Paper, InputAdornment 
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import CloseIcon from "@mui/icons-material/Close";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import GppGoodOutlinedIcon from "@mui/icons-material/GppGoodOutlined";
import SmartphoneOutlinedIcon from "@mui/icons-material/SmartphoneOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Loader from "../../../components/common/Loader";
import useScrollLock from "../../../hooks/useScrollLock";

import { startAadhaarOtp, verifyAadhaarOtp, startDigilocker, getProfile } from "../../auth/authService";
import { useLoading } from '../../../contexts/LoadingContext';

export default function KycVerificationModal({ open, onClose, userId, onSuccess }) {
  const [step, setStep] = useState("method_select"); // method_select, aadhaar_input, otp_input, digilocker_pending, success
  const [aadhaar, setAadhaar] = useState("");
  const [otp, setOtp] = useState("");
  const [refId, setRefId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useScrollLock(open);

  // Reset state when modal opens
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
      setLoading(true);
      setError("");
      const res = await startDigilocker(userId);
      if (res.authorization_url) {
        // Open DigiLocker in a new tab/popup
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
    if (aadhaar.length !== 12) {
      setError("Please enter a valid 12-digit Aadhaar number");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await startAadhaarOtp(userId, aadhaar);
      if (res.reference_id) {
        setRefId(res.reference_id);
        setStep("otp_input");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      setError("Please enter a valid OTP");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await verifyAadhaarOtp(userId, aadhaar, refId, otp);
      setStep("success");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP. Please try again.");
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
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setError("Verification not complete yet. Please finish the DigiLocker flow.");
      }
    } catch {
      setError("Failed to check status.");
    } finally {
      setLoading(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2 } }
  };

  const stepVariants = {
    initial: { y: 15, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.3 } },
    exit: { y: -15, opacity: 0, transition: { duration: 0.2 } }
  };

  if (!open) return null;

  return (
    <Box
      onClick={onClose}
      sx={{
        position: 'fixed', inset: 0, zIndex: 1200, display: 'flex', justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(0, 86, 179, 0.1)', backdropFilter: 'blur(15px)', p: 2, overflow: 'auto'
      }}
    >
      <Paper
        onClick={(e) => e.stopPropagation()}
        elevation={0}
        component={motion.div}
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        sx={{
          display: "flex", flexDirection: "column", width: "100%", maxWidth: "600px",
          borderRadius: { xs: 0, sm: "28px" },
          background: `
            radial-gradient(at 0% 0%, rgba(0, 86, 179, 0.25) 0, transparent 50%), 
            radial-gradient(at 100% 0%, rgba(40, 167, 69, 0.2) 0, transparent 50%), 
            radial-gradient(at 80% 100%, rgba(40, 167, 69, 0.15) 0, transparent 50%),
            radial-gradient(at 20% 100%, rgba(0, 86, 179, 0.1) 0, transparent 50%),
            #ffffff
          `,
          boxShadow: "none",
          border: "1px solid #E2E8F0",
          overflowY: 'auto', maxHeight: '92vh'
        }}
      >
        <Box sx={{ px: { xs: 3, sm: 8 }, py: { xs: 6, sm: 8 }, position: "relative", minHeight: 400 }}>
        
        {/* Header Controls */}
        {step !== "method_select" && step !== "success" && (
          <IconButton 
            onClick={() => setStep("method_select")} 
            disabled={loading}
            sx={{ position: "absolute", top: 16, left: 16, color: "#64748b" }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        
        {step !== "success" && (
          <IconButton 
            onClick={onClose} 
            disabled={loading}
            sx={{ display: { xs: "inline-flex", md: "none" }, position: "absolute", top: 16, right: 16, color: "#64748b" }}
          >
            <CloseIcon />
          </IconButton>
        )}

        <AnimatePresence mode="wait">
          
          {/* STEP 1: Method Selection */}
          {step === "method_select" && (
            <Box component={motion.div} key="method" variants={stepVariants} initial="initial" animate="animate" exit="exit" sx={{ textAlign: "center", pt: 4 }}>
              <Box sx={{ 
                width: 80, height: 80, borderRadius: "50%", bgcolor: "rgba(30, 79, 163, 0.1)", 
                display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3 
              }}>
                <VerifiedUserOutlinedIcon sx={{ fontSize: 40, color: "#0056b3" }} />
              </Box>
              <Typography variant="h5" fontWeight={800} color="#0f172a" mb={1}>
                अपना KYC पूरा करें
              </Typography>
              <Typography fontSize={15} color="#64748b" mb={5} px={2}>
                तरंग पर सभी प्रीमियम सुविधाओं और प्रमाणपत्रों को अनलॉक करने के लिए अपनी पहचान सत्यापित करें।
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Paper 
                  elevation={0}
                  onClick={!loading ? handleDigilocker : undefined}
                  sx={{ 
                    p: 3, borderRadius: { xs: "16px", md: "20px" }, border: "2px solid #0056b3", cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": { bgcolor: "rgba(30, 79, 163, 0.05)" }
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Box sx={{ p: 1.5, borderRadius: "12px", bgcolor: "#0056b3", color: "white" }}>
                      <GppGoodOutlinedIcon />
                    </Box>
                    <Box sx={{ textAlign: "left" }}>
                      <Typography fontWeight={800} color="#0f172a" fontSize={16}>तुरंत DigiLocker प्रमाणीकरण (Auth)</Typography>
                      <Typography fontSize={13} color="#28a745" fontWeight={600}>अनुशंसित (Recommended) • 1 मिनट</Typography>
                    </Box>
                  </Box>
                </Paper>

                <Paper 
                  elevation={0}
                  onClick={!loading ? () => setStep("aadhaar_input") : undefined}
                  sx={{ 
                    p: 3, borderRadius: { xs: "16px", md: "20px" }, border: "1px solid #e2e8f0", cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" }
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Box sx={{ p: 1.5, borderRadius: "12px", bgcolor: "#f1f5f9", color: "#64748b" }}>
                      <SmartphoneOutlinedIcon />
                    </Box>
                    <Box sx={{ textAlign: "left" }}>
                      <Typography fontWeight={700} color="#334155" fontSize={16}>{"आधार OTP"}</Typography>
                      <Typography fontSize={13} color="#64748b">आधार से जुड़े मोबाइल नंबर से सत्यापित करें</Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>
              {error && <Typography color="error" mt={3} fontSize={14}>{error}</Typography>}
            </Box>
          )}

          {/* STEP 2A: Aadhaar Input */}
          {step === "aadhaar_input" && (
            <Box component={motion.div} key="aadhaar" variants={stepVariants} initial="initial" animate="animate" exit="exit" sx={{ textAlign: "center", pt: 6 }}>
              <ShieldOutlinedIcon sx={{ fontSize: 50, color: "#0056b3", mb: 2 }} />
              <Typography variant="h5" fontWeight={800} color="#0f172a" mb={1}>
                आधार नंबर दर्ज करें
              </Typography>
              <Typography fontSize={14} color="#64748b" mb={4}>
                {"हम आपके पंजीकृत मोबाइल नंबर पर 6 अंकों का OTP भेजेंगे।"}
              </Typography>

              <TextField 
                fullWidth
                placeholder="0000 0000 0000"
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                disabled={loading}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Typography fontWeight={600} color="#94a3b8">{"UIDAI"}</Typography></InputAdornment>,
                  sx: { 
                    borderRadius: "8px", 
                    backgroundColor: "#f8fafc", 
                    transition: "all 0.2s ease-in-out",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#cbd5e1" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#0056b3", borderWidth: "1.5px" }
                  }
                }}
                sx={{ mb: 3 }}
              />

              {error && <Typography color="error" mb={3} fontSize={13}>{error}</Typography>}

              <Button 
                fullWidth 
                variant="contained" disableElevation 
                onClick={handleStartOtp}
                disabled={loading || aadhaar.length !== 12}
                sx={{ 
                  py: 1.5, borderRadius: "8px", bgcolor: "#0056b3", fontWeight: 700, fontSize: 16,
                  "&:hover": { bgcolor: "#153b7a" }
                }}
              >
                {loading ? <Loader mini /> : "OTP भेजें (Request OTP)"}
              </Button>
            </Box>
          )}

          {/* STEP 2B: OTP Input */}
          {step === "otp_input" && (
            <Box component={motion.div} key="otp" variants={stepVariants} initial="initial" animate="animate" exit="exit" sx={{ textAlign: "center", pt: 6 }}>
              <SmartphoneOutlinedIcon sx={{ fontSize: 50, color: "#28a745", mb: 2 }} />
              <Typography variant="h5" fontWeight={800} color="#0f172a" mb={1}>
                {"OTP सत्यापित करें"}
              </Typography>
              <Typography fontSize={14} color="#64748b" mb={4}>
                {"अपने आधार से जुड़े मोबाइल नंबर पर भेजे गए OTP को दर्ज करें।"}
              </Typography>

              <TextField 
                fullWidth
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={loading}
                inputProps={{ style: { textAlign: 'center', letterSpacing: '8px', fontSize: '20px', fontWeight: 'bold' } }}
                InputProps={{
                  sx: { 
                    borderRadius: "8px", 
                    backgroundColor: "#f8fafc", 
                    transition: "all 0.2s ease-in-out",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#cbd5e1" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#0056b3", borderWidth: "1.5px" }
                  }
                }}
                sx={{ mb: 3 }}
              />

              {error && <Typography color="error" mb={3} fontSize={13}>{error}</Typography>}

              <Button 
                fullWidth 
                variant="contained" disableElevation 
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
                sx={{ 
                  py: 1.5, borderRadius: "8px", bgcolor: "#28a745", fontWeight: 700, fontSize: 16,
                  "&:hover": { bgcolor: "#218838" }
                }}
              >
                {loading ? <Loader mini /> : "Verify Identity"}
              </Button>
            </Box>
          )}

          {/* STEP 3A: DigiLocker Pending */}
          {step === "digilocker_pending" && (
            <Box component={motion.div} key="digi_pending" variants={stepVariants} initial="initial" animate="animate" exit="exit" sx={{ textAlign: "center", pt: 6 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}><Loader /></Box>
              <Typography variant="h5" fontWeight={800} color="#0f172a" mb={2}>
                पॉपअप में पूरा करें
              </Typography>
              <Typography fontSize={15} color="#64748b" mb={5} px={2}>
                हमने DigiLocker के लिए एक सुरक्षित विंडो खोली है। कृपया वहां प्रमाणीकरण पूरा करें।
              </Typography>

              {error && <Typography color="error" mb={3} fontSize={14}>{error}</Typography>}

              <Button 
                fullWidth 
                variant="contained" disableElevation 
                onClick={checkDigilockerStatus}
                disabled={loading}
                sx={{ 
                  py: 1.5, borderRadius: "8px", bgcolor: "#0056b3", fontWeight: 700, fontSize: 16,
                  "&:hover": { bgcolor: "#153b7a" }
                }}
              >
                {loading ? <Loader mini /> : "I have completed Verification"}
              </Button>
            </Box>
          )}

          {/* STEP 4: Success */}
          {step === "success" && (
            <Box component={motion.div} key="success" variants={stepVariants} initial="initial" animate="animate" exit="exit" sx={{ textAlign: "center", pt: 8, pb: 4 }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <Box sx={{ 
                  width: 100, height: 100, borderRadius: "50%", bgcolor: "#28a745", 
                  display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3,
                  boxShadow: "none"
                }}>
                  <GppGoodOutlinedIcon sx={{ fontSize: 50, color: "white" }} />
                </Box>
              </motion.div>
              <Typography variant="h4" fontWeight={900} color="#0f172a" mb={1}>
                सत्यापित! (Verified)
              </Typography>
              <Typography fontSize={16} color="#64748b">
                आपका KYC पूरा हो गया है।
              </Typography>
            </Box>
          )}

        </AnimatePresence>
      </Box>
      </Paper>
    </Box>
  );
}
