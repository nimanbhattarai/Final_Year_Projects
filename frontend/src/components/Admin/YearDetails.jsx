import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { Trash2, Plus, ArrowLeft, BookOpen } from 'lucide-react';
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
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <BookOpen className="w-6 h-6 text-indigo-600 mr-2" />
            Academic Semesters
          </h2>
        </div>
        <div className="p-6">
          {Object.keys(semesters).length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-gray-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No semesters added yet</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                You can add semester details for this academic year below.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(semesters).map(([semesterKey, subjects]) => (
                <div key={semesterKey} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 flex items-center justify-between px-4 py-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Semester {semesterKey}</h3>
                    <button
                      onClick={() => handleDeleteSemester(semesterKey)}
                      className="text-gray-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                      title="Delete Semester"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-4">
                    {subjects && subjects.length > 0 ? (
                      <div className="overflow-hidden">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="grid grid-cols-2 font-semibold text-gray-500 text-sm mb-1">
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

        {/* Add New Semester Form - Only show if there are available semesters */}
        {availableSemesters.length > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Semester</h3>
              
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Semester</label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">-- Select Semester --</option>
                  {availableSemesters.map((semNumber) => (
                    <option key={semNumber} value={semNumber}>
                      Semester {semNumber}
                    </option>
                  ))}
                </select>
              </div>

              {formData.semester && (
                <>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Add Subjects and Marks</h4>
                    
                    <div className="space-y-4 max-h-96 overflow-y-auto p-2">
                      {formData.subjects.map((subject, index) => (
                        <div key={index} className="flex space-x-4 items-center bg-gray-50 p-3 rounded-lg">
                          <div className="flex-grow">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Subject</label>
                            <select
                              value={subject.name}
                              onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                              className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                            >
                              <option value="">-- Select Subject --</option>
                              {availableSubjects.map((subj) => (
                                <option key={subj} value={subj}>
                                  {subj}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="w-24">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Marks</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={subject.marks}
                              onChange={(e) => handleSubjectChange(index, 'marks', e.target.value)}
                              className="mt-1 block w-full border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            />
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => handleRemoveSubject(index)}
                            className="mt-6 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleAddSubject}
                      className="mt-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Another Subject
                    </button>
                  </div>
                  
                  <div className="pt-5 border-t border-gray-200">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setFormData({ semester: '', subjects: [{ name: '', marks: '' }] })}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                      >
                        Reset
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                          submitting ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        {submitting ? 'Saving...' : 'Save Semester Grades'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default YearDetails;