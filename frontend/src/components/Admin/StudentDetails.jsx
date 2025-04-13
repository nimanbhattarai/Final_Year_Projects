import { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { Search, UserPlus, Trash2, User, Linkedin, Github, Instagram, Facebook } from 'lucide-react';
import toast from 'react-hot-toast';
import PhotoUploader from './PhotoUploader';
import { useNavigate } from 'react-router-dom';

const StudentDetails = ({ onSelectStudent }) => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showEditSocial, setShowEditSocial] = useState(null);
  const [socialMedia, setSocialMedia] = useState({
    facebook: '',
    instagram: '',
    linkedin: '',
    github: ''
  });
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    prn: '',
    address: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      linkedin: '',
      github: ''
    }
  });
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getStudents();
      if (response.data && Array.isArray(response.data)) {
        // Get full details for each student including socialMedia
        const studentsWithFullDetails = await Promise.all(
          response.data.map(async (student) => {
            try {
              const detailsResponse = await adminApi.getStudent(student._id);
              return detailsResponse.data || student;
            } catch (error) {
              console.error(`Error fetching details for student ${student._id}:`, error);
              return student;
            }
          })
        );
        setStudents(studentsWithFullDetails);
      } else if (response.data.students && Array.isArray(response.data.students)) {
        // Same for paginated response
        const studentsWithFullDetails = await Promise.all(
          response.data.students.map(async (student) => {
            try {
              const detailsResponse = await adminApi.getStudent(student._id);
              return detailsResponse.data || student;
            } catch (error) {
              console.error(`Error fetching details for student ${student._id}:`, error);
              return student;
            }
          })
        );
        setStudents(studentsWithFullDetails);
      } else {
        console.error('Unexpected response format:', response.data);
        toast.error('Failed to load students: Invalid data format');
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!newStudent.name || !newStudent.email || !newStudent.password || !newStudent.rollNumber || !newStudent.prn) {
      toast.error('Please fill all required fields');
      return;
    }
    
    // Validate photo if provided
    if (photo) {
      // Check file size (5MB max)
      if (photo.size > 5 * 1024 * 1024) {
        toast.error('Photo size must be less than 5MB');
        return;
      }
      
      // Check file type
      if (!photo.type.startsWith('image/')) {
        toast.error('Only image files are allowed for photo');
        return;
      }
    }
    
    setSubmitting(true);
    
    try {
      // Create form data for mixed content (file + text)
      const formData = new FormData();
      formData.append('name', newStudent.name);
      formData.append('email', newStudent.email);
      formData.append('password', newStudent.password);
      formData.append('rollNumber', newStudent.rollNumber);
      formData.append('prn', newStudent.prn);
      formData.append('address', newStudent.address);
    
      
      // Only append photo if it exists
      if (photo) {
        formData.append('photo', photo);
      }
      
      // Send registration request
      const response = await adminApi.registerStudent(formData);
      
      if (response.data.success) {
        toast.success('Student added successfully');
        
        // Reset form
        setNewStudent({
          name: '',
          email: '',
          password: '',
          rollNumber: '',
          prn: '',
          address: '',
          socialMedia: {
            facebook: '',
            instagram: '',
            linkedin: '',
            github: ''
          }
        });
        setPhoto(null);
        setPhotoPreview(null);
        
        // Refresh student list
        fetchStudents();

        // Close the form
        setShowAddForm(false);

        // Redirect to the Academic Grades section for the newly added student
        const newStudentId = response.data._id;
        navigate(`/admin/academic/${newStudentId}`);
      } else {
        toast.error(response.data.message || 'Failed to add student');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    try {
      await adminApi.deleteStudent(studentId);
      toast.success('Student deleted successfully');
      setShowDeleteConfirm(null);
      fetchStudents();
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  const handleEditSocialMedia = (student) => {
    setSocialMedia({
      facebook: student.socialMedia?.facebook || '',
      instagram: student.socialMedia?.instagram || '',
      linkedin: student.socialMedia?.linkedin || '',
      github: student.socialMedia?.github || ''
    });
    setShowEditSocial(student);
  };

  const handleSaveSocialMedia = async () => {
    try {
      // Clean up social media data by removing empty strings
      const cleanedSocialMedia = {
        facebook: socialMedia.facebook?.trim() || '',
        instagram: socialMedia.instagram?.trim() || '',
        linkedin: socialMedia.linkedin?.trim() || '',
        github: socialMedia.github?.trim() || ''
      };

      await adminApi.updateStudentData({
        studentId: showEditSocial._id,
        data: { socialMedia: cleanedSocialMedia }
      });

      // Update the student in the local state
      setStudents(prevStudents => 
        prevStudents.map(student => 
          student._id === showEditSocial._id 
            ? { ...student, socialMedia: cleanedSocialMedia }
            : student
        )
      );

      toast.success('Social media profiles updated');
      setShowEditSocial(null);
      
      // If this is the selected student, update the selection
      if (selectedStudentId === showEditSocial._id) {
        const updatedStudent = { ...showEditSocial, socialMedia: cleanedSocialMedia };
        onSelectStudent(updatedStudent);
      }
    } catch (error) {
      console.error('Error updating social media:', error);
      toast.error('Failed to update social media profiles');
    }
  };

  const handleSelectStudent = (student) => {
    setSelectedStudentId(student._id);
    onSelectStudent(student);
    toast.success(`Selected student: ${student.name}`);
  };

  const handleSocialMediaChange = (platform, value) => {
    setNewStudent({
      ...newStudent,
      socialMedia: {
        ...newStudent.socialMedia,
        [platform]: value
      }
    });
  };

  const handlePhotoSelect = (file) => {
    setPhoto(file);
    
    // Create preview
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };

  const filteredStudents = students && Array.isArray(students) 
    ? students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Student Details</h2>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search students..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 whitespace-nowrap"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Add Student
            </button>
          </div>
        </div>

        {selectedStudentId && (
          <div className="mb-4 bg-indigo-50 border border-indigo-100 rounded-md p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-2">
                  {students.find(s => s._id === selectedStudentId)?.photo ? (
                    <img 
                      src={students.find(s => s._id === selectedStudentId)?.photo} 
                      alt="Student" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    students.find(s => s._id === selectedStudentId)?.name.charAt(0)
                  )}
                </div>
                <div>
                  <span className="text-sm text-gray-600">Selected:</span>{' '}
                  <span className="text-sm font-medium text-indigo-700">
                    {students.find(s => s._id === selectedStudentId)?.name}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Social Media Links */}
                <div className="flex space-x-3 mr-3 rounded-md bg-white px-3 py-1.5 border border-indigo-100">
                  {(() => {
                    const selectedStudent = students.find(s => s._id === selectedStudentId);
                    const socialMedia = selectedStudent?.socialMedia || {};
                    
                    if (!socialMedia.facebook && !socialMedia.instagram && !socialMedia.linkedin && !socialMedia.github) {
                      return (
                        <div className="text-xs text-gray-500">No social media profiles available</div>
                      );
                    }
                    
                    return (
                      <>
                        {socialMedia.facebook && (
                          <a 
                            href={socialMedia.facebook} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                            title={socialMedia.facebook}
                          >
                            <Facebook className="h-4 w-4" />
                          </a>
                        )}
                        {socialMedia.instagram && (
                          <a 
                            href={socialMedia.instagram} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-pink-600 hover:text-pink-800 flex items-center"
                            title={socialMedia.instagram}
                          >
                            <Instagram className="h-4 w-4" />
                          </a>
                        )}
                        {socialMedia.linkedin && (
                          <a 
                            href={socialMedia.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-700 hover:text-blue-900 flex items-center"
                            title={socialMedia.linkedin}
                          >
                            <Linkedin className="h-4 w-4" />
                          </a>
                        )}
                        {socialMedia.github && (
                          <a 
                            href={socialMedia.github} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-800 hover:text-black flex items-center"
                            title={socialMedia.github}
                          >
                            <Github className="h-4 w-4" />
                          </a>
                        )}
                      </>
                    );
                  })()}
                </div>
                
                <button 
                  onClick={() => setSelectedStudentId(null)}
                  className="text-xs text-gray-500 hover:text-gray-700 bg-white px-2 py-1 rounded-md border border-gray-200"
                >
                  Clear
                </button>
              </div>
            </div>
            
            {/* Social Media Details */}
            {(() => {
              const selectedStudent = students.find(s => s._id === selectedStudentId);
              const socialMedia = selectedStudent?.socialMedia || {};
              
              if (socialMedia.facebook || socialMedia.instagram || socialMedia.linkedin || socialMedia.github) {
                return (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white p-2 rounded-md border border-indigo-100">
                    {socialMedia.facebook && (
                      <div className="flex items-center overflow-hidden">
                        <Facebook className="h-3 w-3 text-blue-600 mr-1 flex-shrink-0" />
                        <span className="truncate text-gray-600">{socialMedia.facebook}</span>
                      </div>
                    )}
                    {socialMedia.instagram && (
                      <div className="flex items-center overflow-hidden">
                        <Instagram className="h-3 w-3 text-pink-600 mr-1 flex-shrink-0" />
                        <span className="truncate text-gray-600">{socialMedia.instagram}</span>
                      </div>
                    )}
                    {socialMedia.linkedin && (
                      <div className="flex items-center overflow-hidden">
                        <Linkedin className="h-3 w-3 text-blue-700 mr-1 flex-shrink-0" />
                        <span className="truncate text-gray-600">{socialMedia.linkedin}</span>
                      </div>
                    )}
                    {socialMedia.github && (
                      <div className="flex items-center overflow-hidden">
                        <Github className="h-3 w-3 text-gray-800 mr-1 flex-shrink-0" />
                        <span className="truncate text-gray-600">{socialMedia.github}</span>
                      </div>
                    )}
                  </div>
                );
              }
              
              return null;
            })()}
          </div>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Social Media
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr 
                  key={student._id}
                  className={`${
                    selectedStudentId === student._id 
                      ? 'bg-blue-50 border-l-4 border-blue-500' 
                      : 'hover:bg-gray-50 border-l-4 border-transparent'
                  } transition-colors duration-200`}
                >
                  <td className="px-6 py-4 whitespace-nowrap" 
                          onClick={() => handleSelectStudent(student)}
                  >
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-2">
                        {student.photo ? (
                          <img 
                            src={student.photo} 
                            alt="Student" 
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          student.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{student.name}</h2>
                        <p className="text-gray-600">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{student.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {student.socialMedia ? (
                        <>
                          {student.socialMedia.facebook && (
                            <a 
                              href={student.socialMedia.facebook} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                              title="Facebook Profile"
                            >
                              <Facebook className="h-5 w-5" />
                            </a>
                          )}
                          {student.socialMedia.instagram && (
                            <a 
                              href={student.socialMedia.instagram} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-pink-600 hover:text-pink-800"
                              title="Instagram Profile"
                            >
                              <Instagram className="h-5 w-5" />
                            </a>
                          )}
                          {student.socialMedia.linkedin && (
                            <a 
                              href={student.socialMedia.linkedin} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-700 hover:text-blue-900"
                              title="LinkedIn Profile"
                            >
                              <Linkedin className="h-5 w-5" />
                            </a>
                          )}
                          {student.socialMedia.github && (
                            <a 
                              href={student.socialMedia.github} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-gray-800 hover:text-gray-900"
                              title="GitHub Profile"
                            >
                              <Github className="h-5 w-5" />
                            </a>
                          )}
                          {!student.socialMedia.facebook && 
                            !student.socialMedia.instagram && 
                            !student.socialMedia.linkedin && 
                            !student.socialMedia.github && (
                              <span className="text-gray-400 text-sm italic">None</span>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400 text-sm italic">None</span>
                      )}
                      <button
                        onClick={() => handleEditSocialMedia(student)}
                        className="ml-2 text-indigo-600 hover:text-indigo-900 text-xs px-2 py-1 bg-indigo-50 rounded-md"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      {selectedStudentId === student._id && (
                        <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Selected
                        </span>
                      )}
                      <button
                        onClick={() => setShowDeleteConfirm(student)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Add New Student</h3>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-1/4 flex justify-center">
                  <PhotoUploader 
                    onPhotoSelect={handlePhotoSelect} 
                    currentPhoto={photoPreview}
                  />
                </div>
                
                <div className="md:w-3/4 space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name*
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address*
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700">
                      Roll Number*
                    </label>
                    <input
                      type="text"
                      id="rollNumber"
                      value={newStudent.rollNumber}
                      onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="prn" className="block text-sm font-medium text-gray-700">
                      PRN (Permanent Registration Number)*
                    </label>
                    <input
                      type="text"
                      id="prn"
                      value={newStudent.prn}
                      onChange={(e) => setNewStudent({ ...newStudent, prn: e.target.value })}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      value={newStudent.address}
                      onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password*
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={newStudent.password}
                      onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
              
              {/* Social Media Section */}
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-700 mb-3">Social Media Profiles</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-700">Facebook</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="https://facebook.com/username"
                      value={newStudent.socialMedia.facebook}
                      onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">Instagram</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="https://instagram.com/username"
                      value={newStudent.socialMedia.instagram}
                      onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">LinkedIn</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="https://linkedin.com/in/username"
                      value={newStudent.socialMedia.linkedin}
                      onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">GitHub</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="https://github.com/username"
                      value={newStudent.socialMedia.github}
                      onChange={(e) => handleSocialMediaChange('github', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 ${
                    submitting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {submitting ? 'Adding...' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Delete Student</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {showDeleteConfirm.name}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteStudent(showDeleteConfirm._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Social Media Edit Modal */}
      {showEditSocial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Edit Social Media Profiles</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center">
                    <Linkedin className="h-5 w-5 text-blue-600 mr-2" />
                    LinkedIn Profile
                  </span>
                </label>
                <input
                  type="url"
                  value={socialMedia.linkedin}
                  onChange={(e) => setSocialMedia({ ...socialMedia, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/your-profile"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center">
                    <Github className="h-5 w-5 text-gray-800 mr-2" />
                    GitHub Profile
                  </span>
                </label>
                <input
                  type="url"
                  value={socialMedia.github}
                  onChange={(e) => setSocialMedia({ ...socialMedia, github: e.target.value })}
                  placeholder="https://github.com/your-username"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center">
                    <Instagram className="h-5 w-5 text-pink-600 mr-2" />
                    Instagram Profile
                  </span>
                </label>
                <input
                  type="url"
                  value={socialMedia.instagram}
                  onChange={(e) => setSocialMedia({ ...socialMedia, instagram: e.target.value })}
                  placeholder="https://instagram.com/your-username"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center">
                    <Facebook className="h-5 w-5 text-blue-600 mr-2" />
                    Facebook Profile
                  </span>
                </label>
                <input
                  type="url"
                  value={socialMedia.facebook}
                  onChange={(e) => setSocialMedia({ ...socialMedia, facebook: e.target.value })}
                  placeholder="https://facebook.com/your-profile"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditSocial(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSocialMedia}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDetails;