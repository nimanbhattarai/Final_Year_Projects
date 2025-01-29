import { Routes, Route } from 'react-router-dom';
import StudentProfile from '../components/Student/StudentProfile';
import AcademicAnalysis from '../components/Student/AcademicAnalysis';

const StudentPage = () => {
  const studentId = localStorage.getItem('studentId');

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <Routes>
        <Route path="/" element={<StudentProfile />} />
        <Route path="/analysis" element={<AcademicAnalysis studentId={studentId} />} />
      </Routes>
    </div>
  );
};

export default StudentPage;