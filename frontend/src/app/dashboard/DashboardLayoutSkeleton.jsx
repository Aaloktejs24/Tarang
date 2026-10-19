import React from "react";
import { Box, Skeleton, Grid } from "@mui/material";

export default function DashboardLayoutSkeleton({ hideLayoutExtras }) {
  return (
    <Box sx={{ p: { xs: 2, md: 4, lg: 6 }, display: 'flex', flexDirection: 'column', gap: 4, minHeight: 'calc(100vh - 72px)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="rounded" width={100} height={40} sx={{ borderRadius: 'var(--radius-lg)' }} />
      </Box>
      <Grid container spacing={3}>
        {[1, 2, 3].map(i => (
          <Grid key={i} size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rounded" height={150} sx={{ borderRadius: 'var(--radius-lg)' }} />
          </Grid>
        ))}
      </Grid>
      <Skeleton variant="rounded" height={300} sx={{ borderRadius: 'var(--radius-lg)', mt: 2 }} />
    </Box>
  );
}
