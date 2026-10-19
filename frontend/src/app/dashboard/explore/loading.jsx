"use client";
import React from 'react';
import { Box, Container, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExploreListSkeleton from '../../../features/institute/ExploreListSkeleton';
import { useAccessibility } from '../../../contexts/AccessibilityContext';
import CentralDropdown from '../../../components/common/CentralDropdown';
import { useBreadcrumbs } from '../../../contexts/BreadcrumbContext';
import { useAppRouter as useRouter } from '../../../hooks/useAppRouter';

export default function ExploreLoading() {
  const { language } = useAccessibility();
  const router = useRouter();
  
  useBreadcrumbs([
    { labelEn: 'Home', labelHi: 'गृह', onClick: () => router.push('/dashboard/home') },
    { labelEn: 'Explore', labelHi: 'खोजें' }
  ]);

  return (
    <Box sx={{ minHeight: "calc(100vh - 64px)", pt: { xs: 8, md: 10 }, pb: 10, position: "relative", zIndex: 1 }}>
      <Container maxWidth="xl" sx={{ mt: 4, px: { xs: 2, sm: 4, md: 8, lg: 12, xl: 16 } }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 6, alignItems: 'center', justifyContent: 'space-between', pointerEvents: 'none' }}>
          <TextField
            fullWidth
            placeholder={language === 'en' ? "Search institutes by name or location..." : "नाम या स्थान से संस्थान खोजें..."}
            variant="outlined"
            value=""
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'var(--color-slate-500)' }} />
                </InputAdornment>
              ),
            }}
            sx={{ 
              flex: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                height: 'var(--box-height, 48px)',
                fontSize: 'var(--font-base)',
                color: 'var(--color-slate-900)',
                fontFamily: 'inherit',
                '& fieldset': {
                  borderColor: 'rgba(30, 79, 163, 0.2)',
                  borderWidth: '1px',
                },
              },
              '& .MuiOutlinedInput-input': {
                padding: '0 14px',
                height: '100%',
                boxSizing: 'border-box',
              }
            }}
          />
          <Box sx={{ display: 'flex', gap: 2, width: { xs: 'var(--size-full)', md: 'auto' } }}>
            <Box sx={{ minWidth: 160, flex: 1 }}>
              <CentralDropdown
                value="all"
                onChange={() => {}}
                options={[
                  { value: "all", label: language === 'en' ? "All Types" : "सभी प्रकार" },
                ]}
                searchable={false}
              />
            </Box>

            <Box sx={{ minWidth: 160, flex: 1 }}>
              <CentralDropdown
                value="newest"
                onChange={() => {}}
                options={[
                  { value: "newest", label: language === 'en' ? "Newest First" : "सबसे नया" },
                ]}
                searchable={false}
              />
            </Box>
          </Box>
        </Box>
        <ExploreListSkeleton />
      </Container>
    </Box>
  );
}
