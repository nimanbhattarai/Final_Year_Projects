import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Radar } from 'react-chartjs-2';
import { studentApi } from '../../services/api';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const PerformanceCharts = ({ studentId }) => {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceData();
  }, [studentId]);

  const fetchPerformanceData = async () => {
    try {
      const response = await studentApi.getProfile(studentId);
      setPerformanceData(response.data.performance);
    } catch (error) {
      toast.error('Failed to fetch performance data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!performanceData) {
    return <div>No performance data available</div>;
  }

  // Prepare academic performance data
  const academicData = {
    labels: Object.keys(performanceData.academic || {}).map(year => `Year ${year}`),
    datasets: [
      {
        label: 'Academic Performance',
        data: Object.values(performanceData.academic || {}).map(semesters =>
          Object.values(semesters).flat().reduce((sum, subject) => sum + subject.marks, 0) /
          Object.values(semesters).flat().length
        ),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.3,
      },
    ],
  };

  // Prepare extracurricular data
  const extracurricularData = {
    labels: performanceData.extracurricular.map(item => item.activity),
    datasets: [
      {
        label: 'Extra-Curricular Performance',
        data: performanceData.extracurricular.map(item => item.grade),
        backgroundColor: 'rgba(147, 51, 234, 0.5)',
        borderColor: 'rgb(147, 51, 234)',
        borderWidth: 1,
      },
    ],
  };

  // Prepare teacher remarks data
  const remarksData = {
    labels: performanceData.teacherRemarks.map(remark => remark.teacherName),
    datasets: [
      {
        label: 'Teacher Evaluations',
        data: performanceData.teacherRemarks.map(remark => remark.grade),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
      },
    ],
  };

  return (
    <div className="space-y-8 p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Academic Progress Over Time</h2>
        <div className="h-80">
          <Line
            data={academicData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                },
              },
            }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Extra-Curricular Activities</h2>
        <div className="h-80">
          <Bar
            data={extracurricularData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                },
              },
            }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Teacher Evaluations</h2>
        <div className="h-80">
          <Radar
            data={remarksData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                r: {
                  beginAtZero: true,
                  max: 100,
                },
              },
            }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Teacher Remarks</h2>
        <div className="space-y-4">
          {performanceData.teacherRemarks.map((remark, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-900">{remark.teacherName}</h3>
                <span className="bg-indigo-100 text-indigo-800 text-sm px-2 py-1 rounded">
                  Grade: {remark.grade}
                </span>
              </div>
              <p className="text-gray-600">{remark.remark}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceCharts;