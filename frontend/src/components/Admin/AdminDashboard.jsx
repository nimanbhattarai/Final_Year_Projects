import { useState } from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import { GraduationCap, Award, UserCircle, BookOpen } from 'lucide-react';
import AcademicGrades from './AcademicGrades';
import ExtraCurricular from './ExtraCurricular';
import TeacherRemarks from './TeacherRemarks';
import StudentDetails from './StudentDetails';

const AdminDashboard = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
        </div>
        <nav className="mt-4">
          <Link
            to="students"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
          >
            <UserCircle className="w-5 h-5 mr-3" />
            Student Details
          </Link>
          <Link
            to="academic"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
          >
            <BookOpen className="w-5 h-5 mr-3" />
            Academic Grades
          </Link>
          <Link
            to="extracurricular"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
          >
            <Award className="w-5 h-5 mr-3" />
            Extra Curricular
          </Link>
          <Link
            to="remarks"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
          >
            <GraduationCap className="w-5 h-5 mr-3" />
            Teacher Remarks
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <Routes>
          <Route path="students" element={<StudentDetails onSelectStudent={setSelectedStudent} />} />
          <Route path="academic" element={<AcademicGrades selectedStudent={selectedStudent} />} />
          <Route path="extracurricular" element={<ExtraCurricular selectedStudent={selectedStudent} />} />
          <Route path="remarks" element={<TeacherRemarks selectedStudent={selectedStudent} />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;