import { useState, useEffect } from 'react';
import { User, Mail, Globe, ExternalLink, MapPin, Hash, Calendar, Phone } from 'lucide-react';
import { Facebook, Instagram, Linkedin, Github } from 'lucide-react';
import toast from 'react-hot-toast';

const StudentInfo = ({ selectedStudent }) => {
  // For debugging - log when component receives new data
  useEffect(() => {
    if (selectedStudent) {
      console.log("StudentInfo component received student data:", selectedStudent);
      console.log("Social media data:", selectedStudent.socialMedia);
    }
  }, [selectedStudent]);

  if (!selectedStudent) {
    return (
      <div className="text-center py-16">
        <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Student Selected</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Please select a student from the Student Details section to view their information.
        </p>
      </div>
    );
  }

  // Ensure socialMedia exists and has default empty strings for each platform
  const socialMedia = selectedStudent.socialMedia || {};
  const sanitizedSocialMedia = {
    linkedin: socialMedia.linkedin || '',
    github: socialMedia.github || '',
    instagram: socialMedia.instagram || '',
    facebook: socialMedia.facebook || ''
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Student Information</h2>
      </div>

      {/* Student Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/10 rounded-lg">
              {selectedStudent.photo ? (
                <img 
                  src={selectedStudent.photo} 
                  alt="Student" 
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User className="h-12 w-12 text-indigo-400" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{selectedStudent.name}</h1>
              <p className="text-indigo-100 flex items-center mb-1">
                <Mail className="h-4 w-4 mr-2" />
                {selectedStudent.email}
              </p>
              {selectedStudent.address && (
                <p className="text-indigo-100 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {selectedStudent.address}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Primary Information */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedStudent.prn && (
              <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
                <Hash className="h-5 w-5 text-indigo-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-gray-500">PRN Number</h4>
                  <p className="text-gray-900 font-medium">{selectedStudent.prn}</p>
                </div>
              </div>
            )}
            
            {selectedStudent.rollNumber && (
              <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
                <Hash className="h-5 w-5 text-indigo-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Roll Number</h4>
                  <p className="text-gray-900 font-medium">{selectedStudent.rollNumber}</p>
                </div>
              </div>
            )}
            
            {/* Adding more personal information */}
            {selectedStudent.address && (
              <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
                <MapPin className="h-5 w-5 text-indigo-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Address</h4>
                  <p className="text-gray-900 font-medium">{selectedStudent.address}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
              <User className="h-5 w-5 text-indigo-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-500">Full Name</h4>
                <p className="text-gray-900 font-medium">{selectedStudent.name}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
              <Mail className="h-5 w-5 text-indigo-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-500">Email Address</h4>
                <p className="text-gray-900 font-medium">{selectedStudent.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media Profiles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sanitizedSocialMedia.linkedin && (
              <a
                href={sanitizedSocialMedia.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Linkedin className="h-5 w-5 text-blue-600" />
                <span className="text-gray-700">LinkedIn Profile</span>
                <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
              </a>
            )}
            
            {sanitizedSocialMedia.github && (
              <a
                href={sanitizedSocialMedia.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Github className="h-5 w-5 text-gray-800" />
                <span className="text-gray-700">GitHub Profile</span>
                <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
              </a>
            )}
            
            {sanitizedSocialMedia.instagram && (
              <a
                href={sanitizedSocialMedia.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Instagram className="h-5 w-5 text-pink-600" />
                <span className="text-gray-700">Instagram Profile</span>
                <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
              </a>
            )}
            
            {sanitizedSocialMedia.facebook && (
              <a
                href={sanitizedSocialMedia.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Facebook className="h-5 w-5 text-blue-600" />
                <span className="text-gray-700">Facebook Profile</span>
                <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
              </a>
            )}

            {(!sanitizedSocialMedia.linkedin && 
              !sanitizedSocialMedia.github && 
              !sanitizedSocialMedia.instagram && 
              !sanitizedSocialMedia.facebook) && (
              <div className="col-span-2 text-center py-4 text-gray-500">
                No social media profiles added
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Student Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Student ID</h4>
            <p className="text-gray-900">{selectedStudent._id}</p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Account Created</h4>
            <p className="text-gray-900 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              {selectedStudent.createdAt 
                ? new Date(selectedStudent.createdAt).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })
                : 'Not available'}
            </p>
          </div>
          
          {selectedStudent.updatedAt && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h4>
              <p className="text-gray-900 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                {new Date(selectedStudent.updatedAt).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentInfo;