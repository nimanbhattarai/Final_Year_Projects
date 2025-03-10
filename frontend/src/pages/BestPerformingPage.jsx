import { useState, useEffect } from 'react';
import { performanceApi } from '../services/api';
import { Trophy, Star, TrendingUp, Users, Award, BookOpen, MessageSquare, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

const BestPerformingPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overall');
  const [filterYear, setFilterYear] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'totalScore', direction: 'desc' });

  useEffect(() => {
    fetchStudents();
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
              let academicScore = 75;
              let extraCurricularScore = 75;
              let remarksScore = 75;
              
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
                  academicScore = Math.round((totalMarks / totalSubjects) * 0.85);
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
                  extraCurricularScore = Math.round((totalExtracurricular / (activities.length * 10)) * 100);
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
                  remarksScore = Math.round((totalRemarks / (remarks.length * 10)) * 100);
                }
              }
              
              transformedData = [{
                _id: student._id,
                name: student.name,
                email: student.email,
                academicScore,
                extraCurricularScore,
                remarksScore,
                totalScore: response.data.totalScore || Math.round(academicScore * 0.7 + extraCurricularScore * 0.2 + remarksScore * 0.1),
                extracurricular: student.performance?.extracurricular || [],
                teacherRemarks: student.performance?.teacherRemarks || []
              }];
            } else if (Array.isArray(response.data)) {
              // If already an array of students
              transformedData = response.data.map(student => ({
                _id: student._id,
                name: student.name,
                email: student.email,
                academicScore: student.academicScore || 75,
                extraCurricularScore: student.extraCurricularScore || 75,
                remarksScore: student.remarksScore || 75,
                totalScore: student.totalScore || 75,
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
      toast.error('Failed to fetch student performance data');
    } finally {
      setLoading(false);
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Student Performance Rankings</h1>
        <p className="text-lg text-gray-600">Compare and analyze student achievements across different areas</p>
      </div>

      {/* Top Performers Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Trophy className="h-6 w-6 text-yellow-500 mr-2" />
          Top Performers
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredStudents.slice(0, 3).map((student, index) => (
            <div
              key={student._id}
              className={`bg-white rounded-xl shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300 ${
                index === 0 ? 'border-4 border-yellow-400' : index === 1 ? 'border-4 border-gray-400' : index === 2 ? 'border-4 border-amber-700' : ''
              }`}
            >
              <div className={`px-6 py-4 ${
                index === 0 
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' 
                  : index === 1 
                    ? 'bg-gradient-to-r from-gray-400 to-gray-600' 
                    : 'bg-gradient-to-r from-amber-700 to-amber-900'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Users className="h-12 w-12 text-white" />
                    <div>
                      <h2 className="text-2xl font-bold text-white">{student.name}</h2>
                      <p className="text-white opacity-90">
                        {index === 0 ? '🥇 Gold' : index === 1 ? '🥈 Silver' : '🥉 Bronze'}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-full p-2">
                    <span className="text-white font-bold text-xl">{student.totalScore}</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <BookOpen className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                    <h3 className="text-sm font-semibold text-gray-600">Academic</h3>
                    <p className="text-2xl font-bold text-indigo-600">{student.academicScore}%</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h3 className="text-sm font-semibold text-gray-600">Extra</h3>
                    <p className="text-2xl font-bold text-purple-600">{student.extraCurricularScore}%</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h3 className="text-sm font-semibold text-gray-600">Remarks</h3>
                    <p className="text-2xl font-bold text-green-600">{student.remarksScore}%</p>
                  </div>
                </div>

                {/* Year Performance (if year filter is applied) */}
                {filterYear !== 'all' && student.academicByYear && student.academicByYear[filterYear] && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Year {filterYear} Performance</h3>
                    <p className="text-xl font-bold text-blue-600">
                      {student.academicByYear[filterYear].average}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {student.academicByYear[filterYear].subjects} subjects
                    </p>
                  </div>
                )}

                {/* Progress bars */}
                <div className="space-y-3">
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold inline-block text-indigo-600">
                        Academic
                      </span>
                      <span className="text-xs font-semibold inline-block text-indigo-600">
                        {student.academicScore}%
                      </span>
                    </div>
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-indigo-200">
                      <div
                        style={{ width: `${student.academicScore}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600"
                      ></div>
                    </div>
                  </div>

                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold inline-block text-purple-600">
                        Extra-Curricular
                      </span>
                      <span className="text-xs font-semibold inline-block text-purple-600">
                        {student.extraCurricularScore}%
                      </span>
                    </div>
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-purple-200">
                      <div
                        style={{ width: `${student.extraCurricularScore}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-600"
                      ></div>
                    </div>
                  </div>

                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold inline-block text-green-600">
                        Overall Score
                      </span>
                      <span className="text-xs font-semibold inline-block text-green-600">
                        {student.totalScore}%
                      </span>
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

      {/* Filters and Tabs */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        {/* Year Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <span className="text-gray-700 font-medium">Filter by Year:</span>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Years</option>
            {availableYears.map(year => (
              <option key={year} value={year}>Year {year}</option>
            ))}
          </select>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 w-full md:w-auto">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'overall' 
                ? 'border-b-2 border-indigo-600 text-indigo-600' 
                : 'text-gray-600 hover:text-indigo-600'
            }`}
            onClick={() => setActiveTab('overall')}
          >
            Overall Rankings
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'academic' 
                ? 'border-b-2 border-indigo-600 text-indigo-600' 
                : 'text-gray-600 hover:text-indigo-600'
            }`}
            onClick={() => setActiveTab('academic')}
          >
            Academic
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'extra' 
                ? 'border-b-2 border-indigo-600 text-indigo-600' 
                : 'text-gray-600 hover:text-indigo-600'
            }`}
            onClick={() => setActiveTab('extra')}
          >
            Extra-Curricular
          </button>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                
                {activeTab === 'overall' && (
                  <>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('academicScore')}
                    >
                      <div className="flex items-center">
                        Academic
                        {renderSortIndicator('academicScore')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('extraCurricularScore')}
                    >
                      <div className="flex items-center">
                        Extra-Curricular
                        {renderSortIndicator('extraCurricularScore')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('remarksScore')}
                    >
                      <div className="flex items-center">
                        Remarks
                        {renderSortIndicator('remarksScore')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('totalScore')}
                    >
                      <div className="flex items-center">
                        Total Score
                        {renderSortIndicator('totalScore')}
                      </div>
                    </th>
                  </>
                )}
                
                {activeTab === 'academic' && (
                  <>
                    {filterYear !== 'all' ? (
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Year {filterYear} Average
                      </th>
                    ) : (
                      <>
                        {getAvailableYears().map(year => (
                          <th key={year} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Year {year}
                          </th>
                        ))}
                      </>
                    )}
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activities
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('extraCurricularScore')}
                    >
                      <div className="flex items-center">
                        Extra-Curricular Score
                        {renderSortIndicator('extraCurricularScore')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
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
                <tr key={student._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
                      {index < 3 && (
                        <span className="ml-2">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  
                  {activeTab === 'overall' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.academicScore}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.extraCurricularScore}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.remarksScore}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.totalScore}%</div>
                      </td>
                    </>
                  )}
                  
                  {activeTab === 'academic' && (
                    <>
                      {filterYear !== 'all' ? (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {student.academicByYear && student.academicByYear[filterYear] 
                              ? `${student.academicByYear[filterYear].average}%` 
                              : 'N/A'}
                          </div>
                        </td>
                      ) : (
                        <>
                          {availableYears.map(year => (
                            <td key={year} className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {student.academicByYear && student.academicByYear[year] 
                                  ? `${student.academicByYear[year].average}%` 
                                  : 'N/A'}
                              </div>
                            </td>
                          ))}
                        </>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.academicScore}%</div>
                      </td>
                    </>
                  )}
                  
                  {activeTab === 'extra' && (
                    <>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {student.extracurricular && student.extracurricular.length > 0 
                            ? (
                              <ul className="list-disc list-inside">
                                {student.extracurricular.slice(0, 3).map((activity, idx) => (
                                  <li key={idx} className="text-sm">
                                    {activity.activity} ({activity.grade}/10)
                                  </li>
                                ))}
                                {student.extracurricular.length > 3 && (
                                  <li className="text-xs text-gray-500">
                                    +{student.extracurricular.length - 3} more
                                  </li>
                                )}
                              </ul>
                            ) 
                            : 'No activities'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.extraCurricularScore}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.remarksScore}%</div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BestPerformingPage;