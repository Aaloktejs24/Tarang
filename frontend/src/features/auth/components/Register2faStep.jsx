import { Box, Typography, Button, TextField, IconButton } from "@mui/material";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import EmailIcon from "@mui/icons-material/Email";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { setupTotp, verifyTotp, updateMfaPreference } from "../authService";
import OtpInput from "./OtpInput";
import { translateError } from "../utils/authErrors";
import Loader from "../../../components/common/Loader";

export default function Register2faStep({ onFinish, handleFinalSubmit, isLoading, isRegistered, setStep, setMode }) {
    const [step2fa, setStep2fa] = useState("choice"); // "choice", "authenticator_setup"
    const [totpData, setTotpData] = useState(null);
    const [verificationCode, setVerificationCode] = useState("");
    const [error, setError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleAuthenticatorChoice = async () => {
        if (isVerifying) return;
        setIsVerifying(true);
        setError("");
        try {
            if (!isRegistered) {
                // Register the user first — required before TOTP setup
                await handleFinalSubmit({ mfa_preference: "totp", shouldStayInFlow: true });
            }
            // Setup TOTP (works whether user was just registered or already was)
            const tempToken = localStorage.getItem("temp_token");
            const data = await setupTotp(tempToken);
            setTotpData(data);
            setStep2fa("authenticator_setup");
        } catch (err) {
            setError(translateError(err.response?.data?.error) || "2FA सेटअप शुरू करने में विफल");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleEmailChoice = async () => {
        if (isVerifying) return;
        setIsVerifying(true);
        setError("");
        try {
            if (isRegistered) {
                // Already registered — just update the preference and finish
                await updateMfaPreference("email");
                onFinish();
            } else {
                // First time — register with email MFA
                await handleFinalSubmit({ mfa_preference: "email", shouldStayInFlow: true });
                const tempToken = localStorage.getItem("temp_token");
                await updateMfaPreference("email", tempToken);
                onFinish();
            }
        } catch (err) {
            setError(translateError(err.response?.data?.error) || "ईमेल OTP सक्षम करने में विफल");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleVerifyTotp = async () => {
        setIsVerifying(true);
        setError("");
        try {
            const tempToken = localStorage.getItem("temp_token");
            await verifyTotp(verificationCode, tempToken);
            onFinish();
        } catch (err) {
            setError(translateError(err.response?.data?.error) || "अमान्य वेरिफिकेशन कोड");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleSkip = async () => {
        setIsVerifying(true);
        setError("");
        try {
            const tempToken = localStorage.getItem("temp_token");
            if (isRegistered) {
                // Already registered — just update preference
                await updateMfaPreference("none", tempToken);
                onFinish();
            } else {
                await handleFinalSubmit({ mfa_preference: "none", shouldStayInFlow: true });
                await updateMfaPreference("none", tempToken);
                onFinish();
            }
        } catch (err) {
            setError(translateError(err.response?.data?.error) || "रजिस्ट्रेशन पूरा करने में विफल");
        } finally {
            setIsVerifying(false);
        }
    };

    if (step2fa === "authenticator_setup") {
        return (
            <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
                <Box sx={{ textAlign: "center", mb: 0.5 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-1px" }}>
                        ऑथेंटिकेटर ऐप सेटअप करें
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5, fontSize: "14px" }}>
                        अपने ऑथेंटिकेटर ऐप से QR कोड स्कैन करें।
                    </Typography>
                </Box>

                {/* Parallel layout: QR on left, secret key on right */}
                <Box sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "center", sm: "flex-start" },
                    gap: 2,
                    width: "100%",
                    mb: 0.5
                }}>
                    {totpData?.url && (
                        <Box sx={{
                            p: 1.5,
                            bgcolor: "white",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <QRCodeSVG value={totpData.url} size={130} />
                        </Box>
                    )}

                    {totpData?.secret && (
                        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0 }}>
                            <Typography variant="caption" sx={{
                                color: "#94a3b8",
                                mb: 0.75,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                fontSize: "10px",
                                display: "block"
                            }}>
                                मैन्युअल एंट्री की (Key)
                            </Typography>
                            <Box sx={{
                                bgcolor: "#f8fafc",
                                px: 1.5,
                                py: 1.25,
                                borderRadius: "8px",
                                border: "1px dashed #cbd5e1",
                                position: "relative",
                                pr: 5
                            }}>
                                <Typography sx={{
                                    fontWeight: 800,
                                    letterSpacing: "1px",
                                    color: "#28a745",
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: "13px",
                                    wordBreak: "break-all",
                                    lineHeight: 1.6
                                }}>
                                    {totpData.secret}
                                </Typography>
                                <IconButton
                                    onClick={() => {
                                        navigator.clipboard.writeText(totpData.secret);
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 2000);
                                    }}
                                    size="small"
                                    title="सीक्रेट की कॉपी करें"
                                    sx={{
                                        position: "absolute",
                                        right: 4,
                                        top: "50%",
                                        
                                        color: copied ? "#28a745" : "#94a3b8",
                                        transition: "color 0.2s"
                                    }}
                                >
                                    {copied ? <CheckIcon sx={{ fontSize: 20 }} /> : <ContentCopyIcon sx={{ fontSize: 20 }} />}
                                </IconButton>
                            </Box>
                            <Typography variant="caption" sx={{ color: "#94a3b8", mt: 0.75, fontSize: "11px", lineHeight: 1.4 }}>
                                अगर आप QR कोड स्कैन नहीं कर पा रहे हैं तो इसका उपयोग करें।
                            </Typography>
                        </Box>
                    )}
                </Box>

                <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#334155", fontSize: "14px", width: "100%", textAlign: "left" }}>
                        6-अंकों का वेरिफिकेशन कोड
                    </Typography>
                    <OtpInput
                        value={verificationCode}
                        onChange={setVerificationCode}
                        numInputs={6}
                        isLoading={isVerifying}
                    />
                </Box>

                {error && (
                    <Typography variant="body2" sx={{ color: "#ef4444", fontSize: "14px", fontWeight: 500 }}>
                        {error}
                    </Typography>
                )}

                <Button
                    fullWidth
                    variant="contained" disableElevation
                    disabled={isVerifying || verificationCode.length !== 6}
                    onClick={handleVerifyTotp}
                    sx={{
                        py: 1.25,
                        borderRadius: "8px",
                        textTransform: "none",
                        fontSize: "15.5px",
                        fontWeight: 700,
                        background: "linear-gradient(135deg, #0056b3 0%, #28a745 100%)",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                            background: "linear-gradient(135deg, #004494 0%, #218838 100%)",
                            },
                        
                        "&.Mui-disabled": { background: "#e2e8f0", color: "#94a3b8" }
                    }}
                >
                    {isVerifying ? <Loader mini /> : "वेरीफाई करें और सक्षम करें"}
                </Button>

                <Button
                    variant="text"
                    fullWidth
                    onClick={() => { setStep2fa("choice"); setTotpData(null); }}
                    sx={{ textTransform: "none", color: "#64748b", fontWeight: 600, fontSize: "14px", mt: 1 }}
                >
                    विकल्पों पर वापस जाएं
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ mb: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-1px" }}>
                    अकाउंट सुरक्षित करें
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5, fontSize: "14px" }}>
                    टू-फैक्टर ऑथेंटिकेशन सुरक्षा की एक अतिरिक्त परत जोड़ता है।
                </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box
                    onClick={handleAuthenticatorChoice}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 1.5,
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        backgroundColor: "#f8fafc",
                        cursor: isVerifying ? "default" : "pointer",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        opacity: isVerifying ? 0.7 : 1,
                        position: "relative",
                        "&:hover": {
                            borderColor: isVerifying ? "#e2e8f0" : "#cbd5e1",
                            background: isVerifying ? "#f8fafc" : "#fff",
                            
                        }
                    }}
                >
                    <Box sx={{ p: 1, borderRadius: "8px", bgcolor: "rgba(40, 167, 69, 0.1)", color: "#28a745", mr: 1.5 }}>
                        <SmartphoneIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "15px" }}>ऑथेंटिकेटर ऐप</Typography>
                        <Typography sx={{ color: "#64748b", fontSize: "12px" }}>गूगल ऑथेंटिकेटर या इसके जैसा कुछ उपयोग करें</Typography>
                    </Box>
                    {isVerifying && !totpData && (
                        <Box sx={{ position: "absolute", right: 16 }}>
                            <Loader mini />
                        </Box>
                    )}
                </Box>

                <Box
                    onClick={handleEmailChoice}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 1.5,
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        backgroundColor: "#f8fafc",
                        cursor: isVerifying ? "default" : "pointer",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        opacity: isVerifying ? 0.7 : 1,
                        position: "relative",
                        "&:hover": {
                            borderColor: isVerifying ? "#e2e8f0" : "#cbd5e1",
                            background: isVerifying ? "#f8fafc" : "#fff",
                            
                        }
                    }}
                >
                    <Box sx={{ p: 1, borderRadius: "8px", bgcolor: "rgba(40, 167, 69, 0.1)", color: "#28a745", mr: 1.5 }}>
                        <EmailIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "15px" }}>ईमेल OTP</Typography>
                        <Typography sx={{ color: "#64748b", fontSize: "12px" }}>ईमेल के माध्यम से कोड प्राप्त करें</Typography>
                    </Box>
                    {isVerifying && (
                        <Box sx={{ position: "absolute", right: 16 }}>
                            <Loader mini />
                        </Box>
                    )}
                </Box>
            </Box>

            {error && (
                <Typography variant="body2" sx={{ color: "#ef4444", fontSize: "14px", textAlign: "center", fontWeight: 500 }}>
                    {error}
                </Typography>
            )}

            <Button
                fullWidth
                variant="text"
                disabled={isVerifying || isLoading}
                onClick={handleSkip}
                sx={{
                    py: 1.5,
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "14px",
                    color: "#64748b",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.02)" }
                }}
            >
                अभी के लिए सुरक्षा सेटअप छोड़ें
            </Button>

            {setStep && (
                <Button
                    variant="text"
                    fullWidth
                    disabled={isVerifying}
                    onClick={() => {
                        setMode("login");
                        setStep(1);
                    }}
                    sx={{ textTransform: "none", color: "#64748b", fontWeight: 600, fontSize: "14px", mt: 1 }}
                >
                    {"← लॉगिन पर वापस जाएं"}
                </Button>
            )}
        </Box>
    );
}