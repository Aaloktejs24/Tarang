import { apiClient } from '../lib/apiClient';

/**
 * Uploads a file to MinIO securely using presigned URLs.
 * Automatically handles generating a signed URL, safely executing the PUT request,
 * and seamlessly cascading the deletion of the previous file to prevent storage bloat.
 *
 * @param {File} file - The file to upload.
 * @param {Object} profile - User profile containing id and username.
 * @param {string} type - File type category (e.g. 'document', 'profile', 'banner', 'thumbnail').
 * @param {string} fieldName - Specific name for the file (e.g. 'profilePic', 'incomeDoc').
 * @param {string|null} oldURL - The existing file URL in MinIO to be deleted (optional).
 * @returns {Promise<string>} The public URL of the uploaded file.
 */
export const uploadToMinIO = async (file, profile, type, fieldName, oldURL = null) => {
  if (!file || !profile?.id) throw new Error("Missing required file or profile info");

  // 1. Cascade Delete Old File
  if (oldURL && typeof oldURL === 'string' && oldURL.startsWith('http')) {
    try {
      await apiClient.post('/s3/delete', { file_urls: [oldURL] });
    } catch (err) {
      console.error('[cascade] Failed to delete old file:', err);
    }
  }

  // 2. Infer correct mime type and format field name
  let mimeType = file.type;
  if (!mimeType) {
    if (file.name.toLowerCase().endsWith('.pdf')) mimeType = 'application/pdf';
    else if (file.name.toLowerCase().match(/\.jpe?g$/)) mimeType = 'image/jpeg';
    else if (file.name.toLowerCase().endsWith('.png')) mimeType = 'image/png';
    else mimeType = 'application/octet-stream';
  }

  // Naming protocol: backend generates {username}_{fieldName_snake_case}_{timestamp}
  // We must pass the snake_case field name (not the raw file.name) so the backend
  // can produce the correct structured filename.
  const formattedName = fieldName
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]/g, '_')
    .toLowerCase();

  // 3. Request Signed URL from backend
  const { data } = await apiClient.get(`/s3/sign`, {
    params: {
      user_id: profile.id,
      username: profile.username,
      type: type,
      filename: formattedName,
      mime: mimeType
    }
  });

  if (!data || !data.upload_url || !data.file_url) {
    throw new Error("Failed to generate presigned URL from backend.");
  }

  // 4. Securely Upload to MinIO
  const response = await fetch(data.upload_url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": mimeType }
  });

  // CRITICAL: Ensure the upload actually succeeded before returning the URL
  if (!response.ok) {
    throw new Error(`Upload to storage failed with status ${response.status}`);
  }

  return data.file_url;
};
