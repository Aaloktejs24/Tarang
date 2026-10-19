import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export default function StatCard({ 
  title, 
  value, 
  icon, 
  iconBgColor, 
  iconColor, 
  trendText, 
  trendValue, 
  trendPositive = true 
}) {
  return (
    <Card sx={{ 
      borderRadius: 'var(--radius-lg)', 
      border: 'var(--border-thin) solid rgba(255, 255, 255, 0.6)',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
      backdropFilter: 'blur(10px)',
      height: 'var(--size-full)'
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="body2" sx={{ color: 'var(--color-slate-500)', fontWeight: 'var(--font-semibold)', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ color: 'var(--color-slate-900)', fontWeight: 800 }}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ p: 1, borderRadius: 'var(--radius-lg)', bgcolor: iconBgColor, color: iconColor, display: 'flex' }}>
            {icon}
          </Box>
        </Box>
        {trendText && (
          <Typography variant="body2" sx={{ 
            color: trendPositive ? 'var(--color-success)' : 'var(--color-error)', 
            fontWeight: 'var(--font-semibold)', 
            display: 'flex', 
            alignItems: 'center' 
          }}>
            {trendPositive ? <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} /> : <TrendingDownIcon sx={{ fontSize: 16, mr: 0.5 }} />}
            {trendValue} {trendText}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
