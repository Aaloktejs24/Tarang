import React from 'react';
import { Box, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export default function AuthMessage({ type = 'error', message }) {
    if (!message) return null;
    
    const isError = type === 'error';
    
    return (
        <Box 
            sx={{ 
                display: 'flex', 
                alignItems: 'flex-start',
                gap: 1,
                p: 1.25, 
                mb: 0.5,
                borderRadius: 'var(--radius-md)', 
                bgcolor: isError ? 'rgba(239, 68, 68, 0.08)' : 'rgba(34, 197, 94, 0.08)',
                border: `1px solid ${isError ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`,
                textAlign: 'left'
            }}
        >
            {isError ? (
                <ErrorOutlineIcon sx={{ color: '#ef4444', fontSize: 18, mt: '2px', flexShrink: 0 }} />
            ) : (
                <CheckCircleOutlineIcon sx={{ color: '#22c55e', fontSize: 18, mt: '2px', flexShrink: 0 }} />
            )}
            <Typography 
                variant="body2" 
                sx={{ 
                    color: isError ? '#dc2626' : '#16a34a', 
                    fontSize: '13px', 
                    fontWeight: 'var(--font-medium)',
                    lineHeight: 1.5
                }}
            >
                {message}
            </Typography>
        </Box>
    );
}
