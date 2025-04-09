import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Award, LogOut, Menu, X, Home, User, Users } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Track scroll position for navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  // Helper to determine if a link is active
  const isActive = (path) => location.pathname === path;

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white text-gray-800 shadow-lg' 
          : 'bg-gradient-to-r from-indigo-600 to-indigo-800 text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className={`p-1.5 rounded-lg ${isScrolled ? 'bg-indigo-100' : 'bg-indigo-500'} transition-colors duration-300 group-hover:scale-110 transform`}>
                <GraduationCap className={`h-6 w-6 ${isScrolled ? 'text-indigo-600' : 'text-white'}`} />
              </div>
              <span className="font-bold text-xl tracking-tight">
                <span className={isScrolled ? 'text-indigo-600' : 'text-white'}>Scholar</span>
                <span className={isScrolled ? 'text-purple-600' : 'text-indigo-200'}>ly</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/best-performing"
              className={`flex items-center space-x-2 py-1 px-3 rounded-md transition-all duration-200 ${
                isActive('/best-performing')
                  ? isScrolled ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-500 text-white'
                  : isScrolled ? 'hover:bg-gray-100' : 'hover:bg-indigo-500'
              }`}
            >
              <Award className="h-4 w-4" />
              <span className="font-medium">Best Performing</span>
            </Link>

            {token ? (
              <>
                <Link
                  to={`/${role}`}
                  className={`py-1 px-3 rounded-md transition-all duration-200 ${
                    isActive(`/${role}`)
                      ? isScrolled ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-500 text-white'
                      : isScrolled ? 'hover:bg-gray-100' : 'hover:bg-indigo-500'
                  }`}
                >
                  <span className="font-medium">Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className={`flex items-center space-x-2 py-1.5 px-4 rounded-full transition-all duration-200 ${
                    isScrolled 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-white text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex space-x-4 items-center">
                <Link 
                  to="/admin/login" 
                  className={`py-1.5 px-3 rounded-md transition-all duration-200 ${
                    isScrolled ? 'hover:bg-gray-100' : 'hover:bg-indigo-500'
                  }`}
                >
                  <span className="font-medium">Admin Login</span>
                </Link>
                <Link 
                  to="/student/login" 
                  className={`flex items-center space-x-2 py-1.5 px-4 rounded-full transition-all duration-200 ${
                    isScrolled 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                      : 'bg-white text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span className="font-medium">Student Login</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-md ${
                isScrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-indigo-500'
              }`}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={`md:hidden ${isScrolled ? 'bg-white' : 'bg-indigo-700'} shadow-lg py-3 px-4 space-y-3`}>
          <Link
            to="/"
            className={`flex items-center space-x-2 py-2 px-3 rounded-md ${
              isActive('/')
                ? isScrolled ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-600 text-white'
                : isScrolled ? 'text-gray-800 hover:bg-gray-100' : 'text-white hover:bg-indigo-600'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>
          
          <Link
            to="/best-performing"
            className={`flex items-center space-x-2 py-2 px-3 rounded-md ${
              isActive('/best-performing')
                ? isScrolled ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-600 text-white'
                : isScrolled ? 'text-gray-800 hover:bg-gray-100' : 'text-white hover:bg-indigo-600'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Award className="h-5 w-5" />
            <span>Best Performing</span>
          </Link>

          {token ? (
            <>
              <Link
                to={`/${role}`}
                className={`flex items-center space-x-2 py-2 px-3 rounded-md ${
                  isActive(`/${role}`)
                    ? isScrolled ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-600 text-white'
                    : isScrolled ? 'text-gray-800 hover:bg-gray-100' : 'text-white hover:bg-indigo-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Users className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center w-full space-x-2 py-2 px-3 rounded-md ${
                  isScrolled ? 'text-red-600 hover:bg-red-50' : 'text-white hover:bg-indigo-600'
                }`}
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/admin/login"
                className={`flex items-center space-x-2 py-2 px-3 rounded-md ${
                  isScrolled ? 'text-gray-800 hover:bg-gray-100' : 'text-white hover:bg-indigo-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Users className="h-5 w-5" />
                <span>Admin Login</span>
              </Link>
              <Link
                to="/student/login"
                className={`flex items-center space-x-2 py-2 px-3 rounded-md ${
                  isScrolled ? 'text-gray-800 hover:bg-gray-100' : 'text-white hover:bg-indigo-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="h-5 w-5" />
                <span>Student Login</span>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;