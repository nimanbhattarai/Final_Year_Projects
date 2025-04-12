import { useState, useEffect } from 'react';
import { studentApi } from '../../services/api';
import toast from 'react-hot-toast';
import { BookOpen, Award, MessageSquare, AlertCircle, TrendingUp, Filter, RefreshCw } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Cell, Sector, ReferenceLine
} from 'recharts';

// Enhanced colors
const COLORS = {
  academic: {
    primary: '#4f46e5',
    secondary: '#818cf8',
    light: '#e0e7ff',
    gradient: ['#4f46e5', '#818cf8']
  },
  extracurricular: {
    primary: '#10b981',
    secondary: '#34d399',
    light: '#d1fae5',
    gradient: ['#10b981', '#34d399']
  },
  remarks: {
    primary: '#f59e0b',
    secondary: '#fbbf24',
    light: '#fef3c7',
    gradient: ['#f59e0b', '#fbbf24']
  }
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label, unit = '' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
        <p className="font-medium text-gray-700">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm flex items-center">
            <span className="inline-block w-3 h-3 mr-1 rounded-full" style={{ backgroundColor: entry.color }}></span>
            <span className="font-medium">{entry.name}:</span>
            <span className="ml-1">{entry.value}{unit}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom active shape for pie chart
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

  return (
    <g>
      <text x={cx} y={cy} dy={-20} textAnchor="middle" fill={fill} className="text-lg font-medium">
        {payload.name}
      </text>
      <text x={cx} y={cy} dy={10} textAnchor="middle" fill="#333" className="text-xl font-bold">
        {value.toFixed(1)}
      </text>
      <text x={cx} y={cy} dy={30} textAnchor="middle" fill="#999" className="text-sm">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius - 5}
        outerRadius={innerRadius - 1}
        fill={fill}
      />
    </g>
  );
};

const ChartCard = ({ title, icon, children, color = 'indigo', className = '' }) => {
  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg ${className}`}>
      <div className={`px-6 py-4 flex items-center border-b border-${color}-100`}>
        <span className={`bg-${color}-100 p-2 rounded-lg mr-3`}>
          {icon}
        </span>
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
};

const PerformanceCharts = ({ studentId }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [performanceData, setPerformanceData] = useState({
    academic: [],
    extracurricular: [],
    teacherRemarks: []
  });
  const [chartType, setChartType] = useState('radar'); // radar, pie
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (studentId) {
      fetchPerformanceData(studentId);
    }
  }, [studentId]);

  const fetchPerformanceData = async (id) => {
    setLoading(true);
    try {
      const response = await studentApi.getProfile(id);
      console.log("API Response:", response.data);
      
      // Transform data for charts if needed
      const formattedData = {
        academic: formatAcademicData(response.data.performance.academic),
        extracurricular: response.data.performance.extracurricular || [],
        teacherRemarks: response.data.performance.teacherRemarks || []
      };
      
      console.log("Formatted Data:", formattedData);
      
      setPerformanceData(formattedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching performance data:', err);
      setError('Failed to load performance data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPerformanceData(studentId);
    toast.success("Refreshing performance data...");
  };

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  // Improved format academic data function
  function formatAcademicData(academicData) {
    if (!academicData || !academicData.length) return [];
    
    // Map each year's data with only its own semesters
    return academicData.map(yearData => {
      const yearObj = { year: yearData.year };
      
      // Only include the semesters that belong to this year
      if (yearData.semesters && yearData.semesters.length) {
        yearData.semesters.forEach(sem => {
          // Calculate SGPA for each semester
          const semesterTotal = sem.subjects.reduce((total, subject) => {
            // Ensure marks are in SGPA scale (0-10)
            const marks = parseFloat(subject.marks);
            return total + (marks > 10 ? marks / 10 : marks); // Convert if marks are in percentage
          }, 0);
          const semesterAvg = sem.subjects.length > 0 ? semesterTotal / sem.subjects.length : 0;
          yearObj[`Semester ${sem.semester}`] = parseFloat(semesterAvg.toFixed(2));
        });
      }
      
      return yearObj;
    });
  }

  // Add this function to get all semester names for rendering
  function getAllSemesterNames(academicData) {
    if (!academicData || !academicData.length) return [];
    
    const allSemesters = new Set();
    
    // Collect semester keys that have actual data values
    academicData.forEach(yearData => {
      Object.entries(yearData).forEach(([key, value]) => {
        if (key.startsWith('Semester') && value > 0) {
          allSemesters.add(key);
        }
      });
    });
    
    return Array.from(allSemesters).sort((a, b) => {
      // Extract semester numbers for proper sorting
      const numA = parseInt(a.split(' ')[1]);
      const numB = parseInt(b.split(' ')[1]);
      return numA - numB;
    });
  }

  // Calculate scores
  function calculateAcademicAverage(academicData) {
    if (!academicData || !academicData.length) return 0;
    
    let totalMarks = 0;
    let totalSubjects = 0;
    
    academicData.forEach(year => {
      Object.keys(year).forEach(key => {
        if (key.startsWith('Semester')) {
          totalMarks += year[key];
          totalSubjects++;
        }
      });
    });
    
    return totalSubjects > 0 ? parseFloat((totalMarks / totalSubjects).toFixed(2)) : 0;
  }
  
  function calculateExtraCurricularScore(activities) {
    if (!activities || !activities.length) return 0;
    const total = activities.reduce((sum, activity) => {
      const grade = parseFloat(activity.grade);
      return sum + (grade > 10 ? grade / 10 : grade); // Convert if grade is in percentage
    }, 0);
    return parseFloat((total / activities.length).toFixed(2));
  }
  
  function calculateRemarksScore(remarks) {
    if (!remarks || !remarks.length) return 0;
    const total = remarks.reduce((sum, remark) => {
      const grade = parseFloat(remark.grade);
      return sum + (grade > 10 ? grade / 10 : grade); // Convert if grade is in percentage
    }, 0);
    return parseFloat((total / remarks.length).toFixed(2));
  }

  // Calculate aggregate scores
  const academicAverage = calculateAcademicAverage(performanceData.academic);
  const extraCurricularScore = calculateExtraCurricularScore(performanceData.extracurricular);
  const remarksScore = calculateRemarksScore(performanceData.teacherRemarks);
  
  const overallScores = [
    { name: 'Academic', score: academicAverage, fill: COLORS.academic.primary, value: academicAverage },
    { name: 'Extra Curricular', score: extraCurricularScore, fill: COLORS.extracurricular.primary, value: extraCurricularScore },
    { name: 'Teacher Remarks', score: remarksScore, fill: COLORS.remarks.primary, value: remarksScore }
  ];

  // Add this helper function for semester colors
  function getColorForSemester(index) {
    // An array of base colors for different semesters
    const colors = [
      '#4f46e5', // indigo
      '#10b981', // green
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // purple
      '#06b6d4', // cyan
      '#f97316', // orange
      '#ec4899'  // pink
    ];
    return colors[index % colors.length];
  }

  function getLighterColorForSemester(index) {
    // Lighter versions of the same colors
    const lighterColors = [
      '#818cf8', // lighter indigo
      '#34d399', // lighter green
      '#fbbf24', // lighter amber
      '#f87171', // lighter red
      '#a78bfa', // lighter purple
      '#22d3ee', // lighter cyan
      '#fb923c', // lighter orange
      '#f472b6'  // lighter pink
    ];
    return lighterColors[index % lighterColors.length];
  }

  // Calculate year over year change (from most recent two years)
  function calculateYearOverYearChange() {
    if (!performanceData.academic || performanceData.academic.length < 2) return 0;
    
    // Sort years in descending order
    const sortedYears = [...performanceData.academic].sort((a, b) => b.year - a.year);
    const currentYear = sortedYears[0];
    const previousYear = sortedYears[1];
    
    // Calculate average for each year
    const currentAvg = calculateYearAverage(currentYear);
    const previousAvg = calculateYearAverage(previousYear);
    
    if (previousAvg === 0) return 0;
    return Math.round((currentAvg - previousAvg) / previousAvg * 100);
  }

  // Calculate average for a year
  function calculateYearAverage(yearData) {
    let total = 0;
    let count = 0;
    
    Object.keys(yearData).forEach(key => {
      if (key.startsWith('Semester')) {
        total += yearData[key];
        count++;
      }
    });
    
    return count > 0 ? total / count : 0;
  }

  // Find the best performing semester
  function findBestSemester() {
    let bestSemester = { semester: 'None', score: 0 };
    
    performanceData.academic.forEach(yearData => {
      Object.keys(yearData).forEach(key => {
        if (key.startsWith('Semester') && yearData[key] > bestSemester.score) {
          bestSemester = {
            semester: `${key} (${yearData.year})`,
            score: parseFloat(yearData[key].toFixed(2))
          };
        }
      });
    });
    
    return bestSemester;
  }

  // Calculate total subjects across all semesters
  function calculateTotalSubjects() {
    let totalSubjects = 0;
    
    // We need to access the original API data to count subjects
    const originalAcademic = performanceData.academic._source || [];
    originalAcademic.forEach(yearData => {
      if (yearData.semesters) {
        yearData.semesters.forEach(sem => {
          totalSubjects += sem.subjects ? sem.subjects.length : 0;
        });
      }
    });
    
    return totalSubjects;
  }

  // Get recent subjects for the table
  function getRecentSubjects(limit = 5) {
    const subjects = [];
    
    // We need to access the original API data to get subject details
    const originalAcademic = performanceData.academic._source || [];
    originalAcademic.forEach(yearData => {
      if (yearData.semesters) {
        yearData.semesters.forEach(sem => {
          if (sem.subjects) {
            sem.subjects.forEach(subject => {
              const marks = parseFloat(subject.marks);
              subjects.push({
                ...subject,
                year: yearData.year,
                semester: sem.semester,
                marks: marks > 10 ? parseFloat((marks / 10).toFixed(2)) : parseFloat(marks.toFixed(2)) // Convert to SGPA if needed
              });
            });
          }
        });
      }
    });
    
    // Sort by most recent (assuming higher year/semester is more recent)
    return subjects
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.semester - a.semester;
      })
      .slice(0, limit);
  }

  // Get status class based on SGPA marks
  function getStatusClass(marks) {
    if (marks >= 8.0) return 'bg-green-100 text-green-800';
    if (marks >= 6.0) return 'bg-blue-100 text-blue-800';
    if (marks >= 4.0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  }

  // Get status text based on SGPA marks
  function getStatusText(marks) {
    if (marks >= 8.0) return 'Excellent';
    if (marks >= 6.0) return 'Good';
    if (marks >= 4.0) return 'Pass';
    return 'Needs Improvement';
  }

  // Simple utility function that shouldn't break
  function getSemesterCount() {
    let semesterCount = 0;
    
    // Count all semester entries across all years
    performanceData.academic.forEach(yearData => {
      Object.keys(yearData).forEach(key => {
        if (key.startsWith('Semester')) {
          semesterCount++;
        }
      });
    });
    
    return semesterCount;
  }

  if (loading) {
    return (
      <div className="grid gap-6 animate-pulse">
        <div className="bg-white rounded-xl shadow-md h-80"></div>
        <div className="bg-white rounded-xl shadow-md h-80"></div>
        <div className="bg-white rounded-xl shadow-md h-80"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
        <AlertCircle className="text-red-500 mr-2" />
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Performance Dashboard</h1>
          <p className="text-gray-600">View your academic and extracurricular performance</p>
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
      <ChartCard 
        title="Overall Performance" 
        icon={<TrendingUp className="h-6 w-6 text-indigo-700" />}
        color="indigo"
        className="transform transition-all hover:scale-[1.01]"
      >
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-2/3 h-80">
            {chartType === 'radar' ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={140} data={overallScores}>
                  <defs>
                    {/* Add gradient for radar fill */}
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="#9ca3af" fontSize={10} />
                  <Radar 
                    name="Performance" 
                    dataKey="score" 
                    stroke="#4f46e5" 
                    fill="url(#colorScore)" 
                    animationDuration={1000}
                  />
                  <Tooltip content={<CustomTooltip unit="/10" />} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={overallScores}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                    animationDuration={800}
                    animationBegin={200}
                  >
                    {overallScores.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          
          <div className="w-full md:w-1/3 flex flex-col justify-center space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {/* Academic score card */}
              <div className="p-4 rounded-xl border-2 border-indigo-100 bg-gradient-to-r from-indigo-50 to-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-indigo-800">Academic Score</p>
                    <h3 className="text-3xl font-bold text-indigo-600 mt-1">{academicAverage.toFixed(1)}/10</h3>
                  </div>
                  <span className="bg-indigo-100 p-2 rounded-md">
                    <BookOpen className="h-5 w-5 text-indigo-700" />
                  </span>
                </div>
                <div className="mt-2 bg-white rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-indigo-600 to-indigo-400 h-full" 
                    style={{ width: `${(academicAverage/10) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">0</span>
                  <span className="text-xs text-gray-500">10 (SGPA)</span>
                </div>
              </div>
                
              {/* Extracurricular score card */}
              <div className="p-4 rounded-xl border-2 border-green-100 bg-gradient-to-r from-green-50 to-white">
                <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-green-800">Extracurricular Score</p>
                    <h3 className="text-3xl font-bold text-green-600 mt-1">{extraCurricularScore.toFixed(1)}/10</h3>
                  </div>
                  <span className="bg-green-100 p-2 rounded-md">
                    <Award className="h-5 w-5 text-green-700" />
                  </span>
                </div>
                <div className="mt-2 bg-white rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-600 to-green-400 h-full" 
                    style={{ width: `${(extraCurricularScore/10) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">0</span>
                  <span className="text-xs text-gray-500">10 (SGPA)</span>
                </div>
              </div>
              
              {/* Teacher remarks score card */}
              <div className="p-4 rounded-xl border-2 border-amber-100 bg-gradient-to-r from-amber-50 to-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-amber-800">Teacher Remarks Score</p>
                    <h3 className="text-3xl font-bold text-amber-600 mt-1">{remarksScore.toFixed(1)}/10</h3>
              </div>
                  <span className="bg-amber-100 p-2 rounded-md">
                    <MessageSquare className="h-5 w-5 text-amber-700" />
                  </span>
                </div>
                <div className="mt-2 bg-white rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-600 to-amber-400 h-full" 
                    style={{ width: `${(remarksScore/10) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">0</span>
                  <span className="text-xs text-gray-500">10 (SGPA)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ChartCard>

      {/* Academic Performance Chart - Without Stats Section */}
      <div className="p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="bg-indigo-100 p-2 rounded-lg mr-3">
            <BookOpen className="h-6 w-6 text-indigo-700" />
          </span>
          Academic Performance
        </h2>
        
        {performanceData.academic.length > 0 ? (
          <div className="space-y-6">
            {/* Chart */}
            <div className="h-80 bg-gradient-to-b from-indigo-50/30 to-transparent p-4 rounded-xl">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={performanceData.academic}
                  margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="year" 
                    stroke="#6b7280" 
                    fontSize={12} 
                    tickMargin={10} 
                  />
                  <YAxis 
                    domain={[0, 10]} 
                    stroke="#6b7280" 
                    fontSize={12} 
                    tickMargin={10} 
                    tickCount={6}
                  />
                  <Tooltip />
                  <Legend />
                  
                  {/* Modified way to render lines - only render actual semester data that exists */}
                  {getAllSemesterNames(performanceData.academic).map((semesterKey, index) => {
                    // Simple color generator based on index
                    const color = getColorForSemester(index);
                    
                    return (
                      <Line 
                        key={semesterKey}
                        type="monotone" 
                        dataKey={semesterKey} 
                        stroke={color}
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        connectNulls={false}
                      />
                    );
                  })}
                  
                  {/* Reference line at passing grade (4.0) */}
                  <ReferenceLine 
                    y={4.0} 
                    stroke="#ef4444" 
                    strokeDasharray="3 3" 
                    label="Passing Grade" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No academic data available</p>
            <p className="text-sm text-gray-500 mt-1">Your academic records will appear here once added</p>
          </div>
        )}
      </div>

      {/* Extracurricular Activities Chart */}
      <ChartCard 
        title="Extracurricular Activities" 
        icon={<Award className="h-6 w-6 text-green-700" />}
        color="green"
      >
        {performanceData.extracurricular.length > 0 ? (
            <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={performanceData.extracurricular}
                margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="colorGrade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="activity" stroke="#6b7280" fontSize={12} tickMargin={10} />
                <YAxis domain={[0, 10]} stroke="#6b7280" fontSize={12} tickMargin={10} />
                <Tooltip content={<CustomTooltip unit="/10" />} />
                <Legend 
                  wrapperStyle={{ paddingTop: 10 }}
                  formatter={(value) => <span className="text-sm font-medium">{value}</span>}
                />
                <Bar 
                  dataKey="grade" 
                  name="Activity Grade" 
                  fill="url(#colorGrade)" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No extracurricular data available</p>
            <p className="text-sm text-gray-500 mt-1">Your extracurricular activities will appear here once added</p>
                </div>
              )}
      </ChartCard>

      {/* Teacher Remarks Chart */}
      <ChartCard 
        title="Teacher Remarks" 
        icon={<MessageSquare className="h-6 w-6 text-amber-700" />}
        color="amber"
      >
        {performanceData.teacherRemarks.length > 0 ? (
          <div className="space-y-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={performanceData.teacherRemarks}
                  margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="colorRemarks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="teacher" stroke="#6b7280" fontSize={12} tickMargin={10} />
                  <YAxis domain={[0, 10]} stroke="#6b7280" fontSize={12} tickMargin={10} />
                  <Tooltip content={<CustomTooltip unit="/10" />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: 10 }}
                    formatter={(value) => <span className="text-sm font-medium">{value}</span>}
                  />
                  <Bar 
                    dataKey="grade" 
                    name="Teacher Rating" 
                    fill="url(#colorRemarks)" 
                    radius={[4, 4, 0, 0]} 
                    barSize={40}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 max-h-60 overflow-y-auto px-2 py-4 bg-amber-50 rounded-xl">
              <h3 className="font-medium text-amber-900 px-2 mb-4">Teacher Comments</h3>
              <div className="space-y-3">
                {performanceData.teacherRemarks.map((remark, index) => (
                  <div key={index} className="p-4 bg-white rounded-lg border-l-4 border-amber-400 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-gray-700 italic mb-2">"{remark.remark}"</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm font-medium text-gray-600">{remark.teacher}</span>
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
                        Rating: {remark.grade}/10
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No teacher remarks available</p>
            <p className="text-sm text-gray-500 mt-1">Teacher comments and ratings will appear here once added</p>
        </div>
      )}
      </ChartCard>
    </div>
  );
};

export default PerformanceCharts;