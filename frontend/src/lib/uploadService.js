import { apiClient } from './apiClient';
import axios from 'axios';

export const uploadDocument = async (file, onProgress) => {
  try {
    // 1. Get Intent
    const intentRes = await apiClient.post('/viewer/upload-intent', { filename: file.name });
    const { job_id, presigned_url } = intentRes.data;

    // 2. Upload to MinIO directly
    await axios.put(presigned_url, file, {
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (onProgress) onProgress(percentCompleted);
        }
      }
    });

    // 3. Trigger Process
    await apiClient.post(`/viewer/process/${job_id}`);

    // Return the job_id immediately. 
    // We don't necessarily need to block on polling for metadata here, 
    // the backend will process it asynchronously.
    return job_id;
  } catch (error) {
    console.error("Document upload failed:", error);
    throw error;
  }
};
