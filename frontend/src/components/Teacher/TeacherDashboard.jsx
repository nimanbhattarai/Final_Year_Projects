import React, { useState, useEffect } from 'react';
import { Route, Routes, Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Award, UserCircle, BookOpen, ArrowLeft, ChevronRight, User, LogOut, BarChart2, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import StudentList from './StudentList';
import PerformanceView from './PerformanceView';
import TeacherRemarks from './TeacherRemarks';
import AcademicGrades from '../Admin/AcademicGrades';
import ExtraCurricular from '../Admin/ExtraCurricular';
import YearDetails from '../Admin/YearDetails';
import PerformanceCharts from '../Student/PerformanceCharts';
import TeacherYearDetails from './TeacherYearDetails';

const TeacherDashboard = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [teacherInfo, setTeacherInfo] = useState(null);

  useEffect(() => {
    const fetchTeacherInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://final-year-projects-backend.onrender.com/api/teacher/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTeacherInfo(response.data.data);
      } catch (error) {
        console.error('Error fetching teacher info:', error);
        toast.error('Failed to load teacher information');
      }
    };

    fetchTeacherInfo();
  }, []);

  const handleBack = () => {
    if (selectedStudent && !location.pathname.includes('/academic/')) {
      setSelectedStudent(null);
    } else {
      navigate(-1);
    }
  };

  // Helper to check if a link is active
  const isActiveLink = (path) => {
    return location.pathname.includes(path);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 mt-20">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <GraduationCap className="h-8 w-8 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-800">Teacher Dashboard</h2>
          </div>
        </div>

        {/* Teacher Info Section */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <User className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{teacherInfo?.name || 'Loading...'}</h3>
              <p className="text-xs text-gray-500">{teacherInfo?.email || 'Loading...'}</p>
              {teacherInfo?.subject && (
                <p className="text-xs text-gray-500 mt-1">Subject: {teacherInfo.subject}</p>
              )}
            </div>
          </div>
        </div>
        
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            <Link
              to="students"
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActiveLink('students') 
                  ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 pl-3' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
              }`}
            >
              <UserCircle className={`w-5 h-5 mr-3 ${isActiveLink('students') ? 'text-indigo-600' : 'text-gray-500'}`} />
              Student List
              {isActiveLink('students') && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
            
            <Link
              to="performance-charts"
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActiveLink('performance-charts') 
                  ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 pl-3' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
              }`}
            >
              <TrendingUp className={`w-5 h-5 mr-3 ${isActiveLink('performance-charts') ? 'text-indigo-600' : 'text-gray-500'}`} />
              Performance Charts
              {isActiveLink('performance-charts') && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
            
            <Link
              to="academic"
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActiveLink('academic') 
                  ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 pl-3' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
              }`}
            >
              <BookOpen className={`w-5 h-5 mr-3 ${isActiveLink('academic') ? 'text-indigo-600' : 'text-gray-500'}`} />
              Academic Grades
              {isActiveLink('academic') && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>

            <Link
              to="extracurricular"
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActiveLink('extracurricular') 
                  ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 pl-3' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
              }`}
            >
              <Award className={`w-5 h-5 mr-3 ${isActiveLink('extracurricular') ? 'text-indigo-600' : 'text-gray-500'}`} />
              Extra Curricular
              {isActiveLink('extracurricular') && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
            
            <Link
              to="remarks"
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActiveLink('remarks') 
                  ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 pl-3' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
              }`}
            >
              <BarChart2 className={`w-5 h-5 mr-3 ${isActiveLink('remarks') ? 'text-indigo-600' : 'text-gray-500'}`} />
              Teacher Remarks
              {isActiveLink('remarks') && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>

            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                navigate('/');
              }}
              className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-all duration-200"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header with back button and selected student */}
        <header className="bg-white shadow-sm py-4 px-6 sticky top-0 left-0 w-full z-10">
          <div className="flex items-center justify-between ">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium">Back</span>
            </button>
            
            {selectedStudent && (
              <div className="flex items-center px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-lg shadow-sm">
                <div className="bg-indigo-100 p-2 rounded-full mr-3">
                  {selectedStudent.photo ? (
                    <img 
                      src={selectedStudent.photo} 
                      alt="Student" 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-indigo-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">Selected Student:</span>
                    <span className="font-semibold text-indigo-700">{selectedStudent.name}</span>
                  </div>
                  <p className="text-xs text-gray-500">{selectedStudent.email}</p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Routes>
              <Route path="students" element={<StudentList onSelectStudent={setSelectedStudent} />} />
              <Route path="performance-charts" element={
                selectedStudent ? (
                  <PerformanceCharts studentId={selectedStudent._id} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="bg-indigo-50 rounded-full p-4 mb-4">
                      <TrendingUp className="h-8 w-8 text-indigo-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Student Selected</h3>
                    <p className="text-gray-600 text-center max-w-md">
                      Please select a student from the Student List section to view their performance charts.
                    </p>
                    <Link 
                      to="students" 
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                    >
                      Go to Student List
                    </Link>
                  </div>
                )
              } />
              <Route path="academic" element={<AcademicGrades selectedStudent={selectedStudent} />} />
              <Route path="academic/:year" element={<TeacherYearDetails />} />
              <Route path="extracurricular" element={<ExtraCurricular selectedStudent={selectedStudent} />} />
              <Route path="remarks" element={<TeacherRemarks selectedStudent={selectedStudent} />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard; 