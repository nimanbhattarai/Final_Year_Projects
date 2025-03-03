import { Link } from 'react-router-dom';
import { UserCircle, Users } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to EduTrack
          </h1>
          <p className="text-xl text-gray-600">
            Comprehensive Student Performance Management System
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link
            to="/student/login"
            className="group p-8 bg-white rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex flex-col items-center">
              <UserCircle className="w-16 h-16 text-indigo-600 mb-4 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Student Portal
              </h2>
              <p className="text-gray-600 text-center">
                View your academic performance, grades, and teacher remarks
              </p>
            </div>
          </Link>

          <Link
            to="/admin/login"
            className="group p-8 bg-white rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex flex-col items-center">
              <Users className="w-16 h-16 text-indigo-600 mb-4 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Admin Portal
              </h2>
              <p className="text-gray-600 text-center">
                Manage student records, grades, and performance tracking
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;