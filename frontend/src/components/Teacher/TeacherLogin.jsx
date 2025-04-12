import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserCircle, AtSign, Lock, ArrowRight, ChevronLeft, GraduationCap, Award, BookOpen } from 'lucide-react';
import axios from 'axios';
import { Snackbar, Alert } from '@mui/material';
import { toast } from 'react-hot-toast';

const TeacherLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('https://final-year-projects-backend.onrender.com/api/teacher/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', 'teacher');
      setSnackbar({ open: true, message: 'Login successful!', severity: 'success' });
      setTimeout(() => navigate('/teacher'), 500);
    } catch (error) {
      console.error('Login error:', error);
      setSnackbar({ open: true, message: 'Invalid credentials', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Left side - decorative section */}
      <div className="hidden md:flex md:w-1/2 bg-indigo-600 p-10 text-white flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white"></div>
          <div className="absolute bottom-40 right-10 w-20 h-20 rounded-full bg-white"></div>
          <div className="absolute top-1/2 left-1/3 w-60 h-60 rounded-full bg-white opacity-20"></div>
        </div>
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center space-x-2 mb-16 text-white hover:text-indigo-200 transition-colors">
            <ChevronLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
          
          <h1 className="text-4xl font-bold mb-4">Welcome Back, Teacher!</h1>
          <p className="text-indigo-200 mb-8 text-lg">Sign in to access your teaching dashboard and manage student performance.</p>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <div className="bg-indigo-500 p-1 rounded-md mt-0.5">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-medium">View Academic Records</h3>
                <p className="text-indigo-200 text-sm">View and track student grades and performance</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-indigo-500 p-1 rounded-md mt-0.5">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-medium">Track Achievements</h3>
                <p className="text-indigo-200 text-sm">Monitor and record student accomplishments</p>
              </div>
            </div>
            
            {/* <div className="flex items-start space-x-3">
              <div className="bg-indigo-500 p-1 rounded-md mt-0.5">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-medium">Provide Feedback</h3>
                <p className="text-indigo-200 text-sm">Give constructive feedback to help students improve</p>
              </div>
            </div> */}
          </div>
        </div>
        
        <div className="relative z-10 text-sm text-indigo-200">
          Scholarly — Empowering educational excellence
        </div>
      </div>
      
      {/* Right side - login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white mb-6 shadow-lg transform transition-transform duration-300 hover:scale-110">
              <UserCircle className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-1">
              Teacher Login
            </h2>
            <p className="text-gray-500">Enter your credentials to access your account</p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AtSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out sm:text-sm"
                    placeholder="teacher@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link to="/teacher/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out sm:text-sm"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <ArrowRight className="h-5 w-5 text-indigo-400 group-hover:text-indigo-300" />
                  </span>
                )}
                {loading ? 'Signing in...' : 'Sign in to Teacher Panel'}
              </button>
            </div>
          </form>
        </div>

        {/* Snackbar Notification */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleClose} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default TeacherLogin; 