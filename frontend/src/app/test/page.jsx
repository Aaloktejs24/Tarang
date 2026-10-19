"use client";
import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { Box } from '@mui/material';

export default function TestPage() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 4 }}>
        <MobileDatePicker 
          format="DD/MM/YYYY"
          slotProps={{ 
            textField: { 
              readOnly: true,
              inputProps: {
                style: { cursor: 'pointer' }
              }
            } 
          }}
          sx={{
            '& .MuiInputBase-input': {
              pointerEvents: 'none'
            }
          }}
        />
      </Box>
    </LocalizationProvider>
  );
}
