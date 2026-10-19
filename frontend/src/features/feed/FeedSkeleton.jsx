"use client";

import React from "react";
import { Box, Card, CardContent, Grid, Container } from "@mui/material";
import Skeleton from "../../components/common/Skeleton";

export default function FeedSkeleton({ count = 6 }) {
  return (
    <Box sx={{ minHeight: "calc(100vh - 64px)", position: "relative", pt: 4 }}>
      <Container maxWidth="xl" sx={{ px: { xs: 4, md: 6, lg: 8 }, pb: 10, zIndex: 1, position: "relative" }}>
        <Grid container spacing={4} sx={{ width: "100%", m: 0 }}>
          {/* Sidebar Skeleton (hidden on mobile) */}
          <Grid size={{xs: 12, md: 3, lg: 2.5}} sx={{ display: { xs: 'none', md: 'block' }, pr: { md: 2 } }}>
            <Box sx={{ pt: 2 }}>
              <Skeleton variant="text" width="60%" height={24} style={{ marginBottom: 20 }} />
              {Array.from(new Array(6)).map((_, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1.5 }}>
                  <Skeleton variant="circular" width={20} height={20} />
                  <Skeleton variant="text" width="70%" height={16} />
                </Box>
              ))}
              <Box sx={{ mt: 5 }}>
                <Skeleton variant="text" width="50%" height={24} style={{ marginBottom: 20 }} />
                {Array.from(new Array(5)).map((_, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1.5 }}>
                    <Skeleton variant="circular" width={20} height={20} />
                    <Skeleton variant="text" width="80%" height={16} />
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
                  <Box sx={{ width: '100%', maxWidth: 450, display: "flex" }}>
                    <Card
                      sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: "16px",
                        background: "rgba(255, 255, 255, 0.3)",
                        backdropFilter: "blur(30px)",
                        border: "1px solid rgba(30, 79, 163, 0.2)",
                        boxShadow: "none",
                      }}
                    >
                      {/* Thumbnail Skeleton */}
                      <Skeleton variant="rectangular" height="auto" style={{ aspectRatio: "16/9", borderRadius: "15px 15px 0 0" }} />

                      <CardContent sx={{ flexGrow: 1, p: 3, pt: 2.5, display: "flex", flexDirection: "column" }}>
                        {/* Title Skeleton */}
                        <Skeleton variant="text" width="80%" height={24} style={{ marginBottom: 8 }} />
                        
                        {/* Description Skeleton (2 lines) */}
                        <Skeleton variant="text" width="100%" height={16} />
                        <Skeleton variant="text" width="90%" height={16} style={{ marginBottom: 16 }} />

                        {/* Uploader Row Skeleton */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 'auto', pt: 2 }}>
                          <Skeleton variant="circular" width={42} height={42} />
                          <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="60%" height={18} style={{ marginBottom: 4 }} />
                            <Skeleton variant="text" width="40%" height={14} />
                          </Box>
                        </Box>

                        {/* Action Row Skeleton */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2.5 }}>
                          <Skeleton variant="circular" width={44} height={44} style={{ borderRadius: "12px" }} />
                          <Skeleton variant="circular" width={44} height={44} style={{ borderRadius: "12px" }} />
                          <Box sx={{ flexGrow: 1 }} />
                          <Skeleton variant="rectangular" width={155} height={44} style={{ borderRadius: "12px" }} />
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
