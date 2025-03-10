import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

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

  useEffect(() => {
    if (!student || !student._id) {
      navigate('/admin/students');
      return;
    }
    fetchStudentAcademicData();
  }, [student, year]);

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
      <div className="text-center py-12">
        <p className="text-gray-600">Student information is missing. Please go back and select a student.</p>
        <button
          onClick={() => navigate('/admin/students')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Go to Students
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const availableSemesters = getAvailableSemesters();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Academic Years
        </button>
        <div>
          <h2 className="text-xl font-bold">
            {student?.name} - Year {year}
          </h2>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Semester Details</h2>
        
        {/* Existing Semesters Display */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Existing Semesters</h3>
          {Object.keys(semesters).length === 0 ? (
            <p className="text-gray-600">No semesters added yet for Year {year}.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {Object.entries(semesters).map(([semester, subjects]) => (
                <div key={semester} className="bg-gray-50 p-5 rounded-lg border">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-lg">Semester {semester}</h4>
                    <button
                      onClick={() => handleDeleteSemester(semester)}
                      className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                      title="Delete Semester"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {Array.isArray(subjects) && subjects.length > 0 ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 font-medium text-gray-600 mb-1">
                        <span>Subject</span>
                        <span className="text-right">Marks</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2">
                        {subjects.map((subject, idx) => (
                          <div key={idx} className="grid grid-cols-2 py-1 text-sm">
                            <span className="truncate">{subject.subject}</span>
                            <span className="text-right font-medium">{subject.marks}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No subjects available</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Semester Form */}
        {availableSemesters.length > 0 ? (
          <form onSubmit={handleSubmit} className="space-y-6 border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Add New Semester</h3>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Select Semester</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full p-2 border rounded-md"
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
              <label className="block text-gray-700">Subjects</label>
              
              {formData.subjects.map((subject, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Subject Name"
                      value={subject.name}
                      onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      placeholder="Marks"
                      min="0"
                      max="100"
                      value={subject.marks}
                      onChange={(e) => handleSubjectChange(index, 'marks', e.target.value)}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(index)}
                    className="text-red-600 hover:text-red-800 p-1"
                    disabled={formData.subjects.length === 1}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddSubject}
                className="flex items-center text-indigo-600 hover:text-indigo-800"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Subject
              </button>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
                disabled={submitting || !formData.semester || formData.subjects.some(s => !s.name.trim() || !s.marks)}
              >
                {submitting ? 'Saving...' : 'Save Grades'}
              </button>
            </div>
          </form>
        ) : (
          <div className="border-t pt-6">
            <p className="text-gray-600">All semesters for Year {year} have been added.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default YearDetails;