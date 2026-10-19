import React from "react";
import { Box, Typography, Paper, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const ResponsiveSection = ({ isMobile, title, action, children, sxParams = {}, customTitleNode }) => {
  if (isMobile) {
    return (
      <Accordion 
        disableGutters
        elevation={0}
        sx={{
          borderRadius: { xs: "16px !important", sm: "20px !important", md: "24px !important" },
          background: "rgba(255, 255, 255, 0.75)",
          border: "1px solid #0056b3",
          backdropFilter: "blur(20px)",
          overflow: "hidden",
          "&:before": { display: "none" },
          ...sxParams
        }}
      >
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon sx={{ color: "#0056b3" }} />}
          sx={{ px: { xs: 2.5, sm: 4 }, py: 1 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", pr: 2 }}>
            {customTitleNode ? customTitleNode : <Typography variant="h6" fontWeight={900} color="#0f172a">{title}</Typography>}
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
    <Paper
      elevation={0}
      sx={{
        borderRadius: { xs: "16px", sm: "20px", md: "24px" },
        background: "rgba(255, 255, 255, 0.75)",
        border: "1px solid #0056b3",
        backdropFilter: "blur(20px)",
        p: { xs: 2.5, md: 5 },
        overflow: "hidden",
        ...sxParams
      }}
    >
      <Box sx={{ display: "flex", justifyContent: action ? "space-between" : "flex-start", alignItems: "center", mb: action ? 6 : 4, gap: 4 }}>
        {customTitleNode ? customTitleNode : <Typography variant="h5" fontWeight={900} color="#0f172a">{title}</Typography>}
        {action}
      </Box>
      {children}
    </Paper>
  );
};

export default ResponsiveSection;
