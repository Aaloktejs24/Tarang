"use client";

import React from 'react';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

const Loader = ({ fullPage = false, mini = false, transparent = false }) => {
  if (mini) {
    return <CircularProgress size={20} color="inherit" />;
  }
  
  return (
    <Backdrop
      sx={(theme) => ({ 
        color: '#fff', 
        zIndex: theme.zIndex.drawer + 9999,
        background: transparent ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.8)'
      })}
      open={true}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}

export default Loader;
