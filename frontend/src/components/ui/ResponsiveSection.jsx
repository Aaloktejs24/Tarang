import React from "react";
import { Box, Typography, Paper, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import PremiumCard from "./PremiumCard";

const ResponsiveSection = ({ isMobile, title, action, children, sxParams = {}, customTitleNode }) => {
  if (isMobile) {
    return (
      <Accordion 
        disableGutters
        elevation={0}
        sx={{
          borderRadius: { xs: "16px !important", sm: "20px !important", md: "24px !important" },
          overflow: "hidden",
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.6)",
          "&:before": { display: "none" },
          ...sxParams
        }}
      >
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon sx={{ color: "var(--color-primary)" }} />}
          sx={{ px: { xs: 2.5, sm: 4 }, py: 1 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "var(--size-full)", pr: 2 }}>
            {customTitleNode ? customTitleNode : <Typography variant="h6" fontWeight={900} color="var(--color-slate-900)">{title}</Typography>}
            {action && <Box onClick={(e) => e.stopPropagation()}>{action}</Box>}
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ px: { xs: 2.5, sm: 4 }, pb: 4, pt: 0 }}>
          {children}
        </AccordionDetails>
      </Accordion>
    );
  }

  return (
    <PremiumCard
      disableHover
      sx={{
        p: { xs: 2.5, md: 5 },
        overflow: "hidden",
        ...sxParams
      }}
    >
      <Box sx={{ display: "flex", justifyContent: action ? "space-between" : "flex-start", alignItems: "center", mb: action ? 6 : 4, gap: 4 }}>
        {customTitleNode ? customTitleNode : <Typography variant="h5" fontWeight={900} color="var(--color-slate-900)">{title}</Typography>}
        {action}
      </Box>
      {children}
    </PremiumCard>
  );
};

export default ResponsiveSection;
