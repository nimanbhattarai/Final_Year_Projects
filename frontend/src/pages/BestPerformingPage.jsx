import { useState, useEffect } from 'react';
import { performanceApi } from '../services/api';
import { Trophy, Star, TrendingUp, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const BestPerformingPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await performanceApi.getBestPerforming();
      setStudents(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch student performance data');
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Student Performance Rankings</h1>
        <p className="text-lg text-gray-600">Compare and analyze student achievements across different areas</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {students.slice(0, 2).map((student, index) => (
          <div
            key={student._id}
            className={`bg-white rounded-xl shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300 ${
              index === 0 ? 'border-4 border-yellow-400' : ''
            }`}
          >
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Users className="h-12 w-12 text-white" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">{student.name}</h2>
                    <p className="text-indigo-100">{index === 0 ? 'Top Performer' : 'Runner Up'}</p>
                  </div>
                </div>
                {index === 0 && <Trophy className="h-12 w-12 text-yellow-400" />}
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <Star className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                  <h3 className="text-sm font-semibold text-gray-600">Academic</h3>
                  <p className="text-2xl font-bold text-indigo-600">{student.academicScore}%</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="text-sm font-semibold text-gray-600">Extra-Curricular</h3>
                  <p className="text-2xl font-bold text-purple-600">{student.extraCurricularScore}%</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="text-sm font-semibold text-gray-600">Overall</h3>
                  <p className="text-2xl font-bold text-green-600">{student.totalScore}%</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-xs font-semibold inline-block text-indigo-600">
                        Academic Performance
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold inline-block text-indigo-600">
                        {student.academicScore}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-indigo-200">
                    <div
                      style={{ width: `${student.academicScore}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600"
                    ></div>
                  </div>
                </div>

                <div className="relative pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-xs font-semibold inline-block text-purple-600">
                        Extra-Curricular
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold inline-block text-purple-600">
                        {student.extraCurricularScore}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-purple-200">
                    <div
                      style={{ width: `${student.extraCurricularScore}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-600"
                    ></div>
                  </div>
                </div>

                <div className="relative pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-xs font-semibold inline-block text-green-600">
                        Overall Score
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold inline-block text-green-600">
                        {student.totalScore}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-green-200">
                    <div
                      style={{ width: `${student.totalScore}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-600"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BestPerformingPage;