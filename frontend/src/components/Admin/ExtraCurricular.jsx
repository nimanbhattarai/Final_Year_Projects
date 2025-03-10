import { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { Snackbar, Alert } from '@mui/material';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ExtraCurricular = ({ selectedStudent }) => {
  const [formData, setFormData] = useState({
    activity: '',
    grade: '',
  });
  const [existingActivities, setExistingActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    if (selectedStudent && selectedStudent._id) {
      fetchExistingActivities();
    }
  }, [selectedStudent]);

  const fetchExistingActivities = async () => {
    if (!selectedStudent || !selectedStudent._id) return;
    
    setLoading(true);
    try {
      const response = await adminApi.getStudentGrades(selectedStudent._id);
      const activities = response.data.performance?.extracurricular || [];
      setExistingActivities(activities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to fetch existing activities');
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
      await adminApi.updateExtracurricular({
        studentId: selectedStudent._id,
        activity: formData.activity,
        grade: Number(formData.grade),
      });
      
      toast.success('Extra-curricular activity added successfully');
      
      // Update local state with new activity
      setExistingActivities([
        ...existingActivities,
        {
          activity: formData.activity,
          grade: Number(formData.grade),
        },
      ]);
      
      // Reset form
      setFormData({ activity: '', grade: '' });
    } catch (error) {
      console.error('Error adding activity:', error);
      toast.error('Failed to add extra-curricular activity');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteActivity = async (index) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) {
      return;
    }

    setLoading(true);
    try {
      await adminApi.deleteExtracurricular({
        studentId: selectedStudent._id,
        activityIndex: index,
      });
      
      toast.success('Activity deleted successfully');
      
      // Update local state
      const updatedActivities = [...existingActivities];
      updatedActivities.splice(index, 1);
      setExistingActivities(updatedActivities);
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast.error('Failed to delete activity');
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

  if (loading && existingActivities.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Existing Activities Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Extra-Curricular Activities</h2>
        
        {existingActivities.length > 0 ? (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Existing Activities</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {existingActivities.map((activity, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border relative">
                  <button
                    onClick={() => handleDeleteActivity(index)}
                    className="absolute top-2 right-2 text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                    title="Delete Activity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <h4 className="font-medium truncate">{activity.activity}</h4>
                  <div className="mt-2 bg-indigo-100 text-indigo-800 inline-block px-2 py-1 rounded text-sm font-medium">
                    Grade: {activity.grade}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 mb-6">
            <p className="text-gray-600">No extra-curricular activities added yet for this student.</p>
          </div>
        )}

        {/* Add New Activity Form */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Add New Activity</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Activity Name</label>
              <input
                type="text"
                required
                className="w-full p-2 border rounded-md"
                value={formData.activity}
                onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Grade/Score</label>
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
              {submitting ? 'Adding...' : 'Add Activity'}
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

export default ExtraCurricular;
