import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminApi = {
  login: (credentials) => api.post('/admin/login', credentials),
  getStudents: () => api.get('/admin/students'),
  registerStudent: (data) => api.post('/student/register', data),
  deleteStudent: (studentId) => api.delete(`/admin/student/${studentId}`),
  updateStudentData: (data) => api.put('/admin/student/update', data),
  getStudentGrades: (studentId) => api.get(`/performance/${studentId}`),
  updateAcademicGrades: (data) => api.put('/performance/academic', data),
  deleteAcademicGrades: (data) => api.delete('/performance/academic', { data }),
  updateExtracurricular: (data) => api.put('/performance/extracurricular', data),
  deleteExtracurricular: (data) => api.delete('/performance/extracurricular', { data }),
  updateTeacherRemarks: (data) => api.put('/performance/teacher-remarks', data),
  deleteTeacherRemarks: (data) => api.delete('/performance/teacher-remarks', { data }),
};

export const studentApi = {
  login: (credentials) => api.post('/student/login', credentials),
  getProfile: (id) => api.get(`/student/${id}/profile`),
  getAnalysis: (id) => api.get(`/student/${id}/analysis`),
};

export const performanceApi = {
  getBestPerforming: () => api.get('/performance/best-performing'),
};

export default api;