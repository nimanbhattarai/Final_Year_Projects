import { useState } from 'react';
import { adminApi } from '../../services/api';
import toast from 'react-hot-toast';

const ExtraCurricular = ({ selectedStudent }) => {
  const [formData, setFormData] = useState({
    activity: '',
    grade: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast.error('Please select a student first');
      return;
    }

    try {
      await adminApi.updateExtracurricular({
        studentId: selectedStudent._id,
        activity: formData.activity,
        grade: Number(formData.grade),
      });
      toast.success('Extra-curricular activity added successfully');
      setFormData({ activity: '', grade: '' });
    } catch (error) {
      toast.error('Failed to add extra-curricular activity');
    }
  };

  if (!selectedStudent) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please select a student from the Student Details section first.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Extra-Curricular Activities</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Activity Name</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.activity}
            onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Grade/Score</label>
          <input
            type="number"
            required
            min="0"
            max="100"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.grade}
            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
          />
        </div>

        <button
          type="submit"
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Activity
        </button>
      </form>
    </div>
  );
};

export default ExtraCurricular;