import { Link, useLocation } from 'react-router-dom';
import { UserCircle, Users, BookOpen, Award, BarChart } from 'lucide-react';

const HomePage = () => {
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-white overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="max-w-7xl mx-auto px-4 py-16 relative z-10 pt-32">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 pb-4 mt-8">
            Welcome to Scholarly
            
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Elevate educational excellence with our comprehensive student performance management system
          </p>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-3 gap-6 max-w-5xl mx-auto mb-16 text-center">
          {[
            { icon: BookOpen, text: "Comprehensive Academic Tracking" },
            { icon: BarChart, text: "Insightful Performance Analytics" },
            { icon: Award, text: "Achievement Recognition" }
          ].map((feature, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="p-3 bg-white bg-opacity-60 rounded-full shadow-md mb-4">
                <feature.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">{feature.text}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link
            to="/student/login"
            className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
          >
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 flex items-center justify-center bg-indigo-50 rounded-full mb-6 group-hover:bg-indigo-100 transition-colors">
                <UserCircle className="w-10 h-10 text-indigo-600 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Student Portal
              </h2>
              <p className="text-gray-600 text-center">
                Access your academic performance, grades, and personalized insights to track your educational journey
              </p>
              <span className="mt-4 text-indigo-600 font-medium group-hover:underline">Sign in as student →</span>
            </div>
          </Link>

          <Link
            to="/teacher/login"
            className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
          >
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 flex items-center justify-center bg-indigo-50 rounded-full mb-6 group-hover:bg-indigo-100 transition-colors">
                <Users className="w-10 h-10 text-indigo-600 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Teacher Portal
              </h2>
              <p className="text-gray-600 text-center">
                Manage student records, track academic progress, and provide comprehensive feedback
              </p>
              <span className="mt-4 text-indigo-600 font-medium group-hover:underline">Sign in as teacher →</span>
            </div>
          </Link>
        </div>

        <footer className="mt-20 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Scholarly. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;