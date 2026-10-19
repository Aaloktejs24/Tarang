"use client";

import React, { createContext, useState, useCallback, useContext } from "react";
import { Snackbar, Alert, Fade } from "@mui/material";

const ToastContext = createContext({
  showToast: () => { },
});

export const useToast = () => useContext(ToastContext);



export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "error", // "error" | "success" | "warning" | "info"
    duration: 4000,
    position: { vertical: "top", horizontal: "right" }
  });

  const showToast = useCallback((message, severity = "error", duration = 4000, position = { vertical: "top", horizontal: "right" }) => {
    setToast({ open: true, message, severity, duration, position });
  }, []);

  const handleClose = (_event, reason) => {
    if (reason === "clickaway") return;
    setToast((prev) => ({ ...prev, open: false }));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={toast.duration}
        onClose={handleClose}
        anchorOrigin={toast.position}
        TransitionComponent={Fade}
        sx={{ zIndex: 99999, mt: { xs: 1, sm: 2 } }} // reduced margin top
      >
        <Alert
          onClose={handleClose}
          severity={toast.severity}
          sx={{
            width: "100%",
            minWidth: { xs: "90vw", sm: 360 },
            maxWidth: 520,
            px: 2.5,
            py: 1.5,
            borderRadius: "var(--radius-lg)",
            fontWeight: "var(--font-semibold)",
            fontSize: "var(--font-sm)",
            boxShadow: "none",
            alignItems: "center",
            backgroundColor: toast.severity === 'error' ? 'rgba(254, 242, 242, 0.30)' :
              toast.severity === 'success' ? 'rgba(236, 253, 245, 0.30)' :
                toast.severity === 'warning' ? 'rgba(255, 251, 235, 0.30)' : 'rgba(239, 246, 255, 0.30)',
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: `var(--border-thin) solid ${toast.severity === 'error' ? 'var(--color-error)' :
              toast.severity === 'success' ? 'var(--color-success)' :
                toast.severity === 'warning' ? 'var(--color-warning)' : 'var(--color-info)'}`,
            color: toast.severity === 'error' ? 'var(--color-error)' :
              toast.severity === 'success' ? 'var(--color-success)' :
                toast.severity === 'warning' ? 'var(--color-warning)' : 'var(--color-info)',
            "& .MuiAlert-icon": {
              fontSize: 28,
              color: 'inherit',
              mr: 1.5,
              mt: 0,
            },
            "& .MuiAlert-action": {
              pt: 0,
              pb: 0,
              mr: 0,
              alignItems: "center",
            },
            "& .MuiAlert-action .MuiIconButton-root": {
              color: 'inherit',
            }
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};
