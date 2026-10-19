import { Box, Typography, TextField, IconButton } from "@mui/material";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import EmailIcon from "@mui/icons-material/Email";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { updateMfaPreference, setupTotp, verifyTotp } from "../authService";
import { getTempToken } from "../../../lib/auth";
import OtpInput from "./OtpInput";
import { translateAuthError, AUTH_ERRORS } from "../../../constants/errors";
import TarangButton from "../../../components/common/TarangButton";
import { FormLoadingProvider } from '../../../contexts/FormLoadingContext';

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
            const tempToken = getTempToken();
            const data = await setupTotp(tempToken);
            setTotpData(data);
            setStep2fa("authenticator_setup");
        } catch (err) {
            setError(translateAuthError(err.response?.data?.error) || AUTH_ERRORS.GENERIC.TFA_SETUP_FAILED);
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
                const tempToken = getTempToken();
                await updateMfaPreference("email", tempToken);
                onFinish();
            }
        } catch (err) {
            setError(translateAuthError(err.response?.data?.error) || AUTH_ERRORS.GENERIC.EMAIL_OTP_ENABLE_FAILED);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleVerifyTotp = async () => {
        setIsVerifying(true);
        setError("");
        try {
            const tempToken = getTempToken();
            await verifyTotp(verificationCode, tempToken);
            onFinish();
        } catch (err) {
            setError(translateAuthError(err.response?.data?.error) || AUTH_ERRORS.GENERIC.INVALID_VERIFICATION_CODE);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleSkip = async () => {
        setIsVerifying(true);
        setError("");
        try {
            const tempToken = getTempToken();
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
            setError(translateAuthError(err.response?.data?.error) || AUTH_ERRORS.GENERIC.REGISTRATION_FAILED);
        } finally {
            setIsVerifying(false);
        }
    };

    if (step2fa === "authenticator_setup" && totpData) {
        return (
            <FormLoadingProvider isLoading={isVerifying || isLoading}>
            <Box sx={{ width: "var(--size-full)", display: "flex", flexDirection: "column", gap: 3, alignItems: "center" }}>
                <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h5" sx={{ mb: 1, fontWeight: 800, color: "var(--color-slate-900)", letterSpacing: "-0.5px", fontSize: 'var(--font-2xl)' }}>
                        ऑथेंटिकेटर ऐप सेटअप करें
                    </Typography>
                    <Typography variant="body2" sx={{ color: "var(--color-slate-500)", fontSize: 'var(--font-base)', lineHeight: 1.5 }}>
                        अपने ऑथेंटिकेटर ऐप से QR कोड स्कैन करें।
                    </Typography>
                </Box>

                {/* Parallel layout: QR on left, secret key on right */}
                <Box sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "center", sm: "flex-start" },
                    gap: 2,
                    width: "var(--size-full)",
                    mb: 0.5
                }}>
                    {totpData?.url && (
                        <Box sx={{
                            p: 1.5,
                            bgcolor: "var(--card-bg)", backdropFilter: "var(--card-blur)",
                            borderRadius: 'var(--radius-md)',
                            border: "var(--border-thin) solid var(--color-slate-200)",
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
                                color: "var(--color-slate-500)",
                                mb: 0.75,
                                fontWeight: 'var(--font-bold)',
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                fontSize: "10px",
                                display: "block"
                            }}>
                                मैन्युअल एंट्री की (Key)
                            </Typography>
                            <Box sx={{
                                bgcolor: "var(--color-slate-50)",
                                px: 1.5,
                                py: 1.25,
                                borderRadius: 'var(--radius-md)',
                                border: "1px dashed var(--color-slate-300)",
                                position: "relative",
                                pr: 5
                            }}>
                                <Typography sx={{
                                    fontWeight: 800,
                                    letterSpacing: "1px",
                                    color: "var(--color-success)",
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: 'var(--font-sm)',
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
                                        
                                        color: copied ? "var(--color-success)" : "var(--color-slate-500)",
                                        transition: "color var(--transition-base)"
                                    }}
                                >
                                    {copied ? <CheckIcon sx={{ fontSize: 20 }} /> : <ContentCopyIcon sx={{ fontSize: 20 }} />}
                                </IconButton>
                            </Box>
                            <Typography variant="caption" sx={{ color: "var(--color-slate-500)", mt: 0.75, fontSize: 'var(--font-xs)', lineHeight: 1.4 }}>
                                अगर आप QR कोड स्कैन नहीं कर पा रहे हैं तो इसका उपयोग करें।
                            </Typography>
                        </Box>
                    )}
                </Box>

                <Box sx={{ width: "var(--size-full)", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 'var(--font-semibold)', color: "var(--color-slate-900)", fontSize: 'var(--font-sm)', width: "var(--size-full)", textAlign: "left" }}>
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
                    <Typography variant="body2" sx={{ color: "var(--color-error)", fontSize: 'var(--font-sm)', fontWeight: 'var(--font-medium)' }}>
                        {error}
                    </Typography>
                )}

                <TarangButton
                    fullWidth
                    loading={isVerifying}
                    disabled={isVerifying || verificationCode.length !== 6}
                    onClick={handleVerifyTotp}
                    sx={{ height: 'var(--box-height)' }}
                >
                    {"वेरीफाई करें और सक्षम करें"}
                </TarangButton>

                <TarangButton
                    variant="text"
                    fullWidth
                    onClick={() => { setStep2fa("choice"); setTotpData(null); }}
                    sx={{ color: 'var(--color-slate-500)', mt: 1 }}
                >
                    विकल्पों पर वापस जाएं
                </TarangButton>
            </Box>
            </FormLoadingProvider>
        );
    }

    return (
        <FormLoadingProvider isLoading={isVerifying || isLoading}>
        <Box sx={{ width: "var(--size-full)", display: "flex", flexDirection: "column", gap: 3 }}>
            <Box>
                <Typography variant="h5" sx={{ mb: 1, fontWeight: 800, color: "var(--color-slate-900)", letterSpacing: "-0.5px", fontSize: 'var(--font-2xl)' }}>
                    अकाउंट सुरक्षित करें
                </Typography>
                <Typography variant="body2" sx={{ color: "var(--color-slate-500)", fontSize: 'var(--font-base)', lineHeight: 1.5 }}>
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
                        borderRadius: 'var(--radius-md)',
                        border: "var(--border-thin) solid var(--color-slate-200)",
                        backgroundColor: "var(--color-slate-50)",
                        cursor: isVerifying ? "default" : "pointer",
                        transition: "all var(--transition-slow)",
                        opacity: isVerifying ? 0.7 : 1,
                        position: "relative",
                        "&:hover": {
                            borderColor: isVerifying ? "var(--color-slate-200)" : "var(--color-slate-200)",
                            background: isVerifying ? "var(--color-slate-50)" : "var(--color-white)",
                            
                        }
                    }}
                >
                    <Box sx={{ p: 1, borderRadius: 'var(--radius-md)', bgcolor: "rgba(40, 167, 69, 0.1)", color: "var(--color-success)", mr: 1.5 }}>
                        <SmartphoneIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography sx={{ fontWeight: 'var(--font-bold)', color: "var(--color-slate-900)", fontSize: 'var(--font-base)' }}>ऑथेंटिकेटर ऐप</Typography>
                        <Typography sx={{ color: "var(--color-slate-500)", fontSize: 'var(--font-xs)' }}>गूगल ऑथेंटिकेटर या इसके जैसा कुछ उपयोग करें</Typography>
                    </Box>
                    {isVerifying && !totpData && (
                        <Box sx={{ position: "absolute", right: 16 }}>
                            null
                        </Box>
                    )}
                </Box>

                <Box
                    onClick={handleEmailChoice}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 1.5,
                        borderRadius: 'var(--radius-md)',
                        border: "var(--border-thin) solid var(--color-slate-200)",
                        backgroundColor: "var(--color-slate-50)",
                        cursor: isVerifying ? "default" : "pointer",
                        transition: "all var(--transition-slow)",
                        opacity: isVerifying ? 0.7 : 1,
                        position: "relative",
                        "&:hover": {
                            borderColor: isVerifying ? "var(--color-slate-200)" : "var(--color-slate-200)",
                            background: isVerifying ? "var(--color-slate-50)" : "var(--color-white)",
                            
                        }
                    }}
                >
                    <Box sx={{ p: 1, borderRadius: 'var(--radius-md)', bgcolor: "rgba(40, 167, 69, 0.1)", color: "var(--color-success)", mr: 1.5 }}>
                        <EmailIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography sx={{ fontWeight: 'var(--font-bold)', color: "var(--color-slate-900)", fontSize: 'var(--font-base)' }}>ईमेल OTP</Typography>
                        <Typography sx={{ color: "var(--color-slate-500)", fontSize: 'var(--font-xs)' }}>ईमेल के माध्यम से कोड प्राप्त करें</Typography>
                    </Box>
                    {isVerifying && (
                        <Box sx={{ position: "absolute", right: 16 }}>
                            null
                        </Box>
                    )}
                </Box>
            </Box>

            {error && (
                <Typography variant="body2" sx={{ color: "var(--color-error)", fontSize: 'var(--font-sm)', textAlign: "center", fontWeight: 'var(--font-medium)' }}>
                    {error}
                </Typography>
            )}

            <TarangButton
                fullWidth
                variant="text"
                loading={isVerifying}
                disabled={isVerifying || isLoading}
                onClick={handleSkip}
                sx={{ height: 'var(--box-height)', color: 'var(--color-slate-500)' }}
            >
                अभी के लिए सुरक्षा सेटअप छोड़ें
            </TarangButton>

            {setStep && (
                <TarangButton
                    variant="text"
                    fullWidth
                    disabled={isVerifying}
                    onClick={() => { setMode("login"); setStep(1); }}
                    sx={{ color: 'var(--color-slate-500)', mt: 1, height: 'var(--box-height)' }}
                >
                    {"← लॉगिन पर वापस जाएं"}
                </TarangButton>
            )}
        </Box>
        </FormLoadingProvider>
    );
}