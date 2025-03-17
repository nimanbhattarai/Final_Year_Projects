import { useState, useEffect } from 'react';
import { User, Mail, Globe, ExternalLink } from 'lucide-react';
import { Facebook, Instagram, Linkedin, Github } from 'lucide-react';
import toast from 'react-hot-toast';

const StudentInfo = ({ selectedStudent }) => {
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
              <User className="h-12 w-12 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{selectedStudent.name}</h1>
              <p className="text-indigo-100 flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                {selectedStudent.email}
              </p>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Globe className="h-5 w-5 mr-2 text-indigo-600" />
            Social Media Profiles
          </h3>

          {selectedStudent.socialMedia && 
           Object.values(selectedStudent.socialMedia).some(link => link) ? (
            <div className="grid md:grid-cols-2 gap-4">
              {selectedStudent.socialMedia.facebook && (
                <a
                  href={selectedStudent.socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors group"
                >
                  <div className="p-2 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                    <Facebook className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">Facebook</h4>
                    <p className="text-xs text-gray-500 truncate">{selectedStudent.socialMedia.facebook}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                </a>
              )}

              {selectedStudent.socialMedia.instagram && (
                <a
                  href={selectedStudent.socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-pink-50 hover:border-pink-200 transition-colors group"
                >
                  <div className="p-2 bg-pink-100 rounded-full group-hover:bg-pink-200 transition-colors">
                    <Instagram className="h-6 w-6 text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">Instagram</h4>
                    <p className="text-xs text-gray-500 truncate">{selectedStudent.socialMedia.instagram}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                </a>
              )}

              {selectedStudent.socialMedia.linkedin && (
                <a
                  href={selectedStudent.socialMedia.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors group"
                >
                  <div className="p-2 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                    <Linkedin className="h-6 w-6 text-blue-700" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">LinkedIn</h4>
                    <p className="text-xs text-gray-500 truncate">{selectedStudent.socialMedia.linkedin}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                </a>
              )}

              {selectedStudent.socialMedia.github && (
                <a
                  href={selectedStudent.socialMedia.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors group"
                >
                  <div className="p-2 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors">
                    <Github className="h-6 w-6 text-gray-800" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">GitHub</h4>
                    <p className="text-xs text-gray-500 truncate">{selectedStudent.socialMedia.github}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                </a>
              )}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <Globe className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No social media profiles available.</p>
              <p className="text-sm text-gray-500 mt-1">
                Social media profiles can be added from the Student Details section.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Additional Student Info (you can expand this section) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Student ID</h4>
            <p className="text-gray-900">{selectedStudent._id}</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Account Created</h4>
            <p className="text-gray-900">
              {selectedStudent.createdAt 
                ? new Date(selectedStudent.createdAt).toLocaleDateString() 
                : 'Not available'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentInfo;