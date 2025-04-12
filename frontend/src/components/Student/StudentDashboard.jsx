import { useState, useEffect } from 'react';
import { studentApi } from '../../services/api';
import PhotoUploadPrompt from './PhotoUploadPrompt';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPhotoPrompt, setShowPhotoPrompt] = useState(false);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const studentId = localStorage.getItem('userId');
      const response = await studentApi.getProfile(studentId);
      setStudentData(response.data);
      
      // Show photo prompt if student hasn't uploaded a photo
      if (!response.data.photo) {
        setShowPhotoPrompt(true);
      }
    } catch (error) {
      toast.error('Failed to fetch student data');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUploaded = () => {
    setShowPhotoPrompt(false);
    fetchStudentData(); // Refresh data to show new photo
    toast.success('Profile photo updated successfully');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* Existing dashboard content */}
      
      {/* Photo Upload Prompt */}
      {showPhotoPrompt && (
        <PhotoUploadPrompt
          studentId={studentData._id}
          onPhotoUploaded={handlePhotoUploaded}
          onSkip={() => setShowPhotoPrompt(false)}
        />
      )}
      
      {/* Rest of your dashboard content */}
    </div>
  );
};

export default StudentDashboard; 