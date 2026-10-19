import React from 'react';
import '../../styles/skeleton.css';

/**
 * A highly customizable Skeleton component for partial content loading.
 * 
 * @param {string} variant - 'text' | 'circular' | 'rectangular'
 * @param {number|string} width - width of the skeleton
 * @param {number|string} height - height of the skeleton
 * @param {string} className - extra CSS classes
 * @param {object} style - extra inline styles
 */
export default function Skeleton({ variant = 'text', width, height, className = '', style = {} }) {
  // Determine base dimensions based on variant
  const defaultStyles = {};
  if (variant === 'text') {
    defaultStyles.height = height || '1.2em';
    defaultStyles.width = width || '100%';
    defaultStyles.marginTop = '0.2em';
    defaultStyles.marginBottom = '0.2em';
  } else if (variant === 'circular') {
    defaultStyles.width = width || 40;
    defaultStyles.height = height || 40;
  } else if (variant === 'rectangular') {
    defaultStyles.width = width || '100%';
    defaultStyles.height = height || 100;
  }

  return (
    <div
      className={`skeleton-root skeleton-${variant} ${className}`}
      style={{
        ...defaultStyles,
        ...style
      }}
    />
  );
}
