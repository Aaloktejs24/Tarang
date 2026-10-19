import { Box, Typography, TextField, Button, InputAdornment } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Loader from "../../../components/common/Loader";

export default function ForgotStep1({ setMode, onStartRecovery, isLoading, error, setError, success }) {
    const [target, setTarget] = useState("");

    return (
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ mb: 1.5, fontWeight: 800, color: "#0f172a", letterSpacing: "-1px" }}>
                    पासवर्ड भूल गए?
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b", fontSize: "15px", lineHeight: 1.6 }}>
                    पंजीकृत ईमेल दर्ज करें। OTP भेजा जाएगा।
                </Typography>
            </Box>

            <Box sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ mb: 1.2, fontWeight: 600, color: "#334155", fontSize: "14px" }}>
                    ईमेल पता
                </Typography>
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                    <TextField
                        fullWidth
                        value={target}
                        onChange={(e) => {
                            setTarget(e.target.value);
                            if (error) setError("");
                        }}
                        placeholder="name@example.com"
                        size="medium"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Box sx={{ mr: 1, color: "#94a3b8", display: "flex", alignItems: "center" }}>
                                        <EmailIcon sx={{ fontSize: 20 }} />
                                    </Box>
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                backgroundColor: "#f8fafc",
                                borderRadius: "8px",
                                transition: "all 0.2s ease-in-out",
                                "& fieldset": { borderColor: "#e2e8f0" },
                                "&:hover fieldset": { borderColor: "#cbd5e1" },
                                "&.Mui-focused fieldset": { borderColor: "#0056b3", borderWidth: "1.5px" },
                                "& input": { color: "#0f172a" }
                            },
                            "& .MuiOutlinedInput-input": { padding: "12px 14px", fontSize: "15px" },
                        }}
                    />
                    <Button
                        variant="contained" disableElevation
                        disabled={isLoading || !target}
                        onClick={() => onStartRecovery(target)}
                        sx={{
                            height: "46.5px",
                            px: 3,
                            borderRadius: "8px",
                            textTransform: "none",
                            fontSize: "15px",
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                            background: "linear-gradient(135deg, #0056b3 0%, #28a745 100%)",
                            transition: "all 0.2s ease-in-out",
                            "&:hover": {
                                background: "linear-gradient(135deg, #004494 0%, #218838 100%)",
                                },
                            
                            "&.Mui-disabled": { background: "#e2e8f0", color: "#94a3b8" }
                        }}
                    >
                        {isLoading ? <Loader mini /> : "OTP भेजें"}
                    </Button>
                </Box>
            </Box>

            <Box sx={{ minHeight: "24px", display: "flex", alignItems: "center", mt: 0.5 }}>
                <AnimatePresence mode="wait">
                    {error && (
                        <Motion.div
                            key="error"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <Typography variant="body2" sx={{ color: "#ef4444 !important", fontSize: "13.5px", fontWeight: 600 }}>
                                {error}
                            </Typography>
                        </Motion.div>
                    )}
                    {!error && success && (
                        <Motion.div
                            key="success"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <Typography variant="body2" sx={{ color: "#28a745", fontSize: "13.5px", fontWeight: 600 }}>
                                {success}
                            </Typography>
                        </Motion.div>
                    )}
                </AnimatePresence>
            </Box>

            <Typography variant="body2" sx={{ textAlign: "center", color: "#64748b", mt: 1 }}>
                क्या आपको अपना पासवर्ड याद है?{" "}
                <Box
                    component="span"
                    sx={{ color: "#0056b3", fontWeight: 600, cursor: "pointer", ml: 0.5, "&:hover": { textDecoration: "underline" } }}
                    onClick={() => { setMode("login"); setError(""); }}
                >
                    लॉगिन पर वापस जाएं
                </Box>
            </Typography>
        </Box>
    );
}
