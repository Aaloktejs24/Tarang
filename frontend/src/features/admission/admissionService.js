import { apiClient } from "../../lib/apiClient";

export const applyForProgram = async (programId, userId, instituteId, metadata = {}) => {
  const response = await apiClient.post(`/admissions/programs/${programId}/apply`, { 
    user_id: userId,
    institute_id: instituteId,
    metadata: JSON.stringify(metadata) 
  });
  return response.data; // { transaction: {...}, application: {...} }
};

export const updateApplicationProgress = async (applicationId, actionType, metadata = {}, actorId = '', newStageIndex = 0, newStatus = '') => {
  const response = await apiClient.put(`/admissions/applications/${applicationId}/progress`, {
    action_type: actionType,
    actor_id: actorId,
    new_stage_index: newStageIndex,
    new_status: newStatus,
    metadata: JSON.stringify(metadata)
  });
  return response.data; // { transaction: {...}, application: {...} }
};

export const getUserApplications = async (userId) => {
  const response = await apiClient.get(`/admissions/users/${userId}/applications`);
  return response.data; // { applications: [...] }
};

export const getApplicationHistory = async (applicationId) => {
  const response = await apiClient.get(`/admissions/applications/${applicationId}`);
  return response.data; // { application: {...}, transactions: [...] }
};

export const getInstituteApplications = async (username) => {
  const response = await apiClient.get(`/admissions/institutes/${username}/applications`);
  return response.data;
};

export const deleteApplication = async (applicationId) => {
  const response = await apiClient.delete(`/admissions/applications/${applicationId}`);
  return response.data;
};
