import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Search, ChevronDown, ChevronUp, Eye, User, Facebook, Instagram, Linkedin, Github, ChevronLeft, ChevronRight } from 'lucide-react';

const StudentList = ({ onSelectStudent }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  });

  useEffect(() => {
    fetchStudents();
  }, [pagination.currentPage, pagination.limit, searchTerm, sortConfig]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { currentPage, limit } = pagination;
      const { key, direction } = sortConfig;
      
      // Build the URL with query parameters
      const baseUrl = `${import.meta.env.VITE_API_URL}/student/all`;
      const params = new URLSearchParams({
        page: currentPage,
        limit,
        sort: key,
        order: direction,
        search: searchTerm
      });
      
      const response = await axios.get(`${baseUrl}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.data) {
        setStudents(response.data.data);
        // Update pagination information
        setPagination(prev => ({
          ...prev,
          totalPages: response.data.totalPages || 1,
          total: response.data.total || 0
        }));
      } else {
        setStudents([]);
        toast.error('Failed to load students data');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  const handleLimitChange = (newLimit) => {
    setPagination(prev => ({
      ...prev,
      limit: Number(newLimit),
      currentPage: 1  // Reset to first page when changing items per page
    }));
  };

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    // Reset to first page when sorting
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    // Reset to first page when searching
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  // We're not manually sorting here as the backend will now handle sorting
  // And filtering is also done on the backend now

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Student List</h2>
            <p className="text-gray-500 mt-1">
              View and manage student information
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Name</span>
                    {sortConfig.key === 'name' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Email</span>
                    {sortConfig.key === 'email' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('rollNumber')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Roll Number</span>
                    {sortConfig.key === 'rollNumber' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Social Media
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No students found
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50" onClick={() => onSelectStudent(student)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {student.photo ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={student.photo}
                              alt={student.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <User className="h-6 w-6 text-indigo-600" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{student.rollNumber}</div>
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
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Facebook className="h-4 w-4" />
                              </a>
                            )}
                            {student.socialMedia.instagram && (
                              <a 
                                href={student.socialMedia.instagram} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-pink-600 hover:text-pink-800"
                                title="Instagram Profile"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Instagram className="h-4 w-4" />
                              </a>
                            )}
                            {student.socialMedia.linkedin && (
                              <a 
                                href={student.socialMedia.linkedin} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-700 hover:text-blue-900"
                                title="LinkedIn Profile"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Linkedin className="h-4 w-4" />
                              </a>
                            )}
                            {student.socialMedia.github && (
                              <a 
                                href={student.socialMedia.github} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-800 hover:text-gray-900"
                                title="GitHub Profile"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Github className="h-4 w-4" />
                              </a>
                            )}
                            {!student.socialMedia.facebook && 
                              !student.socialMedia.instagram && 
                              !student.socialMedia.linkedin && 
                              !student.socialMedia.github && (
                                <span className="text-gray-400 text-xs italic">None</span>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400 text-xs italic">None</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-700">
            <span>
              Showing {students.length} of {pagination.total} students
            </span>
            <div className="ml-4">
              <select
                value={pagination.limit}
                onChange={(e) => handleLimitChange(e.target.value)}
                className="border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className={`p-2 rounded-md ${
                pagination.currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <div className="flex items-center">
              {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
                let pageNumber;
                if (pagination.totalPages <= 5) {
                  // If we have 5 or fewer pages, show all
                  pageNumber = index + 1;
                } else {
                  // Complex logic for showing pages around current page
                  if (pagination.currentPage <= 3) {
                    // Near the start
                    pageNumber = index + 1;
                  } else if (pagination.currentPage >= pagination.totalPages - 2) {
                    // Near the end
                    pageNumber = pagination.totalPages - 4 + index;
                  } else {
                    // In the middle
                    pageNumber = pagination.currentPage - 2 + index;
                  }
                }
                
                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`px-3 py-1 mx-1 rounded-md ${
                      pagination.currentPage === pageNumber
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className={`p-2 rounded-md ${
                pagination.currentPage === pagination.totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentList; 