"use client";
import React from 'react';
import { Box, Skeleton } from '@mui/material';
import PremiumCard from '../../components/ui/PremiumCard';

export default function ProfileSkeleton() {
  return (
    <Box sx={{ height: "calc(100vh - 72px)", overflow: "hidden", display: "flex" }}>
      
      {/* LEFT SIDEBAR SKELETON */}
      <Box sx={{
        width: { xs: '100%', sm: 420, md: 480 },
        flexShrink: 0,
        overflowY: "auto",
        height: "100%",
        display: { xs: 'none', sm: 'block' },
        "&::-webkit-scrollbar": { display: "none" },
        scrollbarWidth: "none",
        pl: { sm: 2, md: 4, lg: 6 },
        pr: { sm: 2, md: 3, lg: 4 },
        py: { sm: 3, md: 4 },
      }}>
        <Box sx={{ width: "var(--size-full)" }}>
          <PremiumCard variant="profile" sx={{ pt: 0, pb: 4, px: 4, textAlign: "left", overflow: "hidden" }}>
            <Skeleton variant="rectangular" height={120} sx={{ mx: -4, mb: 0 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mt: -5, mb: 3 }}>
              <Box sx={{ p: 0.5, bgcolor: "rgba(255, 255, 255, 0.6)", borderRadius: 'var(--radius-full)', zIndex: 2 }}>
                <Skeleton variant="circular" width={100} height={100} sx={{ border: "none" }} />
              </Box>
              <Box sx={{ pb: 1, zIndex: 2, alignSelf: "flex-end" }}>
                <Skeleton variant="rounded" width={80} height={28} sx={{ borderRadius: 'var(--radius-lg)' }} />
              </Box>
            </Box>
            <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="70%" height={20} />
          </PremiumCard>
          
          <PremiumCard variant="profile" sx={{ p: { xs: 2.5, sm: 4 }, mt: 3 }}>
            <Skeleton variant="text" width="50%" height={24} sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} variant="rounded" width={60 + (i * 15 % 40)} height={28} sx={{ borderRadius: 'var(--radius-lg)' }} />
              ))}
            </Box>
          </PremiumCard>
        </Box>
      </Box>

      {/* RIGHT CONTENT SKELETON */}
      <Box sx={{
        flexGrow: 1,
        display: { xs: "block", sm: "flex" },
        flexDirection: "column",
        height: "100%",
        overflowY: { xs: 'auto', sm: 'hidden' },
        "&::-webkit-scrollbar": { display: "none" },
        scrollbarWidth: "none",
        pl: { xs: 2, md: 3, lg: 4 },
        pr: { xs: 2, md: 4, lg: 6 },
        pt: { xs: 3, md: 4 },
        pb: { xs: 4, sm: 0 },
      }}>
        
        {/* Mobile Sidebar (Visible only on xs) */}
        <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 3 }}>
          <PremiumCard variant="profile" sx={{ pt: 0, pb: 4, px: 4, textAlign: "left", overflow: "hidden", mb: 3 }}>
            <Skeleton variant="rectangular" height={120} sx={{ mx: -4, mb: 0 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mt: -5, mb: 3 }}>
              <Box sx={{ p: 0.5, bgcolor: "rgba(255, 255, 255, 0.6)", borderRadius: 'var(--radius-full)', zIndex: 2 }}>
                <Skeleton variant="circular" width={100} height={100} />
              </Box>
              <Box sx={{ pb: 1, zIndex: 2, alignSelf: "flex-end" }}>
                <Skeleton variant="rounded" width={80} height={28} sx={{ borderRadius: 'var(--radius-lg)' }} />
              </Box>
            </Box>
            <Skeleton variant="text" width="70%" height={32} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="50%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="80%" height={20} />
          </PremiumCard>
          
          <PremiumCard variant="profile" sx={{ p: 2.5 }}>
            <Skeleton variant="text" width="60%" height={24} sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} variant="rounded" width={70 + (i * 10 % 30)} height={28} sx={{ borderRadius: 'var(--radius-lg)' }} />
              ))}
            </Box>
          </PremiumCard>
        </Box>

        {/* Desktop Tabs Header Skeleton */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "var(--border-thin) solid rgba(0, 86, 179, 0.15)", pb: 1.5, mb: 2, flexShrink: 0 }}>
          <Box sx={{ display: "flex", gap: 4, overflowX: "auto" }}>
            {[1, 2, 3].map(i => <Skeleton key={i} variant="text" width={80} height={32} />)}
          </Box>
          <Box sx={{ display: "flex", gap: 1.5, flexShrink: 0 }}>
            <Skeleton variant="rounded" width={110} height={32} sx={{ borderRadius: 'var(--radius-lg)' }} />
          </Box>
        </Box>

        {/* Tab Content Skeleton */}
        <Box sx={{ flexGrow: 1, overflowY: { xs: 'visible', sm: 'auto' }, "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none", pb: 6 }}>
          <Skeleton variant="text" width="30%" height={28} sx={{ mb: 1.5 }} />
          <Skeleton variant="text" width="100%" height={20} />
          <Skeleton variant="text" width="100%" height={20} />
          <Skeleton variant="text" width="90%" height={20} sx={{ mb: 4 }} />

          <Skeleton variant="text" width="20%" height={28} sx={{ mb: 2 }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
            {[1, 2, 3, 4].map((item) => (
              <PremiumCard variant="stat" key={item} sx={{ width: '100%', height: 80, display: "flex", alignItems: "center", px: 2 }}>
                 <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                 <Box sx={{ flexGrow: 1 }}>
                   <Skeleton variant="text" width="70%" height={20} />
                   <Skeleton variant="text" width="50%" height={16} />
                 </Box>
              </PremiumCard>
            ))}
          </Box>
        </Box>

      </Box>
    </Box>
  );
}
