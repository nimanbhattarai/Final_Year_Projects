import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';
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

const YearDetails = () => {
  const { year } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { student } = location.state || {};
  
  const [semesters, setSemesters] = useState({});
  const [formData, setFormData] = useState({
    semester: '',
    subjects: [{ name: '', marks: '' }],
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState([]);

  useEffect(() => {
    if (!student || !student._id) {
      navigate('/admin/students');
      return;
    }
    fetchStudentAcademicData();
  }, [student, year]);

  useEffect(() => {
    if (year && formData.semester) {
      const subjects = subjectsByYearAndSemester[year]?.[formData.semester] || [];
      setAvailableSubjects(subjects);
    }
  }, [year, formData.semester]);

  const fetchStudentAcademicData = async () => {
    if (!student || !student._id) return;
    
    setLoading(true);
    try {
      const response = await adminApi.getStudentGrades(student._id);
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
      
      // Set initial semester in form if none is selected
      const availableSems = getAvailableSemesters(yearSemesters);
      if (availableSems.length > 0 && !formData.semester) {
        setFormData(prev => ({ ...prev, semester: availableSems[0] }));
      }
    } catch (error) {
      console.error('Error fetching academic data:', error);
      toast.error('Failed to fetch academic data');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableSemesters = (currentSemesters = semesters) => {
    const yearNum = parseInt(year);
    const baseSemester = (yearNum - 1) * 2 + 1;
    const possibleSemesters = [`${baseSemester}`, `${baseSemester + 1}`];
    return possibleSemesters.filter(sem => !currentSemesters[sem]);
  };

  const handleAddSubject = () => {
    setFormData({
      ...formData,
      subjects: [...formData.subjects, { name: '', marks: '' }],
    });
  };

  const handleRemoveSubject = (index) => {
    const newSubjects = formData.subjects.filter((_, i) => i !== index);
    setFormData({ ...formData, subjects: newSubjects });
  };

  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...formData.subjects];
    newSubjects[index][field] = value;
    setFormData({ ...formData, subjects: newSubjects });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!student || !student._id) {
      toast.error('Student information is missing');
      return;
    }

    if (!formData.semester) {
      toast.error('Please select a semester');
      return;
    }

    // Validate subjects
    for (const subject of formData.subjects) {
      if (!subject.name.trim() || !subject.marks) {
        toast.error('Please fill in all subject details');
        return;
      }
    }

    setSubmitting(true);
    try {
      await adminApi.updateAcademicGrades({
        studentId: student._id,
        year,
        semester: formData.semester,
        grades: formData.subjects.map(s => ({ subject: s.name, marks: Number(s.marks) })),
      });
      
      toast.success('Grades added successfully');
      
      // Update local state
      const updatedSemesters = {
        ...semesters,
        [formData.semester]: formData.subjects.map(s => ({ subject: s.name, marks: Number(s.marks) }))
      };
      setSemesters(updatedSemesters);
      
      // Reset form with next available semester
      const nextAvailableSemesters = getAvailableSemesters(updatedSemesters);
      setFormData({
        semester: nextAvailableSemesters.length > 0 ? nextAvailableSemesters[0] : '',
        subjects: [{ name: '', marks: '' }],
      });
    } catch (error) {
      console.error('Error updating grades:', error);
      toast.error('Failed to update grades');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSemester = async (semester) => {
    if (!window.confirm(`Are you sure you want to delete Semester ${semester}?`)) {
      return;
    }

    setLoading(true);
    try {
      await adminApi.deleteAcademicGrades({
        studentId: student._id,
        year,
        semester,
      });
      
      toast.success('Semester deleted successfully');
      
      // Update local state
      const updatedSemesters = { ...semesters };
      delete updatedSemesters[semester];
      setSemesters(updatedSemesters);
      
      // Update form with newly available semester
      const availableSemesters = getAvailableSemesters(updatedSemesters);
      if (availableSemesters.length > 0 && !formData.semester) {
        setFormData(prev => ({ ...prev, semester: availableSemesters[0] }));
      }
    } catch (error) {
      console.error('Error deleting semester:', error);
      toast.error('Failed to delete semester');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/admin/academic');
  };

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="bg-red-50 rounded-full p-4 mb-4">
          <ArrowLeft className="h-8 w-8 text-red-500" />
        </div>
        <p className="text-gray-600 mb-4 text-center">Student information is missing. Please go back and select a student.</p>
        <button
          onClick={() => navigate('/admin/students')}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
        >
          Go to Students
        </button>
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

  const availableSemesters = getAvailableSemesters();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="font-medium">Back to Academic Years</span>
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
            {student?.name?.charAt(0) || 'S'}
          </div>
          <h2 className="text-lg font-bold text-gray-900">
            {student?.name} - Year {year}
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6">
          <h2 className="text-xl font-bold text-gray-900">Semester Details</h2>
        </div>
        
        <div className="p-6">
          {/* Existing Semesters Display */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Existing Semesters</h3>
            {Object.keys(semesters).length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-600">No semesters added yet for Year {year}.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {Object.entries(semesters).map(([semester, subjects]) => (
                  <div key={semester} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="bg-gradient-to-r from-indigo-50 to-white px-4 py-3 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-gray-900">Semester {semester}</h4>
                        <button
                          onClick={() => handleDeleteSemester(semester)}
                          className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors duration-200"
                          title="Delete Semester"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      {Array.isArray(subjects) && subjects.length > 0 ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 text-sm font-medium text-gray-500">
                            <span>Subject</span>
                            <span className="text-right">Marks</span>
                          </div>
                          <div className="border-t border-gray-100 pt-2">
                            {subjects.map((subject, idx) => (
                              <div key={idx} className="grid grid-cols-2 py-1.5 text-sm hover:bg-gray-50 rounded-md px-2">
                                <span className="text-gray-900">{subject.subject}</span>
                                <span className="text-right font-medium text-indigo-600">{subject.marks}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 italic text-sm">No subjects available</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Semester Form */}
          {availableSemesters.length > 0 ? (
            <div className="border-t border-gray-200 pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Semester</h3>
                
                <div className="max-w-md">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select a semester</option>
                    {availableSemesters.map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">Subjects</label>
                  
                  {formData.subjects.map((subject, index) => (
                    <div key={index} className="flex items-center space-x-3 group">
                      <div className="flex-1">
                        <select
                          value={subject.name}
                          onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        >
                          <option value="">Select Subject</option>
                          {availableSubjects.map((subj) => (
                            <option 
                              key={subj} 
                              value={subj}
                              disabled={formData.subjects.some(
                                (s, i) => i !== index && s.name === subj
                              )}
                            >
                              {subj}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-28">
                        <label className="block text-xs font-medium text-gray-600 mb-1">SGPA (0-10)</label>
                        <input
                          type="number"
                          placeholder="Marks"
                          min="0"
                          max="10"
                          step="0.1"
                          value={subject.marks}
                          onChange={(e) => handleSubjectChange(index, 'marks', e.target.value)}
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(index)}
                        className="text-gray-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
                        disabled={formData.subjects.length === 1}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddSubject}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors duration-200"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add Subject
                  </button>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 font-medium transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    disabled={submitting || !formData.semester || formData.subjects.some(s => !s.name.trim() || !s.marks)}
                  >
                    {submitting ? 'Saving...' : 'Save Grades'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="border-t border-gray-200 pt-6">
              <p className="text-gray-600">All semesters for Year {year} have been added.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YearDetails;