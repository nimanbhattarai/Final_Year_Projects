import { useState, useEffect } from 'react';
import { performanceApi, adminApi } from '../services/api';
import { Trophy, Star, TrendingUp, Users, Award, BookOpen, MessageSquare, Filter, ChevronDown, ChevronUp, Crown, Medal, TrendingDown, BarChart4, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { Snackbar, Alert } from '@mui/material';

const BestPerformingPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overall');
  const [filterYear, setFilterYear] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'totalScore', direction: 'desc' });
  const [bestStudent, setBestStudent] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchStudents();
    fetchBestPerformingStudent();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      let response;
      
      try {
        // First try the new enhanced endpoint
        response = await performanceApi.getAllStudentsPerformance();
      } catch (enhancedApiError) {
        console.log('Enhanced API not available, falling back to basic API');
        
        // If the new endpoint fails, fall back to the original endpoint
        if (enhancedApiError.response && enhancedApiError.response.status === 404) {
          response = await performanceApi.getBestPerforming();
          
          // Transform the data to match expected format
          if (response.data) {
            let transformedData = [];
            if (response.data.bestStudent) {
              // If in original format with single best student
              const student = response.data.bestStudent;
              
              // Calculate scores from available data
              let academicScore = 7.5; // Default on 0-10 SGPA scale
              let extraCurricularScore = 7.5; // Default on 0-10 SGPA scale
              let remarksScore = 7.5; // Default on 0-10 SGPA scale
              
              // Extract academic data if available
              if (student.performance && student.performance.academic) {
                // Count total marks and subjects across all years/semesters
                let totalMarks = 0;
                let totalSubjects = 0;
                
                Object.values(student.performance.academic).forEach(yearData => {
                  if (yearData && yearData.semester) {
                    Object.values(yearData.semester).forEach(subjects => {
                      if (Array.isArray(subjects)) {
                        subjects.forEach(subject => {
                          if (subject && typeof subject.marks === 'number') {
                            totalMarks += subject.marks;
                            totalSubjects++;
                          }
                        });
                      }
                    });
                  }
                });
                
                // Calculate academic score
                if (totalSubjects > 0) {
                  // Convert to SGPA scale (0-10)
                  academicScore = Math.round((totalMarks / totalSubjects) * 10);
                }
              }
              
              // Extract extracurricular score if available
              if (student.performance && student.performance.extracurricular) {
                const activities = student.performance.extracurricular;
                if (activities.length > 0) {
                  const totalExtracurricular = activities.reduce(
                    (sum, activity) => sum + (activity.grade || 0),
                    0
                  );
                  extraCurricularScore = Math.round((totalExtracurricular / activities.length) * 10);
                }
              }
              
              // Extract teacher remarks score if available
              if (student.performance && student.performance.teacherRemarks) {
                const remarks = student.performance.teacherRemarks;
                if (remarks.length > 0) {
                  const totalRemarks = remarks.reduce(
                    (sum, remark) => sum + (remark.grade || 0),
                    0
                  );
                  remarksScore = Math.round((totalRemarks / remarks.length) * 10);
                }
              }
              
              transformedData = [{
                _id: student._id,
                name: student.name,
                email: student.email,
                academicScore,
                extraCurricularScore,
                remarksScore,
                totalScore: response.data.totalScore || Math.round((academicScore * 0.7 + extraCurricularScore * 0.2 + remarksScore * 0.1)),
                extracurricular: student.performance?.extracurricular || [],
                teacherRemarks: student.performance?.teacherRemarks || []
              }];
            } else if (Array.isArray(response.data)) {
              // If already an array of students
              transformedData = response.data.map(student => ({
                _id: student._id,
                name: student.name,
                email: student.email,
                academicScore: student.academicScore || 7.5,
                extraCurricularScore: student.extraCurricularScore || 7.5,
                remarksScore: student.remarksScore || 7.5,
                totalScore: student.totalScore || 7.5,
                extracurricular: student.extracurricular || [],
                teacherRemarks: student.teacherRemarks || []
              }));
            }
            
            response.data = transformedData;
          }
        } else {
          // If it failed for a reason other than 404, re-throw the error
          throw enhancedApiError;
        }
      }
      
      console.log('Student performance data:', response.data);
      setStudents(response.data || []);
    } catch (error) {
      console.error('Error fetching student data:', error);
      // toast.error('Failed to fetch student performance data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBestPerformingStudent = async () => {
    try {
      const response = await adminApi.getBestPerformingStudent();
      setBestStudent(response.data.bestStudent);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to fetch best performing student', severity: 'error' });
    }
  };

  // Get available academic years from all students
  const getAvailableYears = () => {
    const years = new Set();
    students.forEach(student => {
      if (student.academicByYear) {
        Object.keys(student.academicByYear).forEach(year => years.add(year));
      }
    });
    return Array.from(years).sort((a, b) => Number(a) - Number(b));
  };

  // Sort students based on current sort configuration
  const sortedStudents = [...students].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Filter students by year if a specific year is selected
  const filteredStudents = filterYear === 'all' 
    ? sortedStudents 
    : sortedStudents.filter(student => 
        student.academicByYear && student.academicByYear[filterYear]
      );

  // Handle sorting when a column header is clicked
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  // Render sort indicator
  const renderSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const availableYears = getAvailableYears();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gradient-to-b from-indigo-50 to-white min-h-screen">
      <div className="mb-12 text-center mt-20 pt-12">
        <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-4 leading-tight">
          Student Performance Rankings
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Compare and analyze student achievements across different areas of academic and extracurricular excellence
        </p>
      </div>

      {/* Top Performers Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
          <Crown className="h-7 w-7 text-yellow-500 mr-3" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-amber-600">
            Top Performers
          </span>
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredStudents.slice(0, 3).map((student, index) => (
            <div
              key={student._id}
              className={`bg-white rounded-xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300 ${
                index === 0 
                  ? 'ring-4 ring-yellow-400 shadow-yellow-200'
                  : index === 1 
                    ? 'ring-4 ring-gray-400 shadow-gray-200'
                    : index === 2 
                      ? 'ring-4 ring-amber-700 shadow-amber-200'
                      : ''
              }`}
            >
              <div className={`px-6 py-6 ${
                index === 0 
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-500' 
                  : index === 1 
                    ? 'bg-gradient-to-r from-gray-400 to-gray-500' 
                    : 'bg-gradient-to-r from-amber-700 to-amber-800'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white p-2 rounded-full">
                      {index === 0 ? (
                        <Crown className="h-10 w-10 text-yellow-500" />
                      ) : index === 1 ? (
                        <Medal className="h-10 w-10 text-gray-500" />
                      ) : (
                        <Award className="h-10 w-10 text-amber-700" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{student.name}</h2>
                      <p className="text-white opacity-90 flex items-center">
                        {index === 0 
                          ? '🥇 Gold Achiever' 
                          : index === 1 
                            ? '🥈 Silver Performer' 
                            : '🥉 Bronze Talent'}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-full h-16 w-16 flex items-center justify-center border-2 border-white">
                    <div className="text-center">
                      <span className="text-white font-bold text-xl">{student.totalScore.toFixed(1)}</span>
                      <span className="block text-white text-xs">out of 10</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-4 bg-gradient-to-b from-indigo-50 to-white rounded-lg shadow-sm">
                    <BookOpen className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                    <h3 className="text-sm font-semibold text-gray-600">Academic</h3>
                    <p className="text-2xl font-bold text-indigo-600">{student.academicScore.toFixed(1)}/10</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-b from-purple-50 to-white rounded-lg shadow-sm">
                    <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h3 className="text-sm font-semibold text-gray-600">Extra</h3>
                    <p className="text-2xl font-bold text-purple-600">{student.extraCurricularScore.toFixed(1)}/10</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-b from-green-50 to-white rounded-lg shadow-sm">
                    <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h3 className="text-sm font-semibold text-gray-600">Remarks</h3>
                    <p className="text-2xl font-bold text-green-600">{student.remarksScore.toFixed(1)}/10</p>
                  </div>
                </div>

                {/* Year Performance (if year filter is applied) */}
                {filterYear !== 'all' && student.academicByYear && student.academicByYear[filterYear] && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1 flex items-center">
                      <Sparkles className="h-4 w-4 mr-1 text-blue-500" />
                      Year {filterYear} Performance
                    </h3>
                    <p className="text-xl font-bold text-blue-600">
                      {student.academicByYear[filterYear].average.toFixed(1)}/10
                    </p>
                    <p className="text-xs text-gray-500">
                      {student.academicByYear[filterYear].subjects} subjects completed
                    </p>
                  </div>
                )}

                {/* Progress bars */}
                <div className="space-y-4">
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold inline-block text-indigo-600 flex items-center">
                        <BookOpen className="h-3 w-3 mr-1" /> Academic
                      </span>
                      <span className="text-xs font-semibold inline-block text-indigo-600">
                        {student.academicScore.toFixed(1)}/10
                      </span>
                    </div>
                    <div className="overflow-hidden h-2 text-xs flex rounded-full bg-indigo-200">
                      <div
                        style={{ width: `${student.academicScore * 10}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500 ease-in-out"
                      ></div>
                    </div>
                  </div>

                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold inline-block text-purple-600 flex items-center">
                        <Award className="h-3 w-3 mr-1" /> Extra-Curricular
                      </span>
                      <span className="text-xs font-semibold inline-block text-purple-600">
                        {student.extraCurricularScore.toFixed(1)}/10
                      </span>
                    </div>
                    <div className="overflow-hidden h-2 text-xs flex rounded-full bg-purple-200">
                      <div
                        style={{ width: `${student.extraCurricularScore * 10}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500 ease-in-out"
                      ></div>
                    </div>
                  </div>

                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold inline-block text-green-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" /> Overall Score
                      </span>
                      <span className="text-xs font-semibold inline-block text-green-600">
                        {student.totalScore.toFixed(1)}/10
                      </span>
                    </div>
                    <div className="overflow-hidden h-2 text-xs flex rounded-full bg-green-200">
                      <div
                        style={{ width: `${student.totalScore * 10}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500 ease-in-out"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Tabs */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        {/* Year Filter */}
        <div className="flex items-center px-4 py-2 bg-white rounded-lg shadow-md">
          <Filter className="h-5 w-5 text-indigo-600 mr-2" />
          <span className="text-gray-700 font-medium mr-2">Filter by Year:</span>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">All Years</option>
            {availableYears.map(year => (
              <option key={year} value={year}>Year {year}</option>
            ))}
          </select>
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-lg shadow-md overflow-hidden">
          <button
            className={`px-4 py-3 font-medium transition-all duration-300 ${
              activeTab === 'overall' 
                ? 'bg-indigo-600 text-white' 
                : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
            }`}
            onClick={() => setActiveTab('overall')}
          >
            <div className="flex items-center">
              <BarChart4 className="h-4 w-4 mr-2" />
              Overall Rankings
            </div>
          </button>
          <button
            className={`px-4 py-3 font-medium transition-all duration-300 ${
              activeTab === 'academic' 
                ? 'bg-indigo-600 text-white' 
                : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
            }`}
            onClick={() => setActiveTab('academic')}
          >
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Academic
            </div>
          </button>
          <button
            className={`px-4 py-3 font-medium transition-all duration-300 ${
              activeTab === 'extra' 
                ? 'bg-indigo-600 text-white' 
                : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
            }`}
            onClick={() => setActiveTab('extra')}
          >
            <div className="flex items-center">
              <Award className="h-4 w-4 mr-2" />
              Extra-Curricular
            </div>
          </button>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-500">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-indigo-600 to-indigo-700">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Rank
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Student
                </th>
                
                {activeTab === 'overall' && (
                  <>
                    <th 
                      scope="col" 
                      className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-indigo-700 transition-colors"
                      onClick={() => handleSort('academicScore')}
                    >
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-1" />
                        Academic
                        {renderSortIndicator('academicScore')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-indigo-700 transition-colors"
                      onClick={() => handleSort('extraCurricularScore')}
                    >
                      <div className="flex items-center">
                        <Award className="h-4 w-4 mr-1" />
                        Extra-Curricular
                        {renderSortIndicator('extraCurricularScore')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-indigo-700 transition-colors"
                      onClick={() => handleSort('remarksScore')}
                    >
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Remarks
                        {renderSortIndicator('remarksScore')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-indigo-700 transition-colors"
                      onClick={() => handleSort('totalScore')}
                    >
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Total Score
                        {renderSortIndicator('totalScore')}
                      </div>
                    </th>
                  </>
                )}
                
                {activeTab === 'academic' && (
                  <>
                    {filterYear !== 'all' ? (
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Year {filterYear} Average
                      </th>
                    ) : (
                      <>
                        {getAvailableYears().map(year => (
                          <th key={year} scope="col" className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Year {year}
                          </th>
                        ))}
                      </>
                    )}
                    <th 
                      scope="col" 
                      className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-indigo-700 transition-colors"
                      onClick={() => handleSort('academicScore')}
                    >
                      <div className="flex items-center">
                        Overall Academic
                        {renderSortIndicator('academicScore')}
                      </div>
                    </th>
                  </>
                )}
                
                {activeTab === 'extra' && (
                  <>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Activities
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-indigo-700 transition-colors"
                      onClick={() => handleSort('extraCurricularScore')}
                    >
                      <div className="flex items-center">
                        Extra-Curricular Score
                        {renderSortIndicator('extraCurricularScore')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-indigo-700 transition-colors"
                      onClick={() => handleSort('remarksScore')}
                    >
                      <div className="flex items-center">
                        Teacher Remarks
                        {renderSortIndicator('remarksScore')}
                      </div>
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student, index) => (
                <tr 
                  key={student._id} 
                  className={`hover:bg-indigo-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {index < 3 ? (
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-2 ${
                          index === 0
                            ? 'bg-yellow-100 text-yellow-600' 
                            : index === 1 
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-amber-100 text-amber-700'
                        }`}>
                          {index === 0 ? (
                            <Crown className="h-4 w-4" />
                          ) : index === 1 ? (
                            <Medal className="h-4 w-4" />
                          ) : (
                            <Award className="h-4 w-4" />
                          )}
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                          <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-900">
                        {index === 0 ? 'Gold' : index === 1 ? 'Silver' : index === 2 ? 'Bronze' : `Rank #${index + 1}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  
                  {activeTab === 'overall' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                            <div 
                              className="bg-indigo-600 h-2.5 rounded-full"
                              style={{ width: `${student.academicScore * 10}%` }}
                            ></div>
                          </div>
                          <div className="text-sm text-gray-900 font-medium">{student.academicScore.toFixed(1)}/10</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                            <div 
                              className="bg-purple-600 h-2.5 rounded-full"
                              style={{ width: `${student.extraCurricularScore * 10}%` }}
                            ></div>
                          </div>
                          <div className="text-sm text-gray-900 font-medium">{student.extraCurricularScore.toFixed(1)}/10</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                            <div 
                              className="bg-green-600 h-2.5 rounded-full"
                              style={{ width: `${student.remarksScore * 10}%` }}
                            ></div>
                          </div>
                          <div className="text-sm text-gray-900 font-medium">{student.remarksScore.toFixed(1)}/10</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full inline-block">
                          {student.totalScore.toFixed(1)}/10
                        </div>
                      </td>
                    </>
                  )}
                  
                  {activeTab === 'academic' && (
                    <>
                      {filterYear !== 'all' ? (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {student.academicByYear && student.academicByYear[filterYear] 
                              ? (
                                <div className="flex items-center">
                                  <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                                    <div 
                                      className="bg-blue-600 h-2.5 rounded-full"
                                      style={{ width: `${student.academicByYear[filterYear].average * 10}%` }}
                                    ></div>
                                  </div>
                                  <span className="font-medium">{student.academicByYear[filterYear].average.toFixed(1)}/10</span>
                                </div>
                              )
                              : 'N/A'}
                          </div>
                        </td>
                      ) : (
                        <>
                          {getAvailableYears().map(year => (
                            <td key={year} className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {student.academicByYear && student.academicByYear[year] 
                                  ? (
                                    <div className="flex items-center">
                                      <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                                        <div 
                                          className="bg-blue-600 h-2.5 rounded-full"
                                          style={{ width: `${student.academicByYear[year].average * 10}%` }}
                                        ></div>
                                      </div>
                                      <span className="font-medium">{student.academicByYear[year].average.toFixed(1)}/10</span>
                                    </div>
                                  )
                                  : 'N/A'}
                              </div>
                            </td>
                          ))}
                        </>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full inline-block">
                          {student.academicScore.toFixed(1)}/10
                        </div>
                      </td>
                    </>
                  )}
                  
                  {activeTab === 'extra' && (
                    <>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {student.extracurricular && student.extracurricular.length > 0 
                            ? (
                              <ul className="space-y-1">
                                {student.extracurricular.slice(0, 3).map((activity, idx) => (
                                  <li key={idx} className="flex items-center text-sm">
                                    <span className="h-2 w-2 rounded-full bg-purple-500 mr-2"></span>
                                    <span className="font-medium">{activity.activity}</span>
                                    <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                                      {activity.grade.toFixed(1)}/10
                                    </span>
                                  </li>
                                ))}
                                {student.extracurricular.length > 3 && (
                                  <li className="text-xs text-gray-500 italic pl-4">
                                    +{student.extracurricular.length - 3} more activities
                                  </li>
                                )}
                              </ul>
                            ) 
                            : (
                              <span className="text-gray-500 italic">No activities recorded</span>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                            <div 
                              className="bg-purple-600 h-2.5 rounded-full"
                              style={{ width: `${student.extraCurricularScore * 10}%` }}
                            ></div>
                          </div>
                          <div className="text-sm text-gray-900 font-medium">{student.extraCurricularScore.toFixed(1)}/10</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                            <div 
                              className="bg-green-600 h-2.5 rounded-full"
                              style={{ width: `${student.remarksScore * 10}%` }}
                            ></div>
                          </div>
                          <div className="text-sm text-gray-900 font-medium">{student.remarksScore.toFixed(1)}/10</div>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>Student performance rankings are calculated based on academic scores (70%), extracurricular activities (20%), and teacher remarks (10%). All scores shown on a 0-10 SGPA scale.</p>
      </div>

      

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default BestPerformingPage;