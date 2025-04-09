import { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { Snackbar, Alert } from '@mui/material';
import { Trash2, Award, Plus } from 'lucide-react';
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
      <div className="flex flex-col items-center justify-center py-16">
        <div className="bg-indigo-50 rounded-full p-4 mb-4">
          <Award className="h-8 w-8 text-indigo-500" />
        </div>
        <p className="text-gray-600 text-center">
          Please select a student from the Student Details section first.
        </p>
      </div>
    );
  }

  if (loading && existingActivities.length === 0) {
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
                <h2 className="text-xl font-bold text-gray-900">Extra-Curricular Activities</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Manage {selectedStudent.name}'s extra-curricular achievements
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Existing Activities Section */}
          <div className="mb-8">
            {existingActivities.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Existing Activities
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {existingActivities.map((activity, index) => (
                    <div 
                      key={index} 
                      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900 truncate pr-6">
                            {activity.activity}
                          </h4>
                          <button
                            onClick={() => handleDeleteActivity(index)}
                            className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors duration-200"
                            title="Delete Activity"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                          Grade: {activity.grade}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <Award className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No extra-curricular activities added yet for this student.</p>
              </div>
            )}
          </div>

          {/* Add New Activity Form */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Activity</h3>
            <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activity Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter activity name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  value={formData.activity}
                  onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade/Score (0-10)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="10"
                  placeholder="Enter grade"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 font-medium transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting ? (
                    'Adding...'
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Activity
                    </>
                  )}
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

export default ExtraCurricular;
