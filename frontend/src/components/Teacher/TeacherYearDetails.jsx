import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const subjectsByYearAndSemester = {
  '1': {
    '1': [
      'Mathematics For Computing - I',
      'Physics For Computing',
      'Computer Aided Drafting',
      'Digital Electronics',
      'Structured Programming',
      'Computer System Workshop Technology'
    ],
    '2': [
      'Mathematics For Computing - II',
      'Organic & ElectroChemistry',
      'Electrical Technology',
      'Object Oriented Programming',
      'Programing Paradigms',
      'Web Programming'
    ]
  },
  '2': {
    '3': [
      'Discrete Structures & Graph Theory',
      'Data Structures',
      'Database Management Systems',
      'ITC-I: Software Engineering',
      'Computer Communication & Network',
      'Information Technology Laboratory-I',
      'Vocational Course-I'
    ],
    '4': [
      'ITC-II: Infrastructure Management',
      'Formal Languages & Computing Theory',
      'Microprocessor & Microcontroller',
      'Applied Algorithms',
      'Operating Systems',
      'Information Technology Laboratory-II',
      'Vocational Course-II'
    ]
  },
  '3': {
    '5': [
      'Human Computer Interaction ',
      'Artificial Intelligence and Machine Learning ',
      'Computer Architecture and Organization',
      'ITC-III: Advanced Database System',
      'Mobile Application Development',
      'Information Technology Laboratory-III',
      'Vocational Course-III' 
    ],
    '6': [
      'ITC-IV: Cloud Computing',
      'Software Testing & Quality Assurance',
      'Data Warehousing & Data Mining',
      'Quantitative Techniques, Communication And Values',
      'Agile Methodologies',
      'Information Technology Laboratory-IV',
      'Vocational Course-IV'
    ]
  },
  '4': {
    '7': [
      'Project Planning & Management',
      'ITC-V: Web Services',
      'Business Intelligence',
      'Elective - I: Information Retrieval',
      'Elective - I: Software Architecture',
      'Elective - I: User Experience',
      'Elective - I: Storage Area Network',
      'Information Technology Laboratory-V',
      'Internship'
    ],
    '8': [
      'Information Security',
      'Elective - II: Semantic Web Mining', 
      'Elective - II: Social Analytics in Digital Marketing ',
      'Elective - II: Management Information System',
      'Elective - II:  Cyber security',
      'Internet of Things',
      'Data Engineering',
      'Information Technology Laboratory-VI',
    ]
  }
};

const TeacherYearDetails = () => {
  const { year } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { student } = location.state || {};
  
  const [semesters, setSemesters] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState(null);
  
  useEffect(() => {
    if (!student || !student._id) {
      navigate('/teacher/students');
      return;
    }
    fetchStudentAcademicData();
  }, [student, year]);
  
  const fetchStudentAcademicData = async () => {
    if (!student || !student._id) return;
    
    setLoading(true);
    try {
      // Use axios directly to fetch the data
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://final-year-projects-backend.onrender.com/api/performance/${student._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const academicData = response.data.performance?.academic || {};
      
      // Extract the current year's semester data
      const yearSemesters = {};
      if (academicData[year] && academicData[year].semester) {
        // Process semester data from Map structure
        Object.keys(academicData[year].semester)
          .filter(sem => !sem.startsWith('$') && sem !== 'toJSON')
          .forEach(sem => {
            yearSemesters[sem] = academicData[year].semester[sem];
          });
      }
      
      setSemesters(yearSemesters);
      
      // Set initial semester selection if available
      const semesterKeys = Object.keys(yearSemesters);
      if (semesterKeys.length > 0) {
        setSelectedSemester(semesterKeys[0]);
      }
    } catch (error) {
      console.error('Error fetching academic data:', error);
      toast.error('Failed to fetch academic data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleBack = () => {
    navigate('/teacher/academic');
  };

  const getStatusClass = (marks) => {
    if (marks >= 8.0) return 'bg-green-100 text-green-800';
    if (marks >= 6.0) return 'bg-blue-100 text-blue-800';
    if (marks >= 4.0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusText = (marks) => {
    if (marks >= 8.0) return 'Excellent';
    if (marks >= 6.0) return 'Good';
    if (marks >= 4.0) return 'Pass';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 max-w-md mx-auto text-center">
          <p className="text-yellow-700">
            Please select a student first to view their academic details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button 
            onClick={handleBack}
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Year {year} Academic Records
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {student.photo ? (
            <img 
              src={student.photo} 
              alt={student.name} 
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-xl font-bold text-indigo-600">
                {student.name?.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <div className="text-sm font-medium text-gray-900">{student.name}</div>
            <div className="text-xs text-gray-500">{student.email}</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Academic Performance</h2>
            <p className="text-sm text-gray-500 mt-1">Year {year} semester breakdown</p>
          </div>
          <div className="bg-indigo-50 p-2 rounded-lg">
            <BookOpen className="h-5 w-5 text-indigo-600" />
          </div>
        </div>
        
        {Object.keys(semesters).length === 0 ? (
          <div className="p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
            <div className="rounded-full bg-gray-100 p-3 inline-flex mx-auto mb-4">
              <BookOpen className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Academic Data</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              There are no academic records available for this year yet.
            </p>
          </div>
        ) : (
          <div>
            {/* Semester tabs - styled to match Admin UI */}
            <div className="bg-gray-50 p-1 rounded-lg mb-6 inline-flex">
              {Object.keys(semesters).map(sem => (
                <button
                  key={sem}
                  onClick={() => setSelectedSemester(sem)}
                  className={`py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    selectedSemester === sem
                      ? 'bg-white shadow-sm text-indigo-700'
                      : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-100'
                  }`}
                >
                  Semester {sem}
                </button>
              ))}
            </div>
            
            {/* Subject list */}
            {selectedSemester && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">Subject</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Marks (SGPA)</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(semesters[selectedSemester] || []).map((subject, index) => {
                      // Handle marks to ensure they're displayed in SGPA format (0-10)
                      const marks = parseFloat(subject.marks);
                      const formattedMarks = marks > 10 ? (marks / 10).toFixed(2) : marks.toFixed(2);
                      
                      return (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-normal">
                            <div className="text-sm font-medium text-gray-900">{subject.subject}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${parseFloat(formattedMarks) * 10}%` }}></div>
                              </div>
                              <div className="text-sm font-semibold text-gray-900">{formattedMarks}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(formattedMarks)}`}>
                              {getStatusText(formattedMarks)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {/* Summary section */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Total subjects: {(semesters[selectedSemester] || []).length}
                    </div>
                    
                    <div className="text-sm font-medium">
                      Average: 
                      <span className="text-indigo-600 ml-1">
                        {((semesters[selectedSemester] || []).reduce((sum, subj) => {
                          const marks = parseFloat(subj.marks);
                          const normalizedMarks = marks > 10 ? marks / 10 : marks;
                          return sum + normalizedMarks;
                        }, 0) / (semesters[selectedSemester] || []).length || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherYearDetails; 