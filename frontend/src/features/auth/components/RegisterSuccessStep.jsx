import { Box, Typography, Button } from "@mui/material";
 
import { motion } from "framer-motion";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ShieldIcon from "@mui/icons-material/Shield";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function RegisterSuccessStep({ onProceedTo2fa, onSkipToLogin }) {
  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 3 }}>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
      >
        <Box sx={{ 
          width: 80, 
          height: 80, 
          borderRadius: "50%", 
          bgcolor: "rgba(16, 185, 129, 0.1)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          mb: 1
        }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 50, color: "#28a745" }} />
        </Box>
      </motion.div>

      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px", fontSize: "28px", mb: 1 }}>
          बधाई हो!
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", fontSize: "15px", lineHeight: 1.5 }}>
          आपका रजिस्ट्रेशन सफलतापूर्वक पूरा हो गया है।
        </Typography>
      </Box>

      <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1.5, mt: 3 }}>
        <Button
          fullWidth
          variant="contained" disableElevation
          onClick={onSkipToLogin}
          sx={{
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
            "&.Mui-disabled": { background: "#e2e8f0", color: "#94a3b8" },
          }}
        >
          अभी लॉगिन करें
        </Button>
      </Box>
    </Box>
  );
}
