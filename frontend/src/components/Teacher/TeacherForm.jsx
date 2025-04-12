import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const TeacherForm = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email) {
      toast.error('Please fill all required fields');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post('http://localhost:5000/api/teacher/register', formData);
      
      if (response.data.success) {
        // If temporary password is in the response, save it
        if (response.data.tempPassword) {
          setTempPassword(response.data.tempPassword);
        }
        setShowSuccess(true);
      } else {
        toast.error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'An error occurred during registration');
    } finally {
      setSubmitting(false);
    }
  };

  const renderSuccess = () => (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
            
            {tempPassword ? (
              <>
                <p className="text-gray-600 mb-4">Please save your temporary password:</p>
                <div className="bg-gray-100 p-4 rounded-lg mb-6">
                  <code className="text-lg font-mono">{tempPassword}</code>
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  Make sure to save this password. You will need it to log in.
                </p>
              </>
            ) : (
              <p className="text-gray-600 mb-6">
                Thank you for registering as a teacher. Please check your email for login instructions.
              </p>
            )}
            
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (showSuccess) {
    return renderSuccess();
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Teacher Registration</h1>
          <p className="text-gray-600">Fill in your details to register as a teacher</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">Personal Information</h2>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name}
                placeholder="Enter your full name"
                className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-gray-50 text-gray-900" 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email}
                placeholder="your.email@example.com"
                className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-gray-50 text-gray-900" 
                onChange={handleChange} 
                required 
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6 mt-8 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 disabled:bg-indigo-400"
              >
                {submitting ? 'Registering...' : 'Register'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherForm; 