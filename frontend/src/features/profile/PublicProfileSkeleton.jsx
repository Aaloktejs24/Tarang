"use client";
import React from 'react';
import { Box, Container, Paper, Skeleton, Typography, Divider, Stack } from '@mui/material';

export default function PublicProfileSkeleton() {
  return (
    <Box sx={{ minHeight: "var(--size-screen-h)", bgcolor: "var(--color-slate-50)" }}>
      <Box sx={{ bgcolor: "var(--card-bg)", backdropFilter: "var(--card-blur)", py: 2, px: 4, mb: 0, borderBottom: "var(--border-thin) solid var(--color-slate-200)" }}>
        <Container maxWidth="lg">
          <Typography variant="h6" fontWeight={900} color="var(--color-primary)" sx={{ letterSpacing: "-1px" }}>
            TARANG <span style={{ color: "var(--color-slate-500)", fontWeight: 'var(--font-medium)', fontSize: 'var(--font-sm)' }}>• PUBLIC PROFILE</span>
          </Typography>
        </Container>
      </Box>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper elevation={0} sx={{ borderRadius: { xs: "16px", sm: "20px", md: "24px" }, overflow: "hidden", border: "var(--border-thin) solid rgba(30, 79, 163, 0.1)" }}>
          <Skeleton variant="rectangular" height={260} />
          <Box sx={{ px: { xs: 3, md: 5 }, pb: 5, position: "relative", mt: -10 }}>
            <Box sx={{ display: "flex", alignItems: "flex-end", flexWrap: "wrap", gap: 3 }}>
              <Skeleton variant="circular" width={160} height={160} sx={{ border: "6px solid var(--color-white)" }} />
              <Stack spacing={1} sx={{ mb: 2, flex: 1 }}>
                <Skeleton variant="text" width={250} height={40} />
                <Skeleton variant="text" width={200} height={30} />
                <Skeleton variant="text" width={150} height={20} />
              </Stack>
              <Skeleton variant="rounded" width={100} height={40} sx={{ borderRadius: "var(--radius-full)", mb: 2 }} />
            </Box>
            <Divider sx={{ my: 4, opacity: 0.5 }} />
            <Stack spacing={1} sx={{ maxWidth: "800px" }}>
              <Skeleton variant="text" width={100} height={30} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="100%" height={20} />
              <Skeleton variant="text" width="100%" height={20} />
              <Skeleton variant="text" width="80%" height={20} />
            </Stack>
            <Box sx={{ mt: 4, display: "flex", gap: 1.5 }}>
              <Skeleton variant="rounded" width={120} height={36} sx={{ borderRadius: 'var(--radius-lg)' }} />
              <Skeleton variant="rounded" width={100} height={36} sx={{ borderRadius: 'var(--radius-lg)' }} />
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
