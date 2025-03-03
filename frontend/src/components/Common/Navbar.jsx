import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Award, LogOut } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8" />
              <span className="font-bold text-xl">College Website</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/best-performing"
              className="flex items-center space-x-1 hover:text-indigo-200"
            >
              <Award className="h-5 w-5" />
              <span>Best Performing</span>
            </Link>

            {token ? (
              <>
                <Link
                  to={`/${role}`}
                  className="hover:text-indigo-200"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 hover:text-indigo-200"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex space-x-4">
                <Link to="/admin/login" className="hover:text-indigo-200">
                  Admin Login
                </Link>
                <Link to="/student/login" className="hover:text-indigo-200">
                  Student Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;