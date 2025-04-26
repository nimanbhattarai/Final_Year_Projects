import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  RadialBarChart, RadialBar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const PerformanceView = ({ selectedStudent }) => {
  const [performanceData, setPerformanceData] = useState(null);
  const [chartType, setChartType] = useState('radar');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedStudent) {
      fetchPerformanceData();
    }
  }, [selectedStudent]);

  const fetchPerformanceData = async () => {
    if (!selectedStudent) return;

    try {
      setRefreshing(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/performance/${selectedStudent._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPerformanceData(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast.error('Failed to load performance data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchPerformanceData();
  };

  if (!selectedStudent) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="bg-indigo-50 rounded-full p-4 mb-4">
          <TrendingUp className="h-8 w-8 text-indigo-500" />
        </div>
        <p className="text-gray-600 text-center">
          Please select a student from the Student List section first.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-8">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Performance Dashboard</h1>
          <p className="text-gray-600">View student's academic and extracurricular performance</p>
        </div>
        
        <div className="flex space-x-3">
          <div className="inline-flex shadow-sm rounded-md">
            <button
              onClick={() => setChartType('radar')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                chartType === 'radar' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Radar Chart
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                chartType === 'pie' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Pie Chart
            </button>
          </div>
          
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Performance Overview Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Overall Performance</h2>
            <p className="text-sm text-gray-500">Academic year performance breakdown</p>
          </div>
          <div className="bg-indigo-50 p-2 rounded-lg">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
          </div>
        </div>

        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'radar' ? (
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="10%"
                outerRadius="80%"
                data={performanceData?.subjects || []}
                startAngle={0}
                endAngle={360}
              >
                <RadialBar
                  minAngle={15}
                  label={{ position: 'insideStart', fill: '#fff' }}
                  background
                  dataKey="score"
                >
                  {performanceData?.subjects?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </RadialBar>
                <Legend />
                <Tooltip />
              </RadialBarChart>
            ) : (
              <PieChart>
                <Pie
                  data={performanceData?.subjects || []}
                  dataKey="score"
                  nameKey="subject"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  fill="#8884d8"
                  label
                >
                  {performanceData?.subjects?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Subject-wise Performance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Subject-wise Performance</h2>
            <p className="text-sm text-gray-500">Detailed breakdown by subject</p>
          </div>
        </div>

        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData?.subjects || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PerformanceView; 