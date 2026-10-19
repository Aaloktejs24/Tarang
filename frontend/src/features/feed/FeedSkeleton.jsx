"use client";

import React from "react";
import { Box, Card, CardContent, Grid, Container, Skeleton, Stack } from "@mui/material";

export default function FeedSkeleton({ count = 6 }) {
  return (
    <Box sx={{ minHeight: "calc(100vh - 64px)", position: "relative", pt: 4 }}>
      <Container maxWidth="xl" sx={{ px: { xs: 4, md: 6, lg: 8 }, pb: 10, zIndex: 1, position: "relative" }}>
        <Grid container spacing={4} sx={{ width: "var(--size-full)", m: 0 }}>
          {/* Sidebar Skeleton (hidden on mobile) */}
          <Grid size={{xs: 12, md: 3, lg: 2.5}} sx={{ display: { xs: 'none', md: 'block' }, pr: { md: 2 } }}>
            <Box sx={{ pt: 2 }}>
              <Skeleton variant="text" sx={{ width: "60%", height: 24, mb: 2.5 }} />
              {Array.from(new Array(6)).map((_, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1.5 }}>
                  <Skeleton variant="circular" sx={{ width: 20, height: 20 }} />
                  <Skeleton variant="text" sx={{ width: "70%", height: 16 }} />
                </Box>
              ))}
              <Box sx={{ mt: 5 }}>
                <Skeleton variant="text" sx={{ width: "50%", height: 24, mb: 2.5 }} />
                {Array.from(new Array(5)).map((_, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1.5 }}>
                    <Skeleton variant="circular" sx={{ width: 20, height: 20 }} />
                    <Skeleton variant="text" sx={{ width: "80%", height: 16 }} />
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Feed Cards Grid */}
          <Grid size={{xs: 12, md: 9, lg: 9.5}} >
            <Grid container spacing={3} alignItems="stretch">
              {Array.from(new Array(count)).map((_, index) => (
                <Grid size={{xs: 12, sm: 6, lg: 4, xl: 4}} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Box sx={{ width: 'var(--size-full)', maxWidth: 450, display: "flex" }}>
                    <Card
                      sx={{
                        width: "var(--size-full)",
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 'var(--radius-lg)',
                        background: "rgba(255, 255, 255, 0.3)",
                        backdropFilter: "blur(30px)",
                        border: "var(--border-thin) solid rgba(30, 79, 163, 0.2)",
                      }}
                    >
                      {/* Thumbnail Skeleton */}
                      <Skeleton variant="rectangular" sx={{ height: "auto", aspectRatio: "16/9", borderRadius: "15px 15px 0 0" }} />

                      <CardContent sx={{ flexGrow: 1, p: 3, pt: 2.5, display: "flex", flexDirection: "column" }}>
                        {/* Title Skeleton */}
                        <Skeleton variant="text" sx={{ width: "80%", height: 24, mb: 1 }} />
                        
                        {/* Description Skeleton (2 lines) */}
                        <Stack spacing={1} sx={{ mb: 2 }}>
                          <Skeleton variant="text" sx={{ width: "100%", height: 16 }} />
                          <Skeleton variant="text" sx={{ width: "90%", height: 16 }} />
                        </Stack>

                        {/* Uploader Row Skeleton */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 'auto', pt: 2 }}>
                          <Skeleton variant="circular" sx={{ width: 42, height: 42 }} />
                          <Stack spacing={0.5} sx={{ flex: 1 }}>
                            <Skeleton variant="text" sx={{ width: "60%", height: 18 }} />
                            <Skeleton variant="text" sx={{ width: "40%", height: 14 }} />
                          </Stack>
                        </Box>

                        {/* Action Row Skeleton */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2.5 }}>
                          <Skeleton variant="circular" sx={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)' }} />
                          <Skeleton variant="circular" sx={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)' }} />
                          <Box sx={{ flexGrow: 1 }} />
                          <Skeleton variant="rectangular" sx={{ width: 155, height: 44, borderRadius: 'var(--radius-lg)' }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
