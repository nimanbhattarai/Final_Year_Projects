import { useState, useEffect } from 'react';
import { performanceApi } from '../services/api';
import { Trophy, Star, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const BestPerformingPage = () => {
  const [bestStudent, setBestStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBestPerforming();
  }, []);

  const fetchBestPerforming = async () => {
    try {
      const response = await performanceApi.getBestPerforming();
      setBestStudent(response.data.bestStudent);
    } catch (error) {
      toast.error('Failed to fetch best performing student');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!bestStudent) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-gray-600">No student data available</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg shadow-xl overflow-hidden">
        <div className="p-6 text-white">
          <div className="flex items-center justify-center mb-6">
            <Trophy className="h-16 w-16" />
          </div>
          <h1 className="text-3xl font-bold text-center mb-2">Best Performing Student</h1>
          <p className="text-center text-indigo-100 mb-6">Academic Excellence Award</p>
          
          <div className="bg-white/10 rounded-lg p-6 backdrop-blur-lg">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">{bestStudent.name}</h2>
              <p className="text-indigo-100">{bestStudent.email}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/20 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-6 w-6" />
                </div>
                <h3 className="text-center font-semibold mb-2">Academic Score</h3>
                <p className="text-center text-2xl font-bold">{bestStudent.academicScore}%</p>
              </div>

              <div className="bg-white/20 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-center font-semibold mb-2">Extra-Curricular</h3>
                <p className="text-center text-2xl font-bold">{bestStudent.extraCurricularScore}%</p>
              </div>

              <div className="bg-white/20 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Trophy className="h-6 w-6" />
                </div>
                <h3 className="text-center font-semibold mb-2">Overall Score</h3>
                <p className="text-center text-2xl font-bold">{bestStudent.totalScore}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BestPerformingPage;