import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import { User, BarChart as ChartBar, Book, Award, MessageSquare, GraduationCap, Bell, Menu, X } from 'lucide-react';
import { studentApi } from '../services/api';
import StudentProfile from '../components/Student/StudentProfile';
import AcademicAnalysis from '../components/Student/AcademicAnalysis';
import PerformanceCharts from '../components/Student/PerformanceCharts';

const StudentPage = () => {
  const studentId = localStorage.getItem('studentId');
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentPhoto, setStudentPhoto] = useState('');
  
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await studentApi.getProfile(studentId);
        setStudentName(response.data.name || 'Student');
        setStudentPhoto(response.data.photo);
      } catch (error) {
        console.error('Error fetching student data:', error);
      }
    };
    
    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main dashboard layout */}
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Sidebar navigation - desktop */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 bg-white border-r border-gray-200">
            <div className="flex items-center justify-center h-16 px-4 bg-indigo-600 text-white">
              <GraduationCap className="h-8 w-8 mr-2" />
              <span className="text-xl font-semibold">Student Portal</span>
            </div>
            
            <div className="flex flex-col flex-grow px-4 py-6 overflow-y-auto">
              <div className="text-center mb-8">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <img src={studentPhoto} alt="Student Photo" className="h-20 w-20 rounded-full" />
                </div>
                <h3 className="mt-2 text-xl font-medium text-gray-900">
                  {studentName}
                </h3>
              </div>

              <nav className="flex-1 space-y-2">
                <Link
                  to="/student"
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    isActive('/student')
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                  }`}
                >
                  <User className={`mr-3 h-5 w-5 ${isActive('/student') ? 'text-indigo-500' : 'text-gray-500 group-hover:text-indigo-500'}`} />
                  Profile
                </Link>

                <Link
                  to="/student/performance"
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    isActive('/student/performance')
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                  }`}
                >
                  <ChartBar className={`mr-3 h-5 w-5 ${isActive('/student/performance') ? 'text-indigo-500' : 'text-gray-500 group-hover:text-indigo-500'}`} />
                  Performance Charts
                </Link>
              </nav>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`fixed inset-0 flex z-40 md:hidden transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={toggleMobileMenu}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <GraduationCap className="h-8 w-8 text-indigo-600 mr-2" />
                <span className="text-xl font-semibold text-indigo-600">Student Portal</span>
              </div>
              
              <div className="text-center my-6">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <img src={studentPhoto} alt="Student Photo" className="h-16 w-16 rounded-full" />
                </div>
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  {studentName}
                </h3>
              </div>
              
              <nav className="mt-5 px-2 space-y-1">
                <Link
                  to="/student"
                  className={`group flex items-center px-3 py-3 text-base font-medium rounded-md ${
                    isActive('/student')
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                  }`}
                  onClick={toggleMobileMenu}
                >
                  <User className="mr-3 h-5 w-5 text-indigo-500" />
                  Profile
                </Link>

                <Link
                  to="/student/performance"
                  className={`group flex items-center px-3 py-3 text-base font-medium rounded-md ${
                    isActive('/student/performance')
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                  }`}
                  onClick={toggleMobileMenu}
                >
                  <ChartBar className="mr-3 h-5 w-5 text-indigo-500" />
                  Performance Charts
                </Link>
              </nav>
            </div>
          </div>
          
          <div className="flex-shrink-0 w-14" aria-hidden="true">
            {/* Force sidebar to shrink to fit close icon */}
          </div>
        </div>

        {/* Main content area */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          {/* Top header */}
          <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
            <button
              className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            
            <div className="flex-1 px-4 flex justify-between">
              <div className="flex-1 flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  {isActive('/student') && 'Student Profile'}
                  {isActive('/student/performance') && 'Performance Charts'}
                </h1>
              </div>
              
              {/* Notification bell (can be functional later) */}
              <div className="ml-4 flex items-center md:ml-6">
                <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <span className="sr-only">View notifications</span>
                  <Bell className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <Routes>
                  <Route path="/" element={<StudentProfile />} />
                  <Route path="/performance" element={<PerformanceCharts studentId={studentId} />} />
                  <Route path="*" element={<Navigate to="/student" replace />} />
                </Routes>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default StudentPage;