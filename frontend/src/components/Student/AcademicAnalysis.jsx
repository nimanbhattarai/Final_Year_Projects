import { useState, useEffect } from 'react';
import { studentApi } from '../../services/api';
import { LineChart, TrendingUp as TrendUp, Award } from 'lucide-react';
import toast from 'react-hot-toast';

const AcademicAnalysis = ({ studentId }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalysis();
  }, [studentId]);

  const fetchAnalysis = async () => {
    try {
      const response = await studentApi.getAnalysis(studentId);
      setAnalysis(response.data);
    } catch (error) {
      toast.error('Failed to fetch academic analysis');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading analysis...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-3 mb-4">
            <LineChart className="h-6 w-6 text-indigo-600" />
            <h3 className="text-lg font-semibold">Performance Trend</h3>
          </div>
          {analysis?.yearlyPerformance.map((year) => (
            <div key={year.year} className="flex justify-between items-center py-2">
              <span>Year {year.year}</span>
              <span className="font-semibold">{year.totalMarks}%</span>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-3 mb-4">
            <TrendUp className="h-6 w-6 text-indigo-600" />
            <h3 className="text-lg font-semibold">Growth Areas</h3>
          </div>
          <ul className="space-y-2">
            {analysis?.growthAreas?.map((area, index) => (
              <li key={index} className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-3 mb-4">
            <Award className="h-6 w-6 text-indigo-600" />
            <h3 className="text-lg font-semibold">Interests</h3>
          </div>
          <ul className="space-y-2">
            {analysis?.interests?.map((interest, index) => (
              <li key={index} className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                <span>{interest}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AcademicAnalysis;