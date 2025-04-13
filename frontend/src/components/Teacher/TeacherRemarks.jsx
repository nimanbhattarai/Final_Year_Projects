import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Trash2, MessageCircle, Plus } from 'lucide-react';
import { Snackbar, Alert } from '@mui/material';

const TeacherRemarks = ({ selectedStudent }) => {
  const [formData, setFormData] = useState({
    remark: '',
    grade: '',
  });
  const [existingRemarks, setExistingRemarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [teacherInfo, setTeacherInfo] = useState(null);

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

  useEffect(() => {
    // Fetch teacher info when component mounts
    const fetchTeacherProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://final-year-projects-backend.onrender.com/api/teacher/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTeacherInfo(response.data.data);
      } catch (error) {
        console.error('Error fetching teacher info:', error);
      }
    };

    fetchTeacherProfile();
  }, []);

  const fetchExistingRemarks = async () => {
    if (!selectedStudent || !selectedStudent._id) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://final-year-projects-backend.onrender.com/api/teacher/remarks/${selectedStudent._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExistingRemarks(response.data.teacherRemarks || []);
    } catch (error) {
      console.error('Error fetching remarks:', error);
      toast.error('Failed to fetch existing remarks');
      setExistingRemarks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast.error('Please select a student first');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `https://final-year-projects-backend.onrender.com/api/teacher/remarks/${selectedStudent._id}`,
        {
          teacherName: teacherInfo?.name || 'Teacher',
          remark: formData.remark,
          grade: Number(formData.grade),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Teacher remark added successfully');

      // Update local state with new remark
      setExistingRemarks([
        ...existingRemarks,
        {
          teacherName: teacherInfo?.name || 'Teacher',
          remark: formData.remark,
          grade: Number(formData.grade),
          date: new Date()
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

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://final-year-projects-backend.onrender.com/api/teacher/remarks/${selectedStudent._id}/${index}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Remark deleted successfully');

      // Update local state
      const updatedRemarks = [...existingRemarks];
      updatedRemarks.splice(index, 1);
      setExistingRemarks(updatedRemarks);
    } catch (error) {
      console.error('Error deleting remark:', error);
      toast.error('Failed to delete remark');
    }
  };

  const handleClose = () => {
    setSnackbar({ ...snackbar, open: false });
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
                  {existingRemarks.map((remark, index) => (
                    <div 
                      key={index} 
                      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                              Grade: {remark.grade}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteRemark(index)}
                            className="text-gray-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors duration-200"
                            title="Delete Remark"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                          {remark.remark}
                        </p>
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