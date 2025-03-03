import { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const AcademicGrades = ({ selectedStudent }) => {
  const [formData, setFormData] = useState({
    year: '1',
    semester: '1',
    subjects: [{ name: '', marks: '' }],
  });
  const [existingGrades, setExistingGrades] = useState(null);
  const [loading, setLoading] = useState(true);

  const years = ['1', '2', '3', '4'];
  const semesters = ['1', '2'];

  useEffect(() => {
    if (selectedStudent) {
      fetchExistingGrades();
    }
  }, [selectedStudent]);

  const fetchExistingGrades = async () => {
    try {
      const response = await adminApi.getStudentGrades(selectedStudent._id);
      setExistingGrades(response.data.performance.academic || {});
      console.log("HAH", response.data.performance.academic)
    } catch (error) {
      toast.error('Failed to fetch existing grades');
    } finally {
      setLoading(false);
    }
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
    if (!selectedStudent) {
      toast.error('Please select a student first');
      return;
    }

    try {
      const data = {
        studentId: selectedStudent._id,
        year: formData.year,
        semester: formData.semester,
        grades: formData.subjects.map((s) => ({ subject: s.name, marks: Number(s.marks) })),
      }
      console.log(data)
      await adminApi.updateAcademicGrades(data);
      toast.success('Grades updated successfully');
      fetchExistingGrades();
      setFormData({
        year: '1',
        semester: '1',
        subjects: [{ name: '', marks: '' }],
      });
    } catch (error) {
      toast.error('Failed to update grades');
    }
  };

  const handleDeleteGrades = async (year, semester) => {
    if (!window.confirm('Are you sure you want to delete these grades?')) {
      return;
    }

    try {
      await adminApi.deleteAcademicGrades({
        studentId: selectedStudent._id,
        year,
        semester,
      });
      toast.success('Grades deleted successfully');
      fetchExistingGrades();
    } catch (error) {
      toast.error('Failed to delete grades');
    }
  };

  if (!selectedStudent) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please select a student from the Student Details section first.</p>
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

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Academic Grades</h2>

        {/* Existing Grades Display */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Existing Grades</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(existingGrades).map(([year, semesters]) =>
              Object.entries(semesters).map(([semester, subjects]) => (
                <div key={`${year}-${semester}`} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Year {year}, Semester {semester}</h4>
                    <button
                      onClick={() => handleDeleteGrades(year, semester)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {Array.isArray(subjects) ? (
                      subjects.map((subject, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{subject.subject}</span>
                          <span className="font-medium">{subject.marks}</span>
                        </div>
                      ))
                    ) : (
                      <p>No subjects available</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add New Grades Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Year</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              >
                {years.map((year) => (
                  <option key={year} value={year}>Year {year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Semester</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              >
                {semesters.map((sem) => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {formData.subjects.map((subject, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Subject Name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={subject.name}
                    onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="Marks"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={subject.marks}
                    onChange={(e) => handleSubjectChange(index, 'marks', e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSubject(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleAddSubject}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Subject
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Grades
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AcademicGrades;
