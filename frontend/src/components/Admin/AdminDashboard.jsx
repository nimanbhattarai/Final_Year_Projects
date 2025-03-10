import { useState } from 'react';
import { Route, Routes, Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Award, UserCircle, BookOpen, ArrowLeft, ChevronRight } from 'lucide-react';
import AcademicGrades from './AcademicGrades';
import ExtraCurricular from './ExtraCurricular';
import TeacherRemarks from './TeacherRemarks';
import StudentDetails from './StudentDetails';
import YearDetails from './YearDetails';

const AdminDashboard = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <GraduationCap className="h-8 w-8 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
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
              Student Details
              {isActiveLink('students') && <ChevronRight className="w-4 h-4 ml-auto" />}
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
              <GraduationCap className={`w-5 h-5 mr-3 ${isActiveLink('remarks') ? 'text-indigo-600' : 'text-gray-500'}`} />
              Teacher Remarks
              {isActiveLink('remarks') && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header with back button */}
        <header className="bg-white shadow-sm py-4 px-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium">Back</span>
            </button>
            
            {selectedStudent && !location.pathname.includes('/academic/') && (
              <div className="px-4 py-1.5 bg-indigo-50 rounded-full">
                <span className="text-sm text-gray-600">
                  Selected Student: <span className="font-semibold text-indigo-700">{selectedStudent.name}</span>
                </span>
              </div>
            )}
          </div>
        </header>
        
        {/* Main content */}
        <main className="p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Routes>
              <Route path="students" element={<StudentDetails onSelectStudent={setSelectedStudent} />} />
              <Route path="academic" element={<AcademicGrades selectedStudent={selectedStudent} />} />
              <Route path="academic/:year" element={<YearDetails />} />
              <Route path="extracurricular" element={<ExtraCurricular selectedStudent={selectedStudent} />} />
              <Route path="remarks" element={<TeacherRemarks selectedStudent={selectedStudent} />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;