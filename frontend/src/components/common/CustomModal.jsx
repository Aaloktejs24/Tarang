import React from "react";
import { Box, Paper, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import useScrollLock from "../../hooks/useScrollLock";
import BackdropBlur from "./BackdropBlur";

export default function CustomModal({
  open,
  onClose,
  onBack,
  children,
  maxWidth = "600px",
  minHeight = "auto",
  showCloseButton = true,
  disableBackdropClick = false,
  innerBoxSx = {},
}) {
  useScrollLock(open);

  if (!open) return null;

  const handleBackdropClick = (e) => {
    if (!disableBackdropClick && onClose) {
      onClose(e);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2 } },
  };

  return (
    <BackdropBlur onClick={handleBackdropClick} zIndex={1200}>
      <Paper
        onClick={(e) => e.stopPropagation()}
        elevation={0}
        component={motion.div}
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "var(--size-full)",
          maxWidth: maxWidth,
          borderRadius: { xs: 0, sm: "28px" },
          background: `
            radial-gradient(at 0% 0%, rgba(0, 86, 179, 0.45) 0, transparent 50%), 
            radial-gradient(at 100% 0%, rgba(40, 167, 69, 0.3) 0, transparent 50%), 
            radial-gradient(at 80% 90%, rgba(40, 167, 69, 0.2) 0, transparent 50%),
            radial-gradient(at 20% 80%, rgba(0, 86, 179, 0.15) 0, transparent 50%),
            #eef2f6
          `,
          border: "var(--border-thin) solid var(--color-slate-200)",
          overflowY: "auto",
          maxHeight: "92vh",
        }}
      >
        <Box
          sx={{
            px: { xs: 3, sm: 8 },
            py: 3,
            position: "relative",
            minHeight: minHeight,
            ...innerBoxSx,
          }}
        >
          {onBack && (
            <IconButton
              onClick={onBack}
              disableRipple
              sx={{ 
                position: "absolute", 
                top: 16, 
                left: 16, 
                color: "var(--color-slate-500)",
                "&:hover": { bgcolor: "transparent" }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}

          {showCloseButton && onClose && (
            <IconButton
              onClick={onClose}
              disableRipple
              sx={{
                display: { xs: "inline-flex", md: "none" },
                position: "absolute",
                top: 16,
                right: 16,
                color: "var(--color-slate-500)",
                "&:hover": { bgcolor: "transparent" }
              }}
            >
              <CloseIcon />
            </IconButton>
          )}

          {children}
        </Box>
      </Paper>
    </BackdropBlur>
  );
}
