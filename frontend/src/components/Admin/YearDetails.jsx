import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { Trash2, Plus, ArrowLeft, BookOpen, Edit, Check, X } from 'lucide-react';
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
      'Internship',
      'Project Stage 1'
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
      'Project Stage 2'
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
  const [editingSemester, setEditingSemester] = useState(null);
  const [editData, setEditData] = useState({
    semester: '',
    subjects: []
  });

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

  const handleEditSemester = (semester) => {
    const semesterData = semesters[semester];
    
    if (!semesterData) {
      toast.error('Semester data not found');
      return;
    }
    
    // Initialize edit form with current data
    setEditData({
      semester,
      subjects: semesterData.map(subject => ({
        name: subject.subject,
        marks: subject.marks.toString()
      }))
    });
    
    setEditingSemester(semester);
  };

  const handleEditCancel = () => {
    setEditingSemester(null);
    setEditData({
      semester: '',
      subjects: []
    });
  };

  const handleEditSubjectChange = (index, field, value) => {
    const newSubjects = [...editData.subjects];
    newSubjects[index][field] = value;
    setEditData({ ...editData, subjects: newSubjects });
  };

  const handleSaveEdit = async () => {
    if (!editingSemester) return;
    
    // Validate marks
    for (const subject of editData.subjects) {
      if (subject.name.trim() === '' || !subject.marks || isNaN(Number(subject.marks))) {
        toast.error('Please enter valid marks for all subjects');
        return;
      }
    }
    
    setSubmitting(true);
    try {
      await adminApi.updateAcademicGrades({
        studentId: student._id,
        year,
        semester: editingSemester,
        grades: editData.subjects.map(s => ({ subject: s.name, marks: Number(s.marks) })),
      });
      
      toast.success('Semester marks updated successfully');
      
      // Update local state
      const updatedSemesters = {
        ...semesters,
        [editingSemester]: editData.subjects.map(s => ({ subject: s.name, marks: Number(s.marks) }))
      };
      setSemesters(updatedSemesters);
      
      // Reset editing state
      setEditingSemester(null);
      setEditData({
        semester: '',
        subjects: []
      });
    } catch (error) {
      console.error('Error updating semester marks:', error);
      toast.error('Failed to update semester marks');
    } finally {
      setSubmitting(false);
    }
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Year {year} Details</h2>
        <button 
          onClick={handleBack}
          className="text-gray-600 hover:text-indigo-600 transition-colors flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back
        </button>
      </div>

      {student && (
        <div className="bg-indigo-50 p-4 rounded-lg">
          <p className="font-medium text-indigo-800">Selected Student: {student.name}</p>
          <p className="text-sm text-indigo-600">Roll Number: {student.rollNumber}</p>
        </div>
      )}

      {/* Display existing semesters */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {Object.keys(semesters).length > 0 ? (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Existing Semesters</h3>
              
              {Object.entries(semesters).map(([semesterKey, semesterSubjects]) => (
                <div key={semesterKey} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-3 border-b border-gray-100">
                    <h4 className="text-lg font-medium text-gray-900">Semester {semesterKey}</h4>
                    <div className="flex space-x-2">
                      {editingSemester === semesterKey ? (
                        <>
                          <button
                            onClick={handleSaveEdit}
                            disabled={submitting}
                            className="p-1.5 rounded-md text-green-600 hover:bg-green-50 transition-colors"
                            title="Save changes"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-50 transition-colors"
                            title="Cancel edit"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditSemester(semesterKey)}
                            className="p-1.5 rounded-md text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit Semester"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSemester(semesterKey)}
                            className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Semester"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-5">
                    {editingSemester === semesterKey ? (
                      // Edit mode
                      <div className="space-y-4">
                        {editData.subjects.map((subject, index) => (
                          <div key={index} className="flex flex-col md:flex-row md:items-center gap-3">
                            <div className="flex-grow">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                              <input
                                type="text"
                                value={subject.name}
                                onChange={(e) => handleEditSubjectChange(index, 'name', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                readOnly
                              />
                            </div>
                            <div className="w-full md:w-32">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={subject.marks}
                                onChange={(e) => handleEditSubjectChange(index, 'marks', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // View mode
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {semesterSubjects.map((subject, idx) => (
                              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">{subject.subject}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{subject.marks}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="bg-indigo-50 rounded-full p-4 mb-4">
                  <BookOpen className="h-8 w-8 text-indigo-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Semesters Added Yet</h3>
                <p className="text-gray-600 text-center max-w-md">
                  Use the form below to add semester data for Year {year}.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add new semester form */}
      {!loading && getAvailableSemesters().length > 0 && (
        <div className="mt-6 p-6 border border-gray-200 rounded-lg shadow-sm bg-white">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Semester</h3>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-grow">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        semester: e.target.value,
                        subjects: availableSubjects.map(subject => ({ name: subject, marks: '' }))
                      });
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a semester</option>
                    {getAvailableSemesters().map((semester) => (
                      <option key={semester} value={semester}>Semester {semester}</option>
                    ))}
                  </select>
                </div>
              </div>
              {formData.semester && (
                <>
                  <div className="flex justify-between items-center mt-4 mb-2">
                    <h4 className="font-medium text-gray-700">Subjects</h4>
                    <button
                      type="button"
                      onClick={handleAddSubject}
                      className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Subject
                    </button>
                  </div>
                  
                  {formData.subjects.map((subject, index) => (
                    <div key={index} className="flex flex-col md:flex-row md:items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-grow">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                        <select
                          value={subject.name}
                          onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Select Subject</option>
                          {availableSubjects.map((subjectName) => (
                            <option key={subjectName} value={subjectName}>
                              {subjectName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-full md:w-32">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={subject.marks}
                          onChange={(e) => handleSubjectChange(index, 'marks', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="flex items-end justify-center md:pt-6">
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
            {formData.semester && (
              <button
                type="submit"
                disabled={submitting}
                className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {submitting ? 'Saving...' : 'Save Semester Data'}
              </button>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default YearDetails;