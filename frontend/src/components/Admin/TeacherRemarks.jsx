import { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { Snackbar, Alert } from '@mui/material';
import { Trash2, MessageCircle, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { FaTrash } from 'react-icons/fa';

const TeacherRemarks = ({ selectedStudent }) => {
  const [formData, setFormData] = useState({
    remark: '',
    grade: '',
  });
  const [existingRemarks, setExistingRemarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    if (selectedStudent && selectedStudent._id) {
      fetchExistingRemarks();
    }
  }, [selectedStudent]);

  const fetchExistingRemarks = async () => {
    if (!selectedStudent || !selectedStudent._id) return;

    setLoading(true);
    try {
      const response = await adminApi.getStudentGrades(selectedStudent._id);
      const remarks = response.data.performance?.teacherRemarks || [];
      setExistingRemarks(remarks);
    } catch (error) {
      console.error('Error fetching remarks:', error);
      toast.error('Failed to fetch existing remarks');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast.error('Please select a student first');
      return;
    }

    setSubmitting(true);
    try {
      await adminApi.updateTeacherRemarks({
        studentId: selectedStudent._id,
        remark: formData.remark,
        grade: Number(formData.grade),
        teacherName: 'Admin',
      });

      toast.success('Teacher remark added successfully');

      // Update local state with new remark
      setExistingRemarks([
        ...existingRemarks,
        {
          remark: formData.remark,
          grade: Number(formData.grade),
          teacherName: 'Admin', // Set default for admin-added remarks
        },
      ]);

      // Reset form
      setFormData({ remark: '', grade: '' });
    } catch (error) {
      console.error('Error adding remark:', error);
      toast.error('Failed to add teacher remark');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRemark = async (index) => {
    if (!window.confirm('Are you sure you want to delete this remark?')) {
      return;
    }

    setLoading(true);
    try {
      await adminApi.deleteTeacherRemarks({
        studentId: selectedStudent._id,
        remarkIndex: index,
      });

      toast.success('Remark deleted successfully');

      // Update local state
      const updatedRemarks = [...existingRemarks];
      updatedRemarks.splice(index, 1);
      setExistingRemarks(updatedRemarks);
    } catch (error) {
      console.error('Error deleting remark:', error);
      toast.error('Failed to delete remark');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedStudent) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="bg-indigo-50 rounded-full p-4 mb-4">
          <MessageCircle className="h-8 w-8 text-indigo-500" />
        </div>
        <p className="text-gray-600 text-center">
          Please select a student from the Student Details section first.
        </p>
      </div>
    );
  }

  if (loading && existingRemarks.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {selectedStudent.photo && (
                <img 
                  src={selectedStudent.photo} 
                  alt="Student" 
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900">Teacher Remarks</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Manage teacher feedback for {selectedStudent.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Existing Remarks Section */}
          <div className="mb-8">
            {existingRemarks.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Existing Remarks
                </h3>
                <div className="space-y-4">
                  {existingRemarks.map((remarkObj, index) => (
                    <div key={index} className="mb-4 p-3 border rounded relative">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium mb-1">{remarkObj.remark}</p>
                          <p className="text-sm text-gray-600">
                            Grade: <span className="font-semibold">{remarkObj.grade}</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            By: <span className="font-semibold">{remarkObj.teacherName || 'Unknown'}</span>
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteRemark(index)}
                          className="text-red-500 hover:text-red-700"
                          disabled={submitting}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <MessageCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No remarks added yet for this student.</p>
              </div>
            )}
          </div>

          {/* Add New Remark Form */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Remark</h3>
            <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remark
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter your feedback..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade (0-10)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="10"
                  step="0.1"
                  placeholder="Enter grade"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Adding...' : 'Add Remark'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default TeacherRemarks;
