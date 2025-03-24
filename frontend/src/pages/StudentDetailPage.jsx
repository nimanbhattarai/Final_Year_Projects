import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import StudentPhoto from '../components/StudentPhoto';
import StudentPhotoUpload from '../components/StudentPhotoUpload';

const StudentDetailPage = () => {
  const { id } = useParams<{ id: string }>[];
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [photoRefreshTrigger, setPhotoRefreshTrigger] = useState(0);

  // Fetch student data
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/students/${id}`);
        setStudent(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching student:', err);
        setError('Failed to load student details');
      } finally {
        setLoading(false);
      }
    };

    // Check if user is admin
    const checkUserRole = async () => {
      try {
        const response = await axios.get('/api/auth/me');
        setIsAdmin(response.data.role === 'admin');
      } catch (err) {
        console.error('Error checking user role:', err);
        setIsAdmin(false);
      }
    };

    fetchStudentData();
    checkUserRole();
  }, [id]);

  const handlePhotoUpdated = () => {
    // Trigger a refresh of the photo component
    setPhotoRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return <div>Loading student details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!student) {
    return <div>Student not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Student Details</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Photo */}
        <div className="md:col-span-1">
          <StudentPhoto 
            studentId={id || ''} 
            refreshTrigger={photoRefreshTrigger}
          />
          
          {isAdmin && (
            <div className="mt-4">
              <StudentPhotoUpload 
                studentId={id || ''} 
                onPhotoUpdated={handlePhotoUpdated}
              />
            </div>
          )}
        </div>
        
        {/* Right column - Student details */}
        <div className="md:col-span-2">
          {/* Your existing student detail information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">{student.name}</h2>
            {/* Other student details */}
            {/* ... */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailPage; 