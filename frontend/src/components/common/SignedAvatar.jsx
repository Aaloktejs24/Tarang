import React, { useState, useEffect } from 'react';
import { Avatar } from '@mui/material';
import { apiClient } from '../../lib/apiClient';

/**
 * A wrapper around Material-UI Avatar that automatically fetches fresh presigned URLs
 * for MinIO storage keys/urls to prevent 403 Forbidden errors due to expired tokens.
 *
 * @param {object} props - Standard Avatar props plus `src` which can be a clean MinIO URL or regular URL.
 */
export const SignedAvatar = ({ src, ...props }) => {
  const isSafeInitialSrc = src && (src.startsWith('data:') || src.startsWith('/'));
  const [signedSrc, setSignedSrc] = useState(isSafeInitialSrc ? src : undefined);

  useEffect(() => {
    let isMounted = true;
    
    if (!src) {
      setSignedSrc(undefined);
      return;
    }

    // If it's a relative URL or data URI, use it directly
    if (src.startsWith('data:') || src.startsWith('/')) {
      setSignedSrc(src);
      return;
    }

    // Attempt to fetch a fresh signed URL from the backend
    const fetchSignedUrl = async () => {
      try {
        const cleanSrc = src.split('?')[0];
        const response = await apiClient.get('/s3/get', { params: { url: cleanSrc } });
        if (isMounted && response.data?.signed_url) {
          setSignedSrc(response.data.signed_url);
        }
      } catch (err) {
        console.error("Failed to fetch signed URL for avatar:", err);
        // Fallback to original src if fetching fails
        if (isMounted) setSignedSrc(src);
      }
    };

    fetchSignedUrl();

    return () => {
      isMounted = false;
    };
  }, [src]);

  return <Avatar src={signedSrc} {...props} />;
};
