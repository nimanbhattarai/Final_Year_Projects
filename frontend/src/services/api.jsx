import axios from 'axios';

// const API_URL = '`${import.meta.env.VITE_API_URL}';
const API_URL = import.meta.env.VITE_API_URL;

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

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const adminApi = {
  login: (credentials) => api.post('/admin/login', credentials),
  getStudents: () => api.get('/admin/students'),
  
  // Update to accept photo upload
  registerStudent: (formData) => {
    // Use the correct endpoint and send the FormData directly
    return api.post('/admin/student/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  deleteStudent: (studentId) => api.delete(`/admin/student/${studentId}`),
  updateStudentData: (data) => api.put('/admin/student/update', data),
  getStudentGrades: (studentId) => api.get(`/performance/${studentId}`),
  updateAcademicGrades: (data) => api.put('/performance/academic', data),
  deleteAcademicGrades: (data) => api.delete('/performance/academic', { data }),
  updateExtracurricular: (data) => api.put('/performance/extracurricular', data),
  deleteExtracurricular: (data) => api.delete('/performance/extracurricular', { data }),
  updateTeacherRemarks: (data) => api.put('/performance/teacher-remarks', data),
  deleteTeacherRemarks: (data) => api.delete('/performance/teacher-remarks', { data }),
  getStudent: (studentId) => api.get(`/admin/student/${studentId}`),
  
  // Add method to update student photo
  uploadStudentPhoto: (studentId, photoFile) => {
    const formData = new FormData();
    formData.append('photo', photoFile);
    
    return api.post(`/student/${studentId}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Teacher management methods
  getTeachers: (page = 1, limit = 10, sort = 'name', search = '') => {
    return api.get(`/admin/teachers?page=${page}&limit=${limit}&sort=${sort}&search=${search}`);
  },
  deleteTeacher: (teacherId) => api.delete(`/admin/teacher/${teacherId}`)
};

export const studentApi = {
  login: (credentials) => api.post('/student/login', credentials),
  getProfile: (id) => api.get(`/student/${id}/profile`),
  getAnalysis: (id) => api.get(`/student/${id}/analysis`),
  forgotPassword: (email) => api.post('/student/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post(`/student/reset-password/${token}`, { password: newPassword }),
  uploadPhoto: (id, photoFile) => {
    const formData = new FormData();
    formData.append('photo', photoFile);
    
    return api.post(`/student/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`Upload progress: ${percentCompleted}%`);
      }
    });
  }
};

export const teacherApi = {
  login: (credentials) => api.post('/teacher/login', credentials),
  getProfile: () => api.get('/teacher/profile'),
  forgotPassword: (email) => api.post('/teacher/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post(`/teacher/reset-password/${token}`, { password: newPassword })
};

export const performanceApi = {
  getBestPerforming: () => api.get('/performance/best-performing'),
  getAllStudentsPerformance: () => api.get('/performance/students/all'),
};

export default api;