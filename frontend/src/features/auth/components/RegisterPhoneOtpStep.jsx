import { Box, Typography, Button, TextField } from "@mui/material";
import { useState } from "react";
import { confirmPhoneVerification } from "../authService";
import { translateError } from "../utils/authErrors";
import Loader from "../../../components/common/Loader";

const fieldSx = {
    "& .MuiOutlinedInput-root": {
        backgroundColor: "#f8fafc",
        borderRadius: "8px",
        transition: "all 0.2s ease",
        "& fieldset": { borderColor: "#e2e8f0" },
        "&:hover fieldset": { borderColor: "#cbd5e1" },
        "&.Mui-focused fieldset": { borderColor: "#0056b3", borderWidth: "1.5px" },
        "& input": { color: "#0f172a", fontSize: "15px", letterSpacing: "5px", textAlign: "center", fontWeight: "bold" },
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
            setError(translateError(err.response?.data?.error) || "अमान्य OTP");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkip = () => {
        setStep(4);
    };

    return (
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
                <Typography variant="h5" sx={{ mb: 1, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px", fontSize: "28px" }}>
                    फ़ोन वेरीफाई करें
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b", mb: 3, fontSize: "15px", lineHeight: 1.5 }}>
                    हमने <span style={{ color: "#0f172a", fontWeight: 700 }}>{formData.phone}</span> पर एक वेरिफिकेशन कोड भेजा है
                </Typography>
            </Box>

            <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#334155", fontSize: "14px" }}>
                    वेरिफिकेशन कोड
                </Typography>
                <TextField
                    fullWidth
                    value={localOtp}
                    onChange={(e) => setLocalOtp(e.target.value)}
                    placeholder="000000"
                    sx={fieldSx}
                />
            </Box>

            <Button
                fullWidth
                variant="contained" disableElevation
                disabled={isLoading || localOtp.length < 6}
                onClick={handleVerify}
                sx={{
                    height: "48px",
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
                    
                    "&.Mui-disabled": { background: "#e2e8f0", color: "#94a3b8" },
                }}
            >
                {isLoading ? <Loader mini /> : "फ़ोन वेरीफाई करें"}
            </Button>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                <Button
                    variant="text"
                    disabled={isLoading}
                    onClick={handleSkip}
                    sx={{ textTransform: "none", color: "#64748b", fontWeight: 600, fontSize: "14.5px", height: "44px" }}
                >
                    अभी के लिए छोड़ें
                </Button>
            </Box>
        </Box>
    );
}
