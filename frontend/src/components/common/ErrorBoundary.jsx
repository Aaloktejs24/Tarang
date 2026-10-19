"use client";
import React from 'react';
import { Box, Typography } from '@mui/material';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, bgcolor: '#fef2f2', border: '1px solid #ef4444', borderRadius: 2, m: 2 }}>
          <Typography variant="h6" color="error" gutterBottom>Something went wrong.</Typography>
          <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'monospace', bgcolor: '#fee2e2', p: 2, borderRadius: 1 }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </Typography>
        </Box>
      );
    }
    return this.props.children;
  }
}
