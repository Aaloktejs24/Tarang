import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';

export const CustomAccordion = ({ children, sx, ...props }) => {
  return (
    <Accordion
      disableGutters
      elevation={0}
      TransitionProps={{
        timeout: 150,
      }}
      sx={{
        mb: 2,
        bgcolor: 'var(--card-bg)',
        backdropFilter: 'var(--card-blur)',
        WebkitBackdropFilter: 'var(--card-blur)',
        borderRadius: 'var(--radius-lg) !important',
        border: 'var(--border-thin) solid var(--card-border)',
        boxShadow: 'none',
        overflow: 'hidden',
        transform: 'translateZ(0)',
        '&:before': { display: 'none' },
        '& .MuiCollapse-root': {
          transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1) !important',
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Accordion>
  );
};

export const CustomAccordionSummary = ({ children, sx, disabled, ...props }) => {
  return (
    <AccordionSummary
      sx={{
        p: { xs: 2, sm: 2.5 },
        pointerEvents: disabled ? 'none' : 'auto',
        transition: 'none',
        '&&, &&:focus, &&:hover, &&:active, &&.Mui-expanded, &&.Mui-focusVisible': {
          background: 'rgba(0, 86, 179, 0.04)',
          backgroundColor: 'rgba(0, 86, 179, 0.04)',
        },
        '& .MuiAccordionSummary-content': {
          m: 0,
          '&.Mui-expanded': { m: 0 },
        },
        '& .MuiAccordionSummary-expandIconWrapper': {
          ml: 1,
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </AccordionSummary>
  );
};

export const CustomAccordionDetails = ({ children, sx, ...props }) => {
  return (
    <AccordionDetails
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderTop: 'var(--border-thin) solid var(--card-border)',
        ...sx,
      }}
      {...props}
    >
      {children}
    </AccordionDetails>
  );
};
