import { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { Trash2, Plus, ChevronRight, Calendar, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const AcademicGrades = ({ selectedStudent }) => {
  const [existingGrades, setExistingGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [years, setYears] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (selectedStudent && selectedStudent._id) {
      fetchExistingGrades();
    } else {
      setLoading(false);
    }
  }, [selectedStudent]);

  const fetchExistingGrades = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getStudentGrades(selectedStudent._id);
      
      // Ensure we have valid data
      const academicData = response.data.performance?.academic || {};
      
      // Process the data to handle MongoDB Map structure
      const processedData = {};
      
      // Extract years from the data and sort them numerically
      const yearsList = Object.keys(academicData)
        .filter(key => !key.startsWith('$') && key !== 'toJSON') // Filter out Mongoose internals
        .sort((a, b) => Number(a) - Number(b));
      
      // Process each year's data
      yearsList.forEach(year => {
        const yearData = academicData[year];
        if (yearData && yearData.semester) {
          processedData[year] = {
            semester: {}
          };
          
          // Process semester data
          Object.keys(yearData.semester)
            .filter(sem => !sem.startsWith('$') && sem !== 'toJSON')
            .forEach(sem => {
              processedData[year].semester[sem] = yearData.semester[sem];
            });
        }
      });
      
      setExistingGrades(processedData);
      setYears(yearsList);
    } catch (error) {
      console.error('Error fetching grades:', error);
      toast.error('Failed to fetch existing grades');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteYear = async (year) => {
    if (!window.confirm(`Are you sure you want to delete all data for Year ${year}?`)) {
      return;
    }

    try {
      setLoading(true);
      
      // Get all semesters for this year
      const yearData = existingGrades[year] || {};
      const semesterData = yearData.semester || {};
      const semesters = Object.keys(semesterData).filter(sem => !sem.startsWith('$'));
      
      if (semesters.length === 0) {
        toast.error('No semesters found for this year');
        setLoading(false);
        return;
      }
      
      // Delete each semester
      for (const semester of semesters) {
        await adminApi.deleteAcademicGrades({
          studentId: selectedStudent._id,
          year,
          semester,
        });
      }
      
      toast.success(`Year ${year} data deleted successfully`);
      
      // Update local state
      const updatedGrades = { ...existingGrades };
      delete updatedGrades[year];
      setExistingGrades(updatedGrades);
      
      const updatedYears = years.filter(y => y !== year);
      setYears(updatedYears);
    } catch (error) {
      console.error('Error deleting year:', error);
      toast.error('Failed to delete year data');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedStudent) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-indigo-50 rounded-full p-4 mb-4">
          <Calendar className="h-8 w-8 text-indigo-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Student Selected</h3>
        <p className="text-gray-600 text-center max-w-md">
          Please select a student from the Student Details section first to view and manage their academic records.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Calculate which years are available to add
  const availableYears = ['1', '2', '3', '4'].filter(year => !years.includes(year));

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Academic Grades</h2>
    
      {!selectedStudent ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-indigo-50 rounded-full p-4 mb-4">
            <BookOpen className="h-8 w-8 text-indigo-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Student Selected</h3>
          <p className="text-gray-600 text-center max-w-md">
            Please select a student from the Student Details section to view and manage their academic grades.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {years.map(year => {
              const yearData = existingGrades[year] || {};
              const semesterData = yearData.semester || {};
              const semesters = Object.keys(semesterData).filter(sem => !sem.startsWith('$'));
              const semesterCount = semesters.length;
              
              return (
                <div key={year} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 group">
                  <div className="border-b border-gray-100">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">Year {(year).split("r")[1]}</h3>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleDeleteYear(year)}
                            className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Year"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {semesterCount} {semesterCount === 1 ? 'Semester' : 'Semesters'}
                      </span>
                    </div>
                    
                    {semesterCount > 0 && (
                      <div className="space-y-2 mb-4">
                        {semesters.map(sem => (
                          <div key={sem} className="text-sm text-gray-600 flex items-center">
                            <div className="w-2 h-2 rounded-full bg-indigo-400 mr-2"></div>
                            Semester {(sem).split("r")[1]}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <Link
                      to={location.pathname.includes('/admin') ? `/admin/academic/${year}` : `/teacher/academic/${year}`}
                      state={{ student: selectedStudent, yearData: existingGrades[year] }}
                      className="mt-2 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 group-hover:underline"
                    >
                      View details
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add New Year Section - Only show if no existing grades */}
          {years.length < 4 && (
            <div className="mt-8 pt-5 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Academic Year</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {availableYears.map(year => (
                  <Link
                    key={year}
                    to={`/admin/academic/${year}`}
                    state={{ student: selectedStudent, yearData: {} }}
                    className="flex items-center justify-center p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200"
                  >
                    <Plus className="h-5 w-5 mr-2 text-indigo-500" />
                    <span className="font-medium text-indigo-600">Year {(year)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AcademicGrades;