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
  PieController
} from 'chart.js';
import { Line, Bar, Radar, Pie } from 'react-chartjs-2';
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
  PieController,
  Title,
  Tooltip,
  Legend
);

const PerformanceCharts = ({ studentId }) => {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overall');
  const [selectedYear, setSelectedYear] = useState(null);
  const [formattedAcademicData, setFormattedAcademicData] = useState([]);

  useEffect(() => {
    if (!studentId) {
      const id = localStorage.getItem("studentId");
      if (id) {
        fetchPerformanceData(id);
      } else {
        setLoading(false);
      }
    } else {
      fetchPerformanceData(studentId);
    }
  }, [studentId]);

  const fetchPerformanceData = async (id) => {
    try {
      setLoading(true);
      // Fetch profile instead of performance to get all student data
      const response = await studentApi.getProfile(id);
      const data = response.data || {};
      
      console.log("Raw student data:", data);
      
      if (!data || !data.performance) {
        console.warn("No performance data found in response");
        setPerformanceData({});
        setFormattedAcademicData([]);
        setLoading(false);
        return;
      }
      
      // Format academic data if needed
      let academicData = data.performance?.academic || {};
      let processedData = [];
      
      // Check if academic data is an array (old format) or Map (new format)
      if (Array.isArray(academicData)) {
        // Data is already in the right format from StudentProfile
        processedData = academicData;
      } else {
        // Convert Map structure to array format for better visualization
        processedData = [];
        Object.keys(academicData)
          .filter(key => !key.startsWith('$') && key !== 'toJSON')
          .sort((a, b) => Number(a) - Number(b))
          .forEach(year => {
            const yearData = {
              year,
              semesters: []
            };
            
            if (academicData[year] && academicData[year].semester) {
              Object.keys(academicData[year].semester)
                .filter(sem => !sem.startsWith('$') && sem !== 'toJSON')
                .sort((a, b) => Number(a) - Number(b))
                .forEach(semester => {
                  yearData.semesters.push({
                    semester,
                    subjects: academicData[year].semester[semester] || []
                  });
                });
            }
            
            processedData.push(yearData);
          });
      }
      
      setFormattedAcademicData(processedData);
      setPerformanceData(data.performance);
      
      // Set first year as selected by default if available
      if (processedData && processedData.length > 0) {
        setSelectedYear(processedData[0].year);
      }
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
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
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-900 mb-4">No Performance Data</h2>
        <p className="text-gray-600">No performance data is available for your account yet. Please contact your administrator.</p>
      </div>
    );
  }
  
  // Calculate overall academic performance by year
  const overallAcademicData = {
    labels: formattedAcademicData.map(year => `Year ${year.year}`),
    datasets: [
      {
        label: 'Average Score',
        data: formattedAcademicData.map(year => {
          try {
            // Calculate average across all semesters in the year
            const allSubjects = (year.semesters || []).flatMap(sem => sem.subjects || []);
            if (allSubjects.length === 0) return 0;
            
            // Make sure we can read marks safely
            const validSubjects = allSubjects.filter(subject => 
              subject && typeof subject.marks === 'number'
            );
            
            if (validSubjects.length === 0) return 0;
            const totalMarks = validSubjects.reduce((sum, subject) => sum + subject.marks, 0);
            return (totalMarks / validSubjects.length).toFixed(2);
          } catch (err) {
            console.error('Error calculating average for year', year.year, err);
            return 0;
          }
        }),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.3,
      },
    ],
  };
  
  // Prepare extracurricular data
  const extracurricularData = {
    labels: (performanceData.extracurricular || [])
      .filter(item => item && item.activity)
      .map(item => item.activity) || [],
    datasets: [
      {
        label: 'Grade',
        data: (performanceData.extracurricular || [])
          .filter(item => item && typeof item.grade === 'number')
          .map(item => item.grade) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare teacher remarks data
  const remarksData = {
    labels: (performanceData.teacherRemarks || [])
      .filter(remark => remark && remark.teacherName)
      .map(remark => remark.teacherName) || [],
    datasets: [
      {
        label: 'Teacher Evaluations',
        data: (performanceData.teacherRemarks || [])
          .filter(remark => remark && typeof remark.grade === 'number')
          .map(remark => remark.grade) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
      },
    ],
  };
  
  // Prepare semester-wise data if a year is selected
  const semesterData = selectedYear ? {
    labels: formattedAcademicData
      .find(y => y.year === selectedYear)?.semesters
      ?.map(sem => `Semester ${sem.semester}`) || [],
    datasets: [
      {
        label: `Year ${selectedYear} Semester Performance`,
        data: formattedAcademicData
          .find(y => y.year === selectedYear)?.semesters
          ?.map(sem => {
            const subjects = sem.subjects || [];
            if (subjects.length === 0) return 0;
            
            // Make sure we can read marks safely
            const validSubjects = subjects.filter(subj => subj && typeof subj.marks === 'number');
            if (validSubjects.length === 0) return 0;
            
            return (validSubjects.reduce((sum, subj) => sum + subj.marks, 0) / validSubjects.length).toFixed(2);
          }) || [],
        backgroundColor: 'rgba(147, 51, 234, 0.5)',
        borderColor: 'rgb(147, 51, 234)',
        borderWidth: 1,
      },
    ],
  } : null;

  // Prepare subject data for the selected year with safer data access
  const yearSubjectsData = selectedYear ? {
    labels: formattedAcademicData
      .find(y => y.year === selectedYear)?.semesters
      ?.flatMap(sem => (sem.subjects || []).map(subj => subj.subject || 'Unknown')) || [],
    datasets: [
      {
        label: `Year ${selectedYear} Subject Marks`,
        data: formattedAcademicData
          .find(y => y.year === selectedYear)?.semesters
          ?.flatMap(sem => (sem.subjects || []).map(subj => subj.marks || 0)) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
    ],
  } : null;

  return (
    <div className="space-y-8 p-6">
      {/* Tabs navigation */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'overall' 
                ? 'border-b-2 border-indigo-600 text-indigo-600' 
                : 'text-gray-600 hover:text-indigo-600'
            }`}
            onClick={() => setActiveTab('overall')}
          >
            Overall Performance
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'academic' 
                ? 'border-b-2 border-indigo-600 text-indigo-600' 
                : 'text-gray-600 hover:text-indigo-600'
            }`}
            onClick={() => setActiveTab('academic')}
          >
            Academic Details
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'extras' 
                ? 'border-b-2 border-indigo-600 text-indigo-600' 
                : 'text-gray-600 hover:text-indigo-600'
            }`}
            onClick={() => setActiveTab('extras')}
          >
            Extra-Curricular
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'remarks' 
                ? 'border-b-2 border-indigo-600 text-indigo-600' 
                : 'text-gray-600 hover:text-indigo-600'
            }`}
            onClick={() => setActiveTab('remarks')}
          >
            Teacher Remarks
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overall' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Academic Progress Over Years</h2>
          <div className="h-80">
            {formattedAcademicData.length > 0 ? (
              <Line
                data={overallAcademicData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      title: {
                        display: true,
                        text: 'Average Score'
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'Academic Year'
                      }
                    }
                  },
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No academic data available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'academic' && (
        <div className="space-y-6">
          {/* Year selector */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Academic Performance by Year</h2>
            <div className="flex space-x-2 mb-6">
              {formattedAcademicData.map(yearData => (
                <button
                  key={yearData.year}
                  className={`px-4 py-2 rounded-md ${
                    selectedYear === yearData.year
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                  onClick={() => setSelectedYear(yearData.year)}
                >
                  Year {yearData.year}
                </button>
              ))}
            </div>
            
            {selectedYear ? (
              <div className="space-y-6">
                {/* Semester performance chart */}
                <div className="h-64">
                  <h3 className="text-lg font-medium mb-2">Semester Performance</h3>
                  {semesterData.labels.length > 0 ? (
                    <Bar
                      data={semesterData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
                            title: {
                              display: true,
                              text: 'Average Score'
                            }
                          }
                        },
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No semester data for this year</p>
                    </div>
                  )}
                </div>
                
                {/* Subject performance chart */}
                <div className="h-64">
                  <h3 className="text-lg font-medium mb-2">Subject Performance</h3>
                  {yearSubjectsData.labels.length > 0 ? (
                    <Bar
                      data={yearSubjectsData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
                            title: {
                              display: true,
                              text: 'Marks'
                            }
                          },
                          x: {
                            ticks: {
                              autoSkip: false,
                              maxRotation: 45,
                              minRotation: 45
                            }
                          }
                        },
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No subject data for this year</p>
                    </div>
                  )}
                </div>
                
                {/* Detailed subject list */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Detailed Subject Report</h3>
                  <div className="space-y-4">
                    {formattedAcademicData
                      .find(y => y.year === selectedYear)?.semesters
                      ?.filter(semester => semester && semester.semester)
                      .map(semester => (
                        <div key={semester.semester} className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Semester {semester.semester}</h4>
                          <div className="divide-y">
                            {semester.subjects && semester.subjects.length > 0 ? (
                              semester.subjects.map((subject, idx) => (
                                <div key={idx} className="py-2 flex justify-between">
                                  <span>{subject?.subject || 'Unknown Subject'}</span>
                                  <span className="font-medium">{subject?.marks || 'N/A'}</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-500 py-2">No subjects available</p>
                            )}
                          </div>
                        </div>
                      )) || (
                        <p className="text-gray-500 py-2">No semester data available</p>
                      )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-40">
                <p className="text-gray-500">Select a year to view academic performance</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'extras' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Extra-Curricular Activities</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart */}
            <div className="h-80">
              {performanceData.extracurricular?.length > 0 ? (
                <Pie
                  data={extracurricularData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return ` ${context.label}: ${context.raw}/100`;
                          }
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No extracurricular data available</p>
                </div>
              )}
            </div>
            
            {/* Activity list */}
            <div>
              <h3 className="text-lg font-medium mb-3">Activities</h3>
              <div className="space-y-3">
                {performanceData.extracurricular?.length > 0 ? (
                  performanceData.extracurricular.map((activity, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg border">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{activity.activity}</h4>
                        <div className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm font-medium">
                          Grade: {activity.grade}/100
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No activities available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'remarks' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Teacher Evaluations & Remarks</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart */}
            <div className="h-80">
              {performanceData.teacherRemarks?.length > 0 ? (
                <Radar
                  data={remarksData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      r: {
                        beginAtZero: true,
                        max: 10,
                        ticks: {
                          stepSize: 2
                        }
                      },
                    },
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No teacher evaluations available</p>
                </div>
              )}
            </div>
            
            {/* Remarks list */}
            <div>
              <h3 className="text-lg font-medium mb-3">Detailed Remarks</h3>
              <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                {performanceData.teacherRemarks?.length > 0 ? (
                  performanceData.teacherRemarks.map((remark, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{remark.teacherName}</h4>
                        <div className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm font-medium">
                          Grade: {remark.grade}/10
                        </div>
                      </div>
                      <p className="text-gray-700">{remark.remark}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No teacher remarks available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceCharts;