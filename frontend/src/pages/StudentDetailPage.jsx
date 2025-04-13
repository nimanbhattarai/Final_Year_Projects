import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import StudentPhoto from '../components/StudentPhoto';
import StudentPhotoUpload from '../components/StudentPhotoUpload';
import { Facebook, Instagram, Linkedin, Github, Link as LinkIcon } from 'lucide-react';

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
            <div className="grid grid-cols-1 gap-4 mb-6">
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm">Email</span>
                <span>{student.email}</span>
              </div>
              {student.prn && (
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">PRN</span>
                  <span>{student.prn}</span>
                </div>
              )}
              {student.rollNumber && (
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">Roll Number</span>
                  <span>{student.rollNumber}</span>
                </div>
              )}
            </div>
            
            {/* Social Media Profiles */}
            <div className="mt-6 border-t pt-4">
              <h3 className="text-md font-medium mb-3 flex items-center">
                <LinkIcon className="h-4 w-4 mr-2 text-gray-500" />
                Social Media Profiles
              </h3>
              
              {student.socialMedia && (
                Object.values(student.socialMedia).some(link => link && link.trim() !== '') ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {student.socialMedia.facebook && (
                      <a 
                        href={student.socialMedia.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 p-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                      >
                        <Facebook className="h-5 w-5" />
                        <span className="text-sm font-medium truncate">Facebook</span>
                      </a>
                    )}
                    
                    {student.socialMedia.instagram && (
                      <a 
                        href={student.socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 p-2 bg-pink-50 text-pink-600 rounded-md hover:bg-pink-100 transition-colors"
                      >
                        <Instagram className="h-5 w-5" />
                        <span className="text-sm font-medium truncate">Instagram</span>
                      </a>
                    )}
                    
                    {student.socialMedia.linkedin && (
                      <a 
                        href={student.socialMedia.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 p-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                      >
                        <Linkedin className="h-5 w-5" />
                        <span className="text-sm font-medium truncate">LinkedIn</span>
                      </a>
                    )}
                    
                    {student.socialMedia.github && (
                      <a 
                        href={student.socialMedia.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 p-2 bg-gray-50 text-gray-800 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <Github className="h-5 w-5" />
                        <span className="text-sm font-medium truncate">GitHub</span>
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic">No social media profiles available</p>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailPage; 