import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Common/Navbar';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import StudentPage from './pages/StudentPage';
import TeacherDashboard from './components/Teacher/TeacherDashboard';
import BestPerformingPage from './pages/BestPerformingPage';
import ProtectedRoute from './components/Common/ProtectedRoute';
import AdminLogin from './components/Admin/AdminLogin';
import StudentLogin from './components/Student/StudentLogin';
import TeacherLogin from './components/Teacher/TeacherLogin';
import UserForm from './components/User-Details/UserForm';
import TeacherForm from './components/Teacher/TeacherForm';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import TeacherForgotPassword from './components/Teacher/TeacherForgotPassword';
import TeacherResetPassword from './components/Teacher/TeacherResetPassword';

// Wrapper component to handle navbar visibility
const AppContent = () => {
  const location = useLocation();
  const hideNavbarPaths = ['/user-form', '/teacher-form'];
  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/teacher/login" element={<TeacherLogin />} />
        <Route path="/best-performing" element={<BestPerformingPage />} />
        <Route path="/user-form" element={<UserForm />} />
        <Route path="/teacher-form" element={<TeacherForm />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/teacher/forgot-password" element={<TeacherForgotPassword />} />
        <Route path="/teacher/reset-password/:token" element={<TeacherResetPassword />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="admin">
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/*"
          element={
            <ProtectedRoute role="student">
              <StudentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/*"
          element={
            <ProtectedRoute role="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster position="top-right" />
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;