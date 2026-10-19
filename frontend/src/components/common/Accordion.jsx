import React from 'react';
import { Accordion as MuiAccordion, AccordionSummary as MuiAccordionSummary, AccordionDetails as MuiAccordionDetails } from '@mui/material';

export const Accordion = ({ children, sx, ...props }) => {
  return (
    <MuiAccordion
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
    </MuiAccordion>
  );
};

export const AccordionSummary = ({ children, sx, disabled, ...props }) => {
  return (
    <MuiAccordionSummary
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
    </MuiAccordionSummary>
  );
};

export const AccordionDetails = ({ children, sx, ...props }) => {
  return (
    <MuiAccordionDetails
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderTop: 'var(--border-thin) solid var(--card-border)',
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiAccordionDetails>
  );
};

export { Accordion as CustomAccordion, AccordionSummary as CustomAccordionSummary, AccordionDetails as CustomAccordionDetails };
export default Accordion;
