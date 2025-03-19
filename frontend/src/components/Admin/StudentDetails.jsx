import { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { Search, UserPlus, Trash2, User } from 'lucide-react';
import toast from 'react-hot-toast';

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
    socialMedia: {
      facebook: '',
      instagram: '',
      linkedin: '',
      github: ''
    }
  });
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await adminApi.getStudents();
      setStudents(response.data);
    } catch (error) {
      toast.error('Failed to fetch students');
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await adminApi.registerStudent(newStudent);
      toast.success('Student added successfully');
      setShowAddForm(false);
      setNewStudent({ 
        name: '', 
        email: '', 
        password: '', 
        socialMedia: {
          facebook: '',
          instagram: '',
          linkedin: '',
          github: ''
        }
      });
      fetchStudents();
    } catch (error) {
      toast.error('Failed to add student');
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
      await adminApi.updateStudentData({
        studentId: showEditSocial._id,
        data: { socialMedia }
      });
      toast.success('Social media profiles updated');
      fetchStudents();
      setShowEditSocial(null);
    } catch (error) {
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

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="mb-4 bg-indigo-50 border border-indigo-100 rounded-md p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="bg-indigo-100 p-1 rounded-full">
                  <User className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <span className="text-sm text-gray-600">Selected:</span>{' '}
                  <span className="text-sm font-medium text-indigo-700">
                    {students.find(s => s._id === selectedStudentId)?.name}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStudentId(null)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            </div>
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-4 mb-6">
                      {student.photo ? (
                        <img 
                          src={student.photo} 
                          alt={`${student.name}'s photo`} 
                          className="h-16 w-16 rounded-full object-cover shadow-sm"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
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
                    <button
                      onClick={() => handleEditSocialMedia(student)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit Social Media
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      {selectedStudentId === student._id ? (
                        <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Selected
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSelectStudent(student)}
                          className="inline-flex items-center px-3 py-1 border border-blue-200 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                        >
                          Select
                        </button>
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
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={newStudent.password}
                  onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                />
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
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Add Student
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

      {/* Social Media Modal */}
      {showEditSocial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Edit Social Media Profiles</h3>
            <p className="text-sm text-gray-500 mb-4">For student: {showEditSocial.name}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Facebook</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="https://facebook.com/username"
                  value={socialMedia.facebook}
                  onChange={(e) => setSocialMedia({ ...socialMedia, facebook: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Instagram</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="https://instagram.com/username"
                  value={socialMedia.instagram}
                  onChange={(e) => setSocialMedia({ ...socialMedia, instagram: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="https://linkedin.com/in/username"
                  value={socialMedia.linkedin}
                  onChange={(e) => setSocialMedia({ ...socialMedia, linkedin: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">GitHub</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="https://github.com/username"
                  value={socialMedia.github}
                  onChange={(e) => setSocialMedia({ ...socialMedia, github: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowEditSocial(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSocialMedia}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
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