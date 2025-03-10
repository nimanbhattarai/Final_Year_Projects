import { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { Snackbar, Alert } from '@mui/material';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const TeacherRemarks = ({ selectedStudent }) => {
  const [formData, setFormData] = useState({
    teacherName: '',
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
        teacherName: formData.teacherName,
        remark: formData.remark,
        grade: Number(formData.grade),
      });

      toast.success('Teacher remark added successfully');

      // Update local state with new remark
      setExistingRemarks([
        ...existingRemarks,
        {
          teacherName: formData.teacherName,
          remark: formData.remark,
          grade: Number(formData.grade),
        },
      ]);

      // Reset form
      setFormData({ teacherName: '', remark: '', grade: '' });
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
      <div className="text-center py-12">
        <p className="text-gray-600">Please select a student from the Student Details section first.</p>
      </div>
    );
  }

  if (loading && existingRemarks.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Existing Remarks Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Teacher Remarks</h2>

        {existingRemarks.length > 0 ? (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Existing Remarks</h3>
            <div className="space-y-4">
              {existingRemarks.map((remark, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border relative">
                  <div className="flex justify-between flex-col gap-2 items-start">
                    <div className='flex flex-row gap-2'>
                      <h4 className="font-medium">{remark.teacherName}</h4>
                      <div className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm font-medium">
                        Grade: {remark.grade}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-700 mt-1">{remark.remark}</p>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => handleDeleteRemark(index)}
                      className="absolute top-2 right-2 text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                      title="Delete Remark"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 mb-6">
            <p className="text-gray-600">No remarks added yet for this student.</p>
          </div>
        )}

        {/* Add New Remark Form */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Add New Remark</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Teacher Name</label>
              <input
                type="text"
                required
                className="w-full p-2 border rounded-md"
                value={formData.teacherName}
                onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Remark</label>
              <textarea
                required
                rows={4}
                className="w-full p-2 border rounded-md"
                value={formData.remark}
                onChange={(e) => {
                  setFormData({ ...formData, remark: e.target.value })
                }}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Grade</label>
              <input
                type="number"
                required
                min="0"
                max="10"
                className="w-full p-2 border rounded-md"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
              disabled={submitting}
            >
              {submitting ? 'Adding...' : 'Add Remark'}
            </button>
          </form>
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
