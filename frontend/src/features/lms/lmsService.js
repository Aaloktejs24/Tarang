import { apiClient } from '../../lib/apiClient';

const createCourse = async (courseData) => {
  const response = await apiClient.post('/lms/courses', courseData);
  return response.data;
};

const getCourse = async (courseId) => {
  const response = await apiClient.get(`/lms/courses/${courseId}`);
  return response.data;
};

const listCourses = async () => {
  const response = await apiClient.get('/lms/courses');
  return response.data?.courses || (Array.isArray(response.data) ? response.data : []);
};

const updateCourse = async (courseId, courseData) => {
  const response = await apiClient.put(`/lms/courses/${courseId}`, courseData);
  return response.data;
};

const deleteCourse = async (courseId) => {
  const response = await apiClient.delete(`/lms/courses/${courseId}`);
  return response.data;
};

const getEnrolledCourses = async (studentId) => {
  const response = await apiClient.get(`/lms/students/${studentId}/courses`);
  return response.data || [];
};

const enrollCourse = async (courseId, studentId, studentName, studentEmail, profilePic) => {
  const cleanProfilePic = profilePic ? profilePic.split('?')[0] : '';
  const response = await apiClient.post(`/lms/courses/${courseId}/enroll`, {
    student_id: studentId,
    student_name: studentName,
    student_email: studentEmail,
    profile_pic: cleanProfilePic
  });
  return response.data;
};

const getCourseStudents = async (courseId) => {
  const response = await apiClient.get(`/lms/courses/${courseId}/students`);
  return response.data?.students || [];
};

// Media & Document Upload Pipeline Methods
const uploadMediaIntent = async (file, type) => {
  const endpoint = type === 'video' ? '/streaming/upload-intent' : '/viewer/upload-intent';
  const response = await apiClient.post(endpoint, {
    original_filename: file.name,
    file_size: file.size
  });
  return response.data;
};

const completeMediaUpload = async (jobId, uploadId, parts, type) => {
  const endpoint = type === 'video' 
    ? `/streaming/upload-complete/${jobId}` 
    : `/viewer/process/${jobId}`;
  
  const response = await apiClient.post(endpoint, {
    upload_id: uploadId,
    parts: parts
  });
  return response.data;
};

const pollJobStatus = async (jobId, type) => {
  const endpoint = type === 'video' 
    ? `/streaming/${jobId}` 
    : `/viewer/${jobId}/metadata`;
  
  const response = await apiClient.get(endpoint);
  return response.data;
};

export const lmsService = {
  createCourse,
  getCourse,
  listCourses,
  updateCourse,
  deleteCourse,
  getEnrolledCourses,
  enrollCourse,
  getCourseStudents,
  uploadMediaIntent,
  completeMediaUpload,
  pollJobStatus
};
