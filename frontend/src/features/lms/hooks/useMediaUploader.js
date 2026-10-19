import { useState, useRef, useEffect } from 'react';
import { lmsService } from '../lmsService';
import axios from 'axios';

export function useMediaUploader() {
  const [status, setStatus] = useState('IDLE'); // IDLE, REQUESTING_INTENT, UPLOADING, PROCESSING, COMPLETED, ERROR
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [resultData, setResultData] = useState(null);

  const pollIntervalRef = useRef(null);
  const isPollingRef = useRef(false);

  useEffect(() => {
    return () => {
      isPollingRef.current = false;
      if (pollIntervalRef.current) {
        clearTimeout(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, []);

  const startPolling = (pollingJobId, type) => {
    if (pollIntervalRef.current) {
      clearTimeout(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    setStatus('PROCESSING');
    isPollingRef.current = true;

    const poll = async () => {
      if (!isPollingRef.current) return;
      try {
        const jobData = await lmsService.pollJobStatus(pollingJobId, type);
        if (jobData.status === 'COMPLETED') {
          isPollingRef.current = false;
          setStatus('COMPLETED');
          
          setResultData({
            jobId: jobData.id,
            manifestUrl: jobData.dash_manifest_url,
            viewerUrl: jobData.viewer_url || jobData.url,
            status: 'COMPLETED'
          });
          return;
        } else if (jobData.status === 'FAILED') {
          isPollingRef.current = false;
          setStatus('ERROR');
          setError(jobData.error_message || 'Backend processing failed.');
          return;
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
      
      // Schedule next poll only after the current one completes
      if (isPollingRef.current) {
        pollIntervalRef.current = setTimeout(poll, 3000);
      }
    };

    pollIntervalRef.current = setTimeout(poll, 3000);
  };

  const uploadFile = async (file, type) => {
    try {
      isPollingRef.current = false;
      if (pollIntervalRef.current) {
        clearTimeout(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }

      setStatus('REQUESTING_INTENT');
      setProgress(0);
      setError(null);
      setJobId(null);
      setResultData(null);

      // 1. Get Intent
      const intentRes = await lmsService.uploadMediaIntent(file, type);
      const { job_id, upload_id, upload_urls, chunk_size } = intentRes;
      setJobId(job_id);

      setStatus('UPLOADING');
      
      // 2. Upload Chunks
      const parts = [];
      let uploadedBytes = 0;

      for (let i = 0; i < upload_urls.length; i++) {
        const start = i * chunk_size;
        const end = Math.min(start + chunk_size, file.size);
        const chunk = file.slice(start, end);

        // Convert Blob to ArrayBuffer so fetch doesn't auto-append ANY Content-Type header
        const arrayBuffer = await chunk.arrayBuffer();

        // Upload chunk via PUT request using native fetch to avoid ANY default headers
        const res = await fetch(upload_urls[i], {
          method: 'PUT',
          body: arrayBuffer,
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("MinIO Error Body:", errorText);
          throw new Error(`Chunk ${i + 1} upload failed with status ${res.status}. Response: ${errorText}`);
        }

        uploadedBytes += chunk.size;
        setProgress(Math.round((uploadedBytes / file.size) * 100));
        
        // ETag is needed for S3/MinIO multipart upload completion
        let etag = res.headers.get('etag') || res.headers.get('Etag') || res.headers.get('eTag');
        // Remove quotes if present
        if (etag) etag = etag.replace(/"/g, '');

        parts.push({
          PartNumber: i + 1,
          ETag: etag
        });
      }

      // 3. Complete Upload
      setStatus('PROCESSING');
      setProgress(100);
      await lmsService.completeMediaUpload(job_id, upload_id, parts, type);

      // 4. Poll for Completion
      startPolling(job_id, type);

    } catch (err) {
      console.error("Upload failed:", err);
      setStatus('ERROR');
      setError(err.message || 'File upload failed');
    }
  };

  const reset = () => {
    setStatus('IDLE');
    setProgress(0);
    setError(null);
    setJobId(null);
    setResultData(null);
    isPollingRef.current = false;
    if (pollIntervalRef.current) {
      clearTimeout(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  return {
    uploadFile,
    status,
    progress,
    error,
    jobId,
    resultData,
    reset
  };
}
