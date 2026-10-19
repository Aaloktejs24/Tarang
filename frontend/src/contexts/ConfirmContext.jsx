"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import { useTranslation } from '../hooks/useTranslation';
import TarangButton from '../components/common/TarangButton';

const ConfirmContext = createContext();

export const useConfirm = () => {
  return useContext(ConfirmContext);
};

export const ConfirmProvider = ({ children }) => {
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: '',
    message: '',
    confirmText: '',
    cancelText: '',
    onConfirm: null,
    onCancel: null,
    variant: 'danger', // 'danger' | 'primary'
  });
  
  const { language } = useTranslation();

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmState({
        open: true,
        title: options.title || (language === 'en' ? 'Confirm' : 'पुष्टि करें'),
        message: options.message || '',
        confirmText: options.confirmText || (language === 'en' ? 'Confirm' : 'पुष्टि करें'),
        cancelText: options.cancelText || (language === 'en' ? 'Cancel' : 'रद्द करें'),
        variant: options.variant || 'danger',
        onConfirm: () => {
          setConfirmState((prev) => ({ ...prev, open: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmState((prev) => ({ ...prev, open: false }));
          resolve(false);
        },
      });
    });
  }, [language]);

  const handleClose = () => {
    if (confirmState.onCancel) {
      confirmState.onCancel();
    }
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog
        open={confirmState.open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: 'var(--radius-lg)',
            p: 1,
            maxWidth: 400,
            width: '90%',
            background: `
            radial-gradient(at 0% 0%, rgba(0, 86, 179, 0.45) 0, transparent 50%), 
            radial-gradient(at 100% 0%, rgba(40, 167, 69, 0.3) 0, transparent 50%), 
            radial-gradient(at 80% 90%, rgba(40, 167, 69, 0.2) 0, transparent 50%),
            radial-gradient(at 20% 80%, rgba(0, 86, 179, 0.15) 0, transparent 50%),
            #eef2f6
          `,
            backdropFilter: 'blur(20px)',
          }
        }}
        BackdropProps={{
          sx: { backdropFilter: 'blur(6px)', backgroundColor: 'rgba(15,23,42,0.4)' }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2.5, px: 3, fontWeight: 800, color: 'var(--color-slate-900)', fontSize: '1.15rem' }}>
          {confirmState.title}
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 1 }}>
          <Typography sx={{ color: 'var(--color-slate-500)', fontSize: 'var(--font-base)', lineHeight: 1.6 }}>
            {confirmState.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1 }}>
          <TarangButton
            onClick={confirmState.onCancel}
            variant="outlined"
            size="sm"
          >
            {confirmState.cancelText}
          </TarangButton>
          <TarangButton
            onClick={confirmState.onConfirm}
            variant={confirmState.variant === 'danger' ? 'danger' : 'gradient'}
            size="sm"
          >
            {confirmState.confirmText}
          </TarangButton>
        </DialogActions>
      </Dialog>
    </ConfirmContext.Provider>
  );
};
