import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Shield, AtSign, ChevronLeft, Users, BarChart2, Settings } from 'lucide-react';
import { adminApi } from '../../services/api';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await adminApi.login(formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', 'admin');
      setSnackbar({ open: true, message: 'Login successful!', severity: 'success' });
      setTimeout(() => navigate('/admin/students'), 1500);
    } catch (error) {
      setSnackbar({ open: true, message: 'Invalid credentials', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Left Side - Admin Panel Info */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-gray-800 to-gray-900 p-10 text-white flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -right-40 -top-40 w-80 h-80 rounded-full bg-blue-500 opacity-20"></div>
          <div className="absolute -left-20 bottom-10 w-60 h-60 rounded-full bg-indigo-500 opacity-20"></div>
          <div className="absolute right-40 bottom-40 w-40 h-40 rounded-full bg-purple-500 opacity-30"></div>
        </div>
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center space-x-2 mb-16 text-gray-300 hover:text-white transition-colors">
            <ChevronLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
          
          <div className="mb-8">
            <Shield className="h-12 w-12 text-indigo-400 mb-4" />
            <h1 className="text-4xl font-bold mb-4">Admin Control Center</h1>
            <p className="text-gray-300 text-lg mb-6">
              Access your administrative dashboard to manage the entire student performance system.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex items-center justify-center p-2 bg-gray-700 rounded-lg">
                <Users className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Student Management</h3>
                <p className="text-gray-400">Manage student records and academic profiles</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex items-center justify-center p-2 bg-gray-700 rounded-lg">
                <BarChart2 className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Performance Analytics</h3>
                <p className="text-gray-400">Access comprehensive performance reports and trends</p>
              </div>
            </div>
            
            {/* <div className="flex items-start space-x-4">
              <div className="flex items-center justify-center p-2 bg-gray-700 rounded-lg">
                <Settings className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-medium text-lg">System Configuration</h3>
                <p className="text-gray-400">Configure system settings and user permissions</p>
              </div>
            </div> */}
          </div>
        </div>
        
        <div className="relative z-10 text-sm text-gray-400 mt-8">
          Scholarly Administrative Panel — Secure Access Required
        </div>
      </div>
      
      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-xl mb-6 transform transition-transform hover:scale-105 duration-300 relative">
              <div className="absolute inset-0 rounded-2xl bg-white opacity-10 animate-pulse"></div>
              <Lock className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Login
            </h2>
            <p className="text-gray-500">
              Enter your credentials to access the admin dashboard
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Email
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AtSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="admin@gmail.com"
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
                  {/* <a href="#" className="text-sm text-indigo-600 hover:text-indigo-500">
                    Forgot password?
                  </a> */}
                </div>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
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
                <div className="text-sm">
                  {/* <Link to="/" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Need help?
                  </Link> */}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Authenticating...
                    </>
                  ) : (
                    "Sign in to Admin Panel"
                  )}
                </button>
              </div>
            </form>
          </div>
          
          <div className="text-center mt-6">
            {/* <p className="text-sm text-gray-500">
              By signing in, you agree to the{' '}
              <a href="#" className="text-indigo-600 font-medium hover:text-indigo-500">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-indigo-600 font-medium hover:text-indigo-500">
                Privacy Policy
              </a>
            </p> */}
          </div>
        </div>
      </div>
      
      {/* Snackbar Component */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AdminLogin;
