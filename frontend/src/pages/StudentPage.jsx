import { Routes, Route } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import { User, BarChart as ChartBar } from 'lucide-react';
import StudentProfile from '../components/Student/StudentProfile';
import AcademicAnalysis from '../components/Student/AcademicAnalysis';
import PerformanceCharts from '../components/Student/PerformanceCharts';

const StudentPage = () => {
  const studentId = localStorage.getItem('studentId');
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex space-x-4 mb-6">
          <Link
            to="/student"
            className={`flex items-center px-4 py-2 rounded-md ${
              location.pathname === '/student'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <User className="h-5 w-5 mr-2" />
            Profile
          </Link>
          <Link
            to="/student/performance"
            className={`flex items-center px-4 py-2 rounded-md ${
              location.pathname === '/student/performance'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ChartBar className="h-5 w-5 mr-2" />
            Performance Charts
          </Link>
        </div>

        <Routes>
          <Route path="/" element={<StudentProfile />} />
          <Route path="/analysis" element={<AcademicAnalysis studentId={studentId} />} />
          <Route path="/performance" element={<PerformanceCharts studentId={studentId} />} />
        </Routes>
      </div>
    </div>
  );
};

export default StudentPage;