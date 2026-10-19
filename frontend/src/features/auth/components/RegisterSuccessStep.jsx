import { Box, Typography } from "@mui/material";
 
import { motion } from "framer-motion";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ShieldIcon from "@mui/icons-material/Shield";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import TarangButton from "../../../components/common/TarangButton";

export default function RegisterSuccessStep({ onProceedTo2fa, onSkipToLogin }) {
  return (
    <Box sx={{ width: "var(--size-full)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 3 }}>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
      >
        <Box sx={{ 
          borderRadius: 'var(--radius-full)', 
          bgcolor: 'transparent',
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
        }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 50, color: "var(--color-success)" }} />
        </Box>
      </motion.div>

      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-slate-900)", letterSpacing: "-0.5px", fontSize: 'var(--font-2xl)', mb: 1 }}>
          बधाई हो!
        </Typography>
        <Typography variant="body2" sx={{ color: "var(--color-slate-500)", fontSize: 'var(--font-base)', lineHeight: 1.5 }}>
          आपका रजिस्ट्रेशन सफलतापूर्वक पूरा हो गया है।
        </Typography>
      </Box>

      <Box sx={{ width: "var(--size-full)", display: "flex", flexDirection: "column", gap: 1.5 }}>
        <TarangButton
          fullWidth
          onClick={onSkipToLogin}
          sx={{ height: 'var(--box-height)' }}
        >
          अभी लॉगिन करें
        </TarangButton>
      </Box>
    </Box>
  );
}
